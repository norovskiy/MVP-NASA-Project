# Space archive expansion

## Added

- Apollo 12, Apollo 14 and Apollo 16: together with 11/15/17, all six Apollo landing regions.
- Surveyor 3 is explained within Apollo 12. Its camera and selected parts were returned to Earth; the entire spacecraft is not described as intact.
- Dawn, NEAR Shoemaker, Kepler, Pioneer 10, Pioneer 11: separate Deep Space destination and archive filter. Equipment, mission purpose, chronology, remains and NASA sources.
- Spirit: launch 10 June 2003, last communication 22 March 2010, mission ended 25 May 2011; 7.73 km; silica discovery and hydrothermal interpretations. This is not proof of life or a claim that the entire planet was warm.
- InSight: launch 5 May 2018, landing 26 November 2018, last contact 15 December 2022, NASA declared mission ended 21 December 2022. SEIS recorded 1,319 marsquakes. HP3 did not reach its intended depth; no successful heat-flow measurement is claimed. Earlier Viking seismometers are acknowledged.
- Documented 360° cylindrical panoramas: Curiosity/Rocknest 2012, Opportunity/Erebus 2005, Spirit/McMurdo 2006. Each is dated separately from later/final photographs.
- Moon → Mars → deep-space homepage; Earth stays in the educational Solar System page.

## Sources and geometry

Facts use mission-specific NASA Science pages linked in `src/data/archiveExpansion.js`, and supplementary NASA/JPL articles in its `missionEvidence` export. Lunar coordinates: https://nssdc.gsfc.nasa.gov/planetary/lunar/lunar_sites.html . Mars touchdown coordinates: https://www.giss.nasa.gov/tools/mars24/help/landers.html . Media products and download URLs: `public/media/CREDITS.md` and `expansion-assets.json`.

Deep-space craft are not assigned surface coordinates. The trajectory display is schematic, not a live tracker or ephemeris. NEAR's Eros touchdown is explained in its story. Dawn's Ceres orbit and Kepler's heliocentric orbit are different situations from outbound Pioneer probes.

NASA API is not connected. This is a curated, sourced archive. This update is not a certification of challenge eligibility; the team's final submission must still follow the challenge and local organizer's submission instructions.

## Installation

Extract the update ZIP and run the included `INSTALL-UPDATE.sh`, passing the ORIGINAL project directory. It validates file hashes, creates a backup of replaced files beside that project and copies only files in the manifest. It does not copy `node_modules`, overwrite Vercel settings, commit or deploy.

```bash
bash ~/Downloads/space-archive-expansion/INSTALL-UPDATE.sh ~/Desktop/mars-explorer-vercel
cd ~/Desktop/mars-explorer-vercel
npm run build
npx vercel --prod
```

If you extracted somewhere else, change only the first path. Keep editing and deploying the original `mars-explorer-vercel` folder.
