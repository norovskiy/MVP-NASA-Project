# NASA data provenance update — 2026-11-14

## What was checked and changed
- Historical Mars touchdown coordinates for Curiosity, Perseverance/Ingenuity, Opportunity, Spirit, Pathfinder and Viking 1, and InSight were compared with NASA GISS Mars24: https://www.giss.nasa.gov/tools/mars24/help/landers.html . This table was updated in 2023; use it for historical coordinates, not current operational statuses.
- Apollo 11, 15 and 17 coordinates were compared with NASA NSSDCA: https://nssdc.gsfc.nasa.gov/planetary/lunar/lunar_sites.html . Apollo 15 now uses LM latitude 26.13239 N, longitude 3.63330 E; Apollo 17 uses 20.1911 N, 30.7723 E. Existing UI rounds to two decimals.
- Each mission now carries coordinateSource and coordinateMeaning. Its legacy panel links both the coordinate reference and mission record separately from the photo credit.
- About now states the actual implementation: local NASA-derived catalogue, no live API. Removed the unsupported prototype API claim.
- Viking's unqualified numerical duration badge was replaced with the supported years 1976–1982; NASA mission page records operation until November 11, 1982: https://science.nasa.gov/mission/viking-1/ .

## Evidence used in the existing stories
Opportunity: https://science.nasa.gov/mission/mer-opportunity/ — instrument list, water-related geology, last communication June 10, 2018, end-of-mission declaration February 13, 2019. January 25 landing in this project uses UTC; some NASA summaries show January 24 in Pacific time.
Spirit: https://science.nasa.gov/mission/mer-spirit/
Pathfinder/Sojourner: https://science.nasa.gov/mission/mars-pathfinder/
InSight: https://science.nasa.gov/mission/insight/
Ingenuity: https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/
Photo credits remain in public/media/CREDITS.md.

## Challenge requirement — remaining verification
Official Resources URL: https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources
The official page could not be fully retrieved in this review (HTTP errors). A local organizer's reproduction lists NSSDCA, lunar modules, LRVs, ALSEP, Spirit/Opportunity, Viking, InSight and Ingenuity: https://hackathlone.com/challenges/nasas-discarded-equipment-storytelling . Treat this as corroboration, not a substitute for the official Resources tab.
NASA organizer clarification: https://github.com/nasa/spaceapps/discussions/1849 — at least one listed NASA source must be used for Global Awards. Do not claim certification or guaranteed eligibility.

Suggested submission description (adjust to the actual official resource selection):
The project turns NASA mission records and historical landing coordinates into an interactive catalogue: records determine globe marker positions, mission chronology and hardware stories. NSSDCA Apollo coordinate tables and NASA GISS Mars24 are used as curated local data; mission and photograph references are accessible from the mission pages. There is no live telemetry or live NASA API.

## Limits
This is a coordinate/provenance correction, not a completed sentence-by-sentence audit of the entire site. Future mission schedules, every instrument description, image hotspot placement and the solar-system facts have not all been revalidated in this update. Model schematics and imagery do not establish surveyed positions of individual objects.
