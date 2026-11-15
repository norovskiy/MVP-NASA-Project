import test from 'node:test';import assert from 'node:assert/strict';
import {createSpeechInput} from '../src/assistant/speechInput.js';
test('active playback does not disable capture, speech cancels it before transcription, and stop releases the mic',async t=>{
 let node,playing=true,interrupted=false,stopped=false,clock=2000,text='',decodeCount=0;const posts=[];
 t.mock.method(Date,'now',()=>clock);
 class FakeWorker{postMessage(m){posts.push(m.type);if(m.type==='load')queueMicrotask(()=>this.onmessage({data:{id:m.id,type:'ready'}}));else{decodeCount++;queueMicrotask(()=>this.onmessage({data:{id:m.id,type:'text',text:'Tara show robots'}}))}}terminate(){}}
 class FakeContext{sampleRate=16000;audioWorklet={addModule:async()=>{}};destination={};resume(){return Promise.resolve()}close(){return Promise.resolve()}createMediaStreamSource(){return {connect(){},disconnect(){}}}createGain(){return {gain:{value:0},connect(){}}}}
 class FakeNode{port={onmessage:null};constructor(){node=this}connect(){}disconnect(){}}
 const track={readyState:'live',stop(){stopped=true;this.readyState='ended'}};
 const replace=(name,value)=>{const old=Object.getOwnPropertyDescriptor(globalThis,name);Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});t.after(()=>{if(old)Object.defineProperty(globalThis,name,old);else delete globalThis[name]})};
 replace('Worker',FakeWorker);replace('AudioContext',FakeContext);replace('AudioWorkletNode',FakeNode);replace('navigator',{mediaDevices:{getUserMedia:async()=>({getTracks:()=>[track]})}});
 const control=await createSpeechInput({onText:v=>text=v,onState:()=>{},onError:e=>{throw e},onProgress:()=>{},isPaused:()=>false,isPlayback:()=>playing,onSpeechStart:()=>{interrupted=true;playing=false}});
 assert.equal(control.kind,'local');for(let i=0;i<5;i++){clock+=128;node.port.onmessage({data:new Float32Array(2048).fill(.12)})}
 assert.equal(interrupted,true);assert.equal(playing,false);assert.equal(decodeCount,0,'speech onset must cancel playback before final transcription');
 for(let i=0;i<8;i++){clock+=128;node.port.onmessage({data:new Float32Array(2048)})}
 await new Promise(r=>setImmediate(r));assert.equal(text,'Tara show robots');assert.equal(decodeCount,1);control.destroy();assert.equal(stopped,true);
});
