// Cumulative model text enters once; complete sentences play in order while
// generation continues. Incomplete tails are spoken only after completion.
export function createSentenceQueue(speak,isCurrent=()=>true){
 let consumed=0,pending=[],active=false,closed=false,cancelled=false;
 const drain=()=>{
  if(active||cancelled||!isCurrent())return;
  const next=pending.shift();if(!next)return;
  active=true;Promise.resolve().then(()=>speak(next)).catch(()=>{}).finally(()=>{active=false;drain()});
 };
 return {
  push(text,final=false){
   if(cancelled||closed||!isCurrent())return;
   const tail=text.slice(consumed);let end=0;
   const pattern=/[.!?](?:["»”])?(?=\s|$)/gu;let match;
   while((match=pattern.exec(tail)))end=pattern.lastIndex;
   if(final)end=tail.length;
   if(end){const ready=tail.slice(0,end).trim();consumed+=end;if(ready)pending.push(ready);}
   closed=final;drain();
  },
  cancel(){cancelled=true;pending=[];},
  get busy(){return active||pending.length>0;}
 };
}
