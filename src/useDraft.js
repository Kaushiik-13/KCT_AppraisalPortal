import {newScoringPolicy} from './scoringPolicy';
import {useCallback,useLayoutEffect,useState} from 'react';
import {DRAFT_KEY,emptyDraft,readDraft,writeDraft} from './draftStorage';
export default function useDraft(){
 const [initial]=useState(()=>{try{return readDraft(window.localStorage);}catch{return {draft:emptyDraft(),blocked:true,error:'Browser storage is unavailable. Your draft cannot be saved yet.'};}});
 const [draft,setDraft]=useState(()=>({...initial.draft,policy:initial.draft.policy||newScoringPolicy()}));
 const [blocked,setBlocked]=useState(!!initial.blocked);
 const [save,setSave]=useState({status:initial.blocked?'error':'saving',error:initial.error});
 const [retry,setRetry]=useState(0);
 // Save each committed configuration edit before the browser can reload. Drafts are small;
 // no delayed debounce is used, so the last keystroke is included in immediate reloads.
 useLayoutEffect(()=>{if(blocked)return;try{setSave(writeDraft(window.localStorage,draft));}catch{setSave({status:'error',error:'Browser storage is unavailable. Download your draft to keep it.'});}},[draft,blocked,retry]);
 const setPart=useCallback((key,value)=>setDraft(prev=>({...prev,[key]:typeof value==='function'?value(prev[key]):value})),[]);
 const setName=useCallback(v=>setPart('name',v),[setPart]);
 const setFields=useCallback(v=>setPart('fields',v),[setPart]);
 const setPolicy=useCallback(v=>setPart('policy',v),[setPart]);
 const setNodes=useCallback(v=>setPart('nodes',v),[setPart]);
 const retrySave=()=>{if(blocked){try{const raw=window.localStorage.getItem(DRAFT_KEY);if(raw)window.localStorage.setItem(`${DRAFT_KEY}.recovery`,raw);setBlocked(false);}catch{setSave({status:'error',error:'Storage is still unavailable. Download your draft to keep it.'});return;}}setRetry(x=>x+1);};
 const clearDraft=()=>{
 if(!window.confirm('Clear this saved KPI draft? This removes its input fields, workflow, scoring policies and saved versions, then starts a fresh session. This cannot be undone.'))return;
 try{window.localStorage.removeItem(`${DRAFT_KEY}.recovery`);window.localStorage.removeItem(DRAFT_KEY);window.location.reload();}
 catch{setSave({status:'error',error:'Could not clear the saved draft. Browser storage may be unavailable.'});}
 };
 const download=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,draft},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='afpi-kpi-draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 return {draft,setName,setFields,setNodes,setPolicy,save,restored:initial.restored,blocked,retrySave,download,clearDraft};
}
