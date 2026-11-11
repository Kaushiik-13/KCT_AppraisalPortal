import test from 'node:test';
import assert from 'node:assert/strict';
import {aiAssistance,aiStatus} from './nextAiRoute.js';

const endpoint='http://127.0.0.1:3000/api/ai-assistance';
const post=(body,headers={})=>new Request(endpoint,{method:'POST',headers:{Origin:'http://127.0.0.1:3000',Host:'127.0.0.1:3000','Content-Type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)});

test('Next status route exposes configuration state without the secret',async()=>{
 const old=process.env.OPENROUTER_API_KEY;process.env.OPENROUTER_API_KEY='route-test-secret';
 try{const response=aiStatus();assert.equal(response.status,200);const body=await response.json();assert.deepEqual(body,{configured:true,model:'openrouter/free'});assert(!JSON.stringify(body).includes('route-test-secret'));}
 finally{if(old===undefined)delete process.env.OPENROUTER_API_KEY;else process.env.OPENROUTER_API_KEY=old;}
});

test('Next assistance route validates same-origin JSON, instructions and input',async()=>{
 assert.equal((await aiAssistance(new Request(endpoint,{method:'POST',headers:{Origin:'https://unrelated.example',Host:'127.0.0.1:3000','Content-Type':'application/json'},body:'{}'}))).status,403);
 assert.equal((await aiAssistance(new Request(endpoint,{method:'POST',headers:{Origin:'http://127.0.0.1:3000','Content-Type':'text/plain'},body:'{}'}))).status,415);
 assert.equal((await aiAssistance(post('invalid'))).status,400);
 assert.equal((await aiAssistance(post({input:{data:'Notes'},instructions:''}))).status,400);
 assert.equal((await aiAssistance(post({input:{data:'Notes'},instructions:'x'.repeat(6001)}))).status,400);
 assert.equal((await aiAssistance(post({instructions:'Summarize'}))).status,400);
});

test('Next assistance route accepts the forwarded public origin used by Vercel',async()=>{
 const request=post({input:{data:'Notes'},instructions:'Summarize'},{
  Origin:'https://studio.example',
  Host:'internal-host:3000',
  'X-Forwarded-Host':'studio.example',
  'X-Forwarded-Proto':'https'
 });
 const old=process.env.OPENROUTER_API_KEY;delete process.env.OPENROUTER_API_KEY;
 try{assert.equal((await aiAssistance(request)).status,200);}
 finally{if(old!==undefined)process.env.OPENROUTER_API_KEY=old;}
});

test('Next assistance route preserves generic input and missing-key behavior',async()=>{
 const old=process.env.OPENROUTER_API_KEY;delete process.env.OPENROUTER_API_KEY;
 try{const response=await aiAssistance(post({input:{data:{status:'clear'},truncated:false},instructions:'Summarize'}));assert.equal(response.status,200);assert.equal((await response.json()).status,'not-connected');}
 finally{if(old!==undefined)process.env.OPENROUTER_API_KEY=old;}
});

test('Next assistance route rejects declared oversized payloads',async()=>{
 const response=await aiAssistance(post({input:{data:'small'},instructions:'Summarize'},{'Content-Length':'650001'}));
 assert.equal(response.status,413);
});
