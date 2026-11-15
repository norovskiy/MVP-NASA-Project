import test from 'node:test';
import assert from 'node:assert/strict';
import {simpleCalculation,explanationAction} from '../src/assistant/instantGuide.js';
import {conceptAnswer} from '../src/assistant/conceptAnswers.js';
import {worldTour,chooseOffered} from '../src/assistant/interaction.js';
const missions=[{id:'apollo12',name:'Apollo 12',planet:'moon'},{id:'apollo16',name:'Apollo 16',planet:'moon'},{id:'voyager1',name:'Voyager 1',planet:'deep-space'}];
test('arithmetic works without models and rejects executable or unrelated text',()=>{
 for(const q of ['1+1','сколько будет один плюс один','what is one plus one?'])assert.equal(simpleCalculation(q),'1 + 1 = 2.');
 assert.match(simpleCalculation('4/0','ru'),/ноль/);assert.equal(simpleCalculation('0.1+0.2'),'0.1 + 0.2 = 0.3.');
 assert.equal(simpleCalculation('alert(1)'),null);assert.equal(simpleCalculation('Apollo 12'),null);
});
test('explanations navigate to general sections and individual records',()=>{
 for(const q of ['объясни про роботов','explain me robots'])assert.equal(explanationAction(q,{missions}).path,'/robots');
 for(const id of [12,16])assert.equal(explanationAction('расскажи про Apollo '+id,{missions}).path,'/surface/apollo'+id);
 assert.equal(explanationAction('explain Voyager 1',{missions}).path,'/surface/voyager1');
 assert.equal(explanationAction('расскажи про NX1 и NX2',{missions}).path,'/concepts');
 assert.equal(explanationAction('объясни про несуществующую миссию',{missions}),null);
});
test('all three worlds offer only existing locations and honor choices',()=>{
 for(const world of ['Марс','Луна','Deep Space'])assert.ok(worldTour('расскажи про '+world,missions,'ru'));
 const tour=worldTour('explain the Moon',missions,'en');assert.equal(tour.options.length,2);
 const offer={options:tour.options,until:Date.now()+10000};assert.ok(chooseOffered('yes',offer).list);assert.equal(chooseOffered('second',offer).option.path,'/surface/apollo16');
});
test('paired concept answer explains purpose, benefits and unvalidated status',()=>{
 const a=conceptAnswer('объясни про NX1 и NX2',{lang:'ru'}).text;
 for(const pattern of [/NX1/,/NX2/,/преимущества/,/не принятая миссия NASA/,/испытаний/])assert.match(a,pattern);
});

test('polite explanation commands and conversational yes keep the tour working',()=>{
 assert.equal(explanationAction('Tara can you explain robots',{missions}).path,'/robots');
 const offer={options:[{title:'Apollo 16',path:'/surface/apollo16'}],until:Date.now()+10000};
 for(const q of ['да покажи','да, покажи','yes please','yes show me'])assert.equal(chooseOffered(q,offer).list,true,q);
});

import {wantsPageSummary,conciseExcerpt} from '../src/assistant/pageSummary.js';
test('the current page can be read concisely without a model',()=>{
 for(const q of ['Tara explain this page','расскажи об этой странице','прочитай страницу'])assert.equal(wantsPageSummary(q),true,q);
 assert.equal(wantsPageSummary('show robots'),false);
 const summary=conciseExcerpt('Mars',['Mars has ancient river channels. Its history is preserved in rocks. NASA rovers explore them. A fourth sentence.']);
 assert.match(summary,/river channels/);assert.doesNotMatch(summary,/fourth/);
});

import {replyLanguage} from '../src/assistant/taraBehavior.js';
test('mission names do not unexpectedly change the conversation language',()=>{
 assert.equal(replyLanguage('Apollo 16','Tara','ru'),'ru');
 assert.equal(replyLanguage('NX2','Tara','ru'),'ru');
 assert.equal(replyLanguage('show Apollo 16','Tara','ru'),'en');
});
