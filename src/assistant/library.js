import {conceptLibrary} from '../data/concepts';
import {missions} from '../data/missions';
import {robots,roverParts} from '../data/robots';
import {planets} from '../data/planets';
import {solarBodies} from '../data/solar';
import {facts} from '../data/facts';
import {messages} from '../i18n/messages';
export function siteLibrary(lang="en"){
 const t=value=>typeof value==='string'&&lang==='ru'?(messages[value]?.[0]||value):value;
 const docs=[];
 docs.push({entity:'mars',title:t('Mars'),text:t('Billions of years ago, rivers carved channels and water gathered in lakes. NASA rovers now read those ancient shorelines like pages in a field notebook.'),source:'https://science.nasa.gov/resource/mars-evolution/',path:'/',keywords:'история вода реки озера history water rivers lakes'});
 const add=(entity,title,text,source,path,keywords='')=>docs.push({entity,title,text,source,path,keywords});
 for(const m of missions){add(m.id,m.name,[m.date,t(m.site),t(m.status),t(m.description),t(m.legacy)].filter(Boolean).join('. '),m.source,'/surface/'+m.id);docs[docs.length-1].summary=t(m.description);for(const p of m.points||[])add(m.id,t(p.name),t(p.text),m.source,'/surface/'+m.id)}
 for(const r of robots){add(r.id,r.name,[r.era,t(r.status),t(r.summary),t(r.achievement)].join('. '),r.source,'/robots?robot='+r.id);docs[docs.length-1].summary=t(r.summary);for(const part of roverParts[r.id]||[])add(r.id,r.name+' · '+t(part.name),t(part.detail),r.source,'/robots?robot='+r.id)}
 for(const [id,p] of Object.entries(planets))add(id,t(p.name),[t(p.description),t(p.atmosphere),p.temperature,`Gravity: ${p.gravity} m/s². Radius: ${p.radius} km.`].join(' '),p.source,id==='earth'?'/solar-system':'/explore/'+id);
 for(const p of solarBodies)add(p.id,t(p.name),[t(p.fact),t(p.extra),t(p.history)].join(' '),p.source,'/solar-system',p.name);
 for(const f of facts)add(f.id==='dust'?'opportunity':f.id,t(f.title),t(f.text),f.source,'/discover',f.id==='dust'?'перестал сломался молчит пыль stopped failed dust':'');
 return [...conceptLibrary(lang),...docs];
}
export {missions,robots};
