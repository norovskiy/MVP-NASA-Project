import { useEffect, useRef } from "react";
import { t } from "../i18n";
import { getJourneyChapter } from "../scene/planets";
const chapters = [
  ["Mars", "A world of silent explorers", 0],
  ["Moon", "Traces in the dust", 0.53],
  ["Deep Space", "Beyond the last signal", 0.95],
];
export default function JourneyChapters({ timeline, sectionRef }) {
  const root = useRef(null);
  useEffect(
    () =>
      timeline.subscribe((p) => {
        const i = getJourneyChapter(p),
          node = root.current;
        if (!node) return;
        node.style.setProperty("--journey-progress", String(p));
        node.querySelectorAll("[data-chapter]").forEach((el, j) => {
          el.setAttribute("aria-current", j === i ? "step" : "false");
        });
        node.querySelectorAll("[data-chapter-title]").forEach((el, j) => {
          el.hidden = j !== i;
        });
      }),
    [timeline],
  );
  return (
    <div ref={root} className="journey-chapters">
      <div className="journey-current" aria-hidden="true">
        {chapters.map(([title, line], i) => (
          <div data-chapter-title key={title} hidden={i !== 0}>
            <span>
              0{i + 1} / {t(title)}
            </span>
            <strong>{t(line)}</strong>
          </div>
        ))}
      </div>
      <nav aria-label={t("Journey chapters")}>
        {chapters.map(([name, , p], i) => (
          <button
            key={name}
            data-chapter={i}
            aria-current={i === 0 ? "step" : "false"}
            onClick={() => {
              const r = sectionRef.current?.getBoundingClientRect();
              if (!r) return;
              window.scrollTo({
                top: scrollY + r.top + p * Math.max(1, r.height - innerHeight),
                behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "instant"
                  : "smooth",
              });
            }}
          >
            <span>0{i + 1}</span>
            {t(name)}
          </button>
        ))}
      </nav>
      <div className="journey-progress-track">
        <i />
      </div>
    </div>
  );
}
