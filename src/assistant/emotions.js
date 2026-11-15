import {normalize} from './commands.js';
import {withoutAddress} from './conversation.js';
export const initialEmotion={mood:'neutral',irritation:0,hurt:0,at:0};
export function reactToMessage(text,state=initialEmotion,{name='Tara',lang='en',level=1,nickname=''}={}){
 const q=withoutAddress(text,name),L=(en,ru)=>lang==='ru'?ru:en,prefix=nickname?nickname+', ':'';const faded=Date.now()-state.at>120000;const base=faded?initialEmotion:state;
 if(/(?:^|\s)(?:прости|извини\S*|sorry|apolog\S*)(?:\s|$)/u.test(q))return {state:{...initialEmotion,mood:'happy',at:Date.now()},text:prefix+L('We’re good. Friends again? What shall we do next?','Всё хорошо. Мир? Чем займёмся дальше?')};
 const quotedQuestion=/^(?:почему|что значит|как перевести|what does|why|translate)/.test(q);
 const insult=!quotedQuestion&&/(?:туп\S*|дур[аы]\S*|дурак\S*|идиот\S*|бесполезн\S*|дебил\S*|ненавижу тебя|bad ai|bad assistant|can(?:not|nt| t) describe|stupid|idiot|useless|dumb|hate you|shut up|fuck you|заткнись)/u.test(q);
 const tease=!quotedQuestion&&/(?:ленив\S*|соня|вредин\S*|глуп\S*|плохая|дразн\S*|lazy|sleepyhead|grumpy|silly|teas\S*)/.test(q);
 const praise=/(?:молодец|умница|спасибо|ты классная|ты лучшая|люблю тебя|thank|well done|good job|love you|you re great)/.test(q);
 if(insult){const hurt=Math.min(3,base.hurt+1),mood=level===0?'neutral':hurt>1?'angry':'hurt';return {state:{mood,hurt,irritation:Math.min(3,base.irritation+1),at:Date.now()},text:prefix+L(hurt>1?'I’m here to help, but the repeated insults aren’t okay. Please tell me what needs fixing.':'Ouch. That hurt a little. Tell me what went wrong and I’ll try to help.',hurt>1?'Я здесь, чтобы помочь, но повторные оскорбления неприятны. Скажи, что нужно исправить.':'Ай, это немного обидно. Скажи, что пошло не так — я постараюсь помочь.')};}
 if(tease){const irritation=Math.min(3,base.irritation+1);return {state:{...base,mood:level===0?'neutral':irritation>1?'angry':'thinking',irritation,at:Date.now()},text:prefix+L(irritation>1?'All right, enough teasing. Let’s be friendly — what can I help you with?':'Sleepy? Me? I’m on space duty! What’s our next mission?',irritation>1?'Ну всё, хватит дразнить. Давай дружелюбнее — чем помочь?':'Соня? Я? Я вообще-то на космической смене! Какой следующий план?')};}
 if(/^(?:thank you|thanks|спасибо|благодарю)$/.test(q))return {state:{...initialEmotion,mood:'happy',at:Date.now()},text:prefix+L('You’re welcome!','Всегда пожалуйста!')};
 if(praise)return {state:{...initialEmotion,mood:'happy',at:Date.now()},text:prefix+L('That made my space shift brighter. Thank you!','Ты сделал мою космическую смену приятнее. Спасибо!')};
 if(/^(?:привет\S*|здравствуй\S*|hello|hi|hey)(?:\s|$)/.test(q))return {state:{...initialEmotion,mood:'wave',at:Date.now()},text:null};
 return {state:{...base,at:base.at},text:null};
}
