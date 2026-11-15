import test from 'node:test';import assert from 'node:assert/strict';
import {resolveSiteAction} from '../src/assistant/siteActions.js';
import {siteGuideAnswer} from '../src/assistant/siteGuide.js';
import {retrieve} from '../src/assistant/commands.js';
import {isRelevantResult} from '../src/assistant/internet.js';
import {splitSpeech} from '../src/assistant/speechText.js';
import {reactToMessage} from '../src/assistant/emotions.js';
test('every reported page instruction resolves without a language model',()=>{
 for(const q of ['can you turn to the solar system page','show me planets','Tara покажи планеты','переведи на солнечную систему'])assert.equal(resolveSiteAction(q).path,'/solar-system',q);
 for(const q of ['turn to the page about us','Okay tell about us','переведи хотя бы на about us','отведи меня на о нас'])assert.equal(resolveSiteAction(q).path,'/about',q);
 for(const q of ['show me robots','go to robots','turn to the robots page'])assert.equal(resolveSiteAction(q).path,'/robots',q);
 assert.equal(resolveSiteAction('show Mars').path,'/solar-system?body=mars');
 assert.equal(resolveSiteAction('show Jupiter').entity,'jupiter');
 assert.equal(resolveSiteAction('tell me about solar system'),null);
});
test('site explanations and uncertain speech are grounded, with no invented family story',()=>{
 assert.match(siteGuideAnswer('No describe me about this website'),/Norov Muhammad and his team/);
 assert.match(siteGuideAnswer('говори о сайте',{lang:'ru'}),/Норов Мухаммад/);
 const answer=siteGuideAnswer('explain about solar system and the shoulder plate');assert.match(answer,/did not understand/);assert.doesNotMatch(answer,/spacesuit/);
 assert.match(siteGuideAnswer('Dad made it'),/Do you mean/);
 assert.match(siteGuideAnswer('what AI model do you use'),/we did not train/);
});
test('Mars questions cannot retrieve old Perseverance or unrelated candy and songs',()=>{
 const docs=[{title:'Mars',entity:'mars',text:'Planet'},{title:'Perseverance',entity:'perseverance',text:'Mars rover'}];assert.deepEqual(retrieve('Explain Mars',docs,'perseverance').map(d=>d.entity),['mars']);
 assert.equal(isRelevantResult('search online Mars',{title:'Mars bar',extract:'Chocolate candy'}),false);
 assert.equal(isRelevantResult('search online Mars',{title:'When I Was Your Man',extract:'A song'}),false);
 assert.equal(isRelevantResult('search online Mars',{title:'Mars',extract:'A planet in the Solar System'}),true);
});
test('long spoken answers are divided without dropping their ending',()=>{
 const text=('This is a full sentence. ').repeat(180)+'Unique final sentence.';const chunks=splitSpeech(text);assert.ok(chunks.length>5);assert.ok(chunks.every(c=>c.length<=550));assert.equal(chunks.join(' '),text.trim());assert.match(chunks.at(-1),/Unique final sentence/);
});
test('reported negative feedback is recognized and thanks receives a normal response',()=>{
 assert.equal(reactToMessage('you are bad ai').state.mood,'hurt');assert.equal(reactToMessage('you cannt describe normally bad ai').state.mood,'hurt');assert.equal(reactToMessage('Thank you').text,'You’re welcome!');
});
