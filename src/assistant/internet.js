import {normalize,entities} from './commands.js';
// Public Wikimedia API. Called only when the visitor explicitly requests an online search.
export function cleanSearchQuery(question,lang){
 let q=question.replace(/(?:найди|поищи|посмотри|проверь)(?:\s+(?:мне|пожалуйста))?\s*(?:в интернете|в сети|онлайн)?/gi,'').replace(/(?:search|look up|find)(?:\s+(?:online|the web|the internet|for|me))*/gi,'').trim();
 q=q.replace(/^(?:расскажи|объясни)(?:\s+(?:мне|пожалуйста))?\s*(?:про|о)?\s*/i,'').replace(/^(?:tell me about|explain)\s*/i,'');
 q=q.replace(/(?:wikipedia|википед\S*|в интернете|онлайн|online|the internet|the web)/gi,' ').replace(/^(?:что такое|кто такой|кто такая|what is|what are|who is)\s+/i,'');
 return q.slice(0,220)||question.slice(0,220);
}
export async function searchInternet(question,lang='ru',signal){
 const root=lang==='ru'?'https://ru.wikipedia.org':'https://en.wikipedia.org';
 const params=new URLSearchParams({action:'query',generator:'search',gsrsearch:cleanSearchQuery(question,lang),gsrnamespace:'0',gsrlimit:'3',prop:'extracts|info',inprop:'url',exintro:'1',explaintext:'1',exsentences:'4',format:'json',formatversion:'2',origin:'*'});
 const own=AbortSignal.timeout(14000);const r=await fetch(root+'/w/api.php?'+params,{signal:signal?AbortSignal.any([signal,own]):own,credentials:'omit',referrerPolicy:'no-referrer'});
 if(!r.ok)throw new Error('WEB_HTTP_'+r.status);const data=await r.json();if(data.error)throw new Error('WEB_SEARCH');
 return (data.query?.pages||[]).filter(p=>p.extract&&isRelevantResult(question,p)).sort((a,b)=>(a.index||0)-(b.index||0)).map(p=>({entity:'internet',title:p.title,text:p.extract.slice(0,1800),source:root+'/?curid='+p.pageid,provider:'Wikipedia',keywords:'internet'}));
}

export function isRelevantResult(question,page){
 const title=normalize(page.title||''),hay=normalize(title+' '+(page.extract||''));
 const ids=entities(question);if(ids.length){if(!entities(hay).some(id=>ids.includes(id)))return false;if(/(?:song|album|candy|chocolate|confectionery|surname|музык|песня|альбом|шоколад|батончик)/.test(hay)&&!/(?:spacecraft|astronom|planet|космич|планет)/.test(title))return false;}
 const stop=new Set(['search','the','internet','online','wikipedia','find','please','for','about','найди','интернете','википедии']);
 const tokens=normalize(cleanSearchQuery(question,'en')).split(' ').filter(w=>w.length>2&&!stop.has(w));
 return tokens.length>0&&tokens.some(token=>title.includes(token));
}
