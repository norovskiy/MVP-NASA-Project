import HeroMedia from '../components/HeroMedia';
import { useState, lazy, Suspense } from "react";
const SpacecraftScene = lazy(() => import("../components/SpacecraftScene"));
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Radio,
  Satellite,
  Orbit,
  ChevronRight,
} from "lucide-react";
import { t } from "../i18n";
import { deepSpaceMissions } from "../data/archiveExpansion";
import MissionNarrative from "../components/MissionNarrative";
import CinematicCraft from "../components/CinematicCraft";

function MissionImage({ mission }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className="deep-image-fallback">
      <Satellite size={48} />
      <span>{mission.name}</span>
      <small>{t("Open the NASA image source")}</small>
    </div>
  ) : (
    <img
      src={mission.image}
      alt={t("NASA artist’s concept:") + " " + mission.name}
      loading="lazy"
      draggable="false"
      onError={() => setFailed(true)}
    />
  );
}
export function DeepSpaceOverview() {
  const [selected, setSelected] = useState("pioneer10");
  const m = deepSpaceMissions.find((item) => item.id === selected);
  return (
    <div className="deep-space-page deep-variant-b">
      <section className="deep-b-stage" aria-label={t("Deep Space")}>
        <div className="deep-b-stars" aria-hidden="true" />
        <div className="deep-b-sun" aria-hidden="true" />
        <header className="deep-b-heading">
          <span className="eyebrow">{t("BEYOND THE MOON AND MARS")}</span>
          <h1>
            {t("Deep Space")}
            <em>.</em>
          </h1>
          <p>
            {t(
              "Five silent explorers. An asteroid landing, two kinds of orbit, and two journeys beyond the planets.",
            )}
          </p>
          <div className="destination-links">
            <Link to="/explore/moon">{t("Moon")}</Link>
            <Link to="/explore/mars">{t("Mars")}</Link>
            <span aria-current="page">{t("Deep Space")}</span>
          </div>
        </header>
        <div className="deep-b-craft">
          <CinematicCraft missionId={m.id} />
        </div>
        <aside className="deep-b-selected" aria-live="polite">
          <span className="eyebrow">{t(m.locationType)}</span>
          <h2>{m.name}</h2>
          <p>{t(m.site)}</p>
          <Link className="primary" to={"/surface/" + m.id}>
            {t("Open 3D & story")} <ArrowUpRight size={16} />
          </Link>
        </aside>
        <p className="deep-b-credit">
          {t("NASA MESH · ARTISTIC LIGHTING · NO LIVE POSITION")}
          {m.id === "pioneer11" && <span>{t("Pioneer 10 family model")}</span>}
        </p>
        <nav className="deep-b-tabs" aria-label={t("Choose a spacecraft")}>
          {deepSpaceMissions.map((item, i) => (
            <button
              key={item.id}
              aria-pressed={item.id === selected}
              onClick={() => setSelected(item.id)}
            >
              <span>0{i + 1}</span>
              <strong>{item.name}</strong>
              <small>{t(item.locationType)}</small>
            </button>
          ))}
        </nav>
      </section>
      <section className="deep-collection">
        <div className="section-heading">
          <h2>{t("The machines that stayed.")}</h2>
          <p>
            {t(
              "Choose an explorer to follow its hardware, discoveries and final chapter.",
            )}
          </p>
        </div>
        <div className="deep-card-grid">
          {deepSpaceMissions.map((item, i) => (
            <Link
              className="deep-card"
              to={"/surface/" + item.id}
              key={item.id}
            >
              <figure>
                <MissionImage mission={item} />
                <figcaption>{t("NASA artist’s concept")}</figcaption>
              </figure>
              <div>
                <span className="eyebrow">
                  0{i + 1} / {t(item.locationType)}
                </span>
                <h3>
                  {item.name}
                  <ArrowUpRight size={21} />
                </h3>
                <p>{t(item.site)}</p>
                <small>{t(item.description)}</small>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
export function DeepSpaceDetail({ mission: m }) {
  const [part, setPart] = useState(0);
  return (
    <div className="deep-space-page deep-detail" key={m.id} data-assistant-entity={m.id}>
      <div className="record-toolbar">
        <Link to="/explore/deep-space">
          <ArrowLeft size={15} />
          {t("Deep Space")}
        </Link>
        <span>
          {t("MISSION ARCHIVE")} / {t("Deep Space")}
        </span>
        <Link to="/missions">
          {t("All missions")}
          <ChevronRight size={14} />
        </Link>
      </div>
      <header className="record-heading visual-hero hero-probe"><HeroMedia src={m.image} credit={m.credit+" · "+t("ARTIST’S CONCEPT")} position="78% center"/>
        <span className="eyebrow">{t(m.locationType)}</span>
        <h1>{m.name}</h1>
        <p>
          {t(m.site)} ·{" "}
          {t("Historical mission record; no live position is claimed.")}
        </p>
      </header>
      <section className="deep-inspection">
        <Suspense fallback={<p>{t("Preparing the spacecraft…")}</p>}>
          <SpacecraftScene missionId={m.id} focusIndex={part} />
        </Suspense>
        <div className="deep-inspection-caption">
          <span className="eyebrow">{t("ALONGSIDE THE SPACECRAFT")}</span>
          <h2>{t("A silent machine. A living story.")}</h2>
          <p>
            {t(
              "Move around the model, approach its hardware, and follow the instruments below.",
            )}
          </p>
        </div>
      </section>
      <section className="deep-detail-hero">
        <figure>
          <MissionImage mission={m} />
          <figcaption>
            {t("ARTIST’S CONCEPT")} · {m.credit}
            <a href={m.imageSource} target="_blank" rel="noreferrer">
              {t("Original image")} ↗
            </a>
          </figcaption>
        </figure>
        <div>
          <span className="eyebrow">{t("THE SIGNAL FELL SILENT")}</span>
          <h2>{t(m.site)}</h2>
          <p>{t(m.description)}</p>
          <p>{t(m.legacy)}</p>
          <a
            className="text-link"
            href={m.source}
            target="_blank"
            rel="noreferrer"
          >
            {t("NASA mission record")} <ArrowUpRight size={15} />
          </a>
        </div>
      </section>
      <section className="deep-hardware">
        <header>
          <span className="eyebrow">{t("INSIDE THE MISSION")}</span>
          <h2>{t("What made the science possible?")}</h2>
        </header>
        <div className="deep-equipment">
          <nav aria-label={t("Scientific equipment")}>
            {m.equipment.map((item, i) => (
              <button
                key={item.title}
                aria-pressed={i === part}
                onClick={() => setPart(i)}
              >
                <span>0{i + 1}</span>
                {t(item.title)}
                <ArrowUpRight size={14} />
              </button>
            ))}
          </nav>
          <article aria-live="polite">
            <Satellite size={28} />
            <h3>{t(m.equipment[part].title)}</h3>
            <p>{t(m.equipment[part].text)}</p>
            <a href={m.source} target="_blank" rel="noreferrer">
              {t("NASA source")} ↗
            </a>
          </article>
        </div>
      </section>
      <section className="deep-timeline">
        <span className="eyebrow">{t("FROM LAUNCH TO LEGACY")}</span>
        <h2>{t("A mission in moments.")}</h2>
        <ol>
          {m.timeline.map(([date, label], i) => (
            <li key={date + label}>
              <span>0{i + 1}</span>
              <strong>{t(date)}</strong>
              <p>{t(label)}</p>
            </li>
          ))}
        </ol>
      </section>
      <MissionNarrative mission={m} />
      <nav className="record-neighbors" aria-label={t("Other explorers")}>
        {deepSpaceMissions
          .filter((x) => x.id !== m.id)
          .map((x) => (
            <Link key={x.id} to={"/surface/" + x.id}>
              {x.name}
              <ArrowUpRight size={13} />
            </Link>
          ))}
      </nav>
    </div>
  );
}
