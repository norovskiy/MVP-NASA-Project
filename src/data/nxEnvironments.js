// Real NASA landscape photographs. NX hardware is always a separate team concept.
export const nxEnvironments = {
  mars: {
    id:"mars", name:{en:"Mars",ru:"Марс"}, image:"/concepts/mars-real.webp",
    location:{en:"Rocknest · Gale crater",ru:"Рокнест · кратер Гейл"},
    credit:"NASA / JPL-Caltech / MSSS · Curiosity, 2012",
    source:"https://science.nasa.gov/resource/panoramic-view-from-rocknest-position-of-curiosity-mars-rover/",
    note:{en:"Real Mars panorama · raw camera color",ru:"Реальная панорама Марса · исходный цвет камеры"},
  },
  moon: {
    id:"moon", name:{en:"Moon",ru:"Луна"}, image:"/concepts/moon-real.webp",
    location:{en:"Taurus–Littrow · Apollo 17",ru:"Таурус–Литтров · Apollo 17"},
    credit:"NASA / ESA / Apollo 17",
    source:"https://science.nasa.gov/asset/hubble/an-astronauts-snapshot-of-the-moon/",
    note:{en:"Real lunar photograph · visual setting only",ru:"Реальная фотография Луны · только визуальная среда"},
  },
};
export function getNXEnvironment(id){return nxEnvironments[id] || nxEnvironments.mars;}
