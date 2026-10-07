import test from 'node:test';
import assert from 'node:assert/strict';
import {newScoreComponent,newScoringPolicy,newScoringRule,saveScoringVersion,evaluateScoringVersion,validateScoringVersion,validPolicyShape} from './scoringPolicy.js';
import {chooseActionTool,createNode} from './workflowModel.js';
import {runWorkflow,resumeWorkflow} from './workflowEngine.js';
import {writeDraft,readDraft} from './draftStorage.js';

const fields=[{id:'hours',label:'Hours',type:'number',required:false,help:'',options:'',accept:'',multiple:false}];
function fixture(){
 const root=createNode('submit'),result=createNode('result');result.config.outcome='Eligible';root.routes.next=result.id;
 const policy=newScoringPolicy();policy.enabled=true;const rule=newScoringRule();rule.name='Training completed';rule.conditions[0].expected='Eligible';policy.draft.rules=[rule];
 return {nodes:[root,result],fields,values:{hours:'8'},policy:saveScoringVersion(policy,fields,[root,result])};
}
test('saved policy scores completed workflow, multiplies, caps, and retains immutable snapshot',async()=>{
 const f=fixture();let p=newScoringPolicy();p.enabled=true;p.draft={...f.policy.draft,version:'v2',maxPoints:'15',rules:f.policy.draft.rules.map(r=>({...r,points:'12',multiplier:'2'}))};f.policy=saveScoringVersion(p,fields,f.nodes);
 const run=await runWorkflow(f);assert.equal(run.scoring.points,15);assert.equal(run.scoring.version,'v2');assert.equal(run.scoring.policy.rules[0].points,'12');
 f.policy.versions[0].rules[0].points='99';assert.equal(run.scoring.policy.rules[0].points,'12');
});
test('draft changes do not affect active version; duplicate names cannot overwrite versions',async()=>{
 const f=fixture();f.policy.draft.rules[0].points='90';assert.equal((await runWorkflow(f)).scoring.points,12);
 assert.throws(()=>saveScoringVersion(f.policy,fields,f.nodes),/already saved/);
 f.policy.draft.version='v2';f.policy=saveScoringVersion(f.policy,fields,f.nodes);assert.equal((await runWorkflow(f)).scoring.points,90);
 f.policy.activeVersion='v1';assert.equal((await runWorkflow(f)).scoring.points,12);
});
test('missing higher-priority evidence stays pending and cannot fall through to zero',()=>{
 const f=fixture();const policy=structuredClone(f.policy.versions[0]);policy.fallback='zero';policy.rules.unshift({...newScoringRule(),conditions:[{source:'field|hours',type:'number',operator:'gte',expected:'20'}]});
 assert.equal(evaluateScoringVersion(policy,{values:{},outputs:{},result:{outcome:'Eligible'}}).points,null);
 assert.equal(evaluateScoringVersion(policy,{values:{hours:'8'},outputs:{},result:{outcome:'Eligible'}}).points,12);
 assert.equal(evaluateScoringVersion(policy,{values:{hours:'8'},outputs:{},result:{outcome:'Rejected'}}).points,0);
});
test('all/any comparisons preserve false, zero and date boundaries',()=>{
 const f=fixture();const p=structuredClone(f.policy.versions[0]);p.rules[0].match='any';p.rules[0].conditions=[{source:'field|bool',type:'boolean',operator:'eq',expected:'false'},{source:'field|unknown',type:'number',operator:'gte',expected:'3'}];
 assert.equal(evaluateScoringVersion(p,{values:{bool:'No'},outputs:{},result:{}}).points,12);
 p.rules[0].match='all';assert.equal(evaluateScoringVersion(p,{values:{bool:'No'},outputs:{},result:{}}).points,null);
 p.rules[0].conditions=[{source:'field|zero',type:'number',operator:'eq',expected:'0'},{source:'field|date',type:'date',operator:'gte',expected:'2026-10-04'}];
 assert.equal(evaluateScoringVersion(p,{values:{zero:0,date:'2026-10-04'},outputs:{},result:{}}).points,12);
});
test('removed or retyped sources block execution before tools; cap and numeric rules are validated',async()=>{
 const f=fixture();f.policy.versions[0].rules[0].conditions=[{source:'field|hours',type:'number',operator:'gte',expected:'8'}];
 let calls=0;const run=await runWorkflow({...f,fields:[],onStep:()=>calls++});assert.equal(run.status,'invalid');assert.equal(calls,0);
 const p=structuredClone(f.policy.versions[0]);p.maxPoints='-1';p.rules[0].multiplier='NaN';assert.equal(validateScoringVersion(p,fields,f.nodes).length,2);
});
test('policy continues with frozen version after human review',async()=>{
 const f=fixture(),review=createNode('human_review');f.nodes[0].routes.next=review.id;review.routes={approved:f.nodes[1].id,rejected:f.nodes[1].id,clarification:f.nodes[1].id};f.nodes.splice(1,0,review);
 const paused=await runWorkflow(f);assert.equal(paused.status,'awaiting-review');f.policy.versions[0].rules[0].points='100';
 const run=await resumeWorkflow(paused,{action:'approved',reviewer:'Test'});assert.equal(run.scoring.points,12);
});
test('policy draft and saved versions survive reload; malformed policy is protected',()=>{
 const f=fixture();let raw;const storage={setItem:(_,v)=>raw=v,getItem:()=>raw};const draft={name:'Training',fields,nodes:f.nodes,policy:f.policy};writeDraft(storage,draft);assert.deepEqual(readDraft(storage).draft,draft);
 assert.equal(validPolicyShape({...f.policy,versions:[null]}),false);raw=JSON.stringify({version:1,draft:{...draft,policy:{}}});assert.equal(readDraft(storage).blocked,true);
});

