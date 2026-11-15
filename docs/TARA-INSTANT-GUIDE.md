# TARA: instant website guide

The default assistant is a deterministic bilingual site guide. It does not load Qwen or call a text-generation API. Opening the chat does not start any model download. It handles greetings, creator questions, short summaries, basic two-operand arithmetic, navigation, equipment/part selection, contextual location offers and section scrolling.

Explain a world → open the corresponding explorer → offer real catalog entries → accept a name/number or button → open the record and scroll it into view. Explain robots → open the robot profile and summarize the section. Explain NX1 and NX2 → open the concept workbench and explain purpose, surviving systems, potential benefits and unvalidated engineering targets.

English is the default. Typed Russian selects Russian replies. Lightweight microphone input uses browser recognition with an explicit EN/RU language selector; it may use the browser vendor service. System speech requires an installed identifiable female voice. Optional Whisper and Piper modes still require downloads, and are not enabled automatically. Voice quality and microphone behavior must be checked on the presentation device.

Explicit “remember” corrections are stored only in the current browser. They do not train a model or improve other users’ sessions. Scientific catalog facts and creator credits are not silently overwritten by personal notes.

The author biography and team-name privacy rule were supplied by the user. NX concepts are team proposals, not adopted NASA hardware. Panoramas and photographs are historical; dragging changes the view rather than simulating a real walk across terrain.

Legacy localModel/modelWorker files remain as source references and for existing prompt regression tests. They are not imported by the assistant component and are not offered as a startup requirement.
