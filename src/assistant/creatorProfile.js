import {normalize} from './commands.js';
// Facts explicitly supplied by the creator. Do not infer an extended biography.
export function creatorProfileAnswer(question,lang='ru'){
 const q=normalize(question);
 if(/(?:имена|участник|кто.*(?:команд|групп)|ваш.*(?:команд|групп)|наш.*(?:команд|групп)|team members|your team|who.*team)/.test(q))return lang==='ru'?'Имена участников команды конфиденциальны: по их просьбе я их не раскрываю. Публично как автор указан Норов Мухаммад.':'Team members’ names are confidential at their request. Norov Muhammad is publicly credited as the author.';
 if(!/норов|norov|мухаммад|muhammad|mukhammad|кто тебя создал|кто твой создатель|who (?:created|made|built) you|your creator|твоего создателя|твоем создателе/.test(q))return null;
 if(/^(?:покажи|открой|show|open)/.test(q))return null;
 const ru=lang==='ru';
 if(/возраст|сколько.*лет|how old/.test(q)){
 const now=new Date(),age=now.getFullYear()-2009-(now.getMonth()<7||now.getMonth()===7&&now.getDate()<27?1:0);
 return ru?`Норову Мухаммаду ${age} лет. Он родился 27 августа 2009 года.`:`Norov Muhammad is ${age} years old. He was born on August 27, 2009.`;
 }
 return ru?'Норов Мухаммад — Frontend Developer, выпускник Soft Club Academy. Он создал TARA для проекта Mars Explorer, чтобы помогать посетителям читать материалы вслух, разбираться в них и управлять сайтом. Он родился 27 августа 2009 года, мечтает учиться в Америке и достичь своих целей. Других подробностей его биографии у меня нет.':'Norov Muhammad is a frontend developer and a graduate of Soft Club Academy. He created TARA for Mars Explorer to help visitors listen to the site, understand its content and navigate it. He was born on August 27, 2009. His dream is to study in America and achieve his goals. I do not have further biographical details.';
}
