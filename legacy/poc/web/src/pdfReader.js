import {getDocument,GlobalWorkerOptions} from 'pdfjs-dist';
import {analysePaper,textLines} from './paperFindings';
GlobalWorkerOptions.workerSrc='/pdf.worker.min.mjs';
export async function readPaper(file,onProgress=()=>{}){
 if(!file||file.size===0)throw new Error('Choose a non-empty PDF file.');
 if(file.size>20*1024*1024)throw new Error('For this prototype, choose a PDF smaller than 20 MB.');
 const bytes=new Uint8Array(await file.arrayBuffer());
 if(!new TextDecoder().decode(bytes.slice(0,1024)).includes('%PDF-'))throw new Error('This file is not a PDF. Choose the original paper PDF.');
 const task=getDocument({data:bytes,isEvalSupported:false});
 task.onPassword=()=>{task.destroy();};
 try{
  const doc=await task.promise;
  if(doc.numPages>100)throw new Error('For this prototype, choose a PDF with 100 pages or fewer.');
  const {info}=await doc.getMetadata().catch(()=>({info:{}}));const pages=[];
  for(let i=1;i<=doc.numPages;i++){onProgress(`Reading page ${i} of ${doc.numPages}…`);const page=await doc.getPage(i);const content=await page.getTextContent();const lines=textLines(content.items);pages.push({number:i,height:page.getViewport({scale:1}).height,items:content.items,lines,text:lines.join('\n')});page.cleanup();}
  return {fileName:file.name,pageCount:doc.numPages,pages,...analysePaper(pages,info),completedAt:new Date().toLocaleTimeString()};
 }catch(error){if(error?.name==='PasswordException'||task.destroyed)throw new Error('This PDF could not be opened. If password-protected, use an unlocked copy.');throw new Error(`Could not read the PDF. ${error.message||'It may be damaged or password-protected.'}`);}
 finally{await task.destroy();}
}
