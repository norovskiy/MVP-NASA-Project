// Keep a token-limit cutoff from leaving an orphaned third sentence in chat or speech.
export function finalizeReply(text,detailed=false){
 const clean=String(text||'').trim();if(detailed||!clean)return clean;
 const parts=clean.split(/(?<=[.!?])\s+/u);
 const complete=parts.filter(part=>/[.!?]$/.test(part.trim()));
 return complete.length?complete.slice(0,2).join(' ').trim():clean;
}
