// Conservative candidates, never proof of publication, authorship or indexing.
const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
const compact = value => clean(value).normalize('NFKD').replace(/[^a-z0-9]/gi, '').toLowerCase();
export function textLines(items) {
  const lines=[]; let line='';
  for(const item of items){if(typeof item.str!=='string')continue;line+=item.str;if(item.hasEOL){if(line.trim())lines.push(line.trim());line='';}}
  if(line.trim())lines.push(line.trim());return lines;
}
export function analysePaper(pages, info={}) {
  const first=pages[0]; const text=first?.text||'';
  const result=[];
  const add=(name,value,source,note='')=>result.push({name,value,status:value?'Candidate — review':'Not found',source,note});
  const metadataTitle=clean(info.Title);
  const corroborated=metadataTitle.length>8&&compact(text).includes(compact(metadataTitle));
  const items=(first?.items||[]).filter(x=>x.str?.trim()&&x.transform?.[5]>first.height*.55);
  const maxFont=Math.max(0,...items.map(x=>Math.abs(x.transform[0])));
  const heading=items.filter(x=>Math.abs(x.transform[0])>=maxFont*.92&&maxFont>=12).map(x=>x.str).join(' ');
  add('Title',corroborated?metadataTitle:clean(heading)||metadataTitle,corroborated||heading?{page:1,excerpt:corroborated?metadataTitle:clean(heading)}:metadataTitle?{metadata:'Title'}:null,'Title candidates use PDF metadata and first-page typography; confirm against the page.');
  const doiText=text.replace(/(10\.\d{4,9}\/[^\s]*[.\/-])\s*\n\s*(?=[a-z0-9])/gi,'$1');
  const dois=[...new Set((doiText.match(/10\.\d{4,9}\/[-._;()/:a-z0-9]+/gi)||[]).map(x=>x.replace(/[.,;:]+$/,'').toLowerCase()))];
  add('DOI',dois.length?dois:null,dois.length?{page:1,excerpt:doiText.split('\n').filter(l=>/10\.\d{4,9}\//.test(l)).join('\n').slice(0,900)}:null,dois.length>1?'Multiple DOI candidates. Do not choose one automatically.':'First-page candidate only; cited papers can also have DOIs.');
  const journalLine=first?.lines.find(l=>/^.{3,100}\s*\|\s*https?:\/\/doi\.org\//i.test(l));
  const labelledJournal=first?.lines.find(l=>/^Journal\s*:/i.test(l));
  const journal=journalLine?.split('|')[0].trim()||labelledJournal?.replace(/^Journal\s*:\s*/i,'');
  add('Journal / publication',journal||null,journal?{page:1,excerpt:journalLine||labelledJournal}:null,'Only explicit journal labels or a DOI running header are recognised in this first version.');
  const author=clean(info.Author);
  // Do not split commas: PDFs can store either “given surname” or “surname, given”.
  add('Authors in order',author||null,author?{metadata:'Author',page:1,excerpt:text.slice(0,1800)}:null,'PDF author metadata is shown verbatim. Compare it with the page: list order and first authorship have NOT been verified.');
  const dateLines=pages.slice(0,2).flatMap(p=>p.lines.filter(l=>/^(Published(?:\s+online)?|Publication\s+date|Online\s+publication|Accepted|Received)\s*:/i.test(l)).map(l=>({page:p.number,text:l})));
  add('Publication dates',dateLines.length?dateLines.map(d=>d.text):null,dateLines.length?{page:dateLines[0].page,excerpt:dateLines.map(d=>`Page ${d.page}: ${d.text}`).join('\n')}:null,'Dates retain their printed labels. Received and accepted dates are not automatically publication dates. PDF creation dates are ignored.');
  return {findings:result,needsReview:true,textPages:pages.filter(p=>p.text.trim().length>=40).length,emptyPages:pages.filter(p=>p.text.trim().length<40).map(p=>p.number)};
}
