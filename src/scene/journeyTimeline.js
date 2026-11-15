// The canvas owns smoothing. All DOM layers subscribe to that SAME eased progress.
// No second scroll handler, independent easing, or language-dependent animation state.
export function createJourneyTimeline() {
  const listeners = new Set();
  let progress = 0;
  return {
    get: () => progress,
    publish(value) {
      progress = value;
      for (const listener of listeners) listener(value);
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(progress);
      return () => listeners.delete(listener);
    },
  };
}
