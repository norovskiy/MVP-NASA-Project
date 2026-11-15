import {prepareSpeechAudio} from './speechCleanup.js';
import {speechThreshold,shouldInterrupt} from './speechGate.js';
let worker,ready=false,loading,seq=0,modelQuality='accurate';
const jobs=new Map();
function call(type,payload={},onProgress=()=>{}){
 if(!worker){worker=new Worker(new URL('./speechWorker.js',import.meta.url),{type:'module'});worker.onmessage=({data:m})=>{const job=jobs.get(m.id);if(!job)return;if(m.type==='progress'){job.onProgress(m.percent);return}jobs.delete(m.id);clearTimeout(job.timeout);if(m.type==='error')job.reject(new Error(m.message));else job.resolve(m.text)};worker.onerror=()=>{for(const job of jobs.values()){clearTimeout(job.timeout);job.reject(new Error('SPEECH_MODEL'))};jobs.clear();worker?.terminate();worker=null;ready=false;loading=null}}
 const id=++seq;return new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{for(const job of jobs.values()){clearTimeout(job.timeout);job.reject(new Error('SPEECH_TIMEOUT'))}jobs.clear();worker?.terminate();worker=null;ready=false;loading=null},type==='load'?180000:45000);jobs.set(id,{resolve,reject,onProgress,timeout});worker.postMessage({id,type,...payload},payload.audio?[payload.audio.buffer]:[])})
}
export function loadSpeechInput(onProgress,quality='accurate'){if(quality!==modelQuality){worker?.terminate();worker=null;ready=false;loading=null;for(const j of jobs.values()){clearTimeout(j.timeout);j.reject(new Error('CANCELLED'))}jobs.clear();modelQuality=quality}if(ready)return Promise.resolve();if(!loading)loading=call('load',{modelId:quality==='precision'?'Xenova/whisper-small':quality==='accurate'?'Xenova/whisper-base':'Xenova/whisper-tiny'},onProgress).then(()=>{ready=true}).finally(()=>{loading=null});return loading}
function resample(data,rate){if(rate===16000)return data;const ratio=rate/16000,out=new Float32Array(Math.floor(data.length/ratio));for(let i=0;i<out.length;i++){const pos=i*ratio,j=Math.floor(pos),f=pos-j;out[i]=data[j]*(1-f)+(data[j+1]??data[j])*f}return out}
export async function createSpeechInput({onText,onState,onProgress,onError,isPaused,onControl=()=>{},onSpeechStart=()=>{},isPlayback=()=>false,quality='accurate',sensitivity=.65,bargeIn=true,echoGuard=true,silenceMs=800}){
 if(!navigator.mediaDevices?.getUserMedia)throw new Error('MIC_UNAVAILABLE');
 const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
 let context,source,node,destroyed=false,paused=false,decoding=false,frames=[],pre=[],length=0,silence=0,voiced=0,announced=false,playbackAt=0,lastPlayback=false;
 const clear=()=>{frames=[];pre=[];length=0;silence=0;voiced=0;announced=false};
 const control={kind:'local',start(){if(!destroyed){paused=false;onState('listening')}},abort(){paused=true;clear()},destroy(){destroyed=true;paused=true;clear();stream.getTracks().forEach(t=>t.stop());node?.disconnect();source?.disconnect();context?.close().catch(()=>{})}};
 onControl(control);
 try{
 if(destroyed)throw new Error('CANCELLED');
 onState('loading');await loadSpeechInput(onProgress,quality);if(stream.getTracks().every(t=>t.readyState==='ended'))throw new Error('CANCELLED');
 context=new AudioContext();await context.resume();await context.audioWorklet.addModule('/tara/capture.js');
 source=context.createMediaStreamSource(stream);node=new AudioWorkletNode(context,'tara-capture');const mute=context.createGain();mute.gain.value=0;source.connect(node);node.connect(mute);mute.connect(context.destination);
 async function decode(){const parts=frames,total=length,speech=voiced,wasSpeech=announced;clear();if((isPlayback()&&!wasSpeech)||speech<.25||total/context.sampleRate<.4)return;decoding=true;onState('transcribing');try{const audio=new Float32Array(total);let offset=0;for(const part of parts){audio.set(part,offset);offset+=part.length}const text=await call('transcribe',{audio:prepareSpeechAudio(resample(audio,context.sampleRate))});if(!destroyed&&!paused&&!isPaused()&&text?.trim())onText(text.trim())}catch(e){if(!destroyed)onError(e)}finally{decoding=false;if(!destroyed)onState('listening')}}
 node.port.onmessage=({data})=>{if(destroyed||paused||decoding||isPaused()){clear();return}let energy=0;for(const n of data)energy+=n*n;const playback=isPlayback();if(playback&&!lastPlayback)playbackAt=Date.now();lastPlayback=playback;const loud=Math.sqrt(energy/data.length)>speechThreshold(sensitivity,playback,echoGuard),seconds=data.length/context.sampleRate;
 if(!frames.length){pre.push(data);if(pre.length>Math.ceil(context.sampleRate*.3/2048))pre.shift();if(!loud)return;frames=pre.slice();length=frames.reduce((n,a)=>n+a.length,0);pre=[];voiced=seconds;return}
 frames.push(data);length+=data.length;voiced+=loud?seconds:0;silence=loud?0:silence+seconds;if(!announced&&loud&&shouldInterrupt({voicedSeconds:voiced,playbackAgeMs:playback?Date.now()-playbackAt:1000,echoGuard,enabled:!playback||bargeIn})){announced=true;onSpeechStart()}if(silence>silenceMs/1000||length/context.sampleRate>=14)decode()};
 onState('listening');return control;
 }catch(e){control.destroy();throw e}
}
