import test from 'node:test';
import assert from 'node:assert/strict';
import {createNode,chooseActionTool,nodeDefinition} from './workflowModel.js';
import {executeNode,runWorkflow,liveAssistance} from './workflowEngine.js';
import {prepareAIInput} from './aiContext.js';
import {validDraft} from './draftStorage.js';
import {requestAI} from '../server/ai.js';

test('whole-document extraction needs no labels and preserves final-page text',async()=>{
 const n=createNode('document_extract');const tail='FINAL PAGE: industry requirements';
 const output=await executeNode(n,{file:[{}]},{extract:async()=>({pages:[{number:1,text:'A'.repeat(8000)},{number:2,text:tail}]})});
 assert(output.fullText.includes(tail));assert(output.fullText.includes('[Page 2]'));assert.equal(output.textByPage.pages.length,2);
 const prepared=prepareAIInput(output.fullText);assert.equal(prepared.truncated,false);assert(prepared.data.endsWith(tail));
 let body;await requestAI(output.fullText,{key:'test',fetcher:async(_,options)=>{body=JSON.parse(options.body);return {ok:true,json:async()=>({choices:[{message:{content:'Evaluation'}}]})};}});
 assert(JSON.parse(body.messages[2].content).data.endsWith(tail));
});
test('empty scanned PDFs do not create text for AI; partly readable PDFs identify missing pages',async()=>{
 const extract=createNode('document_extract');const empty=await executeNode(extract,{file:[{}]},{extract:async()=>({pages:[{number:1,text:''}]})});assert.equal(empty.fullText,null);assert.equal(empty.textByPage,null);assert.match(empty.finding.note,/OCR/);
 let called=false;const out=await executeNode(createNode('ai'),{decision:empty.fullText},{ai:async()=>{called=true;}});assert.equal(called,false);assert.equal(out.assistance.status,'unavailable');
 const partial=await executeNode(extract,{file:[{}]},{extract:async()=>({pages:[{number:1,text:'Readable content'},{number:2,text:''}]})});assert.equal(partial.finding.status,'uncertain');assert.match(partial.fullText,/Pages 2 have no extractable text/);
});
test('document workflow combines complete content, topic, faculty and creator reference material',async()=>{
 const root=createNode('submit'),extract=chooseActionTool(createNode('action'),'document_extract'),ai=chooseActionTool(createNode('action'),'ai'),result=createNode('result');
 root.routes.next=extract.id;extract.routes.next=ai.id;ai.routes.next=result.id;extract.mappings.file='field|file';ai.mappings={decision:`node|${extract.id}|fullText`,topic:'field|topic',faculty:'field|faculty'};ai.config.settings.contextInputs=[{id:'topic',name:'Topic Name'},{id:'faculty',name:'Faculty Name'}];ai.config.settings.referenceText='Require an implementation example.';ai.config.settings.instructions='Evaluate the document against the supplied rubric. Cite pages.';result.config.outcome='Evaluated';result.mappings.value=`node|${ai.id}|response`;
 const fields=[{id:'file',label:'Content File',type:'file',required:true,help:'',options:'',accept:'.pdf',multiple:false},...['topic','faculty'].map(id=>({id,label:id,type:'text',required:true,help:'',options:'',accept:'',multiple:false}))];let captured;
 assert(validDraft({name:'Content relevance',fields,nodes:[root,extract,ai,result]}));assert.equal(nodeDefinition(ai).inputs.length,3);
 const run=await runWorkflow({nodes:[root,extract,ai,result],fields,values:{file:[{name:'content.pdf'}],topic:'Cloud computing',faculty:'Alex'},extract:async()=>({pages:[{number:1,text:'An implementation example using containers.'}]}),ai:async data=>{captured=data;return {status:'advisory',summary:'Criterion met on page 1.'};}});
 assert.equal(run.status,'completed');assert.equal(run.result.value,'Criterion met on page 1.');assert.equal(captured.additionalInputs[0].value,'Cloud computing');assert.equal(captured.referenceMaterial,'Require an implementation example.');assert.match(captured.primaryInput,/containers/);
});
test('oversized content is blocked on client and server without provider calls',async()=>{
 let calls=0;const fetcher=async()=>{calls++;throw Error('Must not call');};
 const client=await liveAssistance('X'.repeat(100001),fetcher);assert.equal(client.status,'unavailable');assert.equal(calls,0);
 const server=await requestAI('X'.repeat(100001),{key:'test',fetcher});assert.equal(server.status,'unavailable');assert.equal(calls,0);
 const flagged=await requestAI('Previously cut content',{key:'test',fetcher,inputTruncated:true});assert.equal(flagged.status,'unavailable');assert.equal(calls,0);
});
