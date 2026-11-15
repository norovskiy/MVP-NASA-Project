# Immersive scene correction

- Hero: one sticky `.journey-stage` inside the long scroll track. Its clipping bounds keep all text/canvas/model layers inside the hero. No negative viewport margin or late visibility state. Moon and Mars continue using their credited real maps.
- Pioneer transition: official NASA mesh replaces the simplified icon. It loads near the deep-space chapter.
- Deep Space overview/details: NASA meshes, lit camera orbit, manual orbit/approach, pause/reset; equipment selection changes an illustrative inspection angle. NEAR and Kepler use their own meshes. Pioneer 11 labels its shared Pioneer 10 family model.
- GPU-free fallback: 24 Blender views of each same model, interpolated in Canvas2D, with horizontal orbit and zoom. It is labeled rendered orbit. Animation stops offscreen/in hidden tabs and honors reduced motion. There is no live spacecraft tracking.
- Surface: full-viewport photographic scene, contextual title, story controls and dismissible story drawer. Confirmed 360-degree panoramas retain their cylindrical reprojection. Short photos use bounded framing/zoom and optional slow drift without spherical stretching or generated sky/terrain.
- Mars Polar Lander / Deep Space 2: a single mission record about the lander and two probes. Exact locations unknown; no globe pins, no known wreckage photograph. Crash mechanism is a probable explanation from the review, not an observed descent. No telemetry or surface science returned. Deep Space 2 is categorized under Mars, not confused with the Deep Space destination.

## Relevant code

`src/components/SpacecraftScene.jsx`, `SpacecraftOrbitFrames.jsx`, `DeepFlight.jsx`, `ArchivePhotoScene.jsx`, `SurfaceArchive.jsx`; `src/style-immersive.css`; `src/data/spacecraftModels.js`, `lostMission.js`; translations in `src/i18n/immersiveMessages.js`.

## Sources

https://science.nasa.gov/mission/mars-polar-lander-deep-space-2/
https://ntrs.nasa.gov/api/citations/20000061966/downloads/20000061966.pdf
https://www.jpl.nasa.gov/news/nasa-concludes-all-attempts-to-communicate-with-lander/

Model and image provenance: `public/models/deep/SOURCES.json` and `public/media/CREDITS.md`. No NASA API added. No blanket copyright/public-domain assertion added.
