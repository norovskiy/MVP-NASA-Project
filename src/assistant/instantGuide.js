import {normalize} from './commands.js';
import {withoutAddress} from './conversation.js';
import {resolveSiteAction,nxEntity} from './siteActions.js';
// A bounded arithmetic grammar: no eval, executable text or model download.
export function simpleCalculation(text,lang='en'){
 let q=String(text).toLowerCase().replace(/^(?:tara|тара)[, ]*/,'').replace(/^(?:сколько будет|сколько|посчитай|вычисли|what is|what s|calculate)\s+/, '').replace(/[?=]\s*$/,'').trim();
 q=q.replace(/умножить на|multiplied by|times/g,'*').replace(/разделить на|divided by/g,'/').replace(/плюс|plus/g,'+').replace(/минус|minus/g,'-');
 const words={'один':'1','одна':'1','два':'2','две':'2','три':'3','четыре':'4','пять':'5','ноль':'0',one:'1',two:'2',three:'3',four:'4',five:'5',zero:'0'};
 q=q.split(/\s+/).map(w=>words[w]??w).join(' ').replace(/,/g,'.');
 const m=q.match(/^(-?\d{1,12}(?:\.\d{1,8})?)\s*([+*/×÷−-])\s*(-?\d{1,12}(?:\.\d{1,8})?)$/);if(!m)return null;
 const a=Number(m[1]),b=Number(m[3]),op=m[2];if(['/','÷'].includes(op)&&b===0)return lang==='ru'?'На ноль делить нельзя.':'Division by zero is undefined.';
 const result=['+'].includes(op)?a+b:['-','−'].includes(op)?a-b:['*','×'].includes(op)?a*b:a/b;
 return `${a} ${op} ${b} = ${Number(result.toPrecision(12))}.`;
}
// Reuse the same deterministic actions for explanations and show/open commands.
export function explanationAction(text,context={}){
 const q=withoutAddress(text,context.name).replace(/^(?:please|okay|ok|can you|could you|пожалуйста|можешь|ты можешь)\s+/,'');
 if(!/^(?:пожалуйста )?(?:расскажи|объясни|опиши|что такое|что за|tell(?: me)?|explain(?: me| to me)?|describe|what is|what are)(?:\s|$)/.test(q))return null;
 // "Why" and engineering questions should not be turned into generic page tours.
 const subject=q.replace(/^(?:пожалуйста )?(?:расскажи|объясни|опиши|что такое|что за|tell(?: me)?|explain(?: me| to me)?|describe|what is|what are)\s*(?:мне\s+)?(?:про\s+|об\s+|о\s+|about\s+|the\s+)?/,'');
 const named=subject.replace(/^(?:мисси[яию]\s+|mission\s+|робот[ае]?\s+|robot\s+|rover\s+)/,'');
 const mission=(context.missions||[]).find(m=>normalize(m.name)===normalize(named));
 const robot=(context.robots||[]).find(r=>normalize(r.name)===normalize(named));
 let action=/^(?:мисси|mission)/.test(subject)&&mission?{type:'navigate',path:'/surface/'+mission.id,entity:mission.id,title:mission.name}:/^(?:робот|robot|rover)/.test(subject)&&robot?{type:'navigate',path:'/robots?robot='+robot.id,entity:robot.id,title:robot.name}:resolveSiteAction('show '+subject,context);
 if(!action){const normalized=normalize(subject);const mission=(context.missions||[]).find(m=>normalize(m.name)===normalized||m.id===normalized.replace(/\s/g,''));if(mission)action={type:'navigate',path:'/surface/'+mission.id,entity:mission.id,title:mission.name};}
 if(!action||action.type!=='navigate')return null;
 const entity=action.entity|| (action.path.startsWith('/surface/')?action.path.split('/').pop():nxEntity(text));
 return {...action,entity,explain:true};
}
