// Curated NASA records. Dates are historical; positions are not live telemetry.
export const lunarExpansion = [
  {
    id: "apollo12",
    name: "Apollo 12",
    planet: "moon",
    site: "Ocean of Storms",
    lat: -3.0128,
    lon: -23.4219,
    date: "19 NOV 1969",
    year: 1969,
    kind: "Human exploration",
    status: "Crew returned · hardware remains",
    image: "/media/apollo12.jpg",
    credit: "NASA",
    source: "https://www.nasa.gov/mission/apollo-12/",
    imageSource: "https://science.nasa.gov/resource/apollo-12-and-surveyor-3/",
    description:
      "Two generations of explorers met here: Apollo 12 landed near the Surveyor 3 robot, already on the Moon since 1967.",
    legacy:
      "Intrepid’s descent stage, the ALSEP station and most of Surveyor 3 remain. Astronauts returned Surveyor’s camera and other parts to Earth to study lunar exposure.",
    points: [
      {
        name: "Surveyor 3",
        tag: "EQUIPMENT & LEGACY",
        text: "This photograph shows the robot before selected parts were removed. Most of the lander remained on the Moon.",
        x: 60,
        y: 55,
      },
      {
        name: "Intrepid",
        tag: "EQUIPMENT & LEGACY",
        text: "The crew used the ascent stage to leave. The lower descent stage remained at the landing site.",
        x: 31,
        y: 36,
      },
    ],
    viewType: "photograph",
  },
  {
    id: "apollo14",
    name: "Apollo 14",
    planet: "moon",
    site: "Fra Mauro",
    lat: -3.64589,
    lon: -17.47194,
    date: "05 FEB 1971",
    year: 1971,
    kind: "Human exploration",
    status: "Crew returned · hardware remains",
    image: "/media/apollo14.jpg",
    credit: "NASA / JSC",
    source: "https://www.nasa.gov/mission/apollo-14/",
    imageSource:
      "https://science.nasa.gov/resource/apollo-14-mission-image-view-of-the-alsep-station/",
    description:
      "Alan Shepard and Edgar Mitchell deployed instruments and explored the Fra Mauro region while Stuart Roosa orbited the Moon.",
    legacy:
      "Antares’ descent stage, the ALSEP instruments, a laser reflector and the hand-pulled equipment cart remain. The experiments extended scientific observation beyond the crew’s stay.",
    points: [
      {
        name: "ALSEP",
        tag: "EQUIPMENT & LEGACY",
        text: "The station included seismic and particle experiments. This is an archival equipment photograph, not a reconstructed walkable landscape.",
        x: 50,
        y: 50,
      },
    ],
    viewType: "photograph",
  },
  {
    id: "apollo16",
    name: "Apollo 16",
    planet: "moon",
    site: "Descartes Highlands",
    lat: -8.9734,
    lon: 15.5011,
    date: "21 APR 1972",
    year: 1972,
    kind: "Human exploration",
    status: "Crew returned · hardware remains",
    image: "/media/apollo16.jpg",
    credit: "NASA / JSC",
    source: "https://www.nasa.gov/mission/apollo-16/",
    imageSource:
      "https://www.nasa.gov/history/apollo-16-on-the-moon-at-descartes/",
    description:
      "John Young and Charles Duke explored the lunar highlands using a rover and deployed surface experiments.",
    legacy:
      "The rover, Orion’s descent stage, ALSEP hardware and the far-ultraviolet camera remain. The camera studied the Earth and sky; its film returned with the crew.",
    points: [
      {
        name: "Far-ultraviolet camera",
        tag: "EQUIPMENT & LEGACY",
        text: "This instrument worked in the shadow of the Lunar Module. Its recorded film was brought back to Earth for analysis.",
        x: 50,
        y: 64,
      },
    ],
    viewType: "photograph",
  },
];
export const deepSpaceMissions = [
  {
    id: "dawn",
    name: "Dawn",
    planet: "deep-space",
    site: "Orbit around Ceres",
    locationType: "ORBITING ARTIFACT",
    date: "01 NOV 2018",
    year: 2007,
    kind: "Deep-space exploration",
    status: "Silent · mission complete",
    image: "/media/dawn.jpg",
    credit: "NASA / JPL",
    imageSource:
      "https://science.nasa.gov/resource/dawn-spacecraft-orbiting-ceres-artists-concept/",
    source: "https://science.nasa.gov/mission/dawn/",
    description:
      "One spacecraft, two ancient worlds. Dawn orbited Vesta and Ceres to study the building blocks of planets.",
    legacy:
      "Its hydrazine supply ran out in 2018. Without attitude control it could not keep its antenna toward Earth. The silent spacecraft remained in orbit around Ceres.",
    equipment: [
      {
        title: "Ion propulsion",
        text: "Xenon ion thrusters enabled long changes of orbit. The end-of-mission loss concerned hydrazine for pointing, a different system.",
      },
      {
        title: "Cameras & spectrometers",
        text: "Framing cameras mapped the surface; infrared and gamma-ray/neutron measurements investigated composition.",
      },
    ],
    timeline: [
      ["27 SEP 2007", "Launch"],
      ["06 MAR 2015", "Ceres orbit"],
      ["01 NOV 2018", "Mission end announced"],
    ],
    points: [],
    mediaType: "ARTIST’S CONCEPT",
    schematicPosition: [47, 43],
  },
  {
    id: "near",
    name: "NEAR Shoemaker",
    planet: "deep-space",
    site: "Surface of asteroid Eros",
    locationType: "SURFACE ARTIFACT",
    date: "12 FEB 2001",
    year: 1996,
    kind: "Deep-space exploration",
    status: "Silent · mission complete",
    image: "/media/near.jpg",
    credit: "NASA",
    imageSource: "https://science.nasa.gov/mission/near-shoemaker/",
    source: "https://science.nasa.gov/mission/near-shoemaker/",
    description:
      "A rendezvous became a landing. After studying Eros from orbit, NEAR Shoemaker touched down even though it had not been designed as a lander.",
    legacy:
      "The spacecraft survived touchdown on February 12, 2001, and returned additional measurements from the ground. It remains on Eros; no present-day image of the spacecraft is claimed here.",
    equipment: [
      {
        title: "Gamma-ray spectrometer",
        text: "Surface operations allowed additional observations of elemental composition close to the asteroid.",
      },
      {
        title: "Imager & laser rangefinder",
        text: "Images and ranging measurements mapped Eros and revealed its shape and surface geology.",
      },
    ],
    timeline: [
      ["17 FEB 1996", "Launch"],
      ["14 FEB 2000", "Eros orbit"],
      ["12 FEB 2001", "Touchdown"],
      ["FEB 2001", "Surface operations ended"],
    ],
    points: [],
    mediaType: "ARTIST’S CONCEPT",
    schematicPosition: [28, 60],
  },
  {
    id: "kepler",
    name: "Kepler",
    planet: "deep-space",
    site: "Heliocentric orbit",
    locationType: "RETIRED OBSERVATORY",
    date: "30 OCT 2018",
    year: 2009,
    kind: "Deep-space exploration",
    status: "Silent · mission complete",
    image: "/media/kepler.jpg",
    credit: "NASA / Ames / JPL-Caltech",
    imageSource:
      "https://science.nasa.gov/photojournal/reborn-kepler-discovers-first-k2-exoplanet-artist-concept/",
    source: "https://science.nasa.gov/mission/kepler/",
    description:
      "Kepler watched stars for tiny dips in brightness: the signature of planets crossing in front of them.",
    legacy:
      "Fuel exhaustion ended observations in 2018. The telescope remains in an orbit around the Sun. Its archived light curves continue to support discoveries after the hardware fell silent.",
    equipment: [
      {
        title: "Photometer",
        text: "A telescope and detector array repeatedly measured stellar brightness; transit patterns revealed candidate planets.",
      },
    ],
    timeline: [
      ["07 MAR 2009", "Launch (UTC)"],
      ["2014", "K2 observations"],
      ["30 OCT 2018", "Retirement announced"],
    ],
    points: [],
    mediaType: "ARTIST’S CONCEPT",
    schematicPosition: [24, 25],
  },
  {
    id: "pioneer10",
    name: "Pioneer 10",
    planet: "deep-space",
    site: "Outbound trajectory beyond the planets",
    locationType: "OUTBOUND SILENT PROBE",
    date: "23 JAN 2003",
    year: 1972,
    kind: "Deep-space exploration",
    status: "Silent · mission complete",
    image: "/media/pioneer10.jpg",
    credit: "NASA",
    imageSource: "https://science.nasa.gov/mission/pioneer-10/",
    source: "https://science.nasa.gov/mission/pioneer-10/",
    description:
      "Pioneer 10 opened the route through the asteroid belt and past Jupiter.",
    legacy:
      "Its last weak signal was received on January 23, 2003. It continues outward; the symbol here shows mission context, not a live tracked location.",
    equipment: [
      {
        title: "Dish & radioisotope power",
        text: "A large dish carried signals across interplanetary distances. Radioisotope generators supplied electrical power far from sunlight.",
      },
      {
        title: "Fields & particles",
        text: "Magnetic-field and particle instruments studied the environments encountered along the flight path.",
      },
    ],
    timeline: [
      ["1972", "Launch"],
      ["1973", "Jupiter flyby"],
      ["23 JAN 2003", "Final signal / mission end"],
    ],
    points: [],
    mediaType: "ARTIST’S CONCEPT",
    schematicPosition: [79, 24],
  },
  {
    id: "pioneer11",
    name: "Pioneer 11",
    planet: "deep-space",
    site: "Outbound trajectory after Saturn",
    locationType: "OUTBOUND SILENT PROBE",
    date: "1995",
    year: 1973,
    kind: "Deep-space exploration",
    status: "Silent · mission complete",
    image: "/media/pioneer11.jpg",
    credit: "NASA",
    imageSource: "https://science.nasa.gov/mission/pioneer-11/",
    source: "https://science.nasa.gov/mission/pioneer-11/",
    description:
      "Pioneer 11 followed Jupiter with the first spacecraft flyby of Saturn.",
    legacy:
      "Its mission ended in 1995. It continues outward without a working communications link. The route here is illustrative, not a live ephemeris.",
    equipment: [
      {
        title: "Dish & radioisotope power",
        text: "A large dish carried signals across interplanetary distances. Radioisotope generators supplied electrical power far from sunlight.",
      },
      {
        title: "Fields & particles",
        text: "Magnetic-field and particle instruments studied the environments encountered along the flight path.",
      },
    ],
    timeline: [
      ["1973", "Launch"],
      ["1974", "Jupiter flyby"],
      ["1979", "Saturn flyby"],
      ["1995", "Final signal / mission end"],
    ],
    points: [],
    mediaType: "ARTIST’S CONCEPT",
    schematicPosition: [83, 76],
  },
];
export const missionEvidence = {
  spirit: {
    launch: "10 JUN 2003",
    lastContact: "22 MAR 2010",
    missionEnd: "25 MAY 2011",
    blocks: [
      {
        title: "Why it went",
        text: "Spirit investigated rocks and soils in Gusev Crater for evidence of ancient water. Its cameras and arm-mounted instruments connected landscape context with rock chemistry.",
      },
      {
        title: "A broken wheel, a new clue",
        text: "A dragging wheel exposed silica-rich soil. Scientists interpreted it as evidence for water-related processes such as hot springs or steam vents, not proof of life.",
      },
      {
        title: "What remains",
        text: "Spirit became trapped in 2009 and last communicated in March 2010. The rover, its Pancam cameras, spectrometers and Rock Abrasion Tool remain on Mars. It traveled 7.73 km.",
      },
    ],
    sources: [
      "https://science.nasa.gov/mission/mer-spirit/",
      "https://science.nasa.gov/photojournal/rovers-wheel-churns-up-bright-martian-soil/",
    ],
  },
  insight: {
    launch: "05 MAY 2018",
    lastContact: "15 DEC 2022",
    missionEnd: "21 DEC 2022",
    blocks: [
      {
        title: "Listening below the dust",
        text: "InSight placed SEIS directly on the ground and recorded 1,319 marsquakes. Seismic waves helped scientists investigate the crust, mantle and core. Earlier Viking missions also carried seismometers.",
      },
      {
        title: "The instrument that could not dig",
        text: "The HP³ heat probe did not reach its intended depth: the soil did not provide the friction its hammering mechanism needed. Attempts ended in January 2021.",
      },
      {
        title: "What remains",
        text: "Dust reduced solar power. The lander, solar arrays, SEIS with its shield and HP³ hardware remain in Elysium Planitia. Final contact and formal mission closure were six days apart.",
      },
    ],
    sources: [
      "https://www.nasa.gov/missions/insight/nasa-retires-insight-mars-lander-mission-after-years-of-science/",
      "https://www.jpl.nasa.gov/news/nasa-insights-mole-ends-its-journey-on-mars/",
      "https://science.nasa.gov/mission/insight/science-instruments/",
    ],
  },
};

missionEvidence["mars-polar-lander"] = {
  launch: "03 JAN 1999",
  lastContact: "03 DEC 1999",
  missionEnd: "17 JAN 2000",
  blocks: [
    {
      title: "The silence before touchdown",
      text: "Launch: January 3, 1999, on Delta II. A planned communications blackout covered entry and descent on December 3; the expected post-landing signal never arrived. Contact attempts ended January 17, 2000.",
    },
    {
      title: "A probable cause, not a recovered flight recorder",
      text: "The review board found that transient landing-leg sensor signals could be accepted as touchdown and terminate thrust too soon. The conclusion is a most-probable scenario, not an observed reconstruction of the final seconds.",
    },
    {
      title: "An archive with a gap",
      text: "Mars Global Surveyor searched for the lander without locating it. No confirmed wreckage image or exact impact coordinate is shown here. Deep Space 2 was a technology demonstration; its two probes also returned no data.",
    },
  ],
  sources: [
    "https://science.nasa.gov/mission/mars-polar-lander-deep-space-2/",
    "https://ntrs.nasa.gov/api/citations/20000061966/downloads/20000061966.pdf",
    "https://www.jpl.nasa.gov/news/nasa-concludes-all-attempts-to-communicate-with-lander/",
  ],
};
