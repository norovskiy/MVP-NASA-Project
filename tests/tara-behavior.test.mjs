import test from 'node:test';
import assert from 'node:assert/strict';
import {commandFor} from '../src/assistant/commands.js';
import {conversationReply,withoutAddress} from '../src/assistant/conversation.js';
import {compactReply,addressed,emotionReply,chatCommand,BUBBLE_LIMIT,replyLanguage,acceptsBackgroundSpeech} from '../src/assistant/taraBehavior.js';
test('wake name is a whole word in both languages and supports a new name',()=>{
 for(const phrase of ['Hello Tara','Тара привет','Tara show robots'])assert.equal(addressed(phrase),true);
 for(const phrase of ['Tarantula','guitar amplifier','hello there'])assert.equal(addressed(phrase),false);
 assert.equal(addressed('Luna show robots','Luna'),true);
 assert.equal(withoutAddress('Тара привет','Tara'),'привет');
});
test('greetings never retrieve a space lecture',()=>{
 for(const phrase of ['hello Tara','привет Тара','hello orbit remix'])assert.match(conversationReply(phrase,{lang:'en'}).text,/Hi!/);
 assert.match(conversationReply('Тара как дела',{lang:'ru'}).text,/А ты как/);
});
test('navigation and lifecycle commands accept the wake prefix',()=>{
 assert.deepEqual(commandFor('Tara show robots'),{type:'navigate',path:'/robots'});
 assert.deepEqual(commandFor('Тара покажи архив'),{type:'navigate',path:'/missions'});
 assert.equal(commandFor('Тара все можешь идти').type,'dismiss');
 assert.equal(commandFor('Tara stop').type,'stop');
 assert.equal(chatCommand('Tara open chat'),'open');
 assert.equal(chatCommand('Тара сверни чат'),'close');
 assert.equal(commandFor('What happens if a spacecraft shuts down?'),null);
});
test('hurt, teasing and apology are distinct and de-escalate',()=>{
 assert.equal(emotionReply('Тара ты тупая',{lang:'ru'}).mood,'hurt');
 assert.equal(emotionReply('Tara you are lazy').mood,'angry');
 assert.equal(emotionReply('Тара прости',{lang:'ru'}).mood,'happy');
 assert.equal(emotionReply('Why are insults hurtful?'),null);
});
test('floating replies obey hard budget and prefer complete sentences',()=>{
 for(const text of ['word '.repeat(200),'a'.repeat(900),'Текст '.repeat(300)])assert.ok(compactReply(text).length<=BUBBLE_LIMIT);
 assert.equal(compactReply('Hi! '+'Word '.repeat(100)),'Hi!');
 assert.equal(compactReply('Okay, here you go!'),'Okay, here you go!');
});

test('language follows the utterance, not the spelling of the wake name',()=>{
 assert.equal(replyLanguage('Тара hello'),'en');
 assert.equal(replyLanguage('Tara привет'),'ru');
 assert.equal(replyLanguage('Tara you are stupid','Tara','ru'),'en');
 assert.equal(replyLanguage('Tara','Tara','ru'),'ru');
});

test('outside chat accepts greetings, name and follow-ups without accepting unrelated background speech',()=>{
 assert.equal(acceptsBackgroundSpeech('привет',{now:100}),true);
 assert.equal(acceptsBackgroundSpeech('Tara show robots',{now:100}),true);
 assert.equal(acceptsBackgroundSpeech('show robots',{now:100}),false);
 assert.equal(acceptsBackgroundSpeech('show robots',{now:100,until:200}),true);
});
