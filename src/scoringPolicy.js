import {nodeDefinition,FACTS} from './workflowModel.js';

export const newScoringPolicy=()=>({enabled:false,activeVersion:'',versions:[],draft:{version:'v1',maxPoints:'',fallback:'pending',rules:[]}});
export const newScoringRule=()=>({id:crypto.randomUUID(),name:'New rule',match:'all',conditions:[{source:'result|outcome',type:'text',operator:'eq',expected:''}],points:'12',multiplier:'1',outcome:'Eligible'});
const scalarTypes=['text','number','date','boolean'];
export function policySources(fields,nodes){
 const choices=[{value:'result|outcome',label:'Final workflow outcome',type:'text'}];
 const fieldType={integer:'number',textarea:'text',email:'text',url:'text',select:'text'};
 for(const f of fields){const type=fieldType[f.type]||f.type;if(scalarTypes.includes(type))choices.push({value:`field|${f.id}`,label:`Input: ${f.label}`,type});}
 for(const n of nodes){
 for(const p of nodeDefinition(n)?.outputs||[])if(scalarTypes.includes(p.type))choices.push({value:`node|${n.id}|${p.key}`,label:`${n.name}: ${p.label}`,type:p.type});
 const kind=['action','plugin'].includes(n.kind)?n.config.tool:n.kind;
 const paths=kind==='decision'?Object.keys(FACTS).map(k=>`decision.facts.${k}`):kind==='index'?['index.scopus','index.wos','index.sae']:kind==='author'?['author.primary']:kind==='period'?['period.status']:kind==='duplicate'?['duplicate.status']:kind==='human_review'?['review.action']:kind==='condition'?['condition.status']:[];
 for(const path of paths)choices.push({value:`node|${n.id}|${path}`,label:`${n.name}: ${path.split('.').at(-1)}`,type:'text'});
 }
 return choices;
}
function scalar(v,type){
 if(v===null||v===undefined||typeof v==='string'&&!v.trim())return null;
 if(type==='number')return ['number','string'].includes(typeof v)&&Number.isFinite(Number(v))?Number(v):null;
 if(type==='boolean')return [true,'true','Yes'].includes(v)?true:[false,'false','No'].includes(v)?false:null;
 if(type==='date')return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v?v:null;
 return type==='text'&&typeof v==='string'?v:null;
}
const nonnegative=v=>v!==''&&v!==null&&!(typeof v==='string'&&!v.trim())&&['string','number'].includes(typeof v)&&Number.isFinite(Number(v))&&Number(v)>=0;
export function validPolicyShape(p){
 const version=v=>v&&typeof v.version==='string'&&['string','number'].includes(typeof v.maxPoints)&&['pending','zero'].includes(v.fallback)&&Array.isArray(v.rules)&&v.rules.every(r=>r&&['id','name','match','outcome'].every(k=>typeof r[k]==='string')&&['points','multiplier'].every(k=>['number','string'].includes(typeof r[k]))&&Array.isArray(r.conditions)&&r.conditions.every(c=>c&&['source','type','operator','expected'].every(k=>typeof c[k]==='string')));
 return !!p&&typeof p.enabled==='boolean'&&typeof p.activeVersion==='string'&&version(p.draft)&&Array.isArray(p.versions)&&p.versions.every(version)&&new Set(p.versions.map(v=>v.version)).size===p.versions.length;
}
export function validateScoringVersion(version,fields,nodes){
 if(!version)return ['Save a policy version first.'];
 const errors=[],sources=policySources(fields,nodes);
 if(!version.version.trim())errors.push('Enter a policy version name.');
 if(!version.rules.length)errors.push('Add at least one scoring rule.');
 if(version.maxPoints!==''&&!nonnegative(version.maxPoints))errors.push('The score cap must be zero or a positive number.');
 for(const r of version.rules){
 if(!r.name.trim()||!r.outcome.trim())errors.push('Each rule needs a name and an outcome.');
 if(!['all','any'].includes(r.match)||!r.conditions.length)errors.push(`${r.name}: add conditions and choose all or any.`);
 if(!nonnegative(r.points)||!nonnegative(r.multiplier)||!Number.isFinite(Number(r.points)*Number(r.multiplier)))errors.push(`${r.name}: points and multiplier must give a finite, non-negative score.`);
 for(const c of r.conditions){const source=sources.find(s=>s.value===c.source);if(!source||source.type!==c.type)errors.push(`${r.name}: a condition source was removed or changed type.`);
 if(!['eq','ne',...(['number','date'].includes(c.type)?['gte','lte']:[])].includes(c.operator)||scalar(c.expected,c.type)===null)errors.push(`${r.name}: enter a valid comparison value.`);}
 }
 return [...new Set(errors)];
}
export function saveScoringVersion(policy,fields,nodes){
 const draft={...policy.draft,version:policy.draft.version.trim()};
 const issues=validateScoringVersion(draft,fields,nodes);if(issues.length)throw Error(issues.join(' '));
 if(policy.versions.some(v=>v.version===draft.version))throw Error('That version is already saved. Use a new version name to keep earlier rules unchanged.');
 return {...policy,activeVersion:draft.version,versions:[...policy.versions,structuredClone(draft)]};
}
export function evaluateScoringVersion(policy,{values,outputs,result}){
 const trace=[];const base={version:policy.version,policy:structuredClone(policy)};
 const pending=reason=>({...base,status:'pending',points:null,outcome:'Pending review',trace:[...trace,reason]});
 for(const r of policy.rules){
 const checks=r.conditions.map(c=>{const [origin,id,path]=c.source.split('|');const raw=origin==='result'?result.outcome:origin==='field'?values[id]:(path||'').split('.').reduce((v,k)=>v?.[k],outputs[id]);const actual=scalar(raw,c.type),expected=scalar(c.expected,c.type);
 const match=actual===null?null:c.operator==='eq'?actual===expected:c.operator==='ne'?actual!==expected:c.operator==='gte'?actual>=expected:actual<=expected;
 return {source:c.source,actual,expected,operator:c.operator,match};});
 const match=r.match==='all'?(checks.some(c=>c.match===false)?false:checks.some(c=>c.match===null)?null:true):(checks.some(c=>c.match===true)?true:checks.some(c=>c.match===null)?null:false);
 trace.push({rule:r.name,match,checks});
 if(match===null)return pending(`Cannot decide rule "${r.name}" because evidence is missing. Later rules were not used.`);
 if(match){const rawPoints=Number(r.points)*Number(r.multiplier);const capped=policy.maxPoints===''?rawPoints:Math.min(rawPoints,Number(policy.maxPoints));return {...base,status:'scored',points:Number(capped.toFixed(2)),outcome:r.outcome,rule:r.name,trace:[...trace,`${r.points} x ${r.multiplier} = ${rawPoints}${policy.maxPoints!==''?`; cap ${policy.maxPoints}`:''}`]};}
 }
 return policy.fallback==='zero'?{...base,status:'scored',points:0,outcome:'No matching rule',trace:[...trace,'No rule matched: configured fallback is zero.']}:pending('No rule matched: pending review.');
}
