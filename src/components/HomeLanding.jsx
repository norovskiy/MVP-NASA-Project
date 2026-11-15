import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, MapPin, Radio, Wrench } from "lucide-react";
import { t } from "../i18n";
import { journeyStories } from "../data/journeyStories";
import JourneyDetails from "./JourneyDetails";
import SpaceCanvas from "./SpaceCanvas";
import DeepFlight from "./DeepFlight";
import JourneyChapters from "./JourneyChapters";
import { createJourneyTimeline } from "../scene/journeyTimeline";
import { useLanguage } from "../i18n";
const DawnInspection = lazy(() => import("./DawnInspection"));

const previews = [
  { icon: MapPin, label: "Where it landed" },
  { icon: Wrench, label: "What stayed" },
  { icon: Radio, label: "How it ended" },
];

export default function HomeLanding() {
  const sceneRef = useRef(null);
  const timeline = useMemo(createJourneyTimeline, []);
  const [arrived, setArrived] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const lang = useLanguage(s => s.lang);
  const L = (en, ru) => lang === "ru" ? ru : en;
  const closeInspection = useCallback(() => setInspecting(false), []);
  useEffect(() => timeline.subscribe(p => setArrived(p >= .86)), [timeline]);

  return (
    <>
      <section
        ref={sceneRef}
        className="scroll-journey"
        aria-label={t("A journey from Mars to the Moon and deep space")}
      >
        <div className={"journey-stage" + (arrived ? " is-dawn-chapter" : "")}>
          <SpaceCanvas sectionRef={sceneRef} timeline={timeline} />
          <DeepFlight timeline={timeline} interactive={arrived} onInspect={() => setInspecting(true)} />

          <JourneyChapters timeline={timeline} sectionRef={sceneRef} />
          {/* This single sticky panel stays in the same screen position during the whole flight. */}
          <div className="journey-overlay">
            <div className="journey-copy" aria-hidden={arrived} inert={arrived}>
              <p className="journey-eyebrow">
                <span />
                {t("AN INDEPENDENT SPACE ARCHIVE")}
              </p>
              <h1>
                {t("Abandoned.")}
                <br />
                <em>{t("but not forgotten.")}</em>
              </h1>
              <p className="journey-description">
                {t(
                  "Explore real landing sites, the machines left behind, and the discoveries that outlived their final signal.",
                )}
              </p>
              <span className="journey-awaits-label">{t("WHAT AWAITS")}</span>
              <div className="journey-previews">
                {previews.map(({ icon: Icon, label }) => (
                  <div key={label}>
                    <Icon size={14} aria-hidden="true" />
                    <span>{t(label)}</span>
                  </div>
                ))}
              </div>
              <span className="journey-swipe">
                <ArrowDown size={13} />
                {t("SCROLL TO TRAVEL")}
              </span>
            </div>
          </div>
          <div className="dawn-invitation" aria-hidden={!arrived} inert={!arrived}>
            <p className="dawn-kicker"><span />03 / {L("BEYOND THE LAST SIGNAL", "ЗА ПРЕДЕЛАМИ ПОСЛЕДНЕГО СИГНАЛА")}</p>
            <h2>{L("Every mission", "У каждой миссии")}<br/><em>{L("leaves a story.", "есть продолжение.")}</em></h2>
            <p>{L("Meet Dawn. A silent explorer at Ceres. Come closer, discover what kept it alive — and what a second life would take.", "Это Dawn. Безмолвный исследователь у Цереры. Приблизься, изучи его системы и узнай, что нужно для второй жизни.")}</p>
            <button className="dawn-approach" onClick={() => setInspecting(true)}><span className="dawn-invite-orbit" aria-hidden="true">✦</span>{L("Approach Dawn", "Приблизиться к Dawn")}<ArrowUpRight size={20}/></button>
            <small>{L("Tap the spacecraft to begin · NASA model", "Нажми на аппарат, чтобы начать · модель NASA")}</small>
          </div>
        </div>
      </section>
      {inspecting && <Suspense fallback={<div className="dawn-preparing" role="status">{L("Opening the observation deck…", "Открываем палубу наблюдения…")}<button onClick={closeInspection}>{L("Cancel", "Отмена")}</button></div>}><DawnInspection onClose={closeInspection}/></Suspense>}

      <div className="home-destinations">
        {[
          { world: "moon", title: "Moon", detail: "Six Apollo landing regions", image: "/media/apollo15.jpg", credit: "NASA · Apollo" },
          { world: "mars", title: "Mars", detail: "Seven confirmed sites · one lost mission", image: "/media/jezero.jpg", credit: "NASA / JPL-Caltech / ASU / MSSS" },
          { world: "deep-space", title: "Deep Space", detail: "Five silent explorers", image: "/media/dawn.jpg", credit: "NASA / JPL-Caltech · " + t("Artist’s concept") },
        ].map((card) => (
          <a key={card.world} href={"/explore/" + card.world} className={"destination-photo destination-" + card.world}>
            <img src={card.image} alt="" loading="lazy" decoding="async" draggable="false" />
            <div className="destination-photo-copy">
              <h2>{t(card.title)}</h2>
              <p>{t(card.detail)}</p>
              <small>{card.credit}</small>
            </div>
            <ArrowUpRight size={24} aria-hidden="true" />
          </a>
        ))}
      </div>
      <JourneyDetails stories={journeyStories} />
    </>
  );
}
