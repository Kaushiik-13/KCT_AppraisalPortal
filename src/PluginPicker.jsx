import React,{useEffect,useRef,useState} from 'react';
import {plugins} from './workflowModel';
export default function PluginPicker({onChoose,onClose}){
 const dialog=useRef(null),[selected,setSelected]=useState('');
 useEffect(()=>{dialog.current.showModal();},[]);
 const plugin=plugins.find(p=>p.id===selected);
 return <dialog ref={dialog} className="plugin-dialog" onCancel={onClose}><div className="tree-panel-heading"><h2>{plugin?plugin.name:'Choose a plugin'}</h2><button aria-label="Close plugin picker" onClick={onClose}>×</button></div>{plugin?<><button className="mini" onClick={()=>setSelected('')}>← All plugins</button><p>Choose the publication tool to add to this step.</p><div className="plugin-options">{plugin.tools.map(t=><button key={t.kind} onClick={()=>onChoose(plugin.id,t.kind)}><strong>{t.name}</strong><small>{t.description}</small></button>)}</div></>:<div className="plugin-options">{plugins.map(p=><button key={p.id} onClick={()=>setSelected(p.id)}><strong>{p.name}</strong><small>{p.description}</small></button>)}</div>}</dialog>;
}
