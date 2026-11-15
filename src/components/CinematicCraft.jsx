import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { t } from "../i18n";
const family = (id) => (id === "pioneer11" ? "pioneer10" : id);
// Lighting is baked from the real NASA mesh. Only the camera framing drifts;
// the light and self-shadows never rotate independently of the spacecraft.
export default function CinematicCraft({ missionId }) {
  const root = useRef(null),
    [paused, setPaused] = useState(false);
  useEffect(() => {
    const node = root.current;
    const observer = new IntersectionObserver(([e]) =>
      node.style.setProperty(
        "--craft-play",
        e.isIntersecting ? "running" : "paused",
      ),
    );
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={root}
      className={"cinematic-craft" + (paused ? " is-paused" : "")}
    >
      <img
        key={missionId}
        src={`/models/deep/${family(missionId)}-cinematic.webp`}
        alt={t("NASA model in an illustrative lighting setup")}
        draggable="false"
        decoding="async"
      />
      <button
        className="cinematic-pause"
        aria-label={t(paused ? "Resume camera" : "Pause camera")}
        onClick={() => setPaused((v) => !v)}
      >
        {paused ? <Play size={14} /> : <Pause size={14} />}
      </button>
    </div>
  );
}
