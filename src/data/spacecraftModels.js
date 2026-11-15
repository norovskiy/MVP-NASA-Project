// Official NASA downloadable meshes. A shared family model is explicitly labeled.
const pioneer = {
  frames: "/models/deep/pioneer10-orbit.webp",
  url: "/models/deep/pioneer10.glb",
  source: "https://science.nasa.gov/3d-resources/pioneer/",
  poster: "/media/pioneer10.jpg",
  rotation: [0.12, -0.5, 0],
};
export const spacecraftModels = {
  pioneer10: pioneer,
  pioneer11: {
    ...pioneer,
    note: "Pioneer 10 model shown for the shared spacecraft family; not an exact Pioneer 11 reconstruction.",
  },
  near: {
    frames: "/models/deep/near-orbit.webp",
    url: "/models/deep/near.glb",
    source:
      "https://github.com/nasa/NASA-3D-Resources/tree/master/3D%20Models/NEAR%20Shoemaker",
    poster: "/media/near.jpg",
    rotation: [0.1, 0.4, 0],
  },
  dawn: {
    startFrame: 12,
    frameSize: 1024,
    frames: "/models/deep/dawn-detailed-orbit.webp",
    url: "/models/deep/dawn-detailed.glb",
    source: "https://science.nasa.gov/3d-resources/dawn/",
    poster: "/media/dawn.jpg",
    rotation: [0.2, 0.5, 0.1],
  },
  kepler: {
    frames: "/models/deep/kepler-orbit.webp",
    url: "/models/deep/kepler.glb",
    source: "https://science.nasa.gov/3d-resources/kepler-a/",
    poster: "/media/kepler.jpg",
    rotation: [0.1, 0, 0.1],
  },
};
