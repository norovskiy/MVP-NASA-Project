// Only these explicit actions can control the site. Model output never executes code.
export const normalize = value => String(value).toLowerCase().replace(/ё/g,'е').replace(/[^\p{L}\p{N}\s-]/gu,' ').replace(/\s+/g,' ').trim();
export const aliases = {
 perseverance:['perseverance','персеверанс','персевиренс'],curiosity:['curiosity','кьюриосити','куриосити'],opportunity:['opportunity','оппортьюнити','опортюнити','оппорчунити'],spirit:['spirit','спирит'],insight:['insight','инсайт'],ingenuity:['ingenuity','индженюити','инженьюити'],sojourner:['sojourner','соджорнер','соджорнер'],cadre:['cadre','кадре'],dragonfly:['dragonfly','драгонфлай'],moon:['moon','лун'],mars:['mars','марс'],earth:['earth','земл'],mercury:['mercury','меркур'],venus:['venus','венер'],jupiter:['jupiter','юпитер'],saturn:['saturn','сатурн'],uranus:['uranus','уран'],neptune:['neptune','нептун'],apollo11:['apollo 11','аполлон 11','аполло 11'],apollo17:['apollo 17','аполлон 17','аполло 17'],voyager1:['voyager 1','вояджер 1'],voyager2:['voyager 2','вояджер 2'],dawn:['dawn','рассвет']
};
export function entities(text){const q=normalize(text);return Object.entries(aliases).filter(([,xs])=>xs.some(x=>q.includes(x))).map(([id])=>id)}
export function commandFor(text,{name='Tara',robotIds=[],missionIds=[]}={}){
 let q=normalize(text);const names=[normalize(name),'тара','tara','орбит','orbit'].filter(Boolean);
 // Require a dismissal phrase, not a question mentioning the word "disconnect".
 if(/^(?:пожалуйста )?(?:отключись|выключись|можешь идти|все можешь идти|все пока|иди отдыхай|go to sleep|shut down|goodbye|disconnect)(?: пожалуйста)?$/.test(q)||names.some(n=>q===`${n} все`||q.startsWith(n+' ')&&/^(?:все )?(?:можешь идти|отключись|выключись|иди отдыхай|пока|go to sleep|shut down|goodbye|disconnect)(?: пожалуйста)?$/.test(q.slice(n.length+1))))return {type:'dismiss'};
 for(const n of names)if(q.startsWith(n+' ')){q=q.slice(n.length+1).trim();break}
 if(/^(?:стоп|замолчи|помолчи|stop|stop speaking|be quiet)$/.test(q))return {type:'stop'};
 if(/(?:отвечай|говори|переключи|switch|speak|answer).*(?:английск|english)/.test(q))return {type:'language',lang:'en'};
 if(/(?:отвечай|говори|переключи|switch|speak|answer).*(?:русск|russian)/.test(q))return {type:'language',lang:'ru'};
 if(/^(?:назад|вернись назад|go back|back)$/.test(q))return {type:'back'};
 if(!/(?:покажи|показать|открой|открыть|перейди|найди|show|open|navigate|find|take me)/.test(q))return null;
 const ids=entities(q),id=ids.find(x=>robotIds.includes(x)||missionIds.includes(x));
 if(/архив|archive|missions/.test(q))return {type:'navigate',path:'/missions'+(/лун|moon/.test(q)?'?world=moon':/марс|mars/.test(q)?'?world=mars':'')};
 if(id)return {type:'navigate',path:missionIds.includes(id)?'/surface/'+id:'/robots?robot='+id};
 if(/робот|ровер|аппарат|robot|rover/.test(q))return {type:'navigate',path:'/robots'};
 if(/лун|moon/.test(q))return {type:'navigate',path:'/explore/moon'};
 if(/марс|mars/.test(q))return {type:'navigate',path:'/explore/mars'};
 if(/солнечн|solar|земл|earth/.test(q))return {type:'navigate',path:'/solar-system'};
 if(/дальн.*космос|deep space/.test(q))return {type:'navigate',path:'/explore/deep-space'};
 if(/о проекте|автор|создател|about|creator/.test(q))return {type:'navigate',path:'/about'};
 if(/главн|home/.test(q))return {type:'navigate',path:'/'};
 if(/открыти|факт|discover|facts/.test(q))return {type:'navigate',path:'/discover'};
 return null;
}
// Lexical retrieval is the lightweight mode, honestly labelled as the site library.
export function retrieve(question,docs,topic=''){
 const ids=entities(question),tokens=normalize(question).split(' ').filter(w=>w.length>2&&!['что','это','как','про','для','мне','она','его','the','and','what','tell','about','почему','расскажи','please'].includes(w));
 const active=ids.length?ids:topic?[topic]:[];
 return docs.filter(doc=>!active.length||active.includes(doc.entity)).map(doc=>{const hay=normalize(doc.title+' '+doc.text+' '+(doc.keywords||''));let score=tokens.reduce((s,w)=>s+(hay.includes(w)?1:0),0);if(active.includes(doc.entity))score+=12;return {...doc,score}}).filter(d=>d.score>0).sort((a,b)=>b.score-a.score).slice(0,5);
}
