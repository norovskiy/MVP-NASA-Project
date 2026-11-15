import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, X, Orbit, Layers, Sparkles } from "lucide-react";
import { useLanguage } from "../i18n";
import { dawnSystems, dawnSources, dawnLife } from "../data/dawnInspection";
const SpacecraftScene = lazy(() => import("./SpacecraftScene"));

// A functional diagram, deliberately separate from the exterior NASA mesh.
function SystemDiagram({ selected, onSelect, L }) {
  const nodes = [
    ["solar", 24, 25], ["pointing", 76, 25], ["science", 24, 72],
    ["ion", 50, 84], ["radio", 76, 72],
  ];
  return <div className="dawn-system-map">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M24 25 L50 50 L76 25 M24 72 L50 50 L76 72 M50 50 L50 84"/></svg>
    <div className="dawn-map-core"><Orbit size={30}/><strong>{L("SPACECRAFT BUS", "СИСТЕМЫ АППАРАТА")}</strong><small>{L("Power · commands · data", "Питание · команды · данные")}</small></div>
    {nodes.map(([id,x,y]) => { const item = dawnSystems.find(s => s.id === id); return <button key={id} style={{left:x+"%",top:y+"%"}} className={selected === id ? "is-selected" : ""} aria-pressed={selected === id} onClick={() => onSelect(id)}><span>{item.number}</span>{L(...item.label)}</button>; })}
  </div>;
}

