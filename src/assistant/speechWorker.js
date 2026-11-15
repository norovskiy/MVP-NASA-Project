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

let transcriber,loading,Tensor;
async function load(id,modelId='Xenova/whisper-base'){
 if(transcriber)return;if(loading)return loading;
 loading=(async()=>{const lib=await import('@huggingface/transformers');const {pipeline,env}=lib;Tensor=lib.Tensor;env.allowLocalModels=false;env.backends.onnx.wasm.numThreads=1;
 transcriber=await pipeline('automatic-speech-recognition',modelId,{device:'wasm',dtype:'q8',progress_callback:p=>{if(p.status==='progress'||p.status==='progress_total')postMessage({id,type:'progress',percent:Math.round(p.progress||0)})}})})().finally(()=>{loading=null});return loading;
}
self.onmessage=async({data:m})=>{try{await load(m.id,m.modelId);if(m.type==='load'){postMessage({id:m.id,type:'ready'});return}// Transformers.js 4 currently defaults an unspecified Whisper language to English.
// Read the model's first-token language logits ourselves, restricted to Tara's EN/RU pair.
const features=await transcriber.processor(m.audio),config=transcriber.model.generation_config;
const prefix=new Tensor('int64',BigInt64Array.of(BigInt(config.decoder_start_token_id)),[1,1]);
const detection=await transcriber.model({...features,decoder_input_ids:prefix});
const ids=config.lang_to_id,logits=detection.logits.data,offset=logits.length-detection.logits.dims.at(-1);
const language=logits[offset+ids['<|ru|>']]>logits[offset+ids['<|en|>']]?'ru':'en';
const dispose=async value=>{if(value?.dispose)await value.dispose();else if(value&&typeof value==='object')for(const child of Object.values(value))await dispose(child)};
await dispose(detection);await dispose(features);await prefix.dispose();
const result=await transcriber(m.audio,{language,task:'transcribe',max_new_tokens:128});postMessage({id:m.id,type:'text',text:result.text,language})}catch(e){postMessage({id:m.id,type:'error',message:e.message||String(e)})}};
