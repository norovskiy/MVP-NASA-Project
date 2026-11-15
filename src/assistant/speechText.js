// Bounded synthesis jobs keep long replies interruptible, without dropping text.
export function splitSpeech(text,max=550){
 const pieces=String(text).trim().match(/[^.!?]+[.!?]*\s*|[.!?]+/gu)||[];const chunks=[];let current='';
 for(const piece of pieces){for(const word of piece.trim().split(/\s+/u)){if(current&&(current+' '+word).length>max){chunks.push(current);current=''}current+=(current?' ':'')+word}}
 if(current)chunks.push(current);return chunks;
}
