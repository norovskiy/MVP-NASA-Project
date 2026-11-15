import { lazy, Suspense, useEffect, useRef, useState } from "react";
import IconButton from "@mui/material/IconButton";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { SlidersHorizontal, Volume2, VolumeX } from "lucide-react";
import { t } from "../i18n";
const VolumePanel = lazy(() => import("./VolumePanel"));
const preference = () => { try { return localStorage.getItem("mars-explorer-ambient-enabled") !== "false"; } catch { return true; } };
const initialVolume = () => { try { const v=localStorage.getItem("mars-explorer-ambient-volume"); return v === null ? .18 : Math.max(0,Math.min(.35,Number(v)||0)); } catch { return .18; } };

// Enabled by default; the actual playing state follows the browser, not our intent.
export default function AmbientSound() {
  const [enabled,setEnabled]=useState(preference), [playing,setPlaying]=useState(false),
    [volume,setVolume]=useState(initialVolume), [error,setError]=useState(false), [volumeOpen,setVolumeOpen]=useState(false);
  const audio=useRef(null), wanted=useRef(enabled), start=useRef(()=>{}), anchor=useRef(null), closeTimer=useRef(null);
  useEffect(()=>{
    const element=new Audio("/media/space-ambience.mp3"); let disposed=false;
    element.loop=true; element.preload="metadata"; element.volume=volume; audio.current=element;
    const update=()=>{if(!disposed)setPlaying(!element.paused && !element.ended && wanted.current);};
    const failed=()=>{if(!disposed){setPlaying(false);setError(true);}};
    const attempt=()=>{
      if(disposed || !wanted.current || document.hidden || !element.paused)return;
      element.play().then(()=>{
        if(disposed || !wanted.current){element.pause();return;}
        setPlaying(true);setError(false);
      }).catch(err=>{
        if(disposed)return;
        setPlaying(false);
        // Autoplay denial is expected: first trusted interaction retries playback.
        if(err.name!=="NotAllowedError" && err.name!=="AbortError")setError(true);
      });
    };
    start.current=attempt;
    const gesture=e=>{if(e.target.closest?.(".sound-control"))return;if(e.type==="keydown" && !["Enter"," "].includes(e.key))return;attempt();};
    const visibility=()=>{if(document.hidden)element.pause();else attempt();};
    element.addEventListener("playing",update);element.addEventListener("pause",update);element.addEventListener("error",failed);
    document.addEventListener("pointerdown",gesture,{passive:true});document.addEventListener("keydown",gesture);document.addEventListener("visibilitychange",visibility);
    attempt();
    return()=>{
      disposed=true;clearTimeout(closeTimer.current);
      document.removeEventListener("pointerdown",gesture);document.removeEventListener("keydown",gesture);document.removeEventListener("visibilitychange",visibility);
      element.removeEventListener("playing",update);element.removeEventListener("pause",update);element.removeEventListener("error",failed);
      element.pause();element.removeAttribute("src");element.load();audio.current=null;start.current=()=>{};
    };
  },[]);
  useEffect(()=>{if(audio.current)audio.current.volume=volume;try{localStorage.setItem("mars-explorer-ambient-volume",String(volume));}catch{}},[volume]);
  const toggle=()=>{
    if(playing){wanted.current=false;setEnabled(false);audio.current?.pause();setPlaying(false);setVolumeOpen(false);}
    else{wanted.current=true;setEnabled(true);setError(false);start.current();}
    try{localStorage.setItem("mars-explorer-ambient-enabled",String(wanted.current));}catch{}
  };
  const revealVolume=()=>{clearTimeout(closeTimer.current);if(enabled)setVolumeOpen(true);};
  const hideVolume=()=>{closeTimer.current=setTimeout(()=>setVolumeOpen(false),180);};
  const label=error?"Audio unavailable":playing?"Mute ambience":"Enable quiet ambience";
  return <ClickAwayListener onClickAway={()=>setVolumeOpen(false)}><div className="sound-control" data-audio-state={playing?"playing":enabled?"ready":"off"} onMouseEnter={revealVolume} onMouseLeave={hideVolume} onKeyDown={e=>{if(e.key==="Escape")setVolumeOpen(false);}}>
    <IconButton className="audio-toggle" onClick={toggle} aria-label={t(label)} aria-pressed={playing} title={t(error?"Audio unavailable":enabled&&!playing?"Sound starts after your first interaction":label)}>{enabled?<Volume2 size={17}/>:<VolumeX size={17}/>}<span>{t(error?"Audio unavailable":playing?"Sound on":enabled?"Sound ready":"Sound off")}</span></IconButton>
    {enabled&&<IconButton ref={anchor} className="audio-settings" aria-label={t("Ambient volume")} aria-expanded={volumeOpen} onClick={()=>setVolumeOpen(v=>!v)}><SlidersHorizontal size={15}/></IconButton>}
    {enabled&&volumeOpen&&<Suspense fallback={null}><VolumePanel anchor={anchor.current} volume={volume} onChange={setVolume} onEnter={revealVolume} onLeave={hideVolume}/></Suspense>}
  </div></ClickAwayListener>;
}
