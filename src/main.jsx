import {Analytics} from "@vercel/analytics/react";
import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  Plus,
  Minus,
  RotateCcw,
  Pause,
  Play,
  Orbit,
  Globe2,
  X,
  Info,
  Mouse,
  MapPin,
  Compass,
  Scan,
  Search,
  SlidersHorizontal,
  Bookmark,
  Check,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import HomeLanding from "./components/HomeLanding";
import VikingStory from "./components/VikingStory";
import SurfaceArchive from "./components/SurfaceArchive";
import { DeepSpaceOverview, DeepSpaceDetail } from "./pages/DeepSpace";
const Concepts = lazy(() => import("./pages/Concepts"));
const OrbitAssistant = lazy(() => import("./components/OrbitAssistant"));
const LightGlobe = lazy(() => import("./components/LightGlobe"));
import { planets } from "./data/planets";
import { missions, getMission, formatCoords } from "./data/missions";
import { useExplorerStore } from "./store/useExplorerStore";
import "./style.css";
import "./style-modern.css";
import "./style-archive.css";
import "./style-immersive.css";
import "./style-orbital.css";
import "./style-readability.css";
import "./style-visual-repair.css";
import "./style-release.css";
import "./style-header-final.css";
import "./components/DawnInspection.css";
import HeroMedia from "./components/HeroMedia";
import { t, useLanguage } from "./i18n";
import { ExperienceHeader } from "./components/ExperienceControls";
import {
  SolarSystem,
  Discover,
  About,
  RobotsPage,
  MvpBanner,
} from "./pages/Extensions";
const SpaceScene = lazy(() => import("./components/SpaceScene"));
function Home() {
  return (
    <>
      <HomeLanding />
      <VikingStory />
      <section
        className="ancient-mars-feature"
        aria-labelledby="ancient-mars-title"
      >
        <div
          className="ancient-mars-image"
          role="img"
          aria-label={t(
            "Artistic reconstruction of ancient Mars with rivers and a lake",
          )}
        >
          <span className="ancient-mars-credit">
            {t("ARTIST’S RECONSTRUCTION · BASED ON GEOLOGICAL EVIDENCE")}
          </span>
        </div>
        <div className="ancient-mars-copy">
          <span className="eyebrow">{t("A WORLD BEFORE THE DESERT")}</span>
          <h2 id="ancient-mars-title">
            {t("Mars was once a world of water.")}
          </h2>
          <p>
            {t(
              "Billions of years ago, rivers carved channels and water gathered in lakes. NASA rovers now read those ancient shorelines like pages in a field notebook.",
            )}
          </p>
          <div className="ancient-mars-timeline">
            <div>
              <small>01 / THEN</small>
              <b>{t("Rivers & lakes")}</b>
              <span>{t("Evidence in rock layers")}</span>
            </div>
            <div>
              <small>02 / CHANGE</small>
              <b>{t("A thinning atmosphere")}</b>
              <span>{t("Water escaped or froze")}</span>
            </div>
            <div>
              <small>03 / TODAY</small>
              <b>{t("A cold desert")}</b>
              <span>{t("Clues remain in the ground")}</span>
            </div>
          </div>
          <a
            className="text-link"
            href="https://science.nasa.gov/resource/mars-evolution/"
            target="_blank"
            rel="noreferrer"
          >
            {t("See NASA’s Mars evolution animation")}{" "}
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <Footer />
    </>
  );
}
function Explorer() {
  // WebGL is optional; the default globe is light enough for mobile devices.
  const [highQuality, setHighQuality] = useState(false);
  const { world = "mars" } = useParams();
  const key = planets[world] ? world : "mars";
  const p = planets[key];
  const navigate = useNavigate();
  const state = useExplorerStore();
  const [briefing, setBriefing] = useState(false);
  const [descent, setDescent] = useState(null);
  const timer = useRef();
  const sites = missions.filter((m) => m.planet === key);
  useEffect(() => {
    state.select(key);
    setDescent(null);
    setBriefing(false);
    timer.current = null;
    return () => {
      clearTimeout(timer.current);
      timer.current = null;
      useExplorerStore.setState({
        descending: false,
      });
    };
  }, [key]);
  // Focus the chosen landing site, show a brief approach animation, then open its story page.
  const enter = (id) => {
    if (timer.current != null) return;
    const m = getMission(id);
    if (!m) return;
    if (!Number.isFinite(m.lat) || !Number.isFinite(m.lon)) {
      navigate("/surface/" + id);
      return;
    }
    state.setFocus(id);
    setDescent(m);
    useExplorerStore.setState({
      descending: true,
    });
    timer.current = setTimeout(
      () => { timer.current = null; navigate("/surface/" + id); },
      matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 850,
    );
  };
  return (
    <div className="explorer-page">
      <section className="orbit-viewport">
        <div className="orbit-scene">
          <Suspense
            fallback={
              <span className="scene-loading">
                {t("Opening orbital view…")}
              </span>
            }
          >
            {highQuality ? (
              <SpaceScene onEnter={enter} />
            ) : (
              <LightGlobe onEnter={enter} />
            )}
          </Suspense>
        </div>
        <div className="orbit-copy">
          <Link to="/" className="back-link">
            <ArrowLeft size={12} />
            {t(" BACK TO THE JOURNEY")}
          </Link>
          <span className="eyebrow">
            {t(p.number)} / {t(p.label)}
          </span>
          <h1>
            {t(p.name)}
            <span>.</span>
          </h1>
          <p>{t(p.description)}</p>
          <div className="orbit-modes">
            <span className="mode-selected">
              <Orbit size={13} />
              {t(" Orbital view")}
            </span>
            {sites.length > 0 && (
              <button onClick={() => enter(sites[0].id)}>
                <MapPin size={13} />
                {t(" Surface view ")}
                <ArrowUpRight size={12} />
              </button>
            )}
          </div>
          <button className="planet-briefing" onClick={() => setBriefing(true)}>
            {t("Planet briefing ")}
            <Plus size={15} />
          </button>
        </div>
        <div className="orbit-label">
          <span className="signal-dot" />
          {t(" INTERACTIVE PLANETARY EXPLORER")}
        </div>
        <nav className="orbit-worlds" aria-label={t("Select a world")}>
          {Object.entries(planets)
            .filter(([id]) => id !== "earth")
            .map(([id, item]) => (
              <Link
                key={id}
                aria-current={key === id ? "page" : undefined}
                className={key === id ? "selected" : ""}
                to={"/explore/" + id}
              >
                <div
                  className="orbit-world-thumb"
                  style={{
                    backgroundImage: `url(/models/${id}.jpg)`,
                  }}
                />
                <span>{t(item.name)}</span>
              </Link>
            ))}
          <Link className="deep-orbit-link" to="/explore/deep-space">
            {t("Deep Space")} ↗
          </Link>
        </nav>
        <div className="orbit-tools">
          <button
            className="view-mode-button"
            aria-pressed={highQuality}
            onClick={() => setHighQuality((v) => !v)}
            title={t("Toggle 3D view")}
          >
            {highQuality ? t("Light view") : t("3D planets")}
          </button>
          <button
            onClick={state.toggleRotation}
            aria-label={t(
              state.rotating ? "Pause rotation" : "Resume rotation",
            )}
          >
            {state.rotating ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={state.resetView}
            aria-label={t("Reset orbital view")}
          >
            <RotateCcw size={15} />
          </button>
          <span>
            <Mouse size={12} />
            {t(" Drag to rotate · Scroll to zoom")}
          </span>
        </div>
      </section>
      <section className="landing-sites">
        <div className="sites-heading">
          <div>
            <span className="eyebrow">
              {t(
                sites.length
                  ? "TOUCH DOWN. LOOK CLOSER."
                  : "THE WORLD THAT SENT US.",
              )}
            </span>
            <h2>
              {t(
                sites.length
                  ? "Stories on the surface."
                  : "Our home. Our starting point.",
              )}
            </h2>
          </div>
          <p>
            {t(
              sites.length
                ? "Choose a mission: enter a photographic view or an illustrated landing-site record."
                : "Every explorer and every spacecraft in this archive began here.",
            )}
          </p>
        </div>
        {sites.length ? (
          <div className="site-grid">
            {sites.map((m) => (
              <article className="site-card" key={m.id}>
                <button
                  className="site-image"
                  onClick={() => enter(m.id)}
                  aria-label={t("Enter " + m.site)}
                >
                  <MissionImage m={m} loading="lazy" />
                  <span className="site-image-hover">
                    <Scan size={25} />
                    {t(" ENTER SURFACE VIEW")}
                  </span>
                </button>
                <div className="site-card-info">
                  <span>
                    {t(m.planet.toUpperCase())} / {t(m.year)}
                  </span>
                  <h3>
                    {t(m.name)}
                    <button
                      onClick={() => enter(m.id)}
                      aria-label={t("Explore " + m.name)}
                    >
                      <ArrowUpRight size={21} />
                    </button>
                  </h3>
                  <p>{t(m.site)}</p>
                  <small>
                    <MapPin size={10} />
                    {formatCoords(m)}
                    <span>{t("LANDING SITE")}</span>
                  </small>
                  <button className="site-enter" onClick={() => enter(m.id)}>
                    {t("Explore this site ")}
                    <ArrowRight size={13} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="earth-note">
            <Globe2 size={30} />
            <p>
              {t(
                "Earth is the only world known to support life. Continue outward to explore the human legacy on the Moon and the robotic explorers on Mars.",
              )}
            </p>
            <Link className="primary" to="/explore/moon">
              {t("Next stop: the Moon ")}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
      </section>
      <section className="planet-facts">
        <Fact label={t("MEAN RADIUS")} value={p.radius} unit="km" />
        <Fact label={t("SURFACE GRAVITY")} value={p.gravity} unit="m/s²" />
        <Fact label={t("ROTATION PERIOD")} value={p.rotation} unit="hours" />
        <a href={p.source} target="_blank" rel="noreferrer">
          {t("Source: NASA Science ")}
          <ArrowUpRight size={13} />
        </a>
      </section>
      <Footer />
      {briefing && <PlanetBriefing p={p} close={() => setBriefing(false)} />}
      <AnimatePresence>
        {descent && (
          <motion.div
            className="descent-overlay"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: [0, 0.12, 0.92],
            }}
            transition={{
              duration: matchMedia("(prefers-reduced-motion: reduce)").matches
                ? 0
                : 0.85,
              times: [0, 0.35, 1],
            }}
          >
            <div className="descent-reticle" />
            <span className="eyebrow">{t("LEAVING ORBIT")}</span>
            <h2>{t(descent.site)}</h2>
            <p>
              {t("Opening the ")}
              {t(descent.name)}
              {t(" surface archive")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
function Fact({ label, value, unit }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>
        {value}
        <small>{unit}</small>
      </strong>
    </div>
  );
}
function PlanetBriefing({ p, close }) {
  return (
    <Dialog title={t(p.name + " briefing")} close={close}>
      <span className="eyebrow">{t("PLANETARY FIELD NOTES")}</span>
      <h2>{t(p.name)}</h2>
      <p>{t(p.description)}</p>
      <dl>
        <div>
          <dt>{t("Classification")}</dt>
          <dd>{t(p.type)}</dd>
        </div>
        <div>
          <dt>{t("Mean radius")}</dt>
          <dd>
            {t(p.radius)}
            {t(" km")}
          </dd>
        </div>
        <div>
          <dt>{t("Surface gravity")}</dt>
          <dd>{t(p.gravity)} m/s²</dd>
        </div>
        <div>
          <dt>{t("Mass")}</dt>
          <dd>{t(p.mass)}</dd>
        </div>
        <div>
          <dt>{t("Atmosphere")}</dt>
          <dd>{t(p.atmosphere)}</dd>
        </div>
        <div>
          <dt>{t("Surface temperature")}</dt>
          <dd>{t(p.temperature)}</dd>
        </div>
      </dl>
      <a
        href={p.source}
        className="source-link"
        target="_blank"
        rel="noreferrer"
      >
        {t("NASA planetary facts ")}
        <ArrowUpRight size={16} />
      </a>
      <p className="fine-print">
        {t(
          "Orbital globes use NASA-derived planetary maps by Solar System Scope (CC BY 4.0), with aesthetic adjustments and some filled mapping gaps. Lighting, size and distance are visual approximations, not scientific measurements.",
        )}
      </p>
    </Dialog>
  );
}
function Surface() {
  const { id } = useParams();
  const mission = getMission(id);
  if (!mission) return <NotFound />;
  return (
    <>
      {mission.planet === "deep-space" ? (
        <DeepSpaceDetail key={mission.id} mission={mission} />
      ) : (
        <SurfaceArchive key={mission.id} mission={mission} />
      )}
      <Footer />
    </>
  );
}
function Archive() {
  const [params] = useSearchParams();
  const [filter, setFilter] = useState(params.get("world") || "all"),
    [query, setQuery] = useState(""),
    [onlySaved, setOnlySaved] = useState(false);
  useEffect(() => { setFilter(["moon","mars","deep-space"].includes(params.get("world")) ? params.get("world") : "all"); }, [params]);
  const saved = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem("mars-explorer-saved") || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  })();
  const results = missions.filter(
    (m) =>
      (filter === "all" || m.planet === filter) &&
      (!onlySaved || saved.includes(m.id)) &&
      `${m.name} ${m.site} ${t(m.site)}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <div className="archive-page">
      <header className="archive-heading visual-hero hero-archive">
        <HeroMedia src="/media/apollo11.jpg" position="65% 48%" credit="NASA / Apollo 11"/>
        <span className="eyebrow">{t("PEOPLE. MACHINES. PLACES.")}</span>
        <h1>
          {t("The mission")}
          <br />
          <em>{t("doesn’t end here.")}</em>
        </h1>
        <p>
          {t(
            "Explore the records, photographs and discoveries that bring distant worlds a little closer.",
          )}
        </p>
      </header>
      <div className="archive-filters">
        <div>
          {["all", "moon", "mars", "deep-space"].map((x) => (
            <button
              className={filter === x ? "active" : ""}
              key={x}
              onClick={() => setFilter(x)}
            >
              {t(
                x === "all"
                  ? "All missions"
                  : x === "moon"
                    ? "The Moon"
                    : x === "deep-space"
                      ? "Deep Space"
                      : "Mars",
              )}
            </button>
          ))}
          <button
            className={onlySaved ? "active" : ""}
            onClick={() => setOnlySaved(!onlySaved)}
          >
            <Bookmark size={12} />
            {t(" Saved")}
          </button>
        </div>
        <label>
          <Search size={15} />
          <input
            placeholder={t("Search missions or places")}
            aria-label={t("Search missions or places")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="archive-count">
        {t(results.length)}
        {t(" RECORDS / MISSION ARCHIVE")}
      </div>
      <div className="archive-grid">
        {results.map((m) => (
          <Link className="archive-card" to={"/surface/" + m.id} key={m.id}>
            <MissionImage m={m} loading="lazy" />
            <div>
              <span>
                {t(m.planet.toUpperCase())} / {t(m.date)}
              </span>
              <h2>
                {t(m.name)}
                <ArrowUpRight size={22} />
              </h2>
              <p>{t(m.site)}</p>
              <p className="mission-summary">{t(m.description)}</p>
              <small>{t(m.kind)}</small>
            </div>
          </Link>
        ))}
      </div>
      {!results.length && (
        <div className="empty-state">
          <Search size={25} />
          <h2>{t("No missions found")}</h2>
          <p>
            {t("Try another search, or save a site in the surface explorer.")}
          </p>
          <button
            onClick={() => {
              setQuery("");
              setFilter("all");
              setOnlySaved(false);
            }}
          >
            {t("Reset filters ")}
            <RotateCcw size={14} />
          </button>
        </div>
      )}
      <Footer />
    </div>
  );
}
function Footer() {
  const [about, setAbout] = useState(false);
  return (
    <>
      <footer>
        <Link className="footer-brand" to="/">
          <Orbit size={17} />
          {t(" MARS EXPLORER")}
        </Link>
        <span>{t("Created by Norov Muhammad & team · MVP")}</span>
        <div>
          <Link to="/concepts">NX1 &amp; NX2</Link>
          <Link to="/about">{t("About us")}</Link>
          <Link to="/solar-system">{t("Solar system")}</Link>
          <Link to="/discover">{t("Facts & stories")}</Link>
          <button onClick={() => setAbout(true)}>
            {t("Sources & credits ")}
            <Info size={11} />
          </button>
          <Link to="/missions">
            {t("Mission archive ")}
            <ArrowUpRight size={11} />
          </Link>
        </div>
      </footer>
      {about && (
        <Dialog title={t("Sources and credits")} close={() => setAbout(false)}>
          <span className="eyebrow">
            {t("INDEPENDENT EDUCATIONAL EXPERIENCE")}
          </span>
          <h2>
            {t("A window.")}
            <br />
            {t("Not a replica.")}
          </h2>
          <p>
            {t(
              "Real mission photographs meet a cinematic interface. This experience is not an official NASA product.",
            )}
          </p>
          <dl>
            <div>
              <dt>{t("Planetary maps")}</dt>
              <dd>
                <a
                  href="https://www.solarsystemscope.com/textures/"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("Solar System Scope / CC BY 4.0 ↗")}
                </a>
              </dd>
            </div>
            <div>
              <dt>{t("Mission photographs")}</dt>
              <dd>{t("NASA and credited mission teams")}</dd>
            </div>
            <div>
              <dt>{t("Planetary facts")}</dt>
              <dd>
                <a
                  href="https://science.nasa.gov/solar-system/"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("NASA Science ↗")}
                </a>
              </dd>
            </div>
            <div>
              <dt>{t("Design inspiration")}</dt>
              <dd>
                <a
                  href="https://www.outreach.space/"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("Outreach")}
                </a>{" "}
                ·{" "}
                <a
                  href="https://science.nasa.gov/eyes/"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("NASA Eyes")}
                </a>
              </dd>
            </div>
          </dl>
          <p>
            {t(
              "The introductory film is an original rendered visualization using NASA-derived planetary maps. Planet sizes, lighting, camera paths and distances are artistic approximations. The optional 3D view uses lightweight textured spheres.",
            )}
          </p>
          <p>
            {t(
              "Surface views use real archival photographs. Hotspot positions explain the scene; they are not surveyed object coordinates. The compass is a viewing control, not a measured camera heading. Landing coordinates refer to historical touchdown locations, not current rover positions.",
            )}
          </p>
          <a
            className="source-link"
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noreferrer"
          >
            {t("Texture license: CC BY 4.0 ")}
            <ArrowUpRight size={15} />
          </a>
        </Dialog>
      )}
    </>
  );
}
function Dialog({ title, close, children }) {
  const ref = useRef();
  useEffect(() => {
    const previous = document.activeElement;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector("button")?.focus();
    function key(e) {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const elements = [
          ...ref.current.querySelectorAll("button,a,input,select"),
        ];
        if (e.shiftKey && document.activeElement === elements[0]) {
          e.preventDefault();
          elements.at(-1).focus();
        } else if (!e.shiftKey && document.activeElement === elements.at(-1)) {
          e.preventDefault();
          elements[0].focus();
        }
      }
    }
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return (
    <div className="modal-backdrop" onClick={close}>
      <motion.section
        ref={ref}
        className="briefing"
        role="dialog"
        aria-modal="true"
        aria-label={t(title)}
        initial={{
          x: 45,
          opacity: 0,
        }}
        animate={{
          x: 0,
          opacity: 1,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close" aria-label={t("Close panel")} onClick={close}>
          <X size={22} />
        </button>
        {children}
      </motion.section>
    </div>
  );
}
function MissionDiagram({ m }) {
  return (
    <div className="mission-diagram">
      <div className="diagram-grid" />
      <div
        className="diagram-globe"
        style={{
          backgroundImage: `url(/models/${m.planet}.jpg)`,
        }}
      />
      <div className="diagram-target">
        <span />
        <MapPin size={24} />
      </div>
      <span className="diagram-caption">
        {t(m.name)}
        <small>
          {t("ILLUSTRATIVE LANDING DIAGRAM · NOT MEASURED TERRAIN")}
        </small>
      </span>
    </div>
  );
}
function MissionImage({ m, loading }) {
  const [failed, setFailed] = useState(false);
  const image = m.image || m.storyImage;
  useEffect(() => setFailed(false), [image]);
  return image && !failed ? (
    <img
      key={image}
      src={image}
      decoding="async"
      alt={t(t(m.site) + " / " + m.name)}
      loading={loading}
      onError={() => setFailed(true)}
    />
  ) : (
    <MissionDiagram m={m} />
  );
}
function NotFound() {
  return (
    <section className="not-found">
      <span className="eyebrow">{t("OFF THE FLIGHT PATH")}</span>
      <h1>
        {t("Let’s find")}
        <br />
        {t("our way back.")}
      </h1>
      <Link className="primary" to="/">
        {t("Return to the journey ")}
        <ArrowRight size={17} />
      </Link>
    </section>
  );
}
function App() {
  const location = useLocation();
  const lang = useLanguage((s) => s.lang);
  useEffect(() => {
    document.title = t("Abandoned but not Forgotten") + " | Mars Explorer";
  }, [lang]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <>
      <ExperienceHeader />
      <main className="site-main-content" data-assistant-page={location.pathname}
        onDragStart={(event) => {
          if (event.target.closest?.("img")) event.preventDefault();
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explorer />} />
          <Route
            path="/explore/deep-space"
            element={
              <>
                <DeepSpaceOverview />
                <Footer />
              </>
            }
          />
          <Route
            path="/deep-space"
            element={
              <>
                <DeepSpaceOverview />
                <Footer />
              </>
            }
          />
          <Route
            path="/explore/earth"
            element={
              <>
                <DeepSpaceOverview />
                <Footer />
              </>
            }
          />
          <Route path="/explore/:world" element={<Explorer />} />
          <Route path="/surface/:id" element={<Surface />} />
          <Route path="/missions" element={<Archive />} />
          <Route path="/concepts" element={<><Suspense fallback={<div className="nx-preparing">Preparing NX1 / NX2…</div>}><Concepts /></Suspense><Footer /></>} />
          <Route
            path="/robots"
            element={
              <>
                <RobotsPage />
                <Footer />
              </>
            }
          />
          <Route
            path="/solar-system"
            element={
              <>
                <SolarSystem />
                <Footer />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <About />
                <Footer />
              </>
            }
          />
          <Route
            path="/discover"
            element={
              <>
                <Discover />
                <Footer />
              </>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Suspense fallback={null}><OrbitAssistant /></Suspense>
      {__VERCEL_ANALYTICS_ENABLED__ && <Analytics route={location.pathname} path={location.pathname} beforeSend={event=>{const url=new URL(event.url);url.search="";url.hash="";return {...event,url:url.toString()}}}/> }
    </>
  );
}
export default App;
