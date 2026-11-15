// Unknown impact sites deliberately have no lat/lon or globe pin.
export const lostMarsMission = {
  id: "mars-polar-lander",
  name: "Mars Polar Lander / Deep Space 2",
  planet: "mars",
  site: "South polar region · exact site unknown",
  date: "03 DEC 1999",
  year: 1999,
  coordinateKnown: false,
  kind: "Lander and penetrator probes",
  status: "Mission lost · presumed crash",
  image: "/media/mars-polar-lander.jpg",
  mediaType: "ARTIST’S CONCEPT",
  credit: "NASA / JPL-Caltech · artist’s concept",
  source: "https://science.nasa.gov/mission/mars-polar-lander-deep-space-2/",
  imageSource:
    "https://science.nasa.gov/mission/mars-polar-lander-deep-space-2/",
  description:
    "A lander and two tiny probes travelled to the Martian south polar region in 1999. None reported back after arrival. Their exact resting places remain unidentified.",
  legacy:
    "Mars Polar Lander and the Deep Space 2 probes are believed to remain on Mars. This artwork shows the planned lander, not a photograph of recovered wreckage.",
  points: [
    {
      name: "The lander",
      tag: "THE PLANNED MISSION",
      text: "A robotic arm was intended to dig into polar soil, while instruments studied the climate and searched for evidence of water ice. No surface science was returned.",
    },
    {
      name: "Deep Space 2",
      tag: "TWO SEPARATE PROBES",
      text: "The microprobes Amundsen and Scott were designed to penetrate the ground at high speed and relay measurements through Mars Global Surveyor. Neither established contact.",
    },
    {
      name: "The missing signal",
      tag: "AN UNRESOLVED FINAL CHAPTER",
      text: "No descent telemetry established the exact accident sequence. Investigators identified premature engine shutdown after a spurious touchdown signal as the most probable lander failure; the probes’ fate has a separate uncertainty.",
    },
  ],
};
