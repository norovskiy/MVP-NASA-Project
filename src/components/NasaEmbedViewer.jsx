import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { t } from '../i18n';

// NASA hosts the Curiosity model as an interactive embedded viewer, not a single GLB.
export default function NasaEmbedViewer({ robot }) {
  const [reset, setReset] = useState(0);
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    setStatus('loading');
    const timeout = window.setTimeout(() => setStatus(current => current === 'loading' ? 'failed' : current), 12000);
    return () => window.clearTimeout(timeout);
  }, [reset]);
  if (status === 'failed') return <div className="robot-model-viewer model-failure nasa-model-failure" role="status">
    {robot.image && <img src={robot.image} alt={t(`Archival image of ${robot.name}`)} />}
    <div><strong>{t('NASA’s 3D viewer did not load. Use the mission photo and open the NASA model page.')}</strong></div>
    <a className="model-credit" href={robot.modelSource} target="_blank" rel="noreferrer">{t('NASA 3D model source')}</a>
  </div>;
  return <div className="robot-model-viewer nasa-embed-viewer">
    {status === 'loading' && robot.image && <img className="nasa-embed-preview" src={robot.image} alt={t(`Archival image of ${robot.name}`)} />}
    {status === 'loading' && <span className="nasa-embed-loading" role="status">{t('Loading the NASA 3D model…')}</span>}
    <iframe key={reset} src={robot.modelEmbedUrl} title={`${robot.name} NASA interactive 3D model`} loading="lazy" allow="fullscreen" style={{opacity:status==='loading'?0:1}} onLoad={() => setStatus(current => current === 'loading' ? 'loaded' : current)} onError={() => setStatus('failed')} />
    <div className="model-viewer-tools"><span>{t('DRAG TO ROTATE · SCROLL TO ZOOM')}</span><button onClick={() => setReset(value => value + 1)}><RotateCcw size={14} />{t('Reset view')}</button></div>
    <a className="model-credit" href={robot.modelSource} target="_blank" rel="noreferrer">{t('NASA 3D model source')}</a>
  </div>;
}
