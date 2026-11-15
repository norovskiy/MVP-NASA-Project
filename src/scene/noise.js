// A seeded generator keeps the star field stable between renders and devices.
export function seededRandom(seed = 1) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// Stars are generated once, so the same scroll position always shows the same sky.
const random = seededRandom(7401976);
export const stars = Array.from({ length: 260 }, () => ({
  angle: random() * Math.PI * 2,
  depth: random(),
  brightness: 0.35 + random() * 0.65,
  size: 0.55 + random() * 1.15,
}));

export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
export const smoothstep = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
