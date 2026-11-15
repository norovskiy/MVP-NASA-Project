import { useEffect, useRef } from "react";
import { clamp, smoothstep } from "../scene/noise";
// Actual NASA Dawn mesh rendered once with the same upper-right key as the planets.
// Camera travel is driven by the canvas timeline, so reverse scroll has the same composition.
export default function DeepFlight({ timeline }) {
  const element = useRef(null);
  useEffect(
    () =>
      timeline.subscribe((p) => {
        const node = element.current;
        if (!node) return;
        const a = smoothstep(clamp((p - 0.76) / 0.15)),
          travel = clamp((p - 0.76) / 0.24);
        node.style.opacity = String(a);
        node.style.transform = `translate3d(${(1 - travel) * 18}%,${(1 - travel) * 10}%,0) scale(${0.62 + travel * 0.38})`;
      }),
    [timeline],
  );
  return (
    <div ref={element} className="deep-flight dawn-arrival" aria-hidden="true">
      <img
        src="/models/deep/dawn-cinematic.webp"
        alt=""
        draggable="false"
        decoding="async"
      />
    </div>
  );
}
