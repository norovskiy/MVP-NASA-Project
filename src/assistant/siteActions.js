import {normalize,entities} from './commands.js';
import {withoutAddress} from './conversation.js';
import {nxUnits,localText} from '../data/concepts.js';
const numberWords={'первый':1,'первого':1,'первую':1,'первая':1,'first':1,'one':1,'один':1,'второй':2,'второго':2,'вторая':2,'вторую':2,'second':2,'two':2,'два':2,'третий':3,'третьего':3,'третья':3,'third':3,'three':3,'три':3,'четвертый':4,'четвертого':4,'fourth':4,'four':4,'пятый':5,'пятого':5,'fifth':5,'five':5,'шестой':6,'шестого':6,'sixth':6,'six':6,'седьмой':7,'seventh':7,'seven':7};
export function requestedNumber(text){const q=normalize(text);const match=q.match(/^(\d+)$|(?:номер|number|no)\s*(\d+)|(?:робот\S*|марсоход\S*|морсоход\S*|луноход\S*|марсоход\S*|rover|robot|детал\S*|часть|part|component)\s+(\d+)/u);if(match)return Number(match[1]||match[2]||match[3]);for(const w of q.split(' '))if(numberWords[w])return numberWords[w];return null}
export function nxEntity(text){const q=normalize(text).replace(/[-\s]/g,'');if(/(?:nx|nх|нх|энэкс|энекс)(?:one|один|1)/.test(q))return 'nx1';if(/(?:nx|nх|нх|энэкс|энекс)(?:two|два|2)/.test(q))return 'nx2';return null}
const navigation=/(?:покаж|откр|перейд|выбер|включ|переключ|переведи|отведи|веди|show|open|navigate|select|take me|switch|go to|turn to|turn on|head to|visit|bring me)/;
const partRequest=/(?:детал|част|бур|батар|аккум|панел|камер|антенн|катуш|кабел|лидар|лаборатор|колес|питан|sensors?|parts?|component|drill|batter|solar|camera|antenna|tether|lidar|laboratory|wheels?|power)/;
export function resolveSiteAction(text,{name='Tara',lang='en',pathname='/',search='',visibleRobots=[],robots=[],parts=[],roverParts={},missions=[],visibleEntries=[]}={}){
 let q=withoutAddress(text,name).replace(/(марсоход|луноход)(\d)/g,'$1 $2');
 if(/^(?:марсоход|луноход|robot|rover)\s*(?:номер\s*)?\d+$/.test(q))q='покажи '+q;
 if(/^(?:нет|неправильно|ошибаешься|я (?:сказал|сказала|про)|no|wrong)/.test(q)&&entities(q).length)q='покажи '+q;
 const L=(en,ru)=>lang==='ru'?ru:en;
 // Relative movement never invokes the language model.
 if(/^(?:(?:покажи|прокрути|пролистай|иди|давай|scroll|go|move)\s+)?(?:(?:чуть|немного|досконально|a little)\s+)?(?:вниз|ниже|дальше вниз|down)(?:\s.*)?$/.test(q))return {type:'scroll',direction:1};
 if(/^(?:(?:покажи|прокрути|пролистай|иди|scroll|go|move)\s+)?(?:(?:чуть|немного|a little)\s+)?(?:вверх|выше|up)(?:\s.*)?$/.test(q))return {type:'scroll',direction:-1};
 if(/(?:покаж|откр|show|open).*(?:луноход|lunokhod)\s*(?:1|2|один|два)/.test(q)){const r=robots.find(r=>r.id==='lunokhod');if(r)return {type:'navigate',path:'/robots?world=moon&robot=lunokhod',entity:r.id,title:r.name,explanation:L('This is the shared Lunokhod 1 and 2 record. A separate Lunokhod 2 model is not available here.','Это общая карточка «Луноход 1 и 2». Отдельной модели Лунохода 2 здесь нет.')};}
 const relative=/следующ|предыдущ|next|previous/.test(q),ordinal=requestedNumber(q);
 if(pathname==='/about'&&/^(?:дальше|продолжай|следующий раздел|next|continue)$/.test(q))return {type:'scroll',direction:1,section:true};
 if((relative||ordinal)&&!entities(q).length&&!nxEntity(q)&&!partRequest.test(q)){
  if(pathname==='/missions'&&ordinal){const entry=visibleEntries[ordinal-1];return entry?{type:'navigate',path:entry.path,title:entry.title}:{type:'clarify',text:L('Choose a number from the visible archive.','Выбери номер из видимого списка архива.')};}
  if(pathname.startsWith('/surface/')&&relative){const current=missions.find(m=>pathname==='/surface/'+m.id);const list=missions.filter(m=>m.planet===current?.planet);const entry=list[list.indexOf(current)+(/предыдущ|previous/.test(q)?-1:1)];return entry?{type:'navigate',path:'/surface/'+entry.id,title:entry.name}:{type:'clarify',text:L('This is the end of this list.','Это край списка локаций.')};}
  if(pathname==='/robots'){
   const params=new URLSearchParams(search),list=visibleRobots.length?visibleRobots:robots.filter(r=>!params.get('world')||params.get('world')==='all'||r.world===params.get('world')).map(r=>r.id);
   const index=relative?list.indexOf(params.get('robot')||list[0])+(/предыдущ|previous/.test(q)?-1:1):ordinal-1;
   const item=robots.find(r=>r.id===list[index]);
   return item?{type:'navigate',path:'/robots?'+new URLSearchParams({robot:item.id,world:params.get('world')||item.world}),entity:item.id,title:item.name}:{type:'clarify',text:L('No more cards in that direction. Choose a number from the list.','В этой стороне больше нет карточек. Назови номер из списка.')};
  }
  if(pathname==='/concepts'){
   const params=new URLSearchParams(search),current=params.get('unit')||'nx1',index=relative?nxUnits.findIndex(u=>u.id===current)+(/предыдущ|previous/.test(q)?-1:1):ordinal-1,item=nxUnits[index];
   return item?{type:'navigate',path:'/concepts?unit='+item.id,entity:item.id,title:item.name}:{type:'clarify',text:L('There are two concepts: NX1 and NX2. Which one?','У нас две концепции: NX1 и NX2. Какую показать?')};
  }
 }
 const apollo=q.match(/(?:apollo|аполло[н]?)\s*(\d+)/);
 if(apollo&&navigation.test(q)){
  const id='apollo'+apollo[1],mission=missions.find(m=>m.id===id);
  if(!mission)return {type:'clarify',text:L('This Apollo mission is not in this archive. Choose one of the available entries.','Этой миссии Apollo нет в архиве. Выбери одну из доступных записей.')};
  return {type:'navigate',path:'/surface/'+id,title:mission.name};
 }
 if(!navigation.test(q)&&!/(?:tell|explain|describe|расскажи|объясни).*(?:about us|о нас|о проекте)/.test(q)&&!/^(?:about us|about|о нас|о проекте)$/.test(q)&&!(/^(?:а |and )?(?:перв|втор|трет|first|second|third)/.test(q)))return null;
 const clarify=(en,ru)=>({type:'clarify',text:L(en,ru)});
 if(/(?:about\s+(?:us|as)|[аэ]баут\s*(?:ас|ус)|о нас|о проекте|автор|создател)/.test(q))return {type:'navigate',path:'/about',about:true,title:L('About us','О проекте')};
 const namedMission=missions.find(m=>normalize(m.name)===q.replace(/^(?:покажи|открой|show|open)\s+(?:анимацию |animation )?/,''));
 if(namedMission)return {type:'navigate',path:'/surface/'+namedMission.id,title:namedMission.name};
 const namedQuery=q.replace(/^(?:покажи|открой|show|open|расскажи|объясни)\s+(?:мне\s+|me\s+)?(?:про\s+|about\s+)?(?:анимацию\s+|animation\s+)?/,'');
 const exactRobot=robots.find(r=>normalize(r.name)===namedQuery||r.id===namedQuery.replace(/\s/g,''));
 if(exactRobot)return {type:'navigate',path:'/robots?robot='+exactRobot.id,entity:exactRobot.id,title:exactRobot.name};
 const body=entities(q).find(id=>['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune'].includes(id));
 if(body==='mars'&&!/solar|солнечн|archive|mission|архив|мисси|rover|robot|робот|марсоход|машин/.test(q))return {type:'navigate',path:'/explore/mars',title:L('Mars explorer','Исследование Марса')};
 if(body&&!/archive|mission|архив|мисси|rover|robot|робот|марсоход|машин/.test(q))return {type:'navigate',path:'/solar-system?body='+body,entity:body,title:body[0].toUpperCase()+body.slice(1)};
 if(/deep space|дальн.*космос/.test(q))return {type:'navigate',path:'/explore/deep-space',title:L('Deep Space','Дальний космос')};
 if(/discover|facts|факты|открытия/.test(q))return {type:'navigate',path:'/discover',title:L('Discover','Открытия')};
 if(/moon|лун/.test(q)&&!/archive|mission|архив|мисси|rover|robot|робот|марсоход|машин/.test(q))return {type:'navigate',path:'/explore/moon',title:L('Moon explorer','Исследование Луны')};
 if(/(?:solar system|солнечн\S* систем|планеты|planets)/.test(q))return {type:'navigate',path:'/solar-system',title:L('Solar system','Солнечная система')};
 if(/(?:robots?|rovers?|робот|марсоход|морсоход|луноход|машин)/.test(q)&&!requestedNumber(q)&&!entities(q).some(id=>robots.some(r=>r.id===id))&&!partRequest.test(q))return {type:'navigate',path:'/robots'+(/moon|лун/.test(q)?'?world=moon':''),title:L('Rovers & robots','Марсоходы и роботы')};
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
 if(number&&/робот|марсоход|морсоход|луноход|ровер|машин|robot|rover/.test(q)){
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
 if(explicitRobot&&!/мисси|архив|mission|archive/.test(q))return {type:'navigate',path:'/robots?robot='+explicitRobot.id,entity:explicitRobot.id,title:explicitRobot.name};
 if(/оборудован|марсоход|морсоход|machines|equipment/.test(q))return {type:'navigate',path:'/robots'+(/moon|лун/.test(q)?'?world=moon':''),title:L('Rovers & robots','Марсоходы и роботы')};
 return null;
}
// Read only the visible UI's selected and ordered IDs; no action is invented by an LLM.
export function readSiteContext(location,robots,roverParts){const params=new URLSearchParams(location.search),id=params.get('robot')||document.querySelector('[data-assistant-entity]')?.dataset.assistantEntity;const robot=robots.find(r=>r.id===id),kind=robot?.id==='dragonfly'?'aerial':robot?.world==='moon'||['viper','cadre','lunar-terrain-vehicle'].includes(id)?'moon':'mars';return {pathname:location.pathname,search:location.search,robots,roverParts,visibleEntries:[...document.querySelectorAll('a.archive-card')].map(n=>({path:new URL(n.href).pathname,title:n.querySelector('h2,h3')?.textContent||n.textContent.trim().slice(0,70)})),visibleRobots:[...document.querySelectorAll('[data-assistant-robot]')].map(n=>n.dataset.assistantRobot),parts:roverParts[id]||roverParts[kind]||[]}}
export async function waitForAction(action,isCurrent=()=>true){
 const target=new URL(action.path,window.location.origin),until=Date.now()+4500;
 const selector=target.pathname==='/concepts'?'#nx-workbench':target.pathname==='/robots'?'.robot-profile':target.pathname==='/solar-system'?'.solar-workspace':target.pathname==='/about'?'.about-purpose':target.pathname.startsWith('/surface/')?'.surface-immersive,.deep-inspection':null;
 while(isCurrent()&&Date.now()<until){
  const matching=window.location.pathname===target.pathname&&window.location.search===target.search;
  const selected=!action.entity||document.querySelector('[data-assistant-entity="'+action.entity+'"]');
  const part=!action.part||document.querySelector('[data-assistant-part="'+action.part+'"]');
  const focus=selector?document.querySelector(selector):null;
  if(matching&&selected&&part&&(!selector||focus)){
   // Route effects reset scroll; let them finish before bringing the selected content into view.
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   if(!isCurrent())return false;
   if(focus){const offset=Math.min(140,window.innerHeight*.18);focus.style.scrollMarginTop=offset+'px';window.scrollTo({top:window.scrollY+focus.getBoundingClientRect().top-offset,behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));if(!isCurrent())return false;const box=focus.getBoundingClientRect();if(box.top>=window.innerHeight||box.bottom<=0)return false;}
   return true;
  }
  await new Promise(r=>setTimeout(r,60));
 }
 return false;
}
