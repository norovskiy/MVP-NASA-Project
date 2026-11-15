import React, { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, ContactShadows, Html, OrbitControls, useGLTF } from '@react-three/drei';
import { Box3, Vector3 } from 'three';
import { RotateCcw } from 'lucide-react';
import { t } from '../i18n';

function LoadedModel({ url }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const bounds = new Box3().setFromObject(clone);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    const scale = 3.1 / Math.max(size.x, size.y, size.z, 0.001);
    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    clone.scale.setScalar(scale);
    return clone;
  }, [scene]);
  return <primitive object={model} />;
}

function supportsWebGL() {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function ModelFailure({ robot }) {
  return <div className="model-failure" role="status">
    {robot.image && <img src={robot.image} alt={t(`Archival image of ${robot.name}`)} />}
    <div><strong>{t('3D preview is unavailable in this browser.')}</strong><span>{t('The archival photograph and mission details remain available below.')}</span></div>
  </div>;
}

class ModelErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError?.(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function RobotModelViewer({ robot }) {
  const [cameraReset, setCameraReset] = useState(0);
  const [webglAvailable, setWebglAvailable] = useState(supportsWebGL);
  const fallback = <ModelFailure robot={robot} />;
  return <div className="robot-model-viewer">
    {!webglAvailable ? fallback : <ModelErrorBoundary onError={() => setWebglAvailable(false)} fallback={fallback}>
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 1.2, 5.2], fov: 34 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
      <color attach="background" args={['#0b111a']} />
      <ambientLight intensity={1.35} />
      <directionalLight position={[-3, 5, 4]} intensity={2.6} color="#e5f4ff" />
      <pointLight position={[3, 1, -2]} intensity={38} color="#86d7ff" />
      <Suspense fallback={<Html center><span className="scene-loading">{t('Loading the 3D model…')}</span></Html>}>
        <Bounds key={`${robot.id}-${cameraReset}`} fit clip observe margin={1.35}>
          <LoadedModel url={robot.modelUrl} />
        </Bounds>
        <ContactShadows position={[0, -1.5, 0]} opacity={.42} scale={6} blur={2.6} far={4} />
      </Suspense>
      <OrbitControls key={cameraReset} makeDefault enableDamping dampingFactor={.07} minDistance={2.1} maxDistance={9} />
    </Canvas>
    </ModelErrorBoundary>}
    {webglAvailable && <div className="model-viewer-tools"><span>{t('DRAG TO ROTATE · SCROLL TO ZOOM')}</span><button onClick={() => setCameraReset(value => value + 1)} aria-label={t('Reset model camera')}><RotateCcw size={14} />{t('Reset view')}</button></div>}
    <a className="model-credit" href={robot.modelSource} target="_blank" rel="noreferrer">{t('NASA 3D model source')}</a>
  </div>;
}
