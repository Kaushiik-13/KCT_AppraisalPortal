import {validPolicyShape} from './scoringPolicy.js';
import {definition,actionTools,valueTypes} from './workflowModel.js';
export const DRAFT_KEY='afpi.kpi-draft.v1';
export const emptyDraft=()=>({name:'Untitled KPI',fields:[],nodes:[]});
const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const strings=v=>object(v)&&Object.values(v).every(x=>typeof x==='string');
const fieldTypes=['text','textarea','number','integer','date','datetime','email','url','select','multi','boolean','file'];
export function validDraft(d){
 if(d?.policy!==undefined&&!validPolicyShape(d.policy))return false;
 if(!object(d)||typeof d.name!=='string'||!Array.isArray(d.fields)||!Array.isArray(d.nodes))return false;
 if(!d.fields.every(f=>object(f)&&typeof f.id==='string'&&typeof f.label==='string'&&fieldTypes.includes(f.type)&&typeof f.required==='boolean'&&typeof f.help==='string'&&typeof f.options==='string'&&typeof f.accept==='string'&&typeof f.multiple==='boolean'))return false;
 if(new Set(d.fields.map(f=>f.id)).size!==d.fields.length||new Set(d.nodes.map(n=>n?.id)).size!==d.nodes.length)return false;
 return d.nodes.every(n=>{
 if(!object(n)||typeof n.id!=='string'||!definition(n.kind)||typeof n.name!=='string'||!strings(n.mappings)||!strings(n.routes)||!object(n.config))return false;
 const c=n.config;
 if(n.kind==='plugin')return c.plugin==='publication'&&typeof c.tool==='string'&&object(c.settings)&&['extract','lookup','compare','author','period','index','duplicate','decision','score','review'].includes(c.tool)&&validDraft({name:'',fields:[],nodes:[{...n,kind:c.tool,config:c.settings}]});
 if(n.kind==='action')return typeof c.tool==='string'&&object(c.settings)&&(c.tool===''||actionTools.some(t=>t.kind===c.tool)&&validDraft({name:'',fields:[],nodes:[{...n,kind:c.tool,config:c.settings}]}));
 if(n.kind==='condition')return valueTypes.includes(c.valueType)&&['eq','ne','gte','lte'].includes(c.operator)&&typeof c.expected==='string';
 if(n.kind==='human_review')return typeof c.role==='string'&&typeof c.instructions==='string';
 if(n.kind==='result')return typeof c.outcome==='string'&&valueTypes.includes(c.valueType);

 if(['document_extract','external_lookup'].includes(n.kind))return (n.kind!=='external_lookup'||typeof c.endpoint==='string')&&Array.isArray(c.fields)&&new Set(c.fields.map(f=>f.id)).size===c.fields.length&&c.fields.every(f=>object(f)&&['id','name','label'].every(k=>typeof f[k]==='string')&&valueTypes.includes(f.type)&&!['finding','fullText','textByPage','__proto__','constructor','prototype'].includes(f.id));
 if(n.kind==='compare_values')return valueTypes.includes(c.valueType)&&['eq','ne','gte','lte'].includes(c.operator)&&typeof c.ignoreCase==='boolean';
 if(n.kind==='date_range')return typeof c.start==='string'&&typeof c.end==='string';
 if(n.kind==='find_duplicates')return typeof c.ignoreCase==='boolean'&&Array.isArray(c.records)&&c.records.every(r=>object(r)&&typeof r.key==='string'&&typeof r.owner==='string');
 if(n.kind==='apply_policy')return typeof c.policyVersion==='string';
 if(n.kind==='period')return ['start','end','dateRule'].every(k=>typeof c[k]==='string');
 if(n.kind==='index')return Array.isArray(c.registry)&&c.registry.every(r=>object(r)&&['doi','scopus','wos','sae','start','end','source'].every(k=>typeof r[k]==='string'));
 if(n.kind==='duplicate')return Array.isArray(c.records)&&c.records.every(r=>object(r)&&typeof r.doi==='string'&&typeof r.faculty==='string');
 if(n.kind==='ai')return typeof c.mode==='string'&&(c.instructions===undefined||typeof c.instructions==='string')&&(c.referenceText===undefined||typeof c.referenceText==='string')&&(c.contextInputs===undefined||Array.isArray(c.contextInputs)&&c.contextInputs.length<=8&&new Set(c.contextInputs.map(f=>f.id)).size===c.contextInputs.length&&c.contextInputs.every(f=>object(f)&&typeof f.id==='string'&&typeof f.name==='string'&&!['decision','__proto__','constructor','prototype'].includes(f.id)));
 if(n.kind==='score')return object(c.policy)&&typeof c.policy.version==='string'&&Array.isArray(c.policy.rules)&&c.policy.rules.every(r=>object(r)&&['id','name','match'].every(k=>typeof r[k]==='string')&&['number','string'].includes(typeof r.points)&&['number','string'].includes(typeof r.multiplier)&&Array.isArray(r.conditions)&&r.conditions.every(x=>object(x)&&['scopus','wos','sae','primary','period','duplicate'].includes(x.fact)&&typeof x.op==='string'&&typeof x.value==='string'));
 return true;
 });
}
export function readDraft(storage){
 try{const raw=storage.getItem(DRAFT_KEY);if(!raw)return {draft:emptyDraft(),restored:false};const parsed=JSON.parse(raw);if(parsed.version!==1||!validDraft(parsed.draft))throw Error('Invalid draft');return {draft:parsed.draft,restored:true,savedAt:parsed.savedAt};}
 catch{return {draft:emptyDraft(),restored:false,blocked:true,error:'Your saved draft could not be restored. It has not been replaced.'};}
}
export function writeDraft(storage,draft){
 // Persist configuration only: no files, submitted values, run results, or credentials.
 const record={version:1,savedAt:new Date().toISOString(),draft:{name:draft.name,fields:draft.fields,nodes:draft.nodes,...(draft.policy?{policy:draft.policy}:{})}};
 try{storage.setItem(DRAFT_KEY,JSON.stringify(record));return {status:'saved',savedAt:record.savedAt};}
 catch{return {status:'error',error:'Couldn’t save on this browser. Your changes are still open here. Check browser storage or download the draft.'};}
}
