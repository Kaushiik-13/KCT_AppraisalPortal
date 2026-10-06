import test from 'node:test';
import assert from 'node:assert/strict';
import {createNode,chooseActionTool,sourceChoices,nodeDefinition,exampleWorkflow} from './workflowModel.js';
import {insertStep} from './treeModel.js';
import {validDraft,writeDraft,readDraft} from './draftStorage.js';
import {validateWorkflow} from './workflowEngine.js';

const field={id:'hours',label:'Training hours',type:'number',required:true,help:'',options:'',accept:'',multiple:false};
test('training workflow uses typed general tools, branches and autosaves',()=>{
 let {nodes,selected}=insertStep([], [field], 'action');
 nodes=nodes.map(n=>n.id===selected?chooseActionTool(n,'read_number'):n);
 nodes[1].mappings.value='field|hours';
 const inserted=insertStep(nodes,[field],'condition',selected);
 nodes=inserted.nodes;
 const condition=nodes.find(n=>n.id===inserted.selected);
 assert.equal(condition.mappings.value,`node|${selected}|value`);
 condition.config.expected='8';
 for(const route of ['clear','failed','uncertain'])nodes=insertStep(nodes,[field],route==='uncertain'?'human_review':'result',condition.id,route).nodes;
 const draft={name:'Training participation',fields:[field],nodes};
 assert.equal(validDraft(draft),true);
 let raw;const storage={setItem:(_,v)=>raw=v,getItem:()=>raw};writeDraft(storage,draft);
 assert.deepEqual(readDraft(storage).draft,draft);
 assert.ok(validateWorkflow(nodes,[field]).some(issue=>issue.includes('final outcome')));
});
test('changing tools preserves identity and routes but invalidates incompatible sources',()=>{
 let action=chooseActionTool(createNode('action'),'read_number');
 const condition=createNode('condition');condition.mappings.value=`node|${action.id}|value`;
 action.routes.next=condition.id;
 const changed=chooseActionTool(action,'read_text');
 assert.equal(changed.id,action.id);assert.deepEqual(changed.routes,action.routes);
 assert.equal(sourceChoices(condition,{type:'number'},[changed,condition],[]).length,0);
 assert.equal(nodeDefinition(changed).outputs[0].type,'text');
});
test('publication example retains its original twelve executable node definitions',()=>{
 const nodes=exampleWorkflow([]);
 assert.equal(nodes.length,12);
 assert.equal(nodes.filter(n=>n.kind==='submit').length,1);
 assert.equal(validDraft({name:'Publication',fields:[],nodes}),true);
});