export default function DawnInspection({ onClose }) {
  const lang = useLanguage(s => s.lang), L = (en,ru) => lang === "ru" ? ru : en;
  const dialog = useRef(null);
  const [mode,setMode] = useState("inspect"), [selected,setSelected] = useState("solar"), [chapter,setChapter] = useState(0);
  const part = dawnSystems.find(s => s.id === selected);
  const life = dawnLife[chapter];
  useEffect(() => {
    const node = dialog.current, previous = document.activeElement, overflow = document.body.style.overflow, scroll = {top:window.scrollY,left:window.scrollX};
    document.body.style.overflow = "hidden";
    node.showModal();
    return () => { node.close(); document.body.style.overflow = overflow; if(previous?.isConnected)previous.focus({preventScroll:true}); window.scrollTo({...scroll,behavior:"instant"}); };
  }, []);
  const tabs = [["inspect",Orbit,L("Inspect", "Осмотр")],["systems",Layers,L("Systems", "Системы")],["life",Sparkles,L("Second life", "Вторая жизнь")]];
  return createPortal(<dialog ref={dialog} className="dawn-deck" aria-labelledby="dawn-deck-title" onCancel={e => { e.preventDefault(); onClose(); }}>
    <header className="dawn-deck-header">
      <button className="dawn-return" autoFocus onClick={onClose}><ArrowLeft size={18}/><span>{L("Return to journey", "Вернуться к полёту")}</span></button>
      <span className="dawn-deck-mark">MARS EXPLORER <i/> {L("OBSERVATION DECK", "ПАЛУБА НАБЛЮДЕНИЯ")}</span>
      <button className="dawn-close" onClick={onClose} aria-label={L("Close Dawn inspection", "Закрыть осмотр Dawn")}><X size={22}/></button>
    </header>
    <div className="dawn-deck-body">
      <div className="dawn-deck-intro"><div><p className="dawn-kicker">DAWN / {L("CERES ORBIT", "ОРБИТА ЦЕРЕРЫ")}</p><h1 id="dawn-deck-title">{L("A silent explorer.", "Безмолвный исследователь.")}<br/><em>{L("A story still unfolding.", "История продолжается.")}</em></h1></div><p>{L("The signal ended. The questions did not. Explore the machine, follow its systems, and imagine a more useful ending for future missions.", "Сигнал исчез. Вопросы остались. Изучи аппарат, проследи работу систем и представь другое продолжение для будущих миссий.")}</p></div>
      <nav className="dawn-mode-tabs" aria-label={L("Inspection modes", "Режимы осмотра")}>
        {tabs.map(([id,Icon,label],i) => <button key={id} aria-pressed={mode===id} onClick={() => setMode(id)}><span>0{i+1}</span><Icon size={17}/>{label}</button>)}
        <span className="dawn-historical"><i/>{L("Historical record · no live telemetry", "Исторические данные · без телеметрии")}</span>
      </nav>
      <div className={"dawn-workspace dawn-mode-"+mode}>
        <div className="dawn-visual">
          <div className="dawn-visual-caption"><span>{mode === "systems" ? L("FUNCTIONAL SCHEMATIC", "ФУНКЦИОНАЛЬНАЯ СХЕМА") : L("EXTERIOR / NASA MODEL", "ВНЕШНИЙ ВИД / МОДЕЛЬ NASA")}</span><span>DAWN — 2007 / 2018</span></div>
          <div className={"dawn-model-layer"+(mode === "systems" ? " is-hidden" : "")} inert={mode === "systems"} aria-hidden={mode === "systems"}>
            <Suspense fallback={<img className="dawn-loading-poster" src="/models/deep/dawn-detailed-cinematic.webp" alt={L("Dawn NASA model", "Модель Dawn NASA")}/>}><SpacecraftScene missionId="dawn" focusIndex={mode === "inspect" ? part.view : 0} inspection/></Suspense>
          </div>
          {mode === "systems" && <><SystemDiagram selected={selected} onSelect={setSelected} L={L}/><p className="dawn-schematic-note">{L("How the systems depend on one another. Explanatory layout, not an internal cutaway or engineering drawing.", "Как системы зависят друг от друга. Поясняющая схема, не внутренний разрез и не инженерный чертёж.")}</p></>}
          {mode !== "life" && <div className="dawn-system-picker" aria-label={L("Select a spacecraft system", "Выбери систему аппарата")}>{dawnSystems.map(s => <button key={s.id} onClick={()=>setSelected(s.id)} aria-pressed={selected===s.id}><span>{s.number}</span>{L(...s.label)}</button>)}</div>}
          {mode === "life" && <div className="dawn-life-line">{dawnLife.map((s,i) => <button key={i} aria-pressed={chapter===i} onClick={()=>setChapter(i)}><span>0{i+1}</span>{L(...s.label)}</button>)}</div>}
        </div>
        <aside className="dawn-readout" aria-live="polite" aria-atomic="true">
          <div key={mode === "life" ? chapter : selected} className="dawn-readout-copy"><p className="dawn-kicker">{mode === "life" ? L("THE MISSION AFTER THE MISSION", "МИССИЯ ПОСЛЕ МИССИИ") : part.number+" / "+L(...part.label)}</p><h2>{L(...(mode === "life" ? life.title : part.title))}</h2><p>{L(...(mode === "life" ? life.text : part.description))}</p>{mode !== "life" && <div className="dawn-consequence"><span>{L("WHY IT MATTERS", "ПОЧЕМУ ЭТО ВАЖНО")}</span><p>{L(...part.consequence)}</p></div>}</div>
          {mode !== "life" ? <button className="dawn-next-link" onClick={()=>mode==="inspect" ? setMode("systems") : setMode("life")}>{mode === "inspect" ? L("Look beneath the surface", "Заглянуть за оболочку") : L("What could come next?", "Что может быть дальше?")}<ArrowRight size={18}/></button> : <div className="dawn-concept-preview"><span>{L("OUR TEAM’S NEXT QUESTION", "СЛЕДУЮЩИЙ ВОПРОС НАШЕЙ КОМАНДЫ")}</span><h3>{L("What if a second life began in the design?", "А если вторую жизнь заложить в конструкцию?")}</h3><p>{L("NX1 could become a stationary laboratory and energy buffer after mobility loss, if power and communication survive. NX2 is a tethered scout for accessible underground spaces.", "NX1 мог бы стать стационарной лабораторией и энергетическим буфером после потери подвижности, если питание и связь сохранятся. NX2 — разведчик доступных подземных пространств на кабеле.")}</p><Link to="/concepts" onClick={onClose}>{L("Explore NX1 + NX2", "Изучить NX1 + NX2")}<ArrowUpRight size={18}/></Link><small>{L("Our proposed concepts · not flight-tested hardware", "Концепции команды · не испытанная в полёте техника")}</small></div>}
        </aside>
      </div>
      <footer className="dawn-deck-footer"><span>{L("A NASA mission. An independent story by Norov Muhammad & team.", "Миссия NASA. Независимая история Норова Мухаммада и команды.")}</span><div><a href={dawnSources.history} target="_blank" rel="noreferrer">{L("Mission record", "История миссии")} ↗</a><a href={dawnSources.systems} target="_blank" rel="noreferrer">{L("System facts", "Данные о системах")} ↗</a><Link to="/surface/dawn" onClick={onClose}>{L("Full archive", "Полный архив")} ↗</Link></div></footer>
    </div>
  </dialog>, document.body);
}
