import test from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from '@e965/xlsx';
import JSZip from 'jszip';
import {createNode,reusableActionTools} from './workflowModel.js';
import {executeNode} from './workflowEngine.js';
import {readEvidence} from './documentReader.js';

test('new action catalogue replaces read tools and generic lookup',()=>{
 const kinds=reusableActionTools.map(tool=>tool.kind);
 assert.deepEqual(kinds.slice(0,3),['use_form_value','extract_evidence','compare_evidence']);
 assert.equal(kinds.some(kind=>kind.startsWith('read_')),false);
 assert.equal(kinds.includes('external_lookup'),false);
 assert.ok(kinds.includes('ai'));
});

test('use form value derives and records the selected submission source',async()=>{
 const node=createNode('use_form_value');node.config={fieldId:'faculty',valueType:'text'};
 const output=await executeNode(node,{}, {fields:[{id:'faculty',label:'Faculty name',type:'text'}],values:{faculty:'John Smith'}});
 assert.equal(output.value,'John Smith');
 assert.deepEqual(output.source,{origin:'submission_form',fieldId:'faculty',type:'text',label:'Faculty name'});
});

test('evidence extraction returns candidates with locations and never marks them verified',async()=>{
 const node=createNode('extract_evidence');node.config={mode:'both',fields:[{id:'doi',name:'DOI',label:'DOI',type:'text'}]};
 const output=await executeNode(node,{file:[{name:'paper.pdf'}]}, {fields:[],values:{},extract:async()=>({format:'pdf',fileName:'paper.pdf',sections:[{title:'Page 1',text:'DOI: 10.1234/example',location:{type:'pdf_page',page:1}}],warnings:[]})});
 assert.equal(output.doi,'10.1234/example');
 assert.equal(output.evidence.verified,false);
 assert.equal(output.evidence.evidence[0].status,'candidate');
 assert.deepEqual(output.evidence.evidence[0].locations,[{type:'pdf_page',page:1}]);
 assert.match(output.content.fullText,/10\.1234\/example/);
});

test('compare evidence distinguishes mismatch from missing evidence',async()=>{
 const node=createNode('compare_evidence');const [first]=node.config.comparisons;
 node.config.comparisons=[{...first,name:'Author',valueType:'text',operator:'contains',ignoreCase:true},{id:'doi',name:'DOI',valueType:'text',operator:'equals',ignoreCase:true}];
 const output=await executeNode(node,{[`left_${first.id}`]:'John Smith',[`right_${first.id}`]:'J. Smith; John Smith',left_doi:'10.1/a',right_doi:null},{fields:[],values:{}});
 assert.equal(output.comparison.results[0].status,'match');
 assert.equal(output.comparison.results[1].status,'unknown');
 assert.equal(output.status,'unknown');
});

test('AI schema exposes validated structured fields while preserving recommendation',async()=>{
 const node=createNode('ai');node.config={mode:'openrouter',instructions:'Evaluate.',referenceText:'Rubric',contextInputs:[],outputSchema:JSON.stringify({type:'object',properties:{decision:{type:'string',enum:['relevant','not_relevant']},confidence:{type:'number'},requiresReview:{type:'boolean'}},required:['decision','confidence','requiresReview']})};
 const output=await executeNode(node,{decision:{content:'Evidence'}},{ai:async()=>({status:'advisory',summary:'{"decision":"relevant","confidence":0.91,"requiresReview":false}'})});
 assert.equal(output.decision,'relevant');
 assert.equal(output.confidence,0.91);
 assert.equal(output.assistance.structured.requiresReview,false);
 assert.equal(output.assistance.rubric,'Rubric');
});

test('XLS and XLSX adapter preserves sheet rows and range references',async()=>{
 const workbook=XLSX.utils.book_new();XLSX.utils.book_append_sheet(workbook,XLSX.utils.aoa_to_sheet([['DOI','Author'],['10.1/a','John Smith']]),'Publication Details');
 for(const format of ['xlsx','xls']){const bytes=XLSX.write(workbook,{type:'array',bookType:format});const file={name:`evidence.${format}`,size:bytes.byteLength,arrayBuffer:async()=>bytes};
  const result=await readEvidence(file);assert.equal(result.format,format);assert.equal(result.sections[0].location.sheet,'Publication Details');assert.equal(result.sections[0].location.range,'A1:B2');assert.deepEqual(result.sections[0].rows[1],['10.1/a','John Smith']);}
});

test('PPTX adapter preserves slide references',async()=>{
 const zip=new JSZip();zip.file('ppt/slides/slide1.xml','<p:sld xmlns:a="a" xmlns:p="p"><a:t>Cloud Architecture</a:t><a:t>Containers and deployment</a:t></p:sld>');
 const bytes=await zip.generateAsync({type:'uint8array'});const file={name:'evidence.pptx',size:bytes.byteLength,arrayBuffer:async()=>bytes.buffer};
 const result=await readEvidence(file);assert.equal(result.format,'pptx');assert.equal(result.sections[0].title,'Cloud Architecture');assert.equal(result.sections[0].location.slide,1);assert.match(result.sections[0].text,/Containers/);
});

test('human review receives the complete inspectable evidence package',async()=>{
 const node=createNode('human_review');
 const output=await executeNode(node,{}, {values:{faculty:'John Smith'},policyVersions:[{version:'v1'}],outputs:{extract:{evidence:{verified:false}},compare:{comparison:{status:'mismatch'}},ai:{assistance:{structured:{decision:'relevant'}}},score:{scoring:{points:12}}}});
 assert.equal(output.review.package.submission.values.faculty,'John Smith');
 assert.equal(output.review.package.extraction[0].verified,false);
 assert.equal(output.review.package.comparison[0].status,'mismatch');
 assert.equal(output.review.package.aiRecommendation[0].structured.decision,'relevant');
 assert.equal(output.review.package.scoring[0].points,12);
 assert.equal(output.review.package.policyVersions[0].version,'v1');
});

test('new Human review is an optional terminal handoff without decision branches',async()=>{
 const root=createNode('submit'),review=createNode('human_review');root.routes.next=review.id;
 assert.deepEqual(review.routes,{});
 const run=await (await import('./workflowEngine.js')).runWorkflow({nodes:[root,review],fields:[{id:'name',label:'Employee',type:'text',required:true}],values:{name:'Alex'},policy:{enabled:false,activeVersion:'',versions:[],draft:{version:'v1',mode:'rules',aggregation:'sum',maxPoints:'',fallback:'pending',components:[],rules:[]}}});
 assert.equal(run.status,'sent-to-review');assert.equal(run.review.status,'sent-to-review');assert.equal(run.review.package.submission.values.name,'Alex');
});
