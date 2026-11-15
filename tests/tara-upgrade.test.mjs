import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveSiteAction} from '../src/assistant/siteActions.js';
import {creatorProfileAnswer} from '../src/assistant/creatorProfile.js';
import {createSentenceQueue} from '../src/assistant/sentenceQueue.js';
import {worldTour,chooseOffered,memoryCommand,memoryDocs} from '../src/assistant/interaction.js';
const robots=[{id:'perseverance',name:'Perseverance',world:'mars'},{id:'curiosity',name:'Curiosity',world:'mars'}];
test('relative robot commands preserve order and refuse to invent a next entry',()=>{
 const context={pathname:'/robots',search:'?robot=perseverance',robots,lang:'ru'};
 assert.match(resolveSiteAction('вторую',context).path,/robot=curiosity/);
 assert.match(resolveSiteAction('переключи на следующую машинку',context).path,/robot=curiosity/);
 assert.equal(resolveSiteAction('предыдущую',context).type,'clarify');
 assert.equal(resolveSiteAction('чуть ниже',context).direction,1);
});
test('Apollo 12 and 16 route to their own entries; unknown missions do not get substituted',()=>{
 const missions=[{id:'apollo12',name:'Apollo 12'},{id:'apollo16',name:'Apollo 16'}];
 for(const number of [12,16])assert.equal(resolveSiteAction('покажи анимацию Apollo '+number,{missions}).path,'/surface/apollo'+number);
 assert.equal(resolveSiteAction('покажи Apollo 99',{missions}).type,'clarify');
});
test('creator biography uses supplied facts, without generating random dates',()=>{
 assert.match(creatorProfileAnswer('Кто такой Норов Мухаммад?'),/27 августа 2009/);
 assert.match(creatorProfileAnswer('Кто тебя создал?'),/Soft Club Academy/);
 assert.equal(creatorProfileAnswer('Что такое Марс?'),null);
});
test('speaking starts before completion and does not repeat cumulative text',async()=>{
 const heard=[];let release;
 const queue=createSentenceQueue(text=>{heard.push(text);return new Promise(r=>{release=r})});
 queue.push('Первое предложение. Незак');await new Promise(r=>setImmediate(r));
 assert.deepEqual(heard,['Первое предложение.']);
 queue.push('Первое предложение. Незаконченное второе.');
 release();await new Promise(r=>setImmediate(r));
 assert.deepEqual(heard,['Первое предложение.','Незаконченное второе.']);
 queue.cancel();queue.push('Первое предложение. Незаконченное второе. Третье.',true);
 release();await new Promise(r=>setImmediate(r));assert.equal(heard.length,2);
});
test('guided choices keep the actual catalog and expire',()=>{
 const tour=worldTour('Расскажи про Марс',[{id:'curiosity',name:'Curiosity',planet:'mars'},{id:'apollo16',name:'Apollo 16',planet:'moon'}]);
 assert.equal(tour.path,'/explore/mars');assert.equal(tour.options.length,1);
 const offer={options:tour.options,until:Date.now()+1000};
 assert.ok(chooseOffered('да',offer).list);assert.equal(chooseOffered('первую',offer).option.title,'Curiosity');
 assert.equal(chooseOffered('да',{...offer,until:0}),null);
});
test('explicit corrections stay in local storage and can be erased',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
 assert.match(memoryCommand('запомни: я предпочитаю короткие ответы',storage),/браузере/);
 assert.equal(memoryDocs('короткие ответы',storage).length,1);
 memoryCommand('забудь мои исправления',storage);assert.equal(memoryDocs('короткие ответы',storage).length,0);
});

import {cleanSpokenNames,prepareSpeechAudio} from '../src/assistant/speechCleanup.js';
test('name aliases preserve unrelated words and audio gain remains bounded',()=>{
 assert.equal(cleanSpokenNames('Кто такой Нуров Мухамед?'),'Кто такой Норов Мухаммад?');
 assert.equal(cleanSpokenNames('Мухаммад Али'),'Мухаммад Али');
 const quiet=prepareSpeechAudio(Float32Array.of(.01,-.02));assert.ok(quiet[0]>.01);assert.ok(Math.max(...prepareSpeechAudio(Float32Array.of(2,-2)))<=1);
});
test('published team credits distinguish development from research, and lunar catalog entries are identified honestly',()=>{
 assert.match(creatorProfileAnswer('Кто в вашей команде?'),/единственный разработчик/);
 assert.match(creatorProfileAnswer('Кто в вашей команде?'),/Мукумова Сабрина/);
 assert.match(creatorProfileAnswer('Who is on your team?','en'),/Sabrina Mukumova/);
 const action=resolveSiteAction('покажи Луноход 2',{robots:[{id:'lunokhod',name:'Lunokhod 1 & 2',world:'moon'}],lang:'ru'});
 assert.equal(action.entity,'lunokhod');assert.match(action.explanation,/общая карточка/);
});
