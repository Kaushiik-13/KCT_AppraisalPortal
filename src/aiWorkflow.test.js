import test from 'node:test';
import assert from 'node:assert/strict';
import {createNode,chooseActionTool,sourceChoices,exampleWorkflow} from './workflowModel.js';
import {executeNode,runWorkflow,liveAssistance} from './workflowEngine.js';
import {prepareAIInput} from './aiContext.js';
import {validDraft} from './draftStorage.js';

test('AI accepts earlier structured outputs and text, excluding binary form fields',()=>{
 const extract=createNode('extract'),ai=createNode('ai');
 const choices=sourceChoices(ai,{type:'ai_context'},[extract,ai],[{id:'pdf',type:'file',label:'Paper'},{id:'text',type:'text',label:'Notes'}]);
 assert.ok(choices.some(c=>c.value===`node|${extract.id}|paper`));assert.ok(choices.some(c=>c.value==='field|text'));assert.ok(!choices.some(c=>c.value==='field|pdf'));
 const example=exampleWorkflow([]);const decision=example.find(n=>n.kind==='decision');assert.equal(example.find(n=>n.kind==='ai').mappings.decision,`node|${decision.id}|decision`);
});
test('clear findings and custom instructions reach AI and expose response text',async()=>{
 const node=chooseActionTool(createNode('action'),'ai');node.config.settings.instructions='Summarize verified facts for the appraiser.';
 const input={status:'clear',facts:{primary:'yes'}};let captured;
 const output=await executeNode(node,{decision:input},{ai:async(data,unused,instructions)=>{captured={data,instructions};return {status:'advisory',summary:'Verified primary author.'};}});
 assert.deepEqual(captured,{data:input,instructions:node.config.settings.instructions});assert.equal(output.response,'Verified primary author.');assert.equal(output.assistance.instructions,node.config.settings.instructions);
});
test('generic AI response connects to a later Result without publication-specific data',async()=>{
 const root=createNode('submit'),ai=chooseActionTool(createNode('action'),'ai'),result=createNode('result');root.routes.next=ai.id;ai.routes.next=result.id;ai.mappings.decision='field|notes';ai.config.settings.instructions='Write a brief summary.';result.config.outcome='Summary prepared';result.mappings.value=`node|${ai.id}|response`;
 const run=await runWorkflow({nodes:[root,ai,result],fields:[{id:'notes',label:'Notes',type:'text'}],values:{notes:'Completed training'},ai:async()=>({status:'advisory',summary:'Training completed.'})});
 assert.equal(run.status,'completed');assert.equal(run.result.value,'Training completed.');
});
test('legacy AI drafts remain valid, and instructions are valid persisted configuration',()=>{
 const node=createNode('ai');delete node.config.instructions;assert.equal(validDraft({name:'Old',fields:[],nodes:[node]}),true);
 node.config.instructions='Explain these results.';assert.equal(validDraft({name:'New',fields:[],nodes:[node]}),true);
});
test('client posts generic input and instructions; bounded context reports truncation',async()=>{
 let body;await liveAssistance({status:'clear'},async(url,options)=>{body=JSON.parse(options.body);return {ok:true,json:async()=>({status:'advisory',summary:'Ready'})};},'Summarize');
 assert.equal(body.instructions,'Summarize');assert.equal(body.input.data.status,'clear');
 const prepared=prepareAIInput({text:'x'.repeat(200000)});assert.equal(prepared.truncated,true);assert.ok(JSON.stringify(prepared).length<180000);
});
test('simulated generic AI makes no provider call and does not claim instructions were executed',async()=>{
 const node=createNode('ai');node.config.mode='simulated';const out=await executeNode(node,{decision:'Training notes'},{});assert.equal(out.assistance.status,'simulated');assert.match(out.response,/instructions were not executed/);
});
