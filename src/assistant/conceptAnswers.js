import {normalize} from './commands.js';
import {nxEntity} from './siteActions.js';
import {nxUnits,missionStages,localText} from '../data/concepts.js';
export function conceptAnswer(question,{pathname='/',search='',lang='en',detailed=false}={}){
 const q=normalize(question),params=new URLSearchParams(search),explicit=nxEntity(question),id=explicit||(pathname==='/concepts'?(params.get('unit')||'nx1'):null),unit=nxUnits.find(u=>u.id===id);if(!unit)return null;
 if(/анекдот|шутк|joke|как дела|как жизнь|how are you/.test(q))return null;
 const T=x=>localText(x,lang),L=(en,ru)=>lang==='ru'?ru:en;
 const paired=/(?:nx|нх|эн экс)[ -]?1.*(?:nx|нх|эн экс)[ -]?2/.test(q);
 const benefits=/(?:преимущ|польз|зачем|почему|иде[яию]|автор|nasa|наса|advantage|benefit|why|purpose|idea)/.test(q);
 if(paired||benefits)return {entity:id,path:'/concepts?unit='+id,text:L('NX1 is a proposed surface laboratory and drill platform; NX2 is a compact scout for accessible caves and confined routes. The idea addresses a problem: losing mobility need not end useful work. If its power, instruments and communications remain healthy, NX1 could become a stationary laboratory, energy buffer and relay for NX2. Potential benefits are longer use of surviving equipment and access to places the larger rover cannot enter. This is a team concept for future exploration, not an adopted NASA mission. Tether safety, power, dust, access and retrieval still need engineering tests.','NX1 — концепция наземной лаборатории с буром, NX2 — компактный разведчик доступных пещер и тесных маршрутов. Замысел: потеря подвижности не должна прекращать полезную работу. Если питание, приборы и связь исправны, NX1 сможет стать стационарной лабораторией, накопителем энергии и ретранслятором для NX2. Возможные преимущества — дольше использовать исправные системы и исследовать места, куда большой аппарат не войдёт. Это предложение команды для будущих исследований, не принятая миссия NASA. Кабель, энергобюджет, пыль, доступ и возврат требуют испытаний.')};
 const part=unit.parts.find(p=>p.aliases.split(' ').some(w=>w.length>=4&&(q.includes(w)||/[а-я]/.test(w)&&q.includes(w.slice(0,Math.min(w.length,5))))));
 if(part)return {text:unit.name+' · '+T(part.name)+'. '+T(part.detail),entity:id,path:'/concepts?unit='+id+'&part='+part.id};
 if(/втор.*жизн|после.*(?:отказ|мисси|слом|колес)|ненужн|не нужн|second life|after.*(?:fail|mission|wheel)|no longer needed/.test(q))return {text:T(missionStages[1].body)+' '+(detailed?T(missionStages[2].body):''),entity:id,path:'/concepts?unit='+id+'&mode=stationary'};
 if(!explicit&&!/^(?:объясни|расскажи|что это|как (?:он|она|это)|explain|tell me about|what is (?:this|it)|how does (?:it|this))/.test(q))return null;
 const selected=unit.parts.find(p=>p.id===params.get('part'));
 if(!explicit&&selected)return {text:unit.name+' · '+T(selected.name)+'. '+T(selected.detail),entity:id,path:'/concepts?unit='+id+'&part='+selected.id};
 return {text:unit.name+'. '+T(unit.summary)+(detailed?' '+L('Main systems: ','Основные системы: ')+unit.parts.map(p=>T(p.name)).join(', ')+'. '+T(missionStages[1].body):''),entity:id,path:'/concepts?unit='+id};
}
