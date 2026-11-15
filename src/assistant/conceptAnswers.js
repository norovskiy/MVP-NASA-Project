import {normalize} from './commands.js';
import {nxEntity} from './siteActions.js';
import {nxUnits,missionStages,localText} from '../data/concepts.js';
export function conceptAnswer(question,{pathname='/',search='',lang='en',detailed=false}={}){
 const q=normalize(question),params=new URLSearchParams(search),explicit=nxEntity(question),id=explicit||(pathname==='/concepts'?(params.get('unit')||'nx1'):null),unit=nxUnits.find(u=>u.id===id);if(!unit)return null;
 if(/анекдот|шутк|joke|как дела|как жизнь|how are you/.test(q))return null;
 const T=x=>localText(x,lang),L=(en,ru)=>lang==='ru'?ru:en;
 const part=unit.parts.find(p=>p.aliases.split(' ').some(w=>w.length>=4&&(q.includes(w)||/[а-я]/.test(w)&&q.includes(w.slice(0,Math.min(w.length,5))))));
 if(part)return {text:unit.name+' · '+T(part.name)+'. '+T(part.detail),entity:id,path:'/concepts?unit='+id+'&part='+part.id};
 if(/втор.*жизн|после.*(?:отказ|мисси|слом|колес)|ненужн|не нужн|second life|after.*(?:fail|mission|wheel)|no longer needed/.test(q))return {text:T(missionStages[1].body)+' '+(detailed?T(missionStages[2].body):''),entity:id,path:'/concepts?unit='+id+'&mode=stationary'};
 if(!explicit&&!/^(?:объясни|расскажи|что это|как (?:он|она|это)|explain|tell me about|what is (?:this|it)|how does (?:it|this))/.test(q))return null;
 const selected=unit.parts.find(p=>p.id===params.get('part'));
 if(!explicit&&selected)return {text:unit.name+' · '+T(selected.name)+'. '+T(selected.detail),entity:id,path:'/concepts?unit='+id+'&part='+selected.id};
 return {text:unit.name+'. '+T(unit.summary)+(detailed?' '+L('Main systems: ','Основные системы: ')+unit.parts.map(p=>T(p.name)).join(', ')+'. '+T(missionStages[1].body):''),entity:id,path:'/concepts?unit='+id};
}
