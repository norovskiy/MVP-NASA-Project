import PhotoLightbox from './PhotoLightbox';
import { useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  X,
  Plus,
} from "lucide-react";
import { t } from "../i18n";
import { formatCoords, missions } from "../data/missions";
import MissionNarrative from "./MissionNarrative";
import ArchivePhotoScene from "./ArchivePhotoScene";
import { panoramas } from "../data/panoramas";
const PanoramaViewer = lazy(() => import("./PanoramaViewer"));

export default function SurfaceArchive({ mission: m }) {
  const pano = panoramas[m.id],
    [panorama, setPanorama] = useState(Boolean(pano)),
    [selected, setSelected] = useState(null);
  const [photoOpen,setPhotoOpen]=useState(false),[focusView,setFocusView]=useState(false);
  const [saved, setSaved] = useState(() => {
    try {
      const value = JSON.parse(
        localStorage.getItem("mars-explorer-saved") || "[]",
      );
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  });
  const image = m.image || m.storyImage,
    credit = m.image ? m.credit : m.storyCredit,
    source = m.image ? m.imageSource : m.storySource;
  const point = selected !== null ? m.points[selected] : null;
  const toggle = () => {
    const next = saved.includes(m.id)
      ? saved.filter((id) => id !== m.id)
      : [...saved, m.id];
    setSaved(next);
    try {
      localStorage.setItem("mars-explorer-saved", JSON.stringify(next));
    } catch {}
  };
  return (
    <div className="immersive-archive" data-assistant-entity={m.id}>
      <section
        className={"surface-immersive" + (panorama ? " has-panorama" : "")+(focusView?" is-focus-view":"")}
        aria-label={t(m.name) + " " + t("Surface archive")}
      >
        <div className="surface-visual">
          {panorama ? (
            <Suspense
              fallback={
                <span className="surface-loading">
                  {t("Loading the historical panorama…")}
                </span>
              }
            >
              <PanoramaViewer src={pano.src} verticalFocus={pano.focus} />
            </Suspense>
          ) : (
            <ArchivePhotoScene
              src={image}
              alt={t(
                m.mediaType === "ARTIST’S CONCEPT"
                  ? `${t("NASA artist’s concept:")} ${m.name}`
                  : m.image
                    ? `Archival NASA photograph: ${m.name} at ${m.site}`
                    : m.storyCaption,
              )}
            />
          )}
        </div>
        <div className="surface-vignette" />
        <div className="surface-topbar">
          <Link to={"/explore/" + m.planet}>
            <ArrowLeft size={15} />
            {t("Return to orbit")}
          </Link>
          <span>
            {t(m.mediaType || "SURFACE ARCHIVE")} /{" "}
            {t(m.planet === "moon" ? "Moon" : "Mars")}
          </span>
          <button onClick={toggle}>
            {saved.includes(m.id) ? (
              <Check size={15} />
            ) : (
              <Bookmark size={15} />
            )}{" "}
            {t(saved.includes(m.id) ? "Saved" : "Save site")}
          </button>
        </div>
        <header className="surface-title">
          <span className="eyebrow">
            {m.name} · {t(m.date)} UTC
          </span>
          <h1>
            {t(panorama ? pano.location || m.site : m.viewSite || m.site)}
          </h1>
          <p>
            {m.coordinateKnown === false
              ? t("Exact site unknown · no map pin assigned")
              : formatCoords(m) + " · " + t("Historical touchdown coordinates")}
          </p>
        </header>
        <div className="surface-view-actions"><button onClick={()=>setFocusView(v=>!v)} aria-pressed={focusView}>{t(focusView?'Show information':'Focus view')}</button><button onClick={()=>setPhotoOpen(true)}>{t('View full photograph')} <ArrowUpRight size={15}/></button></div>
        {pano && (
          <div className="surface-mode-tabs">
            <button
              aria-pressed={panorama}
              onClick={() => {
                setPanorama(true);
                setSelected(null);
              }}
            >
              {t(pano.label)}
            </button>
            <button
              aria-pressed={!panorama}
              onClick={() => {
                setPanorama(false);
                setSelected(null);
              }}
            >
              {t("Archive photograph")}
            </button>
          </div>
        )}
        <div className="surface-story-launchers">
          {!panorama ? (
            m.points.map((p, i) => (
              <button
                key={p.name}
                aria-expanded={selected === i}
                onClick={() => setSelected(selected === i ? null : i)}
              >
                <Plus size={17} />
                <span>
                  <small>
                    {String(i + 1).padStart(2, "0")} / {t("DISCOVER")}
                  </small>
                  {t(p.name)}
                </span>
              </button>
            ))
          ) : (
            <button
              aria-expanded={selected === 0}
              onClick={() => setSelected(selected === 0 ? null : 0)}
            >
              <Plus size={17} />
              <span>
                <small>{t("THE STORY OF THIS VIEW")}</small>
                {t(pano.label)}
              </span>
            </button>
          )}
        </div>
        {selected !== null && (
          <aside className="surface-story-drawer">
            <button
              className="surface-story-close"
              aria-label={t("Close story")}
              onClick={() => setSelected(null)}
            >
              <X size={17} />
            </button>
            <span className="eyebrow">
              {t(panorama ? pano.label : point?.tag || "READ THE SCENE")}
            </span>
            <h2>{t(panorama ? m.name : point?.name || m.name)}</h2>
            <p>{t(panorama ? pano.note : point?.text || m.description)}</p>
          </aside>
        )}
      </section>
      {photoOpen&&<PhotoLightbox src={panorama?pano.src:image} alt={m.name+' · '+t(m.site)} credit={panorama?pano.credit:credit} source={panorama?pano.source:source||m.source} onClose={()=>setPhotoOpen(false)}/>}
      <div className="surface-evidence-bar">
        <span>
          {t(
            panorama
              ? "HISTORICAL 360° MOSAIC"
              : "ARCHIVAL IMAGE · BOUNDED CAMERA PAN",
          )}
        </span>
        <p>{panorama ? pano.credit : credit}</p>
        <a
          href={panorama ? pano.source : source || m.source}
          target="_blank"
          rel="noreferrer"
        >
          {t("Original image")} <ArrowUpRight size={12} />
        </a>
      </div>
      <div className="surface-record-content">
        <p className="surface-context">{t(m.description)}</p>
        <p className="fine-print">
          {t(
            "Historical imagery. Story notes are interpretive; camera framing is illustrative, not movement across surveyed terrain.",
          )}
        </p>
        <MissionNarrative mission={m} />
        {m.storyImage && m.storyImage !== image && (
          <figure className="record-legacy-image">
            <img
              src={m.storyImage}
              alt={t(m.storyCaption)}
              loading="lazy"
              draggable="false"
            />
            <figcaption>
              {t(m.storyCaption)} · {m.storyCredit}{" "}
              <a href={m.storySource} target="_blank" rel="noreferrer">
                {t("NASA source")} ↗
              </a>
            </figcaption>
          </figure>
        )}
        <nav className="record-neighbors" aria-label={t("Other landing sites")}>
          {missions
            .filter((x) => x.planet === m.planet && x.id !== m.id)
            .map((x) => (
              <Link key={x.id} to={"/surface/" + x.id}>
                {x.name}
                <ArrowUpRight size={13} />
              </Link>
            ))}
        </nav>
      </div>
    </div>
  );
}
