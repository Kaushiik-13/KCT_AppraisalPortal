const port=(key,label,type)=>({key,label,type});
export const reusableTools=[
 {kind:'document_extract',name:'Extract document information',description:'Extract full text and page evidence from a PDF, with optional labelled fields.',inputs:[port('file','Document PDF','file')],outputs:[],routes:['next']},
 {kind:'compare_values',name:'Compare values',description:'Compare two sources using a chosen data type.',inputs:[],outputs:[port('finding','Comparison details','finding'),port('matches','Matches','boolean'),port('status','Status','text')],routes:['next']},
 {kind:'date_range',name:'Check date range',description:'Check a date against inclusive start and end dates.',inputs:[port('date','Date to check','date')],outputs:[port('finding','Date finding','finding'),port('eligible','Within range','boolean'),port('status','Status','text')],routes:['next']},
 {kind:'find_duplicates',name:'Find duplicates',description:'Compare a selected identifier and owner against configured test records.',inputs:[port('key','Record identifier','text'),port('owner','Owner / person identifier','text')],outputs:[port('finding','Duplicate finding','finding'),port('duplicate','Duplicate candidate','boolean'),port('status','Status','text')],routes:['next']},
 {kind:'external_lookup',name:'External lookup',description:'Query a public JSON API and select the returned fields.',inputs:[port('query','Lookup value','text')],outputs:[],routes:['next']},
 {kind:'apply_policy',name:'Apply scoring policy',description:'Calculate provisional marks using a saved policy version.',inputs:[],outputs:[port('scoring','Policy calculation','finding'),port('points','Provisional points','number'),port('status','Scoring status','text')],routes:['next']},
];
export const newOutputField=()=>({id:crypto.randomUUID(),name:'New field',type:'text',label:''});
export function reusableDefaults(kind){return ({document_extract:{fields:[]},compare_values:{valueType:'text',operator:'eq',ignoreCase:true},date_range:{start:'',end:''},find_duplicates:{records:[],ignoreCase:true},external_lookup:{endpoint:'',fields:[]},apply_policy:{policyVersion:''}})[kind];}
export function reusableDefinition(node){
 if(['document_extract','external_lookup'].includes(node.kind))return {outputs:[port('finding','Findings and source evidence','finding'),...(node.kind==='document_extract'?[port('fullText','Full document text','text'),port('textByPage','Text by page','document')]:[]),...(node.config.fields||[]).map(f=>port(f.id,f.name,f.type))]};
 if(node.kind==='ai')return {inputs:[port('decision','AI input','ai_context'),...(node.config.contextInputs||[]).map(f=>port(f.id,f.name||'Additional context','ai_context'))]};
 if(node.kind==='compare_values')return {inputs:[port('left','First value',node.config.valueType),port('right','Second value',node.config.valueType)]};
 return {};
}
export function parseValue(value,type){
 if(value===null||value===undefined||typeof value==='string'&&!value.trim())return null;
 if(type==='text')return typeof value==='string'?value.trim():null;
 if(type==='number')return ['string','number'].includes(typeof value)&&Number.isFinite(Number(value))?Number(value):null;
 if(type==='boolean')return [true,'true','Yes','yes'].includes(value)?true:[false,'false','No','no'].includes(value)?false:null;
 if(type==='date')return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value?value:null;
 return null;
}
export function reusableIssues(node){
 const c=node.config,errors=[];
 if(['document_extract','external_lookup'].includes(node.kind)){
 if(node.kind==='external_lookup'&&!c.fields?.length)errors.push('Add at least one output field.');
 if((c.fields||[]).some(f=>!f.name.trim()||!f.label.trim()||!['text','number','date','boolean'].includes(f.type)))errors.push('Give every output a name, type and source label/path.');
 }
 if(node.kind==='external_lookup'){try{const u=new URL(c.endpoint);if(u.protocol!=='https:'||u.username||u.password||!c.endpoint.includes('{value}'))throw Error();}catch{errors.push('Enter an HTTPS API URL containing {value}, without credentials.');}}
 if(node.kind==='date_range'&&(!parseValue(c.start,'date')||!parseValue(c.end,'date')||c.start>c.end))errors.push('Enter a valid start and end date.');
 if(node.kind==='find_duplicates'&&(c.records||[]).some(r=>!r.key?.trim()||!r.owner?.trim()))errors.push('Complete each record identifier and owner.');
 if(node.kind==='compare_values'&&!['eq','ne',...(['number','date'].includes(c.valueType)?['gte','lte']:[])].includes(c.operator))errors.push('Choose a compatible comparison.');
 if(node.kind==='apply_policy'&&!c.policyVersion)errors.push('Select a saved scoring policy version.');
 return errors;
}
const normalized=(v,fold)=>fold?v.trim().toLowerCase():v;
export async function executeReusable(node,input,ctx){
 const c=node.config;
 if(node.kind==='compare_values'){
 let left=parseValue(input.left,c.valueType),right=parseValue(input.right,c.valueType);
 if(c.valueType==='text'&&left!==null&&right!==null){left=normalized(left,c.ignoreCase);right=normalized(right,c.ignoreCase);}
 const matches=left===null||right===null?null:c.operator==='eq'?left===right:c.operator==='ne'?left!==right:c.operator==='gte'?left>=right:left<=right;
 const status=matches===null?'uncertain':matches?'matched':'different';return {finding:{status,left,right,operator:c.operator},matches,status};
 }
 if(node.kind==='date_range'){const date=parseValue(input.date,'date');const eligible=date===null?null:date>=c.start&&date<=c.end;const status=eligible===null?'uncertain':eligible?'eligible':'ineligible';return {finding:{status,date,start:c.start,end:c.end},eligible,status};}
 if(node.kind==='find_duplicates'){
 const key=parseValue(input.key,'text'),owner=parseValue(input.owner,'text');const records=key===null||owner===null?null:c.records.filter(r=>normalized(r.key,c.ignoreCase)===normalized(key,c.ignoreCase)&&normalized(r.owner,c.ignoreCase)===normalized(owner,c.ignoreCase));
 const duplicate=records===null?null:records.length>0;const status=duplicate===null?'uncertain':duplicate?'candidate':'clear';return {finding:{status,matches:records,scope:'Configured test records only; not a complete organizational history.'},duplicate,status};
 }
 if(node.kind==='document_extract'){
 if(!Array.isArray(input.file)||input.file.length!==1)throw Error('Choose exactly one PDF for document extraction.');
 const document=await ctx.extract(input.file[0]);const result={},findings=[];
 const pages=(document.pages||[]).map(p=>({page:p.number,text:p.text||''}));
 const unreadablePages=pages.filter(p=>!p.text.trim()).map(p=>p.page);
 const readable=pages.some(p=>p.text.trim());
 const note=readable?`Extracted PDF text, not verified facts. ${unreadablePages.length?`Pages ${unreadablePages.join(', ')} have no extractable text; their content has NOT been evaluated.`:'All pages contain extractable text; images, diagrams and reading order may still need manual review.'}`:'No extractable text. This PDF may be scanned; OCR is not available. Provide a text PDF or request manual review.';
 const fullText=readable?[note,...pages.map(p=>`[Page ${p.page}]\n${p.text||'[No extractable text on this page]'}`)].join('\n\n'):null;
 for(const f of c.fields){const candidates=[];for(const page of document.pages||[])for(const line of page.text.split('\n')){const separator=line.indexOf(':');if(separator>=0&&line.slice(0,separator).trim().toLowerCase()===f.label.trim().toLowerCase())candidates.push({raw:line.slice(separator+1).trim(),page:page.number,excerpt:line});}
 const distinct=[...new Set(candidates.map(x=>x.raw))];const value=distinct.length===1?parseValue(distinct[0],f.type):null;result[f.id]=value;findings.push({name:f.name,value,status:value===null?'uncertain':'candidate',evidence:candidates});}
 return {finding:{status:!readable||unreadablePages.length||findings.some(f=>f.value===null)?'uncertain':'candidate',findings,note,pages,pageCount:pages.length,unreadablePages,characterCount:fullText?.length||0},fullText,textByPage:readable?{note,pages}:null,...result};
 }
 if(node.kind==='external_lookup'){
 const unknown=reason=>({finding:{status:'unknown',reason},...Object.fromEntries(c.fields.map(f=>[f.id,null]))});
 if(!parseValue(input.query,'text'))return unknown('Lookup value is missing.');
 const source=c.endpoint.replaceAll('{value}',encodeURIComponent(input.query));const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),18000);
 try{const response=await (ctx.fetcher||fetch)(source,{signal:controller.signal,credentials:'omit',headers:{Accept:'application/json'}});if(!response.ok)return unknown(`API returned HTTP ${response.status}.`);const text=await response.text();if(text.length>1000000)return unknown('API response exceeds the 1 MB limit.');const data=JSON.parse(text);const result={};for(const f of c.fields){const raw=f.label.split('.').reduce((v,k)=>v&&Object.hasOwn(v,k)?v[k]:undefined,data);result[f.id]=parseValue(raw,f.type);}return {finding:{status:Object.values(result).some(v=>v===null)?'unknown':'found',source,values:result,retrievedAt:new Date().toISOString()},...result};}catch{return unknown('API could not return JSON. Check the URL, network and browser CORS support.');}finally{clearTimeout(timer);}
 }
 return null;
}
