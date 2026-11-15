// Reassemble the large CPU runtime from two bounded deployment assets.
const fetchRuntime=self.fetch.bind(self);
self.fetch=async(input,options)=>{
 const url=typeof input==='string'?input:input.url;
 if(!/\.asyncify[^/]*\.wasm(?:\?|$)/.test(url))return fetchRuntime(input,options);
 const plain=url.split('?')[0];
 const first=await fetchRuntime(plain+'.part0',options);
 if(!first.ok||first.headers.get('content-type')?.includes('text/html'))return fetchRuntime(input,options);
 const second=await fetchRuntime(plain+'.part1',options);if(!second.ok)throw new Error('WASM_PART_DOWNLOAD');
 return new Response(new Blob([await first.arrayBuffer(),await second.arrayBuffer()],{type:'application/wasm'}),{headers:{'Content-Type':'application/wasm'}});
};
// WASM inference in a worker keeps 3D rendering and navigation responsive.
let pipe,lib,stopping,queue=Promise.resolve();
async function load(id){
 if(pipe)return {backend:'CPU',modelId:'Qwen3-0.6B'};
 lib=await import('@huggingface/transformers');lib.env.allowLocalModels=false;lib.env.backends.onnx.wasm.numThreads=1;
 const totals=new Map();
 pipe=await lib.pipeline('text-generation','onnx-community/Qwen3-0.6B-ONNX',{device:'wasm',dtype:'q8',progress_callback:p=>{if(p.status==='progress_total')postMessage({id,type:'progress',progress:Math.round(p.progress),stage:'CPU'});else if(p.status==='progress'){totals.set(p.file,{loaded:p.loaded||0,total:p.total||0});const vals=[...totals.values()],total=vals.reduce((s,x)=>s+x.total,0),loaded=vals.reduce((s,x)=>s+x.loaded,0);postMessage({id,type:'progress',progress:total?Math.min(99,Math.round(loaded/total*100)):0,stage:'CPU'})}}});
 stopping=new lib.InterruptableStoppingCriteria();return {backend:'CPU',modelId:'Qwen3-0.6B'};
}
async function handle(m){
 try{let result;if(m.type==='load')result=await load(m.id);else if(m.type==='generate'){await load(m.id);stopping.reset();let out='';const streamer=new lib.TextStreamer(pipe.tokenizer,{skip_prompt:true,skip_special_tokens:true,callback_function:part=>{out+=part;postMessage({id:m.id,type:'chunk',text:out})}});const response=await pipe(m.messages,{max_new_tokens:m.detailed?800:300,tokenizer_encode_kwargs:{enable_thinking:false},do_sample:true,temperature:.7,top_p:.8,top_k:20,repetition_penalty:1.05,streamer,stopping_criteria:stopping});result=out||response?.[0]?.generated_text?.at(-1)?.content||''}postMessage({id:m.id,type:'result',result})}catch(e){postMessage({id:m.id,type:'error',message:e.message||String(e)})}
}
self.onmessage=({data:m})=>{if(m.type==='stop'){stopping?.interrupt();return}queue=queue.then(()=>handle(m))};
