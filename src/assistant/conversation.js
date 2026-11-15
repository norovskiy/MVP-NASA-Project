import {entities,normalize} from './commands.js';
const escape=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
// Remove the current name as whole words; never match "hi" inside "ship".
export function withoutAddress(text,name='Tara'){
 let q=normalize(text);
 for(const n of [normalize(name),'тара','tara','орбит','orbit'].filter(Boolean))q=q.replace(new RegExp('(^|\\s)'+escape(n)+'(?=\\s|$)','gu'),' ');
 return q.replace(/\s+/g,' ').trim();
}
export function isKnowledgeRequest(text,hasTopic=false){
 const q=normalize(text);
 return entities(q).length>0||/(?:^|\s)(?:сайт\S*|проект\S*|архив\S*|мисси\S*|аппарат\S*|ровер\S*|робот\S*|планет\S*|космос\S*|марсоход\S*|гравитаци\S*|атмосфер\S*|вода|воды|истори\S*|website|site|project|archive|mission\S*|spacecraft|rover\S*|robot\S*|planet\S*|space|gravity|atmosphere|water|history|apollo|viking|pioneer|kepler|nasa)(?=\s|$)/u.test(q)||hasTopic&&/^(?:а |and )?(?:почему|зачем|как|когда|сколько|где|что|чем|расскажи|объясни|why|how|when|where|what|tell|explain|which)(?:\s|$)/.test(q);
}
export function conversationReply(text,{name='Tara',lang='en',humor=true}={}){
 const ru=lang==='ru',pick=(a,b)=>ru?a:b;
 let q=withoutAddress(text,name);
 const greeting=/^(?:привет(?:ик)?|здравствуй(?:те)?|добрый (?:день|вечер)|доброе утро|hello|hi|hey|good (?:morning|afternoon|evening))(?:\s|$)/;
 const greeted=greeting.test(q);q=q.replace(greeting,'').trim();
 if(/^(?:как (?:у тебя |твои )?дела(?: у тебя)?|как (?:твоя )?жизнь|как ты|как настроение|how are you|how is (?:your )?life|how s (?:your )?life|how s it going|how is it going|what s up|whats up)$/.test(q))return {text:pick(humor?'Всё хорошо — космическую смену держу! А ты как?':'Всё хорошо, спасибо! А ты как?',humor?"Doing well — holding down my space shift! How are you?":"I'm doing well, thanks! How are you?")};
 if(/^(?:спасибо(?: тебе)?|благодарю|thanks|thank you|thank you so much)$/.test(q))return {text:pick('Всегда пожалуйста!','You’re welcome!')};
 if(/^(?:пока|до свидания|до встречи|bye|bye bye|see you|see you later|goodbye)$/.test(q))return {text:pick('Пока! Буду здесь, если понадоблюсь.','Bye! I’ll be here if you need me.'),endSession:true};
 if(/^(?:хорошо|все хорошо|нормально|норм|отлично|все отлично|fine|i m fine|i am fine|good|i m good|great|not bad|doing well)$/.test(q))return {text:pick('Рада слышать 😊','Glad to hear it 😊')};
 if(/^(?:плохо|грустно|устал|я устал|устала|я устала|так себе|not great|i m tired|i am tired|i m sad|i am sad)$/.test(q))return {text:pick('Я рядом. Хочешь немного поболтать?','I’m here. Want to chat for a bit?')};
 if(/^(?:ты (?:тут|здесь)|ты меня слышишь|are you there|can you hear me)$/.test(q))return {text:pick('Да, я здесь. Слушаю тебя!','Yes, I’m here. I’m listening!')};
 if(/(?:не (?:говори|рассказывай).*пока.*не спрошу|жди (?:моего )?вопроса|wait for my question|don t speak until i ask)/.test(q))return {text:pick('Хорошо, жду твоего вопроса.','All right, I’ll wait for your question.'),endSession:true};
 // A noisy transcript such as "hello orbit remix" is still a greeting, not a science query.
 if(greeted&&!isKnowledgeRequest(q))return {text:pick('Привет! Рада тебя слышать. Как дела?','Hi! Good to hear from you. How are you?')};
 if(!q&&normalize(text))return {text:pick('Я тут! Слушаю тебя.','I’m here! Go ahead.')};
 return null;
}
export function wantsDetails(text){return /подробн|доскональн|развернут|полностью|in detail|detailed|full explanation|more detail/.test(normalize(text))}
export function briefAnswer(docs,{detailed=false,compare=false}={}){
 const selected=docs.slice(0,compare?2:1);
 return selected.map(d=>{
 const sentences=(detailed?d.text:(d.summary||d.text)).split(/(?<=[.!?])\s+/u);
 const text=(detailed?sentences:sentences.slice(0,2)).join(' ').replace(/\s+/g,' ').trim();
 const words=text.split(' '),limit=detailed?180:45;
 const clipped=words.length>limit?words.slice(0,limit).join(' ').replace(/[,;:]$/,'')+'…':text;
 return compare?d.title+' — '+clipped:clipped;
 }).join('\n\n');
}
// Only explicitly identifiable female OS voices may be offered or selected.
export function femaleVoices(voices,lang){const female=/milena|милена|katya|катя|svetlana|irina|maria|елена|samantha|ava|allison|susan|jenny|aria|zira|victoria|female|женск|natasha|наталья|daria|дарья|tatyana|тат[ья]на/i;const male=/\b(?:male|david|daniel|alex|yuri|pavel|dmitri|denis|ruslan|mark|george|fred|aaron|oliver)\b|мужск/i;return voices.filter(v=>v.lang.toLowerCase().startsWith(lang)&&female.test(v.name)&&!male.test(v.name))}
export function chooseVoice(voices,lang,selected=''){
 const available=femaleVoices(voices,lang);const manual=available.find(v=>v.voiceURI===selected);if(manual)return manual;
 return available.sort((a,b)=>(/premium|enhanced|natural|neural/i.test(b.name)?1:0)-(/premium|enhanced|natural|neural/i.test(a.name)?1:0))[0];
}
