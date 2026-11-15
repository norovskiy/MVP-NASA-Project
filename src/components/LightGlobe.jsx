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
  const [width, setWidth] = useState(500);
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
  useEffect(() => {
    const node = globe.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!rotating || descending || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let previous = 0, frame;
    const tick = time => {
      if (time - previous >= 80) {
        const dt = previous ? Math.min(time - previous, 200) : 0;
        previous = time;
        setCenterLongitude(value => (value + dt * .003) % 360);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [rotating, descending]);
  // Equirectangular map repeats every 2 globe widths; longitude 0 is its middle.
  const offset = -((centerLongitude + 90) / 180) * width;

  return (
    <div className="compatibility-world">
      <div
        ref={globe}
        className={
          "compatibility-globe " +
          "" +
          (descending ? " globe-descending" : "")
        }
        tabIndex={0}
        onKeyDown={event => {
          if (!["ArrowLeft", "ArrowRight", "+", "-"].includes(event.key)) return;
          event.preventDefault();
          useExplorerStore.setState({rotating:false});
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") setCenterLongitude(v => v + (event.key === "ArrowLeft" ? -12 : 12));
          else setZoom(v => Math.max(.7, Math.min(1.4, v + (event.key === "+" ? .1 : -.1))));
        }}
        role="group"
        aria-label={t(`${planet} globe compatibility view`)}
        style={{
          backgroundImage: `url(/models/${planet}.jpg)`,
          backgroundPosition: `${offset}px center`,
          backgroundSize: `${width * 2}px 100%`,
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
          // Helicopter and rover may share the same historical touchdown coordinate.
          // Separate their buttons on screen without changing the recorded location.
          const group = sites.filter(item => Math.abs(item.lat - mission.lat) < .03 && Math.abs(item.lon - mission.lon) < .03);
          const shift = group.length > 1 ? (group.indexOf(mission) - (group.length - 1) / 2) * 25 : 0;
          const x = 50 + Math.cos(latitude) * Math.sin(longitudeDelta) * 43;
          const y = 50 - Math.sin(latitude) * 43;
          return (
            <button
              key={mission.id}
              className="fallback-globe-pin"
              style={{ left: `calc(${x}% + ${shift}px)`, top: `${y}%` }}
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
