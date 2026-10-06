import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {requestAI,evidenceForAI,aiMiddleware} from './ai.js';
const decision={status:'uncertain',reasons:['Index evidence missing'],facts:{scopus:'unknown'},checks:{comparison:{source:'page 1'},duplicate:{status:'candidate',records:[{private:'omit'}],scope:'session'}}};
test('missing key gives explicit non-AI result without calling provider',async()=>{let called=false;const r=await requestAI(decision,{fetcher:async()=>{called=true;}});assert.equal(called,false);assert.equal(r.status,'not-connected');});
test('live adapter locks free router, bounds reply, and returns advisory only',async()=>{let body;const r=await requestAI(decision,{key:'test-secret',fetcher:async(url,options)=>{body=JSON.parse(options.body);assert.equal(url,'https://openrouter.ai/api/v1/chat/completions');assert.equal(options.headers.Authorization,'Bearer test-secret');return {ok:true,json:async()=>({model:'fixture/free-model',choices:[{message:{content:'Please verify the indexing source.'}}]})};}});assert.equal(body.model,'openrouter/free');assert.equal(body.messages[0].role,'system');assert.equal(r.status,'advisory');assert(!JSON.stringify(r).includes('test-secret'));assert(!('points' in r));});
test('provider errors and empty responses become reviewable unavailability',async()=>{for(const status of [401,429,500]){const r=await requestAI(decision,{key:'test',fetcher:async()=>({ok:false,status})});assert.equal(r.status,'unavailable');}const r=await requestAI(decision,{key:'test',fetcher:async()=>({ok:true,json:async()=>({choices:[]})})});assert.equal(r.status,'unavailable');});
test('evidence summary omits duplicate personal record bodies',()=>{assert(!JSON.stringify(evidenceForAI(decision)).includes('private'));});
test('clear and generic inputs use creator instructions as system instructions, evidence stays user data',async()=>{
 for(const input of [{status:'clear',facts:{primary:'yes'}},'Training completed']){
 let body;const output=await requestAI(input,{key:'fixture',instructions:'Summarize the achievement in five bullets.',fetcher:async(url,options)=>{body=JSON.parse(options.body);return {ok:true,json:async()=>({choices:[{message:{content:'A summary.'}}]})};}});
 assert.equal(output.status,'advisory');assert.equal(body.messages[1].role,'system');assert.equal(body.messages[1].content,'Summarize the achievement in five bullets.');assert.equal(body.messages[2].role,'user');assert.deepEqual(JSON.parse(body.messages[2].content).data,input);
 }
});
test('endpoint accepts clear results and generic input, rejects invalid instructions',async()=>{
 const middleware=aiMiddleware(()=>({OPENROUTER_API_KEY:''}));const server=createServer((req,res)=>middleware(req,res,()=>res.end()));await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/api/ai-assistance`;
 const post=data=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 try{for(const data of [{decision:{status:'clear',reasons:[]}},{input:{data:'Notes',truncated:false},instructions:'Summarize'}]){const r=await post(data);assert.equal(r.status,200);assert.equal((await r.json()).status,'not-connected');}
 assert.equal((await post({input:{data:'Notes'},instructions:''})).status,400);assert.equal((await post({input:{data:'Notes'},instructions:'x'.repeat(6001)})).status,400);
 }finally{await new Promise(r=>server.close(r));}
});
test('local endpoint returns status without secrets and enforces input and origin',async()=>{const middleware=aiMiddleware(()=>({OPENROUTER_API_KEY:''}));const server=createServer((req,res)=>middleware(req,res,()=>{res.statusCode=404;res.end();}));await new Promise(r=>server.listen(0,'127.0.0.1',r));const root=`http://127.0.0.1:${server.address().port}`;try{assert.deepEqual(await (await fetch(root+'/api/ai-status')).json(),{configured:false,model:'openrouter/free'});assert.equal((await fetch(root+'/api/ai-assistance',{method:'POST',headers:{Origin:'https://unrelated.example','Content-Type':'application/json'},body:JSON.stringify({decision})})).status,403);assert.equal((await fetch(root+'/api/ai-assistance',{method:'POST',headers:{'Content-Type':'application/json'},body:'invalid'})).status,400);const res=await fetch(root+'/api/ai-assistance',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({decision})});assert.equal((await res.json()).status,'not-connected');}finally{await new Promise(r=>server.close(r));}});

 test('reasoning-only and partial length-limited replies are not accepted as advice',async()=>{
 for(const content of [null,'An unfinished summary']){
 let body;const result=await requestAI(decision,{key:'secret',fetcher:async(url,options)=>{body=JSON.parse(options.body);return {ok:true,json:async()=>({model:'fixture:free',choices:[{finish_reason:'length',message:{content,reasoning:'private reasoning'}}]})};}});
 assert.equal(body.max_tokens,4096);assert.deepEqual(body.reasoning,{effort:'low',exclude:true});assert.equal(result.status,'unavailable');assert.equal(result.model,'fixture:free');assert.equal(result.finishReason,'length');assert.match(result.summary,/response limit/);assert(!JSON.stringify(result).includes('private reasoning'));
 }
 });
