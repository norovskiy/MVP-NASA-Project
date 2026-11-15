import {entities,normalize} from './commands.js';
import {requestedNumber} from './siteActions.js';
export function worldTour(question,missions,lang='ru'){
 const q=normalize(question),id=entities(q).find(x=>['mars','moon'].includes(x))||(/deep space|дальн.*космос|открыт.*космос/.test(q)?'deep-space':null);
 if(!id||!/расскажи|что такое|что за|объясни|tell me|what is|explain/.test(q)||/робот|марсоход|сравни|rover|compare/.test(q))return null;
 const options=missions.filter(m=>m.planet===id).map(m=>({title:m.name,path:'/surface/'+m.id}));
 const ru=lang==='ru',facts={mars:ru?'Марс — четвёртая планета от Солнца. Здесь есть следы древних рек и озёр.':'Mars is the fourth planet from the Sun. Its surface preserves traces of ancient rivers and lakes.',moon:ru?'Луна — естественный спутник Земли. В нашем архиве можно изучить места посадок и оставленное оборудование.':'The Moon is Earth’s natural satellite. Our archive covers landing sites and the equipment left there.','deep-space':ru?'В этом разделе собраны аппараты, исследовавшие дальние области Солнечной системы.':'This section presents spacecraft that explored distant regions of the Solar System.'};
 return {type:'navigate',path:'/explore/'+id,title:id,explanation:facts[id]+' '+(ru?'Хочешь, покажу локации из архива нашей команды?':'Would you like to explore locations from our team’s archive?'),options};
}
export function chooseOffered(question,offer){
 if(!offer||Date.now()>offer.until)return null;
 const q=normalize(question);
 if(/^(?:нет|не надо|no|no thanks)$/.test(q))return {dismiss:true};
 if(/^(?:да|давай|покажи|хорошо|да покажи|да давай|да конечно|yes|yes please|yes show me|sure|show me|okay)$/.test(q))return {list:true};
 const named=offer.options.find(o=>q.includes(normalize(o.title)));if(named)return {option:named};
 if(/^(?:да )?покажи (?:эту|ту) локацию$|^show (?:this|that) location$/.test(q))return offer.options.length===1?{option:offer.options[0]}:{list:true};
 const number=requestedNumber(q)||(/^\d+$/.test(q)?Number(q):null);
 if(number&&number<=offer.options.length&&!entities(q).length)return {option:offer.options[number-1]};
 return null;
}
// Explicit corrections are personal notes, stored only on this browser.
export function memoryCommand(question,storage,lang='ru'){
 const q=normalize(question),ru=lang==='ru';
 try{
  if(/^(?:забудь (?:все|мои) исправления|forget my corrections)$/.test(q)){storage.removeItem('tara-corrections');return ru?'Удалила твои сохранённые исправления.':'Your saved corrections have been deleted.';}
  if(/^(?:что ты запомнила|what do you remember)$/.test(q))return JSON.parse(storage.getItem('tara-corrections')||'[]').join('\n')||(ru?'Сохранённых исправлений пока нет.':'There are no saved corrections yet.');
  const match=question.match(/^(?:запомни(?: исправление)?|remember(?: this correction)?)\s*[:—-]?\s+(.{3,800})$/i);
  if(match){const notes=JSON.parse(storage.getItem('tara-corrections')||'[]');storage.setItem('tara-corrections',JSON.stringify([...notes.slice(-19),match[1]]));return ru?'Запомнила в этом браузере. Это личная заметка, она не меняет модель и ответы другим людям.':'Saved in this browser. This is a personal note; it does not train the model or change other visitors’ answers.';}
 }catch{return ru?'Не удалось сохранить заметку в браузере.':'Could not save the note in this browser.';}
 return null;
}
export function memoryDocs(question,storage){
 try{const words=normalize(question).split(' ').filter(w=>w.length>3);return JSON.parse(storage.getItem('tara-corrections')||'[]').filter(n=>words.some(w=>normalize(n).includes(w))).slice(-3).map(text=>({title:'Personal correction / Личное исправление',text:'User-provided personal note, not independently verified: '+text,entity:'personal'}));}catch{return [];}
}
