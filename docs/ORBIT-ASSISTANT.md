# Tara assistant — final architecture

See ../START-HERE-RU.md for startup, Vercel deployment, capabilities and limits.

1. Lifecycle commands stop speech, generation and microphone capture.
2. A deterministic bilingual controller resolves page, rover number, selected component, planet, NX blueprint and mission-stage instructions. React Router applies the action; URL and selected DOM IDs are checked before confirming it.
3. Greetings, feedback, creator questions and authored project explanations use grounded local responses.
4. Factual retrieval uses explicitly named entities or a genuine contextual follow-up. A prior selected rover does not contaminate a new planet query.
5. Wikipedia is optional and only queried on explicit online-search requests. Irrelevant candy/music matches are filtered; sources are identified as Wikipedia.
6. Optional Qwen inference runs locally: WebGPU Qwen2.5 3B/1.5B, CPU Qwen3 0.6B. We did not train these models. Neither an inference API nor an API key is used. Source text is treated as data, not instructions. Small models may still produce errors.
7. Whisper Tiny/Base/Small supports local EN/RU recognition. A first-token language comparison avoids Transformers.js default-to-English behavior. AudioWorklet speech onset stops output before transcript completion; an always-visible Stop control cancels everything.
8. Female-only system voices or Piper Irina/HFC Female are used. Neural downloads are cached. Long replies are synthesized in bounded chunks with cancellation tokens, without silently dropping their ending.
9. Full replies scroll inside the closed-chat bubble and chat window. Generation has finite safety/resource budgets; there is no 148-character display truncation. The model downloads and actual microphone/voice quality must be tested on the target device.

Tests: npm test. Production build: npm run build. Regression cases include the actual failed English/Russian page requests, numbered selection, component state, irrelevant sources, normal thanks, uncertain transcripts, long speech and pre-transcription interruption. Browser QA exercises real routing and page state. Model speech quality is not inferred from these tests.

## Static hosting

splitWasmAssets emits the large asyncify WASM runtime as two bounded deployment assets. Workers reconstruct the response. Preserve the plugin and fetch interception when deploying to another host.

## Attribution

AI-assisted implementation. Scientific records and media retain their item credits. Qwen, Whisper, Transformers.js, WebLLM, Piper and voice model cards retain their respective licenses. Voice weights are downloaded from their model host, not included as new team-owned assets.
