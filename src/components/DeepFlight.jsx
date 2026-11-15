import { useEffect, useRef } from "react";
import { clamp, smoothstep } from "../scene/noise";
import { useLanguage } from "../i18n";
import { ArrowUpRight } from "lucide-react";
// Actual NASA Dawn mesh rendered once with the same upper-right key as the planets.
// Camera travel is driven by the canvas timeline, so reverse scroll has the same composition.
export default function DeepFlight({ timeline, interactive = false, onInspect }) {
  const element = useRef(null);
  const lang = useLanguage(s => s.lang);
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
    <div ref={element} className={"deep-flight dawn-arrival" + (interactive ? " is-inviting" : "")}>
      <button disabled={!interactive} onClick={onInspect} aria-label={lang === "ru" ? "Изучить аппарат Dawn" : "Explore the Dawn spacecraft"}>
      <img
        src="/models/deep/dawn-detailed-cinematic.webp"
        alt=""
        draggable="false"
        decoding="async"
      />
      <span className="dawn-touch-hint" aria-hidden="true"><i />{lang === "ru" ? "Нажми на меня" : "Come closer"}<ArrowUpRight size={14}/></span>
      </button>
    </div>
  );
}