test('formula policy combines any number of organization-defined score components',()=>{
 const policy={version:'relevance-v1',mode:'formula',aggregation:'sum',maxPoints:'20',fallback:'pending',rules:[],components:[{...newScoreComponent(),id:'evidence_a',name:'Evidence A relevance',weight:'1',required:true},{...newScoreComponent(),id:'evidence_b',name:'Evidence B relevance',weight:'1',required:true}]};
 const scored=evaluateScoringVersion(policy,{componentValues:{evidence_a:8,evidence_b:7}});assert.equal(scored.points,15);assert.equal(scored.status,'scored');assert.equal(scored.components.length,2);
 assert.equal(evaluateScoringVersion(policy,{componentValues:{evidence_a:8}}).status,'pending');
 policy.aggregation='weighted_average';policy.components[0].weight='2';assert.equal(evaluateScoringVersion(policy,{componentValues:{evidence_a:8,evidence_b:5}}).points,7);
});

test('formula policy is manually mapped through Apply scoring policy',async()=>{
 const scoreFields=[{id:'a',label:'First evaluated score',type:'number',required:true,help:'',options:'',accept:'',multiple:false},{id:'b',label:'Second evaluated score',type:'number',required:true,help:'',options:'',accept:'',multiple:false}];
 const root=createNode('submit'),apply=chooseActionTool(createNode('action'),'apply_policy'),result=createNode('result');root.routes.next=apply.id;apply.routes.next=result.id;result.config.outcome='Calculated';
 const components=[{id:'a_score',name:'First evidence score',weight:'1',required:true},{id:'b_score',name:'Second evidence score',weight:'1',required:true}];apply.config.settings={policyVersion:'org-v1',components};apply.mappings={a_score:'field|a',b_score:'field|b'};result.mappings.value=`node|${apply.id}|points`;result.config.valueType='number';
 const version={version:'org-v1',mode:'formula',aggregation:'sum',maxPoints:'20',fallback:'pending',components,rules:[]};const policy={...newScoringPolicy(),versions:[version],activeVersion:'org-v1'};
 const run=await runWorkflow({nodes:[root,apply,result],fields:scoreFields,values:{a:'8',b:'7'},policy});assert.equal(run.status,'completed');assert.equal(run.outputs[apply.id].points,15);assert.equal(run.result.value,15);
});
