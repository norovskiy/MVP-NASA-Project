import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import { missions } from "../data/missions";
import { useExplorerStore } from "../store/useExplorerStore";

export default function LightGlobe({ onEnter }) {
  const { planet, rotating, reset, descending } = useExplorerStore();
  // Start on the useful near-side (Apollo sites) and a Mars hemisphere with
  // Jezero, Gale and Elysium visible. Longitude remains factual; the globe turns.
  const [centerLongitude, setCenterLongitude] = useState(105);
  const [zoom, setZoom] = useState(1);
  const drag = useRef(null);
  const globe = useRef(null);
  const sites = missions.filter(
    (m) =>
      m.planet === planet && Number.isFinite(m.lat) && Number.isFinite(m.lon),
  );
  useEffect(() => {
    setCenterLongitude(planet === "moon" ? 15 : 105);
    setZoom(1);
  }, [planet, reset]);
  const width = globe.current?.clientWidth || 500;
  const offset = ((180 - centerLongitude) / 360) * width;

  return (
    <div className="compatibility-world">
      <div
        ref={globe}
        className={
          "compatibility-globe " +
          (rotating ? "spinning" : "") +
          (descending ? " globe-descending" : "")
        }
        role="group"
        aria-label={t(`${planet} globe compatibility view`)}
        style={{
          backgroundImage: `url(/models/${planet}.jpg)`,
          backgroundPosition: `${offset}px center`,
          "--zoom": zoom,
        }}
        onPointerDown={(event) => {
          if (event.target.closest(".fallback-globe-pin")) return;
          drag.current = event.clientX;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (drag.current !== null) {
            useExplorerStore.setState({ rotating: false });
            setCenterLongitude(
              (value) =>
                value -
                ((event.clientX - drag.current) /
                  (globe.current?.clientWidth || 500)) *
                  360,
            );
            drag.current = event.clientX;
          }
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onWheel={(event) =>
          setZoom((value) =>
            Math.min(1.4, Math.max(0.7, value - event.deltaY * 0.001)),
          )
        }
      >
        {sites.map((mission) => {
          // Project each real landing coordinate onto the visible hemisphere.
          const latitude = (mission.lat * Math.PI) / 180;
          const longitudeDelta =
            ((mission.lon - centerLongitude) * Math.PI) / 180;
          const visible = Math.cos(latitude) * Math.cos(longitudeDelta) > 0;
          if (!visible) return null;
          const x = 50 + Math.cos(latitude) * Math.sin(longitudeDelta) * 43;
          const y = 50 - Math.sin(latitude) * 43;
          return (
            <button
              key={mission.id}
              className="fallback-globe-pin"
              style={{ left: `${x}%`, top: `${y}%` }}
              aria-label={t("Explore ") + t(mission.name)}
              title={t(mission.name)}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onEnter(mission.id);
              }}
            >
              <span />
              <span className="pin-label">{t(mission.name)}</span>
            </button>
          );
        })}
      </div>
      <span className="compatibility-note">
        {t("LIGHT VIEW · HOVER A DOT FOR ITS MISSION")}
      </span>
    </div>
  );
}
