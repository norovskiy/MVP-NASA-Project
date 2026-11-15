import {normalize,entities} from './commands.js';
import {withoutAddress} from './conversation.js';
import {nxUnits,localText} from '../data/concepts.js';
const numberWords={'первый':1,'первого':1,'первую':1,'первая':1,'first':1,'one':1,'один':1,'второй':2,'второго':2,'вторая':2,'вторую':2,'second':2,'two':2,'два':2,'третий':3,'третьего':3,'третья':3,'third':3,'three':3,'три':3,'четвертый':4,'четвертого':4,'fourth':4,'four':4,'пятый':5,'пятого':5,'fifth':5,'five':5,'шестой':6,'шестого':6,'sixth':6,'six':6,'седьмой':7,'seventh':7,'seven':7};
export function requestedNumber(text){const q=normalize(text);const match=q.match(/(?:номер|number|no)\s*(\d+)|(?:робот\S*|марсоход\S*|морсоход\S*|rover|robot|детал\S*|часть|part|component)\s+(\d+)/u);if(match)return Number(match[1]||match[2]);for(const w of q.split(' '))if(numberWords[w])return numberWords[w];return null}
export function nxEntity(text){const q=normalize(text).replace(/[-\s]/g,'');if(/(?:nx|nх|нх|энэкс|энекс)(?:one|один|1)/.test(q))return 'nx1';if(/(?:nx|nх|нх|энэкс|энекс)(?:two|два|2)/.test(q))return 'nx2';return null}
const navigation=/(?:покаж|откр|перейд|выбер|включ|переключ|переведи|отведи|веди|show|open|navigate|select|take me|switch|go to|turn to|turn on|head to|visit|bring me)/;
const partRequest=/(?:детал|част|бур|батар|аккум|панел|камер|антенн|катуш|кабел|лидар|лаборатор|колес|питан|sensors?|parts?|component|drill|batter|solar|camera|antenna|tether|lidar|laboratory|wheels?|power)/;
export function resolveSiteAction(text,{name='Tara',lang='en',pathname='/',search='',visibleRobots=[],robots=[],parts=[],roverParts={}}={}){
 const q=withoutAddress(text,name),L=(en,ru)=>lang==='ru'?ru:en;
 if(!navigation.test(q)&&!/(?:tell|explain|describe|расскажи|объясни).*(?:about us|о нас|о проекте)/.test(q)&&!/^(?:about us|about|о нас|о проекте)$/.test(q)&&!(/^(?:а |and )?(?:перв|втор|трет|first|second|third)/.test(q)))return null;
 const clarify=(en,ru)=>({type:'clarify',text:L(en,ru)});
 if(/(?:about\s+(?:us|as)|[аэ]баут\s*(?:ас|ус)|о нас|о проекте|автор|создател)/.test(q))return {type:'navigate',path:'/about',about:true,title:L('About us','О проекте')};
 const body=entities(q).find(id=>['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune'].includes(id));
 if(body&&!/archive|mission|архив|мисси|rover|robot|робот|марсоход/.test(q))return {type:'navigate',path:'/solar-system?body='+body,entity:body,title:body[0].toUpperCase()+body.slice(1)};
 if(/deep space|дальн.*космос/.test(q))return {type:'navigate',path:'/explore/deep-space',title:L('Deep Space','Дальний космос')};
 if(/discover|facts|факты|открытия/.test(q))return {type:'navigate',path:'/discover',title:L('Discover','Открытия')};
 if(/moon|лун/.test(q)&&!/archive|mission|архив|мисси|rover|robot|робот|марсоход/.test(q))return {type:'navigate',path:'/explore/moon',title:L('Moon explorer','Исследование Луны')};
 if(/(?:solar system|солнечн\S* систем|планеты|planets)/.test(q))return {type:'navigate',path:'/solar-system',title:L('Solar system','Солнечная система')};
 if(/(?:robots?|rovers?|робот|марсоход|морсоход)/.test(q)&&!requestedNumber(q)&&!entities(q).some(id=>robots.some(r=>r.id===id))&&!partRequest.test(q))return {type:'navigate',path:'/robots'+(/moon|лун/.test(q)?'?world=moon':''),title:L('Rovers & robots','Марсоходы и роботы')};
 if(/(?:archive|missions|архив|миссии)/.test(q))return {type:'navigate',path:'/missions'+(/moon|лун/.test(q)?'?world=moon':/mars|марс/.test(q)?'?world=mars':''),title:L('The archive','Архив миссий')};
 if(/(?:home|главн)/.test(q))return {type:'navigate',path:'/',title:L('Home','Главная')};
 const params=new URLSearchParams(search),explicitNX=nxEntity(q),currentNX=pathname==='/concepts'?(params.get('unit')||'nx1'):null,nx=explicitNX||currentNX;
 if(/(?:наши? (?:разработ|концеп|аппарат|оборуд)|our (?:concept|equipment|design)|nx1.*nx2|nx 1.*nx 2)/.test(q))return {type:'navigate',path:'/concepts',entity:'nx1',title:'NX1 + NX2'};
 if(nx&&(explicitNX||partRequest.test(q)||/чертеж|blueprint|внутри|inside|стационар|stationary|second life|втор.*жизн/.test(q))){
 const unit=nxUnits.find(u=>u.id===nx),next=new URLSearchParams({unit:nx});let selectedPart;
 if(/чертеж|blueprint|drawing/.test(q))next.set('view','blueprint');
 if(/стационар|stationary|second life|втор.*жизн/.test(q))next.set('mode','stationary');
 if(partRequest.test(q)){
 const n=requestedNumber(q);if(n){if(!unit.parts[n-1])return clarify('This design has '+unit.parts.length+' components. Which one?','У этой конструкции '+unit.parts.length+' деталей. Какую выбрать?');selectedPart=unit.parts[n-1]}
 else selectedPart=unit.parts.find(p=>p.aliases.split(' ').some(w=>w.length>3&&(q.includes(w)||/[а-я]/.test(w)&&q.includes(w.slice(0,Math.min(5,w.length))))));
 if(!selectedPart&&/детал|част|component|parts/.test(q))return {type:'navigate',path:'/concepts?'+next,entity:nx,title:nx};
 }
 if(selectedPart)next.set('part',selectedPart.id);
 return {type:'navigate',path:'/concepts?'+next,entity:nx,part:selectedPart?.id,title:unit.name+(selectedPart?' · '+localText(selectedPart.name,lang):'')};
 }
 const ids=entities(q),explicitRobot=robots.find(r=>ids.includes(r.id)),number=requestedNumber(q);
 if(number&&/робот|марсоход|морсоход|ровер|robot|rover/.test(q)){
 const list=visibleRobots.length?visibleRobots:robots.filter(r=>r.world==='mars').map(r=>r.id),id=list[number-1],r=robots.find(r=>r.id===id);
 if(!r)return clarify('There are '+list.length+' machines in this list. Which one should I show?','В этом списке '+list.length+' аппаратов. Какой показать?');
 return {type:'navigate',path:'/robots?'+new URLSearchParams({robot:r.id,world:params.get('world')||r.world}),entity:r.id,title:r.name};
 }
 const currentRobot=robots.find(r=>r.id===(params.get('robot')||'perseverance')),robot=explicitRobot||(pathname==='/robots'?currentRobot:null);
 if(robot&&partRequest.test(q)){
 const kind=robot.id==='dragonfly'?'aerial':robot.world==='moon'?'moon':'mars';const list=roverParts[robot.id]||roverParts[kind]||parts,n=requestedNumber(q);const words=q.split(' ').filter(w=>w.length>3);
 const aliases={camera:'камера камеры навигация camera cameras navigation',battery:'батар аккумулятор питание энергия power battery',power:'батар аккумулятор питание энергия power battery mmrtg',mast:'камера камеры мачта camera cameras mast supercam',antenna:'антенна связь antenna antennas communication',wheels:'колеса шасси wheels mobility',arm:'рука манипулятор бур arm drill sampling',body:'корпус компьютер body electronics'};
 const chosen=n?list[n-1]:list.find(p=>{const hay=normalize(p.name+' '+(aliases[p.id]||''));return words.some(w=>hay.includes(w)||/[а-я]/.test(w)&&hay.includes(w.slice(0,Math.min(w.length,5))))});
 if(chosen)return {type:'navigate',path:'/robots?'+new URLSearchParams({robot:robot.id,part:chosen.id,world:params.get('world')||robot.world}),entity:robot.id,part:chosen.id,title:robot.name+' · '+chosen.name};
 if(n||/детал|част|component/.test(q))return clarify('Choose a named component or its number from the parts list.','Назови деталь или её номер из списка деталей.');
 }
 if(explicitRobot&&!/мисси|архив|mission|archive/.test(q))return {type:'navigate',path:'/robots?robot='+robot.id,entity:robot.id,title:robot.name};
 if(/оборудован|марсоход|морсоход|machines|equipment/.test(q))return {type:'navigate',path:'/robots'+(/moon|лун/.test(q)?'?world=moon':''),title:L('Rovers & robots','Марсоходы и роботы')};
 return null;
}
// Read only the visible UI's selected and ordered IDs; no action is invented by an LLM.
export function readSiteContext(location,robots,roverParts){const params=new URLSearchParams(location.search),id=params.get('robot')||document.querySelector('[data-assistant-entity]')?.dataset.assistantEntity;const robot=robots.find(r=>r.id===id),kind=robot?.id==='dragonfly'?'aerial':robot?.world==='moon'||['viper','cadre','lunar-terrain-vehicle'].includes(id)?'moon':'mars';return {pathname:location.pathname,search:location.search,robots,roverParts,visibleRobots:[...document.querySelectorAll('[data-assistant-robot]')].map(n=>n.dataset.assistantRobot),parts:roverParts[id]||roverParts[kind]||[]}}
export async function waitForAction(action,isCurrent=()=>true){const target=new URL(action.path,window.location.origin),until=Date.now()+4500;while(isCurrent()&&Date.now()<until){const matching=window.location.pathname===target.pathname&&window.location.search===target.search;const selected=!action.entity||document.querySelector('[data-assistant-entity="'+action.entity+'"]');const part=!action.part||document.querySelector('[data-assistant-part="'+action.part+'"]');if(matching&&selected&&part){const focus=target.pathname==='/concepts'?document.querySelector('#nx-workbench'):action.part?document.querySelector('.robots-page'):null;focus?.scrollIntoView({block:'start',behavior:'smooth'});return true;}await new Promise(r=>setTimeout(r,60))}return false}
