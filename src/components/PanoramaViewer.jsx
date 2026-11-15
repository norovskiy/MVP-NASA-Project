import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { t } from '../i18n';

// Cylindrical source -> perspective view. Vertical gaps remain unfilled.
// This is a camera turn in a historical mosaic, not movement through 3D terrain.
export default function PanoramaViewer({ src, verticalFocus = .28 }) {
  const canvas = useRef(null), image = useRef(null), drag = useRef(null);
  const [yaw, setYaw] = useState(0), [fov, setFov] = useState(70);
  const [vertical, setVertical] = useState(verticalFocus);
  const [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const [size, setSize] = useState([900, 440]);
  useEffect(() => {
    let active = true;
    setReady(false); setFailed(false);
    const img = new Image();
    img.onload = () => { if (active) { image.current = img; setReady(true); } };
    img.onerror = () => { if (active) setFailed(true); };
    img.src = src;
    const node = canvas.current;
    const observer = new ResizeObserver(entries => {
      const r = entries[0].contentRect;
      setSize([Math.max(1, r.width), Math.max(1, r.height)]);
    });
    if (node) observer.observe(node);
    return () => { active = false; observer.disconnect(); };
  }, [src]);
  useEffect(() => {
    if (!ready || !canvas.current) return;
    const id = requestAnimationFrame(() => {
      const node = canvas.current, img = image.current;
      const w = Math.min(1400, Math.round(size[0] * Math.min(devicePixelRatio || 1, 1.5)));
      const h = Math.round(w * size[1] / size[0]);
      node.width = w; node.height = h;
      const ctx = node.getContext('2d');
      ctx.fillStyle = '#050709'; ctx.fillRect(0, 0, w, h);
      const focal = w / (2 * Math.tan(fov * Math.PI / 360));
      const pixelsPerRadian = img.naturalWidth / (2 * Math.PI);
      for (let x = 0; x < w; x += 2) {
        const theta = Math.atan((x + 1 - w / 2) / focal);
        const u = ((0.5 + yaw / 360 + theta / (2 * Math.PI)) % 1 + 1) % 1;
        const scale = focal / (pixelsPerRadian * Math.cos(theta));
        const sourceWidth = Math.max(1, 2 * pixelsPerRadian * Math.cos(theta) ** 2 / focal);
        const sx = u * img.naturalWidth;
        const sw = Math.min(sourceWidth, img.naturalWidth - sx);
        ctx.drawImage(img, sx, 0, sw, img.naturalHeight, x, h * .42 - img.naturalHeight * scale * vertical, 2.1, img.naturalHeight * scale);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [yaw, fov, ready, size, vertical]);
  const turn = delta => setYaw(v => (v + delta) % 360);
  return <div className="cylinder-viewer">
    {failed ? <p role="status">{t('Panorama unavailable. The archive photograph and source are still available.')}</p> : <canvas ref={canvas} tabIndex={0} role="img" aria-label={t('Historical 360-degree panorama. Use left and right arrows to turn.')} onPointerDown={e => { drag.current = {x:e.clientX,y:e.clientY}; e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={e => { if (drag.current !== null) { turn((drag.current.x - e.clientX) * fov / size[0]); setVertical(v => Math.max(0,Math.min(1,v+(drag.current.y-e.clientY)/size[0]))); drag.current = {x:e.clientX,y:e.clientY}; } }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onKeyDown={e => { if (['ArrowLeft','ArrowRight'].includes(e.key)) { e.preventDefault(); turn(e.key === 'ArrowLeft' ? -8 : 8); } }} />}
    {!ready && !failed && <span className="cylinder-loading" role="status">{t('Loading the historical panorama…')}</span>}
    <div className="cylinder-tools"><button onClick={() => turn(-15)} aria-label={t('Turn left')}><ChevronLeft size={18}/></button><span>{t('Drag to turn')} · 360°</span><button onClick={() => turn(15)} aria-label={t('Turn right')}><ChevronRight size={18}/></button><button onClick={() => setFov(v => Math.min(90, v + 10))} aria-label={t('Zoom out')}><Minus size={17}/></button><button onClick={() => setFov(v => Math.max(40, v - 10))} aria-label={t('Zoom in')}><Plus size={17}/></button><button onClick={() => { setYaw(0); setFov(70); setVertical(verticalFocus); }} aria-label={t('Reset view')}><RotateCcw size={16}/></button></div>
  </div>;
}
