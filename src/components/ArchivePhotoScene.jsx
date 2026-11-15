import { useEffect, useRef, useState } from "react";
import { Minus, Plus, RotateCcw, Pause, Play } from "lucide-react";
import { t } from "../i18n";

// Bounded pan of one photograph. No invented scenery, spherical warp or false walk-through.
export default function ArchivePhotoScene({ src, alt }) {
  const host = useRef(null),
    drag = useRef(null),
    [zoom, setZoom] = useState(1),
    [position, setPosition] = useState([50, 18]),
    [moving, setMoving] = useState(false),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    const node = host.current;
    const observer = new IntersectionObserver(([entry]) =>
      node?.style.setProperty(
        "--photo-play",
        entry.isIntersecting ? "running" : "paused",
      ),
    );
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={host}
      className={"archive-photo-scene" + (moving ? " is-moving" : "")}
      onPointerDown={(e) => {
        if (e.target.closest("button")) return;
        drag.current = [e.clientX, e.clientY, ...position];
        e.currentTarget.setPointerCapture(e.pointerId);
        setMoving(false);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        setPosition([
          Math.max(
            0,
            Math.min(
              100,
              drag.current[2] - (e.clientX - drag.current[0]) * 0.09,
            ),
          ),
          Math.max(
            0,
            Math.min(
              100,
              drag.current[3] - (e.clientY - drag.current[1]) * 0.09,
            ),
          ),
        ]);
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      {!failed ? (
        <img
          src={src}
          alt={alt}
          draggable="false"
          style={{
            objectPosition: `${position[0]}% ${position[1]}%`,
            transform: `scale(${zoom})`,
          }}
          onError={() => setFailed(true)}
        />
      ) : (
        <p className="photo-failed">
          {t("Image unavailable. Open the NASA source below.")}
        </p>
      )}
      <div className="photo-scene-tools">
        <span>{t("Drag to frame the photograph")}</span>
        <button
          aria-label={t("Zoom out")}
          onClick={() => setZoom((v) => Math.max(1, v - 0.1))}
        >
          <Minus size={16} />
        </button>
        <button
          aria-label={t("Zoom in")}
          onClick={() => setZoom((v) => Math.min(1.6, v + 0.1))}
        >
          <Plus size={16} />
        </button>
        <button
          aria-label={t(moving ? "Pause camera" : "Resume camera")}
          onClick={() => setMoving((v) => !v)}
        >
          {moving ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button
          aria-label={t("Reset view")}
          onClick={() => {
            setZoom(1);
            setPosition([50, 18]);
            setMoving(false);
          }}
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
