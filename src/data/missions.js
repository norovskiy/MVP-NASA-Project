import { lostMarsMission } from "./lostMission";
import { additionalMissions } from "./additionalMissions";
import { lunarExpansion, deepSpaceMissions } from "./archiveExpansion";
// Landing coordinates: degrees north / east; historical landing positions,
// never the current rover positions. Surface hotspots are narrative annotations.
const missionRecords = [
  {
    id: "apollo17",
    name: "Apollo 17",
    planet: "moon",
    site: "Taurus–Littrow Valley",
    lat: 20.1911,
    lon: 30.7723,
    date: "11 DEC 1972",
    year: 1972,
    kind: "Human exploration",
    status: "Crew returned · hardware remains",
    image: "/media/moon-surface.jpg",
    credit: "NASA / Harrison Schmitt",
    source: "https://www.nasa.gov/mission/apollo-17/",
    imageSource:
      "https://science.nasa.gov/resource/apollo-17-gene-cernan-in-lunar-roving-vehicle/",
    storyImage: "/media/apollo17-lro.jpg",
    storySource:
      "https://science.nasa.gov/photojournal/exploring-the-apollo-17-site/",
    storyCredit: "NASA / GSFC / Arizona State University / LRO",
    storyCaption:
      "LRO image showing the Apollo 17 descent stage left in Taurus–Littrow after the crew departed.",
    description:
      "The last Apollo lunar landing brought a geologist to the Moon. Eugene Cernan and Harrison Schmitt explored Taurus–Littrow while Ronald Evans orbited above.",
    legacy:
      "The lunar rover, descent stage and scientific instruments remain on the Moon. Their story continues in photographs, samples and measurements.",
    points: [
      {
        name: "Gene Cernan",
        tag: "THE EXPLORER",
        x: 35,
        y: 61,
        text: "Mission commander Eugene Cernan drove the lunar rover during the first Apollo 17 moonwalk. Harrison Schmitt took this photograph in December 1972.",
      },
      {
        name: "Lunar Roving Vehicle",
        tag: "LEFT ON THE MOON",
        x: 45,
        y: 83,
        text: "This battery-powered vehicle extended the astronauts’ reach. The Apollo 17 rover was left at Taurus–Littrow when the crew returned to Earth.",
      },
      {
        name: "Lunar Module Challenger",
        tag: "A BASE ON ANOTHER WORLD",
        x: 60,
        y: 38,
        text: "The astronauts landed in Challenger. Its lower descent stage remained at Taurus–Littrow when the ascent stage carried Cernan and Schmitt back to lunar orbit.",
      },
    ],
  },
  {
    id: "apollo11",
    name: "Apollo 11",
    planet: "moon",
    site: "Sea of Tranquility",
    lat: 0.67416,
    lon: 23.47314,
    date: "20 JUL 1969",
    year: 1969,
    kind: "Human exploration",
    status: "Crew returned · hardware remains",
    image: "/media/apollo11.jpg",
    credit: "NASA / Neil Armstrong",
    source: "https://www.nasa.gov/mission/apollo-11/",
    imageSource: "https://science.nasa.gov/resource/buzz-aldrin-on-the-moon/",
    storyImage: "/media/apollo11-lro.jpg",
    storySource: "https://science.nasa.gov/resource/apollo-11-landing-site/",
    storyCredit: "NASA / GSFC / Arizona State University / LRO",
    storyCaption:
      "LRO later imaged the Eagle descent stage and astronaut foot trails at Tranquility Base.",
    description:
      "Neil Armstrong and Buzz Aldrin became the first people to walk on another world, while Michael Collins remained in lunar orbit.",
    legacy:
      "The Eagle descent stage and a laser retroreflector were left on the surface. The reflector makes lunar distance measurements possible.",
    points: [
      {
        name: "Buzz Aldrin",
        tag: "FIRST LUNAR EXPLORERS",
        x: 48,
        y: 47,
        text: "Buzz Aldrin walks on the lunar surface, photographed by Neil Armstrong. This is an archival photograph from 1969, not a present-day view.",
      },
      {
        name: "Tranquility Base",
        tag: "HISTORIC LANDING SITE",
        x: 68,
        y: 62,
        text: "Eagle landed at 0.67416° north, 23.47314° east. The lower descent stage remained behind when the astronauts launched back to lunar orbit.",
      },
    ],
  },
  {
    id: "perseverance",
    name: "Perseverance",
    planet: "mars",
    site: "Jezero Crater",
    lat: 18.44,
    lon: 77.45,
    date: "18 FEB 2021",
    year: 2021,
    kind: "Robotic exploration",
    status: "Surface archive · February 2021",
    image: "/media/jezero.jpg",
    credit: "NASA / JPL-Caltech / ASU / MSSS",
    source: "https://science.nasa.gov/mission/mars-2020-perseverance/",
    imageSource:
      "https://science.nasa.gov/resource/mastcam-zs-first-360-degree-panorama/",
    description:
      "A rover sent to a former lake basin to investigate ancient environments, search for evidence relevant to past microbial life and collect rock samples.",
    legacy:
      "This Mastcam-Z panorama combines 142 photographs taken on February 21, 2021. Its distant rim is part of the crater that once held a lake.",
    points: [
      {
        name: "Jezero crater rim",
        tag: "AN ANCIENT LANDSCAPE",
        x: 66,
        y: 38,
        text: "The distant crater rim frames the rover’s landing region. Jezero was selected because orbital observations revealed evidence of an ancient lake and river delta.",
      },
      {
        name: "The rocky surface",
        tag: "GEOLOGY AT YOUR FEET",
        x: 43,
        y: 66,
        text: "The landing-area panorama records rocks and regolith before the rover began its long traverse. This image is a photographic mosaic, not a live camera feed.",
      },
      {
        name: "Mastcam-Z panorama",
        tag: "142 IMAGES · SOL 3",
        x: 24,
        y: 47,
        text: "Two zoomable cameras on the rover’s mast acquired the images for this panorama on February 21, 2021. The mosaic was assembled on Earth.",
      },
    ],
  },
  {
    id: "curiosity",
    name: "Curiosity",
    planet: "mars",
    site: "Gale Crater",
    lat: -4.59,
    lon: 137.44,
    date: "06 AUG 2012",
    year: 2012,
    kind: "Robotic exploration",
    status: "Surface archive · March 2021",
    image: "/media/curiosity.jpg",
    credit: "NASA / JPL-Caltech / MSSS",
    source: "https://science.nasa.gov/mission/msl-curiosity/",
    imageSource:
      "https://science.nasa.gov/resource/curiositys-selfie-at-mont-mercou/",
    description:
      "Curiosity investigates whether ancient Mars had environments that could support microbial life. Its laboratory studies rocks in Gale Crater.",
    legacy:
      "This archived selfie places the rover beside Mont Mercou. Layered rocks preserve clues about changes in the Martian environment.",
    points: [
      {
        name: "Curiosity rover",
        tag: "A LABORATORY ON WHEELS",
        x: 48,
        y: 65,
        text: "The rover carries instruments that analyze rock chemistry and mineralogy. This mosaic selfie combines views from two different cameras.",
      },
      {
        name: "Mont Mercou",
        tag: "LAYERS OF MARTIAN HISTORY",
        x: 71,
        y: 40,
        text: "The rock outcrop is approximately six meters tall. Its exposed layers offer scientists a record of past geological conditions.",
      },
    ],
  },
  {
    id: "opportunity",
    name: "Opportunity",
    planet: "mars",
    site: "Meridiani Planum",
    viewSite: "Perseverance Valley",
    imageNote: "INCOMPLETE MOSAIC · BLACK REGIONS WERE NOT IMAGED",
    lat: -1.95,
    lon: 354.47,
    date: "25 JAN 2004",
    year: 2004,
    kind: "Robotic exploration",
    status: "Mission complete · 13 FEB 2019",
    image: "/media/opportunity.jpg",
    credit: "NASA / JPL-Caltech / Cornell / ASU",
    source:
      "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
    imageSource:
      "https://science.nasa.gov/resource/opportunity-legacy-pan-true-color/",
    description:
      "Designed for a 90-sol mission, Opportunity explored Mars for nearly 15 years. A global dust storm interrupted its final communications in June 2018.",
    legacy:
      "Its final panorama was acquired in Perseverance Valley from May 13 to June 10, 2018. The rover is silent, but its images and discoveries remain.",
    points: [
      {
        name: "Perseverance Valley",
        tag: "THE FINAL VIEW",
        x: 70,
        y: 44,
        text: "This is part of the final panorama sent home by Opportunity. The rover was exploring Perseverance Valley on the inner slope of Endeavour Crater.",
      },
      {
        name: "A lasting legacy",
        tag: "2004 — 2018",
        x: 38,
        y: 68,
        text: "Opportunity found evidence for ancient water and far outlived its planned mission. NASA declared the mission complete on February 13, 2019.",
      },
    ],
  },
  ...additionalMissions,
  ...lunarExpansion,
  ...deepSpaceMissions,
  lostMarsMission,
];
// Source provenance travels with each record; globe geometry still uses lat/lon.
export const missions = missionRecords.map((mission) => ({
  ...mission,
  coordinateSource:
    mission.planet === "deep-space" || mission.coordinateKnown === false
      ? null
      : mission.planet === "moon"
        ? "https://nssdc.gsfc.nasa.gov/planetary/lunar/lunar_sites.html"
        : "https://www.giss.nasa.gov/tools/mars24/help/landers.html",
  coordinateMeaning:
    mission.coordinateKnown === false
      ? "Exact impact location unknown"
      : mission.planet === "deep-space"
        ? "Historical mission orbit or trajectory; no surface coordinates"
        : "Historical touchdown; not current rover position",
}));
export const getMission = (id) => missions.find((m) => m.id === id);
export const formatCoords = (m) =>
  !Number.isFinite(m.lat) || !Number.isFinite(m.lon)
    ? "—"
    : `${Math.abs(m.lat).toFixed(2)}° ${m.lat < 0 ? "S" : "N"} / ${Math.abs(m.lon).toFixed(2)}° ${m.lon < 0 ? "W" : "E"}`;
