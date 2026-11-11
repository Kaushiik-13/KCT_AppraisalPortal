import {createNode,suggestMappings} from './workflowModel.js';
export function orderedNodes(nodes){
 const indegree=new Map(nodes.map(n=>[n.id,0]));
 for(const n of nodes)for(const target of new Set(Object.values(n.routes)))if(indegree.has(target))indegree.set(target,indegree.get(target)+1);
 const queue=nodes.filter(n=>!indegree.get(n.id));const result=[];
 while(queue.length){const n=queue.shift();result.push(n);for(const target of new Set(Object.values(n.routes)))if(indegree.has(target)){indegree.set(target,indegree.get(target)-1);if(!indegree.get(target))queue.push(nodes.find(x=>x.id===target));}}
 return [...result,...nodes.filter(n=>!result.includes(n))];
}
export function insertStep(nodes,fields,kind,sourceId,route='next'){
 let next=nodes;
 if(!next.length){const root={...createNode('submit'),name:'Submission received'};if(kind==='submit')return {nodes:[root],selected:root.id};next=[root];sourceId=root.id;}
 if(kind==='submit')throw Error('Your workflow already has a submission trigger.');
 const source=next.find(n=>n.id===sourceId);if(!source||!(route in source.routes))throw Error('Choose a + on a path to place this step.');
 const previous=source.routes[route];const n=createNode(kind);
 if(previous&&!('next' in n.routes)&&!('clear' in n.routes))throw Error('Add a final review at the end of a path. Existing steps have been kept.');
 if('next' in n.routes)n.routes.next=previous;
 else if('clear' in n.routes)n.routes.clear=previous;
 next=orderedNodes([...next.map(x=>x.id===sourceId?{...x,routes:{...x.routes,[route]:n.id}}:x),n]);
 return {nodes:next.map(x=>x.id===n.id?suggestMappings(n,next,fields):x),selected:n.id};
}
export function moveStep(nodes,id,sourceId,route){
 const n=nodes.find(x=>x.id===id);const source=nodes.find(x=>x.id===sourceId);
 if(!n||!source||id===sourceId||!(route in source.routes))throw Error('Choose a different insertion point.');
 if(n.kind==='submit'||Object.keys(n.routes).length!==1)throw Error('Move an action step. Triggers, branch points and final reviews stay with their paths.');
 const parents=nodes.flatMap(x=>Object.entries(x.routes).filter(([,target])=>target===id).map(([r])=>({id:x.id,route:r})));
 if(parents.length>1)throw Error('This step is shared by several paths. Update its connections in settings before moving it.');
 if(source.routes[route]===id)return nodes;
 const following=Object.values(n.routes)[0];const ownRoute=Object.keys(n.routes)[0];
 let next=nodes.map(x=>({...x,routes:Object.fromEntries(Object.entries(x.routes).map(([r,t])=>[r,t===id?following:t]))}));
 const target=next.find(x=>x.id===sourceId).routes[route];
 next=next.map(x=>x.id===sourceId?{...x,routes:{...x.routes,[route]:id}}:x.id===id?{...x,routes:{...x.routes,[ownRoute]:target}}:x);
 if(hasCycle(next))throw Error('That move would create a loop. Choose another path.');
 return orderedNodes(next);
}
export function removeStep(nodes,id){
 const n=nodes.find(x=>x.id===id);if(!n)return nodes;
 const replacement=Object.keys(n.routes).length===1?Object.values(n.routes)[0]:'';
 return orderedNodes(nodes.filter(x=>x.id!==id).map(x=>({...x,routes:Object.fromEntries(Object.entries(x.routes).map(([r,t])=>[r,t===id?replacement:t]))})));
}
export function hasCycle(nodes){
 const seen=new Set(),active=new Set(),byId=new Map(nodes.map(n=>[n.id,n]));
 const visit=id=>{if(active.has(id))return true;if(seen.has(id)||!byId.has(id))return false;active.add(id);for(const t of Object.values(byId.get(id).routes))if(visit(t))return true;active.delete(id);seen.add(id);return false;};return nodes.some(n=>visit(n.id));
}
export function layoutTree(nodes){
 const ordered=orderedNodes(nodes);const ranks=new Map();const root=nodes.find(n=>n.kind==='submit');const reachable=new Set();const collect=id=>{if(reachable.has(id))return;const n=nodes.find(x=>x.id===id);if(!n)return;reachable.add(id);Object.values(n.routes).forEach(collect);};if(root)collect(root.id);
 for(const n of ordered){const r=ranks.get(n.id)||0;ranks.set(n.id,r);for(const t of Object.values(n.routes))if(t&&t!==n.id&&nodes.some(x=>x.id===t)&&ordered.findIndex(x=>x.id===t)>ordered.indexOf(n))ranks.set(t,Math.max(ranks.get(t)||0,r+1));}
 const rows=new Map();for(const n of ordered){const rank=ranks.get(n.id);if(!rows.has(rank))rows.set(rank,[]);rows.get(rank).push(n);}
 const width=Math.max(880,...[...rows.values()].map(row=>row.length*330+160));const points=new Map();
 for(const [rank,row] of rows)row.forEach((n,i)=>points.set(n.id,{x:width/2+(i-(row.length-1)/2)*330,y:70+rank*230,rank}));
 const height=Math.max(650,Math.max(0,...ranks.values())*230+350);
 return {width,height,points,reachable,cycle:hasCycle(nodes)};
}
