// Cinematic composition: screen fractions, not orbital positions or physical distances.
// One distant key light stays at the upper-right in the camera frame through the journey.
export const journeyLight = [0.48, 0.56, 0.68];
export const planetKeyframes = [
  {
    kind: "mars",
    tilt: 0.5,
    light: journeyLight,
    longitude: 0.22,
    atmosphere: true,
    glow: "#d29971",
    frames: [
      [0, 0.91, 1.91, 1.72, 1],
      [0.13, 0.94, 1.62, 1.3, 1],
      [0.26, 0.88, 0.94, 0.31, 1],
      [0.34, 0.87, 0.69, 0.045, 0.85],
      [0.39, 0.87, 0.65, 0.012, 0],
    ],
  },
  {
    kind: "moon",
    light: journeyLight,
    longitude: -0.32,
    atmosphere: false,
    frames: [
      [0.29, 0.92, 0.59, 0.012, 0],
      [0.37, 0.94, 0.6, 0.055, 1],
      [0.51, 1.02, 0.78, 0.62, 1],
      [0.61, 1.01, 0.92, 0.73, 1],
      [0.72, 1.04, 1.38, 0.67, 1],
      [0.8, 1.07, 1.92, 0.55, 0],
    ],
  },
  {
    kind: "ceres",
    light: journeyLight,
    longitude: 0.8,
    atmosphere: false,
    frames: [
      [0.72, 1.11, 1.39, 0.15, 0],
      [0.83, 1.08, 1.1, 0.44, 1],
      [1, 0.99, 0.95, 0.9, 1],
    ],
  },
];
export const textureSources = {
  moon: "/models/moon.jpg",
  mars: "/models/mars.jpg",
  ceres: "/models/ceres.jpg",
};
export function samplePlanet(planet, p) {
  const frames = planet.frames;
  if (p < frames[0][0] || p > frames.at(-1)[0]) return null;
  let i = 1;
  while (i < frames.length - 1 && p > frames[i][0]) i++;
  const a = frames[i - 1],
    b = frames[i],
    span = b[0] - a[0];
  const raw = Math.max(0, Math.min(1, (p - a[0]) / span)),
    ease = raw * raw * (3 - 2 * raw);
  // Monotone Hermite tangents keep camera velocity continuous across keyframes.
  const tangent = (index, n) => {
    if (index === 0 || index === frames.length - 1) return 0;
    const prev = frames[index - 1],
      cur = frames[index],
      next = frames[index + 1];
    const left = (cur[n] - prev[n]) / (cur[0] - prev[0]),
      right = (next[n] - cur[n]) / (next[0] - cur[0]);
    return left * right <= 0 ? 0 : (2 * left * right) / (left + right);
  };
  const mix = (n) =>
    n === 4
      ? a[n] + (b[n] - a[n]) * ease
      : (2 * raw ** 3 - 3 * raw ** 2 + 1) * a[n] +
        (raw ** 3 - 2 * raw ** 2 + raw) * span * tangent(i - 1, n) +
        (-2 * raw ** 3 + 3 * raw ** 2) * b[n] +
        (raw ** 3 - raw ** 2) * span * tangent(i, n);

  return { x: mix(1), y: mix(2), radius: mix(3), alpha: mix(4), t: raw };
}
export function getJourneyChapter(p) {
  return p < 0.32 ? 0 : p < 0.75 ? 1 : 2;
}
