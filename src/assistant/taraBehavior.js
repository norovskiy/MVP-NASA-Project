import {normalize} from './commands.js';
import {withoutAddress} from './conversation.js';
export const BUBBLE_LIMIT=148;
// The floating companion has a hard text budget; the chat keeps the full answer.
export function compactReply(value,limit=BUBBLE_LIMIT){
 const text=String(value).replace(/\[\d+\]/g,'').replace(/\s+/g,' ').trim();
 if(text.length<=limit)return text;
 const first=text.match(/^.*?[.!?](?=\s|$)/u)?.[0];
 if(first&&first.length<=limit)return first;
 let cut=text.slice(0,limit-1);const space=cut.lastIndexOf(' ');if(space>limit*.55)cut=cut.slice(0,space);
 return cut.replace(/[,;:\s]+$/,'')+'…';
}
export function addressed(text,name='Tara'){
 const q=normalize(text);return [name,'tara','тара','тарa','orbit','орбит'].some(n=>(' '+q+' ').includes(' '+normalize(n)+' '));
}
export function emotionReply(text,{name='Tara',lang='en',humor=true}={}){
 const q=withoutAddress(text,name),L=(a,b)=>lang==='ru'?a:b;
 if(/(?:^|\s)(?:извини|прости|извиняюсь|sorry|apologies)(?:\s|$)/u.test(q))return {mood:'happy',text:L('Всё хорошо. Мир? Продолжим 🙂','All good. Friends again? Let’s carry on 🙂')};
 // Match directed phrases, not words inside a factual question about insults.
 if(/^(?:ты |you (?:are |re )?|you )?(?:(?:такая |такой |очень |so |really ))?(?:тупая|тупой|дура|дурак|идиотка|идиот|бесполезная|уродина|stupid|idiot|useless|dumb|ugly)(?:\s|$)/u.test(q)||/^(?:заткнись|shut up|fuck you)(?:\s|$)/.test(q))return {mood:'hurt',text:L('Мне обидно. Давай без оскорблений — я здесь, чтобы помочь.','That’s hurtful. Please be kind — I’m here to help.')};
 if(/^(?:ты |you (?:are |re )?)?(?:соня|ленивая|вредина|ленишься|lazy|sleepyhead|grumpy)(?:\s|$)/u.test(q)||/^(?:дразню тебя|я тебя дразню|i m teasing you|wake up lazy)/.test(q))return {mood:'angry',text:L(humor?'Эй, я вообще-то на космической смене! Давай дружелюбнее.':'Давай общаться дружелюбно.',humor?'Hey, I’m on space duty! A little kindness, please.':'Let’s keep things friendly.')};
 if(/^(?:привет(?:ик)?|здравствуй(?:те)?|hello|hi|hey)(?:\s|$)/.test(q))return {mood:'wave'};
 return null;
}
export function chatCommand(text,name='Tara'){
 const q=withoutAddress(text,name);
 if(/^(?:пожалуйста )?(?:открой|покажи|open|show)(?: мне| me)? (?:чат|chat)(?: пожалуйста| please)?$/.test(q))return 'open';
 if(/^(?:закрой|сверни|спрячь|close|hide|minimize)(?: the)? (?:чат|chat)(?: пожалуйста| please)?$/.test(q))return 'close';
 return null;
}

export function replyLanguage(text,name='Tara',fallback='en'){
 const q=withoutAddress(text,name);
 if(/[а-яё]/i.test(q))return 'ru';
 if(/[a-z]/i.test(q))return 'en';
 return fallback;
}

export function acceptsBackgroundSpeech(text,{name='Tara',until=0,now=Date.now()}={}){
 return addressed(text,name)||now<=until||/^(?:привет(?:ик)?|здравствуй(?:те)?|hello|hi|hey)(?:\s|$)/.test(withoutAddress(text,name));
}
