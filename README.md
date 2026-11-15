# Abandoned but not Forgotten — Mars Explorer

Independent educational React + Vite project by Norov Muhammad, Soft-Club Academy graduate. English, Russian and Tajik. Built around equipment left on the Moon, Mars and in deep space.

## Run and deploy

```bash
npm install
npm run dev
npm run build
npx vercel --prod
```

Vercel: Vite, build `npm run build`, output `dist`. `vercel.json` supports direct client-side routes.

## Current scope

20 mission records: 6 lunar Apollo missions, 9 Mars records, 5 deep-space spacecraft. Perseverance and Ingenuity share the Jezero touchdown region; records are not 20 unique landing sites. The Moon and Mars have 13 distinct confirmed landing regions in this catalog; Mars Polar Lander / Deep Space 2 has no confirmed impact location and no globe pin. Deep-space records use historical orbits/trajectories instead of latitude/longitude.

Deep Space: Dawn, NEAR Shoemaker, Kepler, Pioneer 10 and Pioneer 11. Operating rovers are contextual comparisons, not labeled abandoned. Mission dates and narratives are curated historical records, not live operational telemetry.

## Code map

| File | Purpose |
| --- | --- |
| `src/main.jsx` | Routing, mission archive and globe destination pages |
| `src/components/HomeLanding.jsx` | Homepage text and destination cards |
| `src/components/SpaceCanvas.jsx` | Fixed 2D Canvas journey; Mars → Moon → deep space |
| `src/scene/useScrollScene.js` | Scroll smoothing, resize and reduced-motion behavior |
| `src/scene/planets.js` | Planet keyframes in scroll progress |
| `src/scene/noise.js` | Deterministic procedural texture noise |
| `src/components/SurfaceArchive.jsx` | Historical surface photographs, notes and sources |
| `src/components/PanoramaViewer.jsx` | Cylindrical 360° mosaic → perspective viewing window |
| `src/data/panoramas.js` | Panorama dates, products, credits and source links |
| `src/pages/DeepSpace.jsx` | Interactive spacecraft observation and equipment stories |
| `src/components/SpacecraftScene.jsx` | NASA GLB viewer, lighting, camera orbit and reduced-motion controls |
| `src/components/SpacecraftOrbitFrames.jsx` | GPU-free fallback using 24 Blender renders of the same NASA meshes |
| `src/components/ArchivePhotoScene.jsx` | Bounded image framing and optional cinematic drift |
| `src/components/DeepFlight.jsx` | Dawn portrait driven by the shared eased progress |
| `src/scene/journeyTimeline.js` | Single timeline shared by canvas, Dawn framing and chapter controls |
| `src/components/JourneyChapters.jsx` | Accessible chapter navigation and progress |
| `src/components/CinematicCraft.jsx` | Quiet cinematic portraits on the Deep Space B overview |
| `src/data/lostMission.js` | Mars Polar Lander / Deep Space 2, explicitly unknown coordinates |
| `src/components/MissionNarrative.jsx` | Purpose, remaining equipment and scientific legacy |
| `src/data/missions.js` | Combined catalog and historical coordinate provenance |
| `src/data/archiveExpansion.js` | New lunar/deep-space records and Spirit/InSight evidence |
| `src/data/additionalMissions.js` | Earlier Mars and Apollo 15 records |
| `src/data/robots.js` | Rover/model profiles and instrument explanations |
| `src/i18n/expansionMessages.js` | Added RU/TG translations |
| `src/style-archive.css` | New archive and deep-space layouts |
| `src/components/LightGlobe.jsx` | Lightweight planet explorer |
| `src/components/SpaceScene.jsx` | Optional WebGL globe |
| `src/pages/Extensions.jsx` | Robots, Solar System, discovery timeline and About |

The actual file extensions in `src/scene` are authoritative if they differ from this overview. Zustand stores application preferences; scene drawing does not depend on language.

## Data and limits

No NASA API connection is claimed. Facts and imagery come from the NASA mission, Photojournal and coordinate pages linked in each record. Coordinates are historical touchdown positions, not current rover locations. Different missions remain at different real sites. Surface story notes are interpretive explanations, not surveyed object markers.

The homepage, orbital diagrams and globe lighting are visual illustrations. Sizes and distances are not to scale. Panoramas are historical camera mosaics; they do not enable walking or show current conditions. Ordinary photographs are not stretched into a fake 360° environment. The surface scene uses bounded framing/zoom and an optional slow camera drift; it does not synthesize missing scenery.

Read `docs/SPACE-ARCHIVE-UPDATE.md` for the content audit and `public/media/CREDITS.md` for media provenance. Existing legacy assets or unused modules may remain in the source; their presence does not mean they are part of the active page.

Current art direction and rollback reference: `docs/ORBITAL-REDESIGN.md` and `docs/ROLLBACK-CHECKPOINT.json`.
# MVP-NASA-Project
