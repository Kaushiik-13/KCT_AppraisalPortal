import test from 'node:test';
import assert from 'node:assert/strict';
import {createNode,chooseActionTool} from './workflowModel.js';
import {runWorkflow,resumeWorkflow,validateWorkflow,validateRunConfiguration,typedValue} from './workflowEngine.js';

export function trainingFixture(){
 const fields=[{id:'hours',label:'Training hours',type:'number',required:false}];
 const root=createNode('submit'),action=chooseActionTool(createNode('action'),'read_number'),condition=createNode('condition'),review=createNode('human_review');
 const results=['Eligible','Not eligible','Approved manually','Rejected','Clarification requested'].map(outcome=>({...createNode('result'),config:{outcome,valueType:'number'}}));
 action.mappings.value='field|hours';condition.mappings.value=`node|${action.id}|value`;condition.config.expected='8';
 root.routes.next=action.id;action.routes.next=condition.id;
 condition.routes={clear:results[0].id,failed:results[1].id,uncertain:review.id};
 review.routes={approved:results[2].id,rejected:results[3].id,clarification:results[4].id};
 return {fields,nodes:[root,action,condition,review,...results],values:{hours:'8'}};
}
test('training runs pass/fail boundaries and zero, with only chosen branches executed',async()=>{
 for(const [hours,outcome] of [['8','Eligible'],['9','Eligible'],['7','Not eligible'],['0','Not eligible']]){
 const fixture=trainingFixture();assert.deepEqual(validateWorkflow(fixture.nodes,fixture.fields),[]);
 const run=await runWorkflow({...fixture,values:{hours}});
 assert.equal(run.status,'completed');assert.equal(run.result.outcome,outcome);assert.equal(run.trace.length,4);
 }
});
test('missing value pauses, validates reviewer, continues chosen branch, prevents repeat review',async()=>{
 for(const [action,outcome] of [['approved','Approved manually'],['rejected','Rejected'],['clarification','Clarification requested']]){
 const run=await runWorkflow({...trainingFixture(),values:{}});assert.equal(run.status,'awaiting-review');
 await assert.rejects(()=>resumeWorkflow(run,{action,reviewer:''}),/reviewer name/);
 if(action!=='approved')await assert.rejects(()=>resumeWorkflow(run,{action,reviewer:'R'}),/reason/);
 const completed=await resumeWorkflow(run,{action,reviewer:'R',reason:'Checked evidence'});
 assert.equal(completed.result.outcome,outcome);assert.equal(completed.decisions.length,1);assert.equal(completed.trace.length,5);
 await assert.rejects(()=>resumeWorkflow(run,{action,reviewer:'R',reason:'Again'}),/no longer/);
 }
});
test('validation rejects missing tool settings, disconnected routes, loops and branch-only inputs',()=>{
 const f=trainingFixture();f.nodes[1].config={tool:'period',settings:{start:'',end:'',dateRule:'published'}};
 assert.ok(validateWorkflow(f.nodes,f.fields).some(x=>x.includes('assessment')));
 const g=trainingFixture();g.nodes[2].routes.failed='';assert.ok(validateWorkflow(g.nodes,g.fields).some(x=>x.includes('failed route')));
 const h=trainingFixture();h.nodes[2].routes.failed=h.nodes[1].id;assert.ok(validateWorkflow(h.nodes,h.fields).some(x=>x.includes('loop')));
 const j=trainingFixture();j.nodes[4].mappings.value=`node|${j.nodes[3].id}|review`;assert.ok(validateWorkflow(j.nodes,j.fields).some(x=>x.includes('incompatible')));
});
test('typed comparisons preserve false and zero; invalid dates and missing values stay unknown',()=>{
 assert.equal(typedValue('No','boolean'),false);assert.equal(typedValue(0,'number'),0);
 assert.equal(typedValue('','number'),null);assert.equal(typedValue('2026-02-30','date'),null);
 assert.equal(typedValue('not a number','number'),null);
});
test('date, boolean and text conditions execute with typed values',async()=>{
 for(const [type,value,expected,operator,outcome] of [['boolean','No','false','eq','Eligible'],['date','2026-10-04','2026-10-04','gte','Eligible'],['text','Pending','Approved','eq','Not eligible']]){
 const f=trainingFixture();f.fields[0].type=type;f.nodes[1]=chooseActionTool(f.nodes[1],`read_${type}`);f.nodes[1].mappings.value='field|hours';
 f.nodes[2].config={valueType:type,expected,operator};
 const run=await runWorkflow({...f,values:{hours:value}});assert.equal(run.result.outcome,outcome);
 }
});
test('result without a named outcome and malformed comparison are rejected before any tools run',async()=>{
 const f=trainingFixture();f.nodes[4].config.outcome='';f.nodes[2].config.expected='abc';let calls=0;
 const run=await runWorkflow({...f,onStep:()=>calls++});assert.equal(run.status,'invalid');assert.equal(calls,0);
 assert.ok(run.issues.some(i=>i.includes('expected value')));assert.ok(run.issues.some(i=>i.includes('final outcome')));
});
test('setup checklist and execution report the same issues',async()=>{
 const f=trainingFixture();f.nodes[2].config.expected='';
 const issues=validateRunConfiguration(f);assert.ok(issues.some(i=>i.includes('expected value')));
 assert.deepEqual((await runWorkflow(f)).issues,issues);
});
test('a tool failure after review retains the recorded decision and stops the run',async()=>{
 const f=trainingFixture();const review=f.nodes.find(n=>n.kind==='human_review');
 const extract=chooseActionTool(createNode('action'),'extract');extract.mappings.file='field|pdf';extract.routes.next=review.routes.approved;review.routes.approved=extract.id;
 f.nodes.splice(f.nodes.indexOf(review)+1,0,extract);f.fields.push({id:'pdf',label:'Certificate',type:'file',required:false,accept:'.pdf'});
 const paused=await runWorkflow({...f,values:{pdf:[{name:'test.pdf',type:'application/pdf'}]},extract:async()=>{throw Error('Unreadable test PDF');}});
 const stopped=await resumeWorkflow(paused,{action:'approved',reviewer:'Reviewer'});
 assert.equal(stopped.status,'error');assert.equal(stopped.decisions[0].reviewer,'Reviewer');assert.match(stopped.issues[0],/Unreadable/);
});
