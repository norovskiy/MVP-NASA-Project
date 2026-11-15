// NASA explicitly identifies these products as 360-degree cylindrical mosaics.
// Images are historical observations, not rover-current positions.
export const panoramas = {
  curiosity: {
    location:'Rocknest · Gale Crater', src:'/media/rocknest-cylinder.jpg', label:'360° Rocknest · 2012',
    credit:'NASA / JPL-Caltech · Navcam · Sols 59–60 · OCT 2012 · PIA16227',
    source:'https://science.nasa.gov/photojournal/curiositys-location-during-first-scooping/',
    note:'Curiosity recorded this cylindrical panorama at Rocknest in October 2012. The separate Mont Mercou selfie was taken in 2021. These images show different chapters of the same mission.', focus:.30,
  },
  opportunity: {
    location:'Erebus Crater', src:'/media/erebus-cylinder.jpg',label:'360° Erebus · 2005',
    credit:'NASA / JPL-Caltech / Cornell · Pancam · Erebus · 2005 · PIA03270',
    source:'https://science.nasa.gov/resource/on-the-rim-of-erebus/',
    note:'Opportunity recorded the Erebus panorama in 2005, years before its final 2018 view. NASA presents an approximate true-color cylindrical mosaic with sky seams smoothed by the mission team.',focus:.04,
  },
  spirit: {
    location:'Low Ridge · Gusev Crater', src:'/media/mcmurdo-cylinder.jpg',label:'360° McMurdo · 2006',
    credit:'NASA / JPL-Caltech / Cornell Univ. / Arizona State Univ. · Pancam · APR–OCT 2006 · PIA16440',
    source:'https://science.nasa.gov/resource/spirit-mars-rover-in-mcmurdo-panorama/',
    note:'Spirit recorded McMurdo at Low Ridge during the 2006 winter campaign. The mission team processed colors and mosaic seams to approximate human vision. This is not its final location at Troy.',focus:.13,
  },
};
