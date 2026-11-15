import {conceptAnswer} from '../src/assistant/conceptAnswers.js';
import test from 'node:test';import assert from 'node:assert/strict';
import {resolveSiteAction,requestedNumber,nxEntity} from '../src/assistant/siteActions.js';
import {reactToMessage,initialEmotion} from '../src/assistant/emotions.js';
import {femaleVoices,chooseVoice} from '../src/assistant/conversation.js';
import {speechThreshold,shouldInterrupt} from '../src/assistant/speechGate.js';
import {nxUnits,conceptLibrary} from '../src/data/concepts.js';
import {buildMessages} from '../src/assistant/localModel.js';
const robots=[{id:'perseverance',name:'Perseverance',world:'mars'},{id:'curiosity',name:'Curiosity',world:'mars'},{id:'apollo-rover',name:'Apollo Rover',world:'moon'}];
test('real reported navigation phrases resolve exact pages',()=>{
 for(const q of ['покажи about us','Tara show about us','открой о нас','покажи абаут ас','about us'])assert.equal(resolveSiteAction(q).path,'/about');
 for(const q of ['покажи марсоход номер 2','покажи морсоход номер два','show the second rover'])assert.match(resolveSiteAction(q,{robots}).path,/robot=curiosity/);
 const filtered=resolveSiteAction('покажи второго робота',{robots,visibleRobots:['apollo-rover','perseverance'],search:'?world=all'});assert.match(filtered.path,/robot=perseverance/);
 assert.equal(resolveSiteAction('show robot number 99',{robots}).type,'clarify');
});
test('NX names, parts, blueprints and second-life mode retain selection',()=>{
 assert.equal(nxEntity('эн экс 2'),'nx2');
 assert.equal(nxEntity('NX 2'),'nx2');assert.equal(nxEntity('НХ1'),'nx1');
 assert.match(resolveSiteAction('Tara покажи NX2').path,/unit=nx2/);
 assert.match(resolveSiteAction('покажи его аккумулятор',{pathname:'/concepts',search:'?unit=nx2'}).path,/unit=nx2&part=battery/);
 assert.match(resolveSiteAction('open NX1 blueprint').path,/view=blueprint/);
 assert.match(resolveSiteAction('show NX1 second life').path,/mode=stationary/);
 assert.equal(resolveSiteAction('explain NX2'),null);
});
test('emotion carries irritation, recognizes varied insults, and recovers',()=>{
 const a=reactToMessage('Тара ты вообще очень тупая',initialEmotion,{lang:'ru'});assert.equal(a.state.mood,'hurt');
 const b=reactToMessage('ты меня бесишь, тупая',a.state,{lang:'ru'});assert.equal(b.state.mood,'angry');
 const c=reactToMessage('Тара прости меня',b.state,{lang:'ru'});assert.equal(c.state.mood,'happy');assert.equal(c.state.hurt,0);
 assert.equal(reactToMessage('what does stupid mean').text,null);
});
test('female-only voice choice cannot fall back to male or unknown voices',()=>{
 const male={name:'Daniel',lang:'en-US',voiceURI:'male'},unknown={name:'Google English',lang:'en-US',voiceURI:'unknown'},female={name:'Samantha',lang:'en-US',voiceURI:'female'};
 assert.equal(chooseVoice([male,unknown],'en'),undefined);assert.equal(chooseVoice([male,female],'en','male').voiceURI,'female');assert.equal(femaleVoices([male,female],'en').length,1);
});
test('speech onset interrupts before transcription; echo grace and noise guard are bounded',()=>{
 assert.equal(shouldInterrupt({voicedSeconds:.2,playbackAgeMs:400}),true);
 assert.equal(shouldInterrupt({voicedSeconds:.06,playbackAgeMs:400}),false);
 assert.equal(shouldInterrupt({voicedSeconds:.2,playbackAgeMs:100}),false);
 assert.equal(shouldInterrupt({voicedSeconds:.2,playbackAgeMs:400,enabled:false}),false);
 assert.ok(speechThreshold(.65,true)>speechThreshold(.65,false));
});
test('concept facts are bilingual and the prompt receives nickname and emotional context',()=>{
 assert.equal(nxUnits.length,2);assert.equal(nxUnits[0].parts.length,6);assert.match(conceptLibrary('ru').find(d=>d.entity==='nx1'&&d.title.includes('Аккумулятор')).text,/хранит, а не создаёт/);
 assert.match(buildMessages('hi',[],[],'en',true,'Tara',{nickname:'Norov',mood:'happy'})[0].content,/Norov.*happy/s);
});

test('NX follow-up questions use the selected equipment and inflected Russian part names',()=>{
 const a=conceptAnswer('объясни его батарею',{pathname:'/concepts',search:'?unit=nx2',lang:'ru',detailed:true});assert.match(a.text,/резерв возврата/);assert.match(a.path,/part=battery/);
 assert.match(resolveSiteAction('покажи батарею',{pathname:'/concepts',search:'?unit=nx2'}).path,/part=battery/);
 assert.equal(conceptAnswer('расскажи анекдот',{pathname:'/concepts'}),null);
});

test('Russian inflected robot parts select the component, not just the robot page',()=>{
 const a=resolveSiteAction('покажи антенну Curiosity',{robots,roverParts:{curiosity:[{id:'antenna',name:'Communication antennas'}]}});assert.equal(a.part,'antenna');
});
