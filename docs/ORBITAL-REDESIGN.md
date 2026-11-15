# Mars B → Moon A → Dawn/Ceres A; Deep Space B

## Rollback

Exact previous commit: `166bc0729899f76fa012e824d58e26a1384a05d4`.
Local tag: `checkpoint-before-mars-moon-deep-20261114`.
Full source snapshot: `archives/before-mars-moon-redesign.zip.part1` + `.part2` + `.part3` (join in that order) (excluding historical download ZIPs and Sites hosting identity). SHA-256 and byte size: `docs/ROLLBACK-CHECKPOINT.json`.

The previous commit remains in the remote history. A rollback should create a new commit restoring the desired source files from that commit and publish normally; no force-push is necessary. Vercel identity is deliberately not changed by the update or source snapshot.

## Journey

The Mars horizon is the opening scene. Scroll pulls away from Mars, approaches the Moon, rises past its limb, then reveals Dawn with Ceres behind it. The camera path is cinematic and is not an ephemeris or a scale model of the Solar System. No Earth is part of this introductory sequence.

`src/scene/planets.js` holds body keyframes and a shared upper-right light vector. Monotone Hermite interpolation keeps position/radius velocity continuous between keyframes; opacity uses smooth fades. The baked sphere shader uses linear-light diffuse shading and low ambient illumination. Moon/Ceres have no atmospheric halo; Mars has a subtle illuminated-side rim only. This is a visual lighting approximation with real map imagery, not a physical scattering or terrain-shadow simulation.

`src/scene/journeyTimeline.js` shares the single eased progress produced by `useScrollScene` with the Dawn layer and chapter controls. DOM layers no longer calculate independent scroll targets or smoothing. The sticky stage clips every layer at the end of the journey.

Dawn's homepage image and the Deep Space B portraits are rendered from official NASA meshes with an upper-right key light. Their self-shadows are baked in Blender. Framing movement does not rotate the light independently. In the overview, mission selection changes this portrait; opening the mission still leads to the existing interactive 3D viewer and narrative. Inspection controls and mission information are retained.

## Added source

Ceres clear-filter HAMO global mosaic, Dawn Framing Camera data, provided by DLR:
https://dawngis.dlr.de/data/Ceres/mosaic_ceres.php
https://dawngis.dlr.de/data/Ceres/mosaics/HAMO/clear/Ceres_HAMO_mosaic_global.png
NASA PDS dataset description:
https://pds.nasa.gov/ds-view/pds/viewProfile.jsp?dsid=DAWN-A-FC2-5-CERESMOSAIC-V1.0

The cylindrical global PNG (21093×10546) was reduced to a local 4096-pixel-wide JPEG for visualization. The Mollweide preview was inspected but is NOT used as a spherical texture. Credits: NASA/JPL-Caltech/UCLA/MPS/DLR/IDA; see `public/media/CREDITS.md`. Existing map/mesh credits remain applicable. No new NASA API or live position is claimed.

For the existing local project, `public/downloads/restore-previous-journey.zip` restores the previous active source files with the same backup-and-hash-check installer. It is a patch, not a standalone project; new unused files may remain, while the previous active code is restored. The full source snapshot remains in the repository.
