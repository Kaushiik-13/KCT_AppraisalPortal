export const DEFAULT_AI_INSTRUCTIONS='Explain the supplied findings for a human reviewer. Summarize what is established, identify conflicts or missing evidence, and suggest questions to resolve them. Cite supplied sources where available. Clearly label simulated evidence.';
export const MAX_AI_INSTRUCTIONS=6000;
export const MAX_AI_TEXT=100000;
export const MAX_AI_REFERENCE=12000;

// Bound excerpts before transport; never serialize a binary file as AI evidence.
export function prepareAIInput(input){
 let remaining=MAX_AI_TEXT,truncated=false;
 const visit=(value,depth=0)=>{
 if(remaining<=0||depth>8){truncated=true;return '[omitted: context limit]';}
 if(value===null||typeof value==='boolean'||typeof value==='number')return value;
 if(typeof value==='string'){const limit=remaining;remaining-=Math.min(value.length,limit);if(value.length>limit)truncated=true;return value.slice(0,limit);}
 if(typeof Blob!=='undefined'&&value instanceof Blob)return '[binary file omitted; use extracted text]';
 if(Array.isArray(value)){if(value.length>200)truncated=true;return value.slice(0,200).map(v=>visit(v,depth+1));}
 if(value&&typeof value==='object'){const entries=Object.entries(value);if(entries.length>40)truncated=true;return Object.fromEntries(entries.slice(0,40).map(([k,v])=>[k.slice(0,100),visit(v,depth+1)]));}
 return null;
 };
 const data=visit(input);const serialized=JSON.stringify(data);
 if(serialized.length>180000)return {data:{excerpt:serialized.slice(0,170000),note:'Input shortened; excerpt may end mid-record.'},truncated:true};
 return {data,truncated};
}
