import {wantsPageSummary,visiblePageSummary} from '../assistant/pageSummary';
import {simpleCalculation,explanationAction} from '../assistant/instantGuide';
import {cleanSpokenNames} from '../assistant/speechCleanup';
import {worldTour,chooseOffered,memoryCommand,memoryDocs} from '../assistant/interaction';
import {creatorProfileAnswer} from '../assistant/creatorProfile';
import {createSentenceQueue} from '../assistant/sentenceQueue';
import {splitSpeech} from '../assistant/speechText';
import {siteGuideAnswer} from '../assistant/siteGuide';
import React,{useEffect,useRef,useState} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {Mic,MicOff,Send,X,Settings2,Volume2,VolumeX,Square,ArrowUpRight,MessageCircle,ChevronDown,Sparkles} from 'lucide-react';
import {useLanguage} from '../i18n';
import {siteLibrary,missions,robots} from '../assistant/library';
import {commandFor,entities,normalize,retrieve} from '../assistant/commands';
import {conversationReply,withoutAddress,isKnowledgeRequest,wantsDetails,briefAnswer,chooseVoice,femaleVoices} from '../assistant/conversation';
const interruptModel=()=>{};
import {searchInternet} from '../assistant/internet';
import {finalizeReply} from '../assistant/replyText';
import {speakNeural,stopNeuralVoice,prepareNeuralVoice,isNeuralVoiceReady} from '../assistant/neuralVoice';
import {acceptsBackgroundSpeech,chatCommand,replyLanguage} from '../assistant/taraBehavior';
import {roverParts} from '../data/robots';
import {nxUnits,localText,conceptLibrary} from '../data/concepts';
import {resolveSiteAction,readSiteContext,waitForAction,nxEntity} from '../assistant/siteActions';
import {conceptAnswer} from '../assistant/conceptAnswers';
import {reactToMessage,initialEmotion} from '../assistant/emotions';
import {createSpeechInput} from '../assistant/speechInput';
import TaraAvatar from './TaraAvatar';
import '../style-assistant.css';
const saved=()=>{try{return JSON.parse(localStorage.getItem('tara-preferences')||'{}')}catch{return {}}};
export default function TaraAssistant(){
 const siteLang=useLanguage(s=>s.lang),navigate=useNavigate(),location=useLocation();
 const [prefs,setPrefs]=useState(()=>({name:'Tara',humor:true,sound:true,voice:'',rate:.96,web:true,nickname:'',emotionLevel:2,bargeIn:true,echoGuard:true,sensitivity:.65,silenceMs:800,sttQuality:'accurate',aiQuality:'quality',volume:1,pitch:1.04,...saved(),autoAI:false,autoLanguage:false,neuralVoice:false,replyLength:'short',lang:'en'}));
 const [welcome,setWelcome]=useState(()=>{try{return !sessionStorage.getItem('tara-welcomed')}catch{return true}}),[bubble,setBubble]=useState(''),[awake,setAwake]=useState(true),[micState,setMicState]=useState('off'),[lastHeard,setLastHeard]=useState('');
 const [open,setOpen]=useState(false),[settings,setSettings]=useState(false),[messages,setMessages]=useState([]),[input,setInput]=useState(''),[phase,setPhase]=useState('idle'),[mood,setMood]=useState(''),[listening,setListening]=useState(false),[notice,setNotice]=useState(''),[voices,setVoices]=useState([]),[model,setModel]=useState('off'),[progress,setProgress]=useState(0),[backend,setBackend]=useState(''),[voiceState,setVoiceState]=useState('');
 const rec=useRef(null),micWanted=useRef(false),speaking=useRef(false),busy=useRef(false),run=useRef(0),topic=useRef(''),lastSources=useRef([]),lastQuestion=useRef(''),history=useRef([]),log=useRef(),entry=useRef(),timer=useRef(),alive=useRef(true),prefsRef=useRef(prefs),faceTimer=useRef(),submitRef=useRef(),webRequest=useRef(),speechRun=useRef(0),openRef=useRef(open),armedUntil=useRef(0),micGeneration=useRef(0),bubbleTimer=useRef(),emotionState=useRef(initialEmotion),modelPromise=useRef(),streamingId=useRef(),audioPlaying=useRef(false),speechDone=useRef(),sentenceQueue=useRef(),offer=useRef();
 prefsRef.current=prefs;openRef.current=open;
 const ru=prefs.lang==='ru',label=(a,b)=>ru?a:b;
 const add=m=>setMessages(xs=>[...xs.slice(-39),{...m,id:crypto.randomUUID()}]);
 useEffect(()=>{topic.current=selectedTopic()},[location.pathname,location.search]);
 useEffect(()=>{history.current=messages;log.current?.scrollTo({top:log.current.scrollHeight,behavior:'smooth'})},[messages,phase]);
 useEffect(()=>{try{localStorage.setItem('tara-preferences',JSON.stringify(prefs))}catch{}},[prefs]);
 useEffect(()=>{const synth=window.speechSynthesis;if(!synth)return;const update=()=>setVoices(synth.getVoices());update();synth.addEventListener('voiceschanged',update);return()=>synth.removeEventListener('voiceschanged',update)},[]);
 // All exits share the same teardown: no background microphone or late speech.
 function stopMic(){micGeneration.current++;micWanted.current=false;clearTimeout(timer.current);rec.current?.abort();rec.current?.destroy?.();rec.current=null;setListening(false);setMicState('off')}
 function stopWork(){sentenceQueue.current?.cancel();speechDone.current?.();speechDone.current=null;if(streamingId.current){const id=streamingId.current;setMessages(ms=>ms.map(m=>m.id===id?{...m,text:m.text||label('Ответ прерван.','Reply interrupted.')}:m));streamingId.current=null}webRequest.current?.abort();speechRun.current++;stopNeuralVoice();run.current++;interruptModel();busy.current=false;speaking.current=false;audioPlaying.current=false;window.speechSynthesis?.cancel();setPhase('idle')}
 function dismiss(){stopMic();stopWork();setOpen(false);setSettings(false);setNotice('');setBubble('');setAwake(false);setMood('sleeping');closeWelcome()}
 function closeWelcome(){setWelcome(false);try{sessionStorage.setItem('tara-welcomed','1')}catch{}}
 function react(mood){setMood(mood);clearTimeout(faceTimer.current);faceTimer.current=setTimeout(()=>setMood(''),8000)}
 function showBubble(text){setBubble(text);clearTimeout(bubbleTimer.current);bubbleTimer.current=setTimeout(()=>setBubble(''),Math.max(18000,Math.min(120000,text.length*70)))}
 useEffect(()=>{alive.current=true;const hide=()=>{if(document.hidden){stopMic();stopWork()}};document.addEventListener('visibilitychange',hide);return()=>{alive.current=false;micWanted.current=false;clearTimeout(timer.current);clearTimeout(faceTimer.current);rec.current?.abort();rec.current?.destroy?.();clearTimeout(bubbleTimer.current);window.speechSynthesis?.cancel();stopNeuralVoice();interruptModel();document.removeEventListener('visibilitychange',hide)}},[]);
 function restartMic(){clearTimeout(timer.current);if(micWanted.current&&!speaking.current&&!busy.current&&!document.hidden)timer.current=setTimeout(()=>{try{rec.current?.start()}catch{}},350)}
 function say(text,onDone=()=>{}){
 speechDone.current?.();speechDone.current=onDone;
 const p=prefsRef.current,token=++speechRun.current;stopNeuralVoice();window.speechSynthesis?.cancel();
 if(!p.sound){speechDone.current=null;onDone();setPhase(busy.current?'thinking':'idle');restartMic();return}
 speaking.current=true;if(rec.current?.kind!=='local')rec.current?.abort();setListening(false);
 const clean=text.replace(/\[\d+\]/g,'').replace(/[\p{Extended_Pictographic}]/gu,'').trim();
 const finish=()=>{if(!alive.current||token!==speechRun.current)return;armedUntil.current=Date.now()+60000;speaking.current=false;audioPlaying.current=false;setVoiceState('');setPhase(busy.current?'thinking':'idle');speechDone.current=null;onDone();restartMic()};
 const chosen=chooseVoice(window.speechSynthesis?.getVoices()||[],p.lang,p.voice);
 const systemVoice=()=>{if(!window.speechSynthesis||!chosen){setNotice(label('Подходящий женский голос не установлен. Ответ доступен текстом; включи женский нейроголос.','No identifiable female system voice is installed. The text reply is available; enable the female neural voice.'));finish();return}setPhase('speaking');const chunks=splitSpeech(clean);let index=0;const next=()=>{if(token!==speechRun.current||!alive.current)return;if(index>=chunks.length){finish();return}const u=new SpeechSynthesisUtterance(chunks[index++]);u.lang=p.lang==='ru'?'ru-RU':'en-US';u.voice=chosen;u.rate=p.rate;u.pitch=p.pitch;u.volume=p.volume;u.onstart=()=>{audioPlaying.current=true};u.onend=next;u.onerror=finish;window.speechSynthesis.speak(u)};next()};
 if(!p.neuralVoice){systemVoice();return}
 if(!isNeuralVoiceReady(p.lang)&&chosen){systemVoice();prepareNeuralVoice(p.lang).catch(()=>{});return}
 setPhase('voice-loading');setVoiceState(isNeuralVoiceReady(p.lang)?label('Создаю речь…','Synthesizing…'):label('Первая загрузка женского голоса…','First female voice download…'));
 speakNeural(clean,p.lang,{rate:p.rate,volume:p.volume,onProgress:n=>{if(token===speechRun.current)setVoiceState(label('Загрузка женского голоса ','Downloading female voice ')+n+'%')},onStart:()=>{if(token===speechRun.current){audioPlaying.current=true;setPhase('speaking')}}}).then(finish).catch(e=>{if(e.message==='CANCELLED'||token!==speechRun.current)return;if(chosen)systemVoice();else{setNotice(label('Женский нейроголос сейчас недоступен. Ответ остаётся текстом.','The female neural voice is unavailable right now. Your reply is available as text.'));finish()}});
 }

 function launch(){closeWelcome();setAwake(true);setOpen(true);setBubble('');if(!messages.length)add({role:'assistant',text:label('Привет! Я Tara. Что показать: Марс, Луну, роботов или концепции нашей команды?','Hi, I’m Tara. What would you like to see: Mars, the Moon, robots or our team’s concepts?')});setTimeout(()=>entry.current?.focus(),80)}
 async function microphone(){
 if(micWanted.current){stopMic();return}closeWelcome();setAwake(true);setMood('');stopWork();setNotice('');
 micWanted.current=true;armedUntil.current=Date.now()+60000;const attempt=++micGeneration.current;setMicState('loading');
 if(prefsRef.current.neuralVoice)prepareNeuralVoice(prefsRef.current.lang).catch(()=>{});
 if(prefsRef.current.autoLanguage){
 try{const control=await createSpeechInput({quality:prefsRef.current.sttQuality,sensitivity:prefsRef.current.sensitivity,bargeIn:prefsRef.current.bargeIn,echoGuard:prefsRef.current.echoGuard,silenceMs:prefsRef.current.silenceMs,isPlayback:()=>audioPlaying.current,onSpeechStart:()=>{if(prefsRef.current.bargeIn&&(speaking.current||busy.current)){stopWork();setMood('');armedUntil.current=Date.now()+60000}},onControl:c=>{if(attempt===micGeneration.current)rec.current=c;else c.destroy()},onText:text=>{if(micWanted.current){setLastHeard(text);submitRef.current(text,{spoken:true})}},onProgress:n=>{if(attempt===micGeneration.current)setMicState('loading '+n+'%')},onState:state=>{if(attempt!==micGeneration.current)return;setMicState(state);setListening(state==='listening'&&!speaking.current&&!busy.current)},isPaused:()=>!micWanted.current||document.hidden,onError:()=>{if(attempt===micGeneration.current)setNotice(label('Не расслышала. Повтори чуть ближе к микрофону.','I didn’t catch that. Please try a little closer to the mic.'))}});
 if(attempt!==micGeneration.current){control.destroy();return}rec.current=control;showBubble(label('Скажи «Тара» и свою просьбу. Чат останется закрыт.','Say “Tara” and your request. The chat stays closed.'));
 }catch(e){if(attempt!==micGeneration.current)return;stopMic();setNotice(label('Не удалось включить авто-распознавание. Проверь доступ к микрофону. В настройках есть браузерный режим EN/RU.','Auto recognition could not start. Check microphone permission. Browser EN/RU mode is available in settings.'))}return;
 }
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Recognition){stopMic();setNotice(label('Голосовой ввод недоступен. Напиши вопрос.','Voice input is unavailable. Please type your question.'));return}
 const recognition=new Recognition();rec.current=recognition;recognition.lang=prefsRef.current.lang==='ru'?'ru-RU':'en-US';recognition.continuous=false;recognition.interimResults=false;
 recognition.onstart=()=>{if(!micWanted.current){recognition.abort();return}setListening(true);setMicState('listening')};
 recognition.onresult=e=>{if(micWanted.current){const text=e.results[0][0].transcript;setLastHeard(text);submitRef.current(text,{spoken:true})}};
 recognition.onerror=e=>{if(!alive.current||e.error==='no-speech'||e.error==='aborted')return;stopMic();setNotice(label('Проверь разрешение микрофона и подключение.','Check microphone permission and your connection.'))};
 recognition.onend=()=>{if(!alive.current)return;setListening(false);restartMic()};try{recognition.start()}catch{stopMic()}
 }
 function switchLanguage(lang,{keepMic=false}={}){if(!keepMic)stopMic();stopWork();prefsRef.current={...prefsRef.current,lang,voice:''};setPrefs(p=>({...p,lang,voice:''}));useLanguage.getState().setLanguage(lang)}

 function selectedTopic(){const path=location.pathname;if(path.startsWith('/surface/'))return path.split('/').pop();if(path==='/solar-system')return new URLSearchParams(location.search).get('body')||'earth';if(path==='/concepts')return new URLSearchParams(location.search).get('unit')||'nx1';if(path==='/robots')return new URLSearchParams(location.search).get('robot')||'perseverance';if(path.startsWith('/explore/'))return path.split('/').pop();return ''}
 async function submit(raw,{spoken=false}={}){
 let question=(spoken?cleanSpokenNames(raw):raw).trim().slice(0,12000);if(!question)return;setInput('');setNotice('');
 const inChat=openRef.current;
 if(spoken&&!inChat){if(!acceptsBackgroundSpeech(question,{name:prefsRef.current.name,until:armedUntil.current})){restartMic();return}armedUntil.current=Date.now()+60000}
 setAwake(true);
 const rawCommand=commandFor(question,{name:prefsRef.current.name,robotIds:robots.map(r=>r.id),missionIds:missions.map(m=>m.id)});
 let command=rawCommand;
 if(command?.type==='dismiss'){dismiss();return}if(command?.type==='stop'){stopWork();restartMic();return}
 if(busy.current||speaking.current)stopWork();
 let replyLang=prefsRef.current.lang;
 if(command?.type==='language')replyLang=command.lang;
 else replyLang=replyLanguage(question,prefsRef.current.name,replyLang);
 if(replyLang!==prefsRef.current.lang)switchLanguage(replyLang,{keepMic:true});else if(useLanguage.getState().lang!==replyLang)useLanguage.getState().setLanguage(replyLang);
 const L=(a,b)=>replyLang==='ru'?a:b,p={...prefsRef.current,lang:replyLang};
 const offered=chooseOffered(question,offer.current);
 const tour=worldTour(question,missions,replyLang);
 const explainAction=explanationAction(question,{...readSiteContext(location,robots,roverParts),missions,name:p.name,lang:replyLang});
 const exactAction=resolveSiteAction(question,{...readSiteContext(location,robots,roverParts),missions,name:p.name,lang:replyLang});if(exactAction)command=exactAction;
 if(explainAction)command=explainAction;
 if(tour&&!explainAction?.path.startsWith('/surface/'))command=tour;
 if(offered?.option)command={type:'navigate',path:offered.option.path,title:offered.option.title};
 const social=conversationReply(question,p),q=normalize(question),cleaned=withoutAddress(question,p.name).replace(/^(?:привет|hello|hi|hey)\s+/,'');
 const socialChat=Boolean(social)||!entities(question).length&&/(?:как.*(?:дела|настроени|жизнь)|чем.*занимаешь|расскажи.*(?:шутку|анекдот)|how.*(?:you|life|going)|tell.*joke|what.*you.*doing)/.test(q);
 const detail=wantsDetails(question)||(p.replyLength!=='short'),followup=/^(?:а )?(?:еще|дальше|продолжай|подробнее|расскажи подробнее|more|tell me more|go on|in detail)$/.test(q);
 const factual=Boolean(nxEntity(question))||location.pathname==='/concepts'&&!socialChat||isKnowledgeRequest(cleaned,Boolean(topic.current||selectedTopic()))||followup&&Boolean(lastQuestion.current)||/^(?:кто|что|почему|зачем|когда|где|сколько|как работает|найди|поищи|who|what|why|when|where|how does|search|find)(?:\s|$)/u.test(q)||/\?$/.test(question);
 // A microphone session accepts direct speech; it never starts itself.

 const prior=history.current.slice();stopWork();add({role:'user',text:question});
 const respond=(text,sources=[],choices=[])=>{const output=text;add({role:'assistant',text:output,sources,choices});if(!inChat)showBubble(output);lastSources.current=sources;busy.current=false;armedUntil.current=Date.now()+60000;say(output)};
 const calculation=simpleCalculation(question,replyLang);if(calculation){respond(calculation);return}
 const chatAction=chatCommand(question,p.name);if(chatAction){if(chatAction==='open'){launch();respond(L('Открыла чат.','Chat is open.'))}else{setOpen(false);showBubble(L('Я рядом.','I’m right here.'));respond(L('Свернула чат. Я рядом.','Chat minimized. I’m right here.'))}return}
 const remembered=memoryCommand(question,window.localStorage,replyLang);if(remembered){respond(remembered);return}
 if(offered?.dismiss){offer.current=null;respond(L('Хорошо. Чем ещё помочь?','All right. What else can I help with?'));return}
 if(offered?.list){respond(offer.current.options.map((o,i)=>(i+1)+'. '+o.title).join('. ')+L('. Назови название или номер.','. Say a name or number.'),[],offer.current.options);return}
 const feeling=reactToMessage(question,emotionState.current,{...p,level:p.emotionLevel});emotionState.current=feeling.state;if(feeling.state.mood!=='neutral')react(feeling.state.mood);if(feeling.text){respond(feeling.text);return}
 if(command?.type==='scroll'){if(location.pathname==='/about'){const sections=[...document.querySelectorAll('.about-purpose,.about-pages,.tara-about-story,.about-method')];const section=command.direction>0?sections.find(n=>n.getBoundingClientRect().top>160):sections.filter(n=>n.getBoundingClientRect().top<100).at(-1);if(section){section.style.scrollMarginTop='140px';section.scrollIntoView({block:'start',behavior:'smooth'});respond(section.innerText.replace(/\s+/g,' ').slice(0,450));return}}window.scrollBy({top:command.direction*window.innerHeight*.6,behavior:'smooth'});respond(L('Вот, немного '+(command.direction>0?'ниже.':'выше.'),'Here, a little '+(command.direction>0?'lower.':'higher.')));return}
 const profile=creatorProfileAnswer(question,replyLang);if(profile){respond(profile);return}
 if(command?.type==='clarify'){respond(command.text);return}
 if(command?.type==='language'){respond(L('Теперь говорю по-русски.','I’ll speak English now.'));return}
 if(command?.type==='back'){navigate(-1);respond(L('Возвращаюсь.','Going back.'));return}
 if(command?.type==='navigate'){if(command.explain){const target=new URL(command.path,window.location.origin);const concept=conceptAnswer(question,{pathname:target.pathname,search:target.search,lang:replyLang,detailed:detail});const guide=siteGuideAnswer(question,{name:p.name,lang:replyLang,pathname:target.pathname});const library=siteLibrary(replyLang);const id=command.entity||target.pathname.split('/').pop();const docs=retrieve(question,library,id);command.explanation=concept?.text||(command.entity&&docs.length?briefAnswer(docs,{detailed:detail}):guide)||(docs.length?briefAnswer(docs,{detailed:detail}):null);topic.current=id;lastQuestion.current=question;}if(command.path.startsWith('/surface/')&&!command.explanation)command.explanation=L('Открываю '+(command.title||'локацию')+'. В интерактивном виде можно поворачивать обзор пальцем или мышью. Если панорама недоступна, останется архивное фото.','Opening '+(command.title||'the location')+'. Drag with a finger or mouse in the interactive view to look around. If a panorama is unavailable, the archive photo remains.');if(command.explain&&command.path.startsWith('/surface/'))command.explanation=(command.explanation||'')+' '+L('В интерактивном виде можно двигать обзор пальцем или мышью.','In the interactive view, drag with a finger or mouse to look around.');const actionToken=run.current;setPhase('thinking');navigate(command.path);const opened=await waitForAction(command,()=>actionToken===run.current&&alive.current);if(actionToken!==run.current)return;if(opened){if(command.options)offer.current={options:command.options,until:Date.now()+120000};else offer.current=null;react('happy');respond(command.explanation|| (command.about?L('Если коротко, этот проект создали Норов Мухаммад и его команда. Открыла About Us.','In short, Norov Muhammad and his team created this project. About Us is open.'):L('Окей, показываю'+(command.title?': '+command.title:'')+'.','Okay, here’s '+(command.title||'the page')+'.')))}else respond(L('Не смогла подтвердить открытие. Попробуй выбрать раздел вручную.','I couldn’t confirm that it opened. Please choose the section manually.'));return}
 if(/^(?:пока|до свидания|bye|goodbye|see you)$/.test(withoutAddress(question,p.name))){stopMic();respond(L('Пока! Буду здесь.','Bye! I’ll be here.'));return}
 if(/(?:откуда|источник|source|evidence)/.test(q)&&lastSources.current.length){respond(L('Вот источники.','Here are the sources.'),lastSources.current);return}
 if(/(?:как тебя зовут|твое имя|твоё имя|what is your name|what s your name|who are you)/.test(q)){respond(L('Я '+p.name+' — помощница этого сайта. Рада знакомству!','I’m '+p.name+', this site’s assistant. Nice to meet you!'));return}
 const creator=/(?:зачем ты|кто тебя создал|твой создатель|кто твой автор|why.*(?:exist|need)|who.*(?:made|created|built) you|your creator)/.test(q);
 if(social){if(social.endSession)stopMic();respond((p.nickname&&/привет|hello|hi|hey|как.*дела|how are/.test(q)?p.nickname+', ':'')+social.text);return}
 if(creator){respond(L('Меня создали Норов Мухаммад и его команда. Когда он уставал читать тексты сайта, я читала их вслух. Теперь помогаю и тебе!','Norov Muhammad and his team created me so he could listen when he was too tired to read the site. Now I do the reading and explaining for you, too!'));return}
 if(wantsPageSummary(question,p.name)){const summary=visiblePageSummary();respond(summary||L('На этой странице пока нет доступного текста.','There is no readable text on this page yet.'));return}
 const guide=siteGuideAnswer(question,{name:p.name,lang:replyLang,pathname:location.pathname});if(guide){respond(guide);return}
 const concept=conceptAnswer(question,{pathname:location.pathname,search:location.search,lang:replyLang,detailed:detail});if(concept){topic.current=concept.entity;lastQuestion.current=question;respond(concept.text);return}
 question=followup&&lastQuestion.current?lastQuestion.current+' '+question:cleaned||question;
 let context=followup||/(?:^|\s)(?:его|ее|её|он|она|it|its|their|this rover|this planet)(?:\s|$)/u.test(cleaned)?topic.current||selectedTopic():'';const explicit=[...entities(question),nxEntity(question)].filter(Boolean);if(explicit.length)context=explicit[0];if(context)topic.current=context;
 let docs=factual||creator?retrieve(question,siteLibrary(replyLang),context):[];
 const personalDocs=memoryDocs(question,window.localStorage);
 if(personalDocs.length&&!docs.length){respond(L('В твоих сохранённых исправлениях: ','From your saved corrections: ')+personalDocs.map(d=>d.text.replace('User-provided personal note, not independently verified: ','')).join('. '));return}
 if(explicit.length>1){const library=siteLibrary(replyLang);docs=explicit.flatMap(id=>retrieve(question,library.filter(d=>d.entity===id),id).slice(0,2)).slice(0,4)}
 const aboutSite=/(?:сайт|проект|website|project)/.test(q);
 if(aboutSite||creator)docs.unshift({title:L('О проекте','About this project'),text:L('Автор сайта и Tara — Norov Muhammad. Tara читает материалы вслух, чтобы Норов мог слушать, когда уставал читать. Это образовательный архив аппаратов на Луне, Марсе и в дальнем космосе. Есть архив миссий, исследование миров, роботы, научные факты и страница автора.','Norov Muhammad created this website and Tara. Tara reads the site aloud so Norov can listen when tired of reading. It is an educational archive of equipment on the Moon, Mars and in deep space, with missions, world exploration, robots, facts and a creator page.'),path:'/about'});
 const token=++run.current;busy.current=true;if(rec.current?.kind!=='local')rec.current?.abort();setPhase('thinking');
 const internet=Boolean(p.web&&!socialChat&&!aboutSite&&!creator&&/(?:в интернете|в сети|онлайн|wikipedia|википед|search online|search the web|look up online|search the internet)/.test(q));
 if(internet){setPhase('searching');webRequest.current=new AbortController();try{const searchQuestion=question;const online=await searchInternet(searchQuestion,replyLang,webRequest.current.signal);if(token!==run.current)return;docs=[...docs.slice(0,2),...online].slice(0,5);if(!online.length)setNotice(L('Поиск Wikipedia не нашёл подходящих статей.','Wikipedia search found no matching articles.'))}catch(e){if(token!==run.current)return;setNotice(L('Поиск в интернете сейчас недоступен. Использую только доступные материалы.','Internet search is unavailable. Using available materials only.'))}}
 if(token!==run.current)return;
 const sources=docs.map((d,i)=>({...d,number:i+1})).filter(d=>d.source).map(d=>({title:(d.provider?d.provider+' · ':'')+d.title,url:d.source,path:d.path,number:d.number}));
 lastQuestion.current=question;
 if(!docs.length){respond(L('В материалах сайта такого ответа пока нет. Могу рассказать о миссиях, роботах, планетах и NX1/NX2. Что показать?','That answer is not in the site materials yet. I can explain missions, robots, planets and NX1/NX2. What would you like to see?'));return}
 const chosen=explicit.length>1?explicit.map(id=>docs.find(d=>d.entity===id)).filter(Boolean):docs.slice(0,1);
 respond(briefAnswer(chosen,{detailed:detail,compare:explicit.length>1}),sources.filter(s=>chosen.some(d=>d.source===s.url)));
 }

 submitRef.current=submit;
 const face=mood||(listening?'listening':phase==='thinking'||phase==='searching'||phase==='voice-loading'?'thinking':phase==='speaking'?'speaking':!awake?'sleeping':'neutral');
 const status=phase==='speaking'?label('Говорю · можешь перебить','Speaking · you can interrupt'):phase==='voice-loading'?voiceState:phase==='thinking'?label('Думаю…','Thinking…'):phase==='searching'?label('Ищу источники…','Finding sources…'):micState.startsWith('loading')?label('Готовлю авто-язык · ','Preparing auto language · ')+micState.replace('loading',''):micState==='transcribing'?label('Распознаю…','Recognizing…'):listening?label('Слушаю · RU / EN','Listening · EN / RU'):phase==='voice-loading'?voiceState:phase==='searching'?label('Ищу источники…','Finding sources…'):phase==='thinking'?label('Думаю…','Thinking…'):phase==='speaking'?label('Говорю…','Speaking…'):!awake?label('Отдыхаю','Resting'):label('Твоя космическая помощница','Your little space companion');
 function toggleSound(){speechRun.current++;stopNeuralVoice();window.speechSynthesis?.cancel();speaking.current=false;audioPlaying.current=false;setPhase('idle');setPrefs(p=>({...p,sound:!p.sound}));restartMic()}
 const tools=<div className="tara-controls"><button className={'tara-control '+(micWanted.current?'is-on':'')} aria-pressed={micWanted.current} onClick={microphone}>{micWanted.current?<Mic size={19}/>:<MicOff size={19}/>}<span>{micState.startsWith('loading')?label('Загрузка…','Loading…'):micWanted.current?label('Микрофон вкл.','Mic on'):label('Микрофон выкл.','Mic off')}</span></button><button className="tara-control" aria-pressed={prefs.sound} onClick={toggleSound}>{prefs.sound?<Volume2 size={19}/>:<VolumeX size={19}/>}<span>{prefs.sound?label('Звук вкл.','Sound on'):label('Звук выкл.','Sound off')}</span></button><button className="tara-control tara-stop" onClick={()=>{stopMic();stopWork()}} aria-label={label('Остановить речь и микрофон','Stop speech and microphone')}><Square size={17}/></button></div>;
 return <aside className="tara-assistant" aria-label={label('Помощница Tara','Tara assistant')}>
 {welcome&&!open&&<section className="tara-welcome" aria-label={label('Знакомство с Tara','Meet Tara')}><button className="tara-close" onClick={closeWelcome} aria-label={label('Позже','Maybe later')}><X size={18}/></button><span className="tara-kicker"><Sparkles size={13}/> MEET YOUR COPILOT</span><TaraAvatar mood="wave"/><h2>{label('Привет, я Tara.','Hi, I’m Tara.')} <span>✦</span></h2><p>{label('Покажу роботов, объясню миссии и почитаю за тебя. Попробуем?','I’ll show you the robots, explain missions, and do the reading for you. Ready?')}</p><button className="tara-primary" onClick={microphone}><Mic size={18}/>{label('Включить голос','Enable voice')}</button><button className="tara-secondary" onClick={launch}><MessageCircle size={17}/>{label('Открыть чат','Open chat')}</button><small>{label('Микрофон — с разрешения. Ответы по сайту доступны сразу. Голосовой ввод зависит от браузера; локальное распознавание можно включить в настройках.','Microphone with permission. Site answers work immediately. Voice input depends on your browser; local recognition is optional in settings.')}</small></section>}
 {open&&<section className="tara-panel" aria-label={prefs.name+' chat'}>
 <header className="tara-head"><TaraAvatar mood={face}/><div className="tara-head-copy"><span className="tara-kicker">SPACE COMPANION</span><strong>{prefs.name}</strong><small role="status"><i className={listening?'live':''}/>{status}</small></div><button aria-label={label('Настройки Tara','Tara settings')} aria-expanded={settings} onClick={()=>setSettings(!settings)}><Settings2 size={19}/></button><button aria-label={label('Свернуть чат','Minimize chat')} onClick={()=>{setOpen(false);setSettings(false)}}><ChevronDown size={22}/></button></header>
 {settings?<div className="tara-settings">
 <div className="tara-settings-title"><h3>{label('Настройки Tara','Tara settings')}</h3><button onClick={()=>setSettings(false)} aria-label={label('Закрыть настройки','Close settings')}><X size={18}/></button></div>
 <label>{label('Твой ник · как к тебе обращаться','Your nickname · how I address you')}<input value={prefs.nickname} maxLength={28} onChange={e=>setPrefs(p=>({...p,nickname:e.target.value}))} placeholder={label('Например, Норов','For example, Norov')}/></label>
 <label>{label('Длина ответов в чате','Chat reply length')}<select value={prefs.replyLength} onChange={e=>setPrefs(p=>({...p,replyLength:e.target.value}))}><option value="short">{label('Коротко','Short')}</option><option value="normal">{label('Основное с объяснением','Key points with explanation')}</option></select></label>
 <label>{label('Выраженность эмоций','Emotional expression')}<select value={prefs.emotionLevel} onChange={e=>setPrefs(p=>({...p,emotionLevel:Number(e.target.value)}))}><option value="0">{label('Спокойная','Calm')}</option><option value="1">{label('Мягкая','Gentle')}</option><option value="2">{label('Выразительная','Expressive')}</option></select></label>
 <label className="tara-check"><input type="checkbox" checked={prefs.bargeIn} onChange={e=>{stopMic();setPrefs(p=>({...p,bargeIn:e.target.checked}))}}/>{label('Останавливать речь, когда я начинаю говорить','Stop speaking when I start talking')}</label>
 <label className="tara-check"><input type="checkbox" checked={prefs.echoGuard} onChange={e=>{stopMic();setPrefs(p=>({...p,echoGuard:e.target.checked}))}}/>{label('Защита от собственного эха','Guard against playback echo')}</label>
 <label>{label('Чувствительность микрофона','Microphone sensitivity')}<input type="range" min="0" max="1" step=".05" value={prefs.sensitivity} onChange={e=>{stopMic();setPrefs(p=>({...p,sensitivity:Number(e.target.value)}))}}/></label>
 <label>{label('Пауза до распознавания','Pause before recognition')}<select value={prefs.silenceMs} onChange={e=>{stopMic();setPrefs(p=>({...p,silenceMs:Number(e.target.value)}))}}><option value="550">{label('Быстрая · 0,55 с','Fast · 0.55 s')}</option><option value="800">{label('Обычная · 0,8 с','Normal · 0.8 s')}</option><option value="1200">{label('Спокойная · 1,2 с','Relaxed · 1.2 s')}</option></select></label>
 <label>{label('Распознавание RU / EN','EN / RU recognition')}<select value={prefs.sttQuality} onChange={e=>{stopMic();setPrefs(p=>({...p,sttQuality:e.target.value}))}}><option value="precision">{label('Максимум · Whisper Small · медленнее, больше загрузка','Precision · Whisper Small · slower, larger download')}</option><option value="accurate">{label('Точнее · Whisper Base · больше загрузка','More accurate · Whisper Base · larger download')}</option><option value="fast">{label('Быстрее · Whisper Tiny','Faster · Whisper Tiny')}</option></select></label>
 <small>{label('Прерывание голосом работает с включённым локальным распознаванием. Качество зависит от микрофона и эха; кнопка ■ доступна всегда. После изменения микрофона включи его заново.','Voice interruption uses enabled local recognition. Quality depends on your mic and echo; ■ is always available. Re-enable the mic after changing its settings.')}</small>
 <label>{label('Громкость Tara','Tara volume')}<input type="range" min="0" max="1" step=".05" value={prefs.volume} onChange={e=>setPrefs(p=>({...p,volume:Number(e.target.value)}))}/></label>
 <label>{label('Имя','Name')}<input value={prefs.name} maxLength={24} onChange={e=>setPrefs(p=>({...p,name:e.target.value}))} onBlur={()=>{if(!prefs.name.trim())setPrefs(p=>({...p,name:'Tara'}))}}/></label>
 <label>{label('Язык · автоматически из разговора','Language · follows your conversation')}<select value={prefs.lang} onChange={e=>switchLanguage(e.target.value)}><option value="en">English</option><option value="ru">Русский</option></select></label>
 <label className="tara-check"><input type="checkbox" checked={prefs.autoLanguage} onChange={e=>{stopMic();setPrefs(p=>({...p,autoLanguage:e.target.checked}))}}/>{label('Авто RU / EN · локальное распознавание','Auto EN / RU · local speech recognition')}</label><small>{label('Выключи для браузерного распознавания на выбранном языке. Оно может отправлять звук своему сервису.','Turn off to use browser recognition in the selected language. It may send audio to its service.')}</small>
 <label className="tara-check"><input type="checkbox" checked={prefs.neuralVoice} onChange={e=>setPrefs(p=>({...p,neuralVoice:e.target.checked}))}/>{label('Женский нейроголос · загрузка один раз на язык','Female neural voice · one download per language')}</label>
 <label>{label('Женский системный голос','Female system voice')}<select value={prefs.voice} onChange={e=>setPrefs(p=>({...p,voice:e.target.value}))}><option value="">{label('Женский автоматически','Female voice automatically')}</option>{femaleVoices(voices,prefs.lang).map(v=><option value={v.voiceURI} key={v.voiceURI}>{v.name}</option>)}</select></label>
 <label>{label('Темп речи','Speaking pace')}<input type="range" min="0.8" max="1.1" step="0.01" value={prefs.rate} onChange={e=>setPrefs(p=>({...p,rate:Number(e.target.value)}))}/></label>
 <button className="tara-secondary" onClick={()=>say(label('Привет! Я '+prefs.name+'. Рада знакомству.','Hi! I’m '+prefs.name+'. It’s lovely to meet you.'))}>{label('Послушать голос','Preview voice')}</button>
 <label className="tara-check"><input type="checkbox" checked={prefs.humor} onChange={e=>setPrefs(p=>({...p,humor:e.target.checked}))}/>{label('Космический юмор','Cosmic humor')}</label><label className="tara-check"><input type="checkbox" checked={prefs.web} onChange={e=>setPrefs(p=>({...p,web:e.target.checked}))}/>{label('Поиск Wikipedia только по прямому запросу','Wikipedia search only when explicitly requested')}</label>
 <small>Piper · <a href="https://huggingface.co/rhasspy/piper-voices/blob/main/ru/ru_RU/irina/medium/MODEL_CARD" target="_blank" rel="noreferrer">Irina RU</a> / <a href="https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/hfc_female/medium/MODEL_CARD" target="_blank" rel="noreferrer">HFC Female EN</a></small>
 <button className="tara-secondary" onClick={dismiss}>{label('Отключить Tara','Turn off Tara')}</button>
 </div>:<>
 <div className="tara-context"><span>✦</span>{label('С тобой на странице: ','Exploring with you: ')}<b>{location.pathname==='/'?label('Главная','Home'):location.pathname.split('/').filter(Boolean).join(' / ')}</b></div>
 <div className="tara-log" ref={log} role="log" aria-label={label('Разговор','Conversation')} aria-live="polite" aria-relevant="additions text">{messages.map(m=><article key={m.id} className={'tara-message tara-message-'+m.role}><small>{m.role==='user'?label('Ты','You'):prefs.name}</small><p>{m.text||label('Готовлю ответ…','Preparing an answer…')}</p>{m.choices?.length>0&&<div className="tara-sources">{m.choices.map((choice,i)=><button type="button" key={choice.path} onClick={()=>submitRef.current(label('покажи ','show ')+choice.title)}>{i+1}. {choice.title}</button>)}</div>}{m.sources?.length>0&&<div className="tara-sources">{m.sources.map((s,i)=><a key={s.url+String(s.number)} href={s.url} target="_blank" rel="noreferrer">[{s.number||i+1}] {s.title}<ArrowUpRight size={12}/></a>)}</div>}</article>)}</div>
 <div className="tara-suggestions">{[label('Покажи роботов','Show robots'),label('Зачем ты нужна?','Who created you?'),label('Покажи планеты','Show planets'),label('Открой About us','Open About us'),label('Покажи NX2','Show NX2')].map(q=><button key={q} disabled={busy.current} onClick={()=>submit(q)}>{q}</button>)}</div>
 <form className="tara-compose" onSubmit={e=>{e.preventDefault();submit(input)}}><input ref={entry} value={input} maxLength={12000} onChange={e=>setInput(e.target.value)} aria-label={label('Вопрос Tara','Ask Tara')} placeholder={label('Спроси у Tara…','Ask Tara anything…')}/><button type="submit" disabled={!input.trim()} aria-label={label('Отправить','Send')}><Send size={18}/></button></form>
 </>}
 {notice&&<p className="tara-notice" role="status">{notice}</p>}
 {lastHeard&&<div className="tara-heard"><span>{label("Услышала: ","Heard: ")}{lastHeard.slice(0,160)}</span><button onClick={()=>{setInput(lastHeard);entry.current?.focus()}}>{label("Исправить","Edit")}</button></div>}
 {tools}<footer className="tara-footnote"><span>{label('Гид по материалам сайта · без загрузки ИИ','Site guide · no AI download')}</span><div>{['en','ru'].map(lang=><button key={lang} aria-pressed={prefs.lang===lang} onClick={()=>switchLanguage(lang)}>{lang.toUpperCase()}</button>)}</div></footer>
 </section>}
 {!open&&<div className={"tara-floating "+(micWanted.current||phase!=="idle"?"is-active":"")}>
 {!welcome&&(bubble||notice)&&<div className="tara-bubble" role="status"><button aria-label={label('Скрыть реплику','Hide reply')} onClick={()=>{setBubble('');setNotice('')}}><X size={14}/></button><strong>{prefs.name}<span>✦</span></strong><p>{notice||bubble}</p></div>}
 <button className="tara-character" aria-label={label('Открыть чат с ','Open chat with ')+prefs.name} aria-expanded={open} onClick={launch}><TaraAvatar mood={welcome?'wave':face}/><span className="tara-name">{prefs.name}<i className={micWanted.current?'live':''}/></span></button>
 {!welcome&&<><p className="tara-floating-status" role="status">{status}</p>{tools}<div className="tara-dock-links"><button onClick={launch}><MessageCircle size={14}/>{label('Чат','Chat')}</button><button onClick={()=>{launch();setSettings(true)}}><Settings2 size={14}/>{label('Настройки','Settings')}</button></div></>}
 </div>}
 </aside>;
}
