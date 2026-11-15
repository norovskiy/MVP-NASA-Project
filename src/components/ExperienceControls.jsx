import AmbientSound from './AmbientSound';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {Menu,X,Orbit,Palette} from 'lucide-react';
import {Link,useLocation} from 'react-router-dom';
import {useLanguage,t} from '../i18n';

const links=[['/','The journey'],['/explore/moon','Planet explorer'],['/missions','The archive'],['/explore/deep-space','Deep Space'],['/robots','Rovers & robots'],['/concepts','NX1 & NX2'],['/solar-system','Solar system'],['/about','About us']];

export function ExperienceHeader(){
 const {lang,setLanguage}=useLanguage();
 const [open,setOpen]=useState(false),[compact,setCompact]=useState(true);
 const [nebula,setNebula]=useState(()=>{try{return localStorage.getItem('mars-explorer-theme')==='nebula'}catch{return false}});
 const {pathname}=useLocation();
 const header=useRef(null),nav=useRef(null),menu=useRef(null);
 useEffect(()=>{
  document.documentElement.dataset.theme=nebula?'nebula':'midnight';
  try{localStorage.setItem('mars-explorer-theme',nebula?'nebula':'midnight')}catch{}
 },[nebula]);
 useEffect(()=>setOpen(false),[pathname]);
 useEffect(()=>{
  const escape=event=>{if(event.key==='Escape'&&open){setOpen(false);menu.current?.focus()}};
  const outside=event=>{if(open&&!header.current?.contains(event.target))setOpen(false)};
  window.addEventListener('keydown',escape);
  document.addEventListener('pointerdown',outside);
  return()=>{window.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside)};
 },[open]);
 // Use the actual translated link widths, including font loading and browser zoom.
 // A reserved menu-button slot prevents measurements oscillating between layouts.
 useLayoutEffect(()=>{
  const node=header.current, navigation=nav.current;
  if(!node||!navigation)return;
  let frame,active=true;
  const measure=()=>{
   if(!active)return;
   const style=getComputedStyle(node);
   const brand=node.querySelector('.site-brand'),controls=node.querySelector('.site-header-controls');
   const available=node.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)-brand.getBoundingClientRect().width-controls.getBoundingClientRect().width-2*parseFloat(style.columnGap||0);
   const items=[...navigation.querySelectorAll('a')];
   const gap=parseFloat(getComputedStyle(navigation).columnGap)||0;
   const required=items.reduce((sum,item)=>sum+item.getBoundingClientRect().width,0)+Math.max(0,items.length-1)*gap;
   setCompact(available<required+8);
   document.documentElement.style.setProperty('--site-header-height',`${Math.ceil(node.getBoundingClientRect().height)}px`);
  };
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure)};
  const observer=new ResizeObserver(schedule);
  observer.observe(node);
  observer.observe(node.querySelector('.site-brand'));
  observer.observe(node.querySelector('.site-header-controls'));
  window.addEventListener('resize',schedule);
  document.fonts?.ready.then(schedule);
  measure();
  return()=>{active=false;cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('resize',schedule)};
 },[lang]);
 useEffect(()=>{if(!compact)setOpen(false)},[compact]);
 return <header ref={header} className="site-shell-header" data-compact={compact?'true':'false'}>
  <div className="site-header-top">
   <Link className="site-brand" to="/" aria-label={t('Mars Explorer home')}><Orbit size={28}/><span>MARS <b>EXPLORER</b></span></Link>
   <div className="site-header-controls">
    <AmbientSound/>
    <button className="site-theme" onClick={()=>setNebula(v=>!v)} aria-label={t('Switch to galaxy colors')} aria-pressed={nebula}><Palette size={19}/><span>{t(nebula?'Galaxy':'Midnight')}</span></button>
    <select value={lang} aria-label={t('Language')} onChange={e=>setLanguage(e.target.value)}><option value="en">ENG</option><option value="ru">RU</option><option value="tg">TJK</option></select>
    <button ref={menu} className="site-menu" aria-label={t(open?'Close menu':'Open menu')} aria-controls="main-site-navigation" aria-expanded={open} aria-hidden={!compact} tabIndex={compact?0:-1} onClick={()=>setOpen(v=>!v)}>{open?<X size={22}/>:<Menu size={22}/>}</button>
   </div>
  </div>
  <nav ref={nav} id="main-site-navigation" className={'site-header-nav'+(open?' expanded':'')} aria-label={t('Main navigation')} aria-hidden={compact&&!open} inert={compact&&!open}>
   {links.map(([path,label])=><Link key={path} aria-current={pathname===path?'page':undefined} to={path}>{t(label)}</Link>)}
  </nav>
 </header>;
}
