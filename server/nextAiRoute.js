import {DEFAULT_AI_INSTRUCTIONS,MAX_AI_INSTRUCTIONS} from '../src/aiContext.js';
import {requestAI} from './ai.js';

const MAX_BODY_BYTES=650000;
let active=false;

const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});

function validOrigin(request){
 const origin=request.headers.get('origin');
 if(!origin)return process.env.NODE_ENV!=='production';
 try{
  const originUrl=new URL(origin);
  const forwardedHost=request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const requestHost=forwardedHost||request.headers.get('host')||new URL(request.url).host;
  const forwardedProtocol=request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const requestProtocol=forwardedProtocol||new URL(request.url).protocol.replace(':','');
  return originUrl.host===requestHost&&originUrl.protocol===`${requestProtocol}:`;
 }catch{return false;}
}

export function aiStatus(){
 return json({configured:!!process.env.OPENROUTER_API_KEY?.trim(),model:'openrouter/free'});
}

export async function aiAssistance(request){
 if(!validOrigin(request))return json({error:'Use the application to make this request.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Use JSON.'},415);
 if(active)return json({error:'An AI request is already running. Please wait.'},429);
 const declared=Number(request.headers.get('content-length'));
 if(Number.isFinite(declared)&&declared>MAX_BODY_BYTES)return json({error:'Evidence summary is too large.'},413);
 active=true;
 try{
  const raw=await request.text();
  if(Buffer.byteLength(raw)>MAX_BODY_BYTES)return json({error:'Evidence summary is too large.'},413);
  let data;try{data=JSON.parse(raw);}catch{return json({error:'Invalid JSON.'},400);}
  const instructions=data?.instructions??DEFAULT_AI_INSTRUCTIONS;
  if(typeof instructions!=='string'||!instructions.trim()||instructions.length>MAX_AI_INSTRUCTIONS)return json({error:'Provide system instructions of 1 to 6000 characters.'},400);
  const supplied=data?.input&&typeof data.input==='object'&&Object.hasOwn(data.input,'data');
  const input=supplied?data.input.data:data?.decision;
  if(input===undefined||input===null||input==='')return json({error:'Provide an AI input.'},400);
  return json(await requestAI(input,{key:process.env.OPENROUTER_API_KEY,instructions,inputTruncated:!!data?.input?.truncated}));
 }catch{
  return json({error:'Could not complete AI assistance.'},500);
 }finally{
  active=false;
 }
}
