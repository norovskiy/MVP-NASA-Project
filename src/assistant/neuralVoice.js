import {splitSpeech} from './speechText.js';
let worker,audio,url,language,ready=false,warming=null,serial=0,requestId=0,playReject;
const jobs=new Map(),cache=new Map();
function resetWorker(){worker?.terminate();worker=null;ready=false;warming=null;for(const job of jobs.values()){clearTimeout(job.timeout);job.reject(new Error('CANCELLED'))};jobs.clear()}
function connect(lang){
 if(worker&&language!==lang)resetWorker();language=lang;
 if(worker)return;
 worker=new Worker(new URL('./voiceWorker.js',import.meta.url),{type:'module'});
 worker.onmessage=({data:m})=>{const job=jobs.get(m.id);if(!job)return;if(m.type==='progress'){job.onProgress(m.percent);return}jobs.delete(m.id);clearTimeout(job.timeout);if(m.type==='error'){job.reject(new Error(m.message));resetWorker()}else job.resolve(m.wav)};
 worker.onerror=()=>{for(const job of jobs.values()){clearTimeout(job.timeout);job.reject(new Error('VOICE_WORKER'))};jobs.clear();resetWorker()};
}
function call(type,lang,text,onProgress=()=>{}){connect(lang);const id=++requestId;return new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{jobs.delete(id);reject(new Error('VOICE_TIMEOUT'));resetWorker()},type==='prepare'?90000:45000);jobs.set(id,{type,resolve,reject,onProgress,timeout});worker.postMessage({id,type,lang,text})})}
export function isNeuralVoiceReady(lang){return ready&&language===lang}
export function prepareNeuralVoice(lang,onProgress=()=>{}){
 connect(lang);if(ready)return Promise.resolve();if(warming)return warming;
 const promise=call('prepare',lang,'',onProgress).then(()=>{if(language===lang)ready=true}).finally(()=>{if(warming===promise)warming=null});warming=promise;return promise;
}
export function stopNeuralVoice(){
 serial++;playReject?.(new Error('CANCELLED'));playReject=null;audio?.pause();audio=null;if(url)URL.revokeObjectURL(url);url=null;
 // Cancel synthesis, but do not tear down a voice being warmed in the background.
 if([...jobs.values()].some(j=>j.type==='speak'))resetWorker();
}
export async function speakNeural(text,lang,{rate=.95,volume=1,onProgress=()=>{},onStart=()=>{}}={}){
 stopNeuralVoice();const id=serial;await prepareNeuralVoice(lang,onProgress);if(id!==serial)throw new Error('CANCELLED');
 for(const chunk of splitSpeech(text)){if(id!==serial)throw new Error('CANCELLED');const key=lang+':'+chunk;let blob=cache.get(key);
 if(!blob){blob=await call('speak',lang,chunk,onProgress);cache.set(key,blob);if(cache.size>12)cache.delete(cache.keys().next().value)}
 if(id!==serial)throw new Error('CANCELLED');url=URL.createObjectURL(blob);audio=new Audio(url);audio.playbackRate=rate;audio.volume=Math.max(0,Math.min(1,volume));audio.preservesPitch=true;
 await new Promise((resolve,reject)=>{playReject=reject;audio.onended=()=>{playReject=null;resolve()};audio.onerror=()=>{playReject=null;reject(new Error('AUDIO_PLAYBACK'))};audio.play().then(onStart).catch(reject)});
 if(id!==serial)return;if(url)URL.revokeObjectURL(url);url=null;audio=null;
 }
}
