// Conservative aliases correct familiar proper names only, not arbitrary speech.
export function cleanSpokenNames(text){
 return text.replace(/(?<!\p{L})(?:нуров|норов|норав|norov|nurov)\s+(?:мухаммад|мухамад|мухамед|мухаммед|мухаммет|muhammad|mohammad|mukhamad)(?!\p{L})/giu,'Норов Мухаммад');
}
// Keep quiet words audible without amplifying background noise without limit.
export function prepareSpeechAudio(audio){
 let peak=0;for(const value of audio)peak=Math.max(peak,Math.abs(value));
 const gain=peak>.005?Math.min(3,.85/peak):1;
 return Float32Array.from(audio,value=>Math.max(-1,Math.min(1,value*gain)));
}
