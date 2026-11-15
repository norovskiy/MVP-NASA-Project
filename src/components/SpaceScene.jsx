import LightGlobe from "./LightGlobe";
import { t } from "../i18n";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture, Stars, Html } from "@react-three/drei";
import { Vector3, SRGBColorSpace } from "three";
import gsap from "gsap";
import { missions, getMission } from "../data/missions";
import { useExplorerStore } from "../store/useExplorerStore";
export const latLonToVector = (lat, lon, r = 2.34) => {
  const a = (lat * Math.PI) / 180,
    b = (lon * Math.PI) / 180;
  return new Vector3(
    r * Math.cos(a) * Math.cos(b),
    r * Math.sin(a),
    -r * Math.cos(a) * Math.sin(b),
  );
};
class SceneBoundary extends React.Component {
  state = {
    failed: false,
  };
  static getDerivedStateFromError() {
    return {
      failed: true,
    };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
// Shared native sphere: no GLB cloning or UV reconstruction on route changes.
function Planet({ name }) {
  const map = useTexture(`/models/${name}.jpg`);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 2;
  return (
    <mesh>
      <sphereGeometry args={[2.3, 64, 32]} />
      <meshStandardMaterial map={map} roughness={0.96} />
    </mesh>
  );
}
function Marker({ mission, onEnter }) {
  const v = latLonToVector(mission.lat, mission.lon),
    pin = useRef();
  const { camera } = useThree();
  // Hide the far hemisphere without clipping HTML labels against the sphere.
  useFrame(() => {
    if (pin.current)
      pin.current.style.visibility =
        v.dot(camera.position) > 0 ? "visible" : "hidden";
  });
  return (
    <Html position={v.toArray()} center zIndexRange={[24, 21]}>
      <button
        ref={pin}
        className="globe-pin"
        aria-label={t("Explore ") + t(mission.name)}
        title={t(mission.name)}
        onClick={() => onEnter(mission.id)}
      >
        <span aria-hidden="true" />
        <span className="pin-label">{t(mission.name)}</span>
      </button>
    </Html>
  );
}
function CameraRig({ controls }) {
  const { camera, invalidate } = useThree();
  const { planet, reset, focus, descending } = useExplorerStore();
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    c.enabled = false;
    const mission = getMission(focus);
    // Center the default camera on real landing regions. The Moon's Apollo sites
    // share one near-side region; Mars sites remain geographically dispersed.
    const defaultView =
      planet === "moon"
        ? latLonToVector(12, 15, 8.5)
        : latLonToVector(-2, 105, 8.5);
    const target = mission
      ? latLonToVector(mission.lat, mission.lon, descending ? 2.55 : 6.8)
      : defaultView;
    if (descending && !mission) target.set(0, 0.1, 2.55);
    const anim = gsap.to(camera.position, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration: reduced ? 0 : descending ? 1.15 : 1.5,
      ease: "power3.inOut",
      onUpdate: () => {
        invalidate();
        camera.lookAt(0, 0, 0);
        if (!descending) c.update();
      },
      onComplete: () => {
        if (!descending) c.enabled = true;
      },
    });
    invalidate();
    return () => {
      anim.kill();
      c.enabled = true;
    };
  }, [planet, reset, focus, descending, camera, controls, invalidate]);
  return null;
}
function World({ onEnter, onContextLost }) {
  const ref = useRef();
  const { planet, rotating, descending } = useExplorerStore();
  const { gl } = useThree();
  useEffect(() => {
    const cb = (e) => {
      e.preventDefault();
      onContextLost();
    };
    gl.domElement.addEventListener("webglcontextlost", cb);
    return () => gl.domElement.removeEventListener("webglcontextlost", cb);
  }, [gl, onContextLost]);
  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight position={[-5, 4, 6]} intensity={2.6} color="#fff5e8" />
      <Stars
        radius={80}
        depth={35}
        count={450}
        factor={1.1}
        saturation={0}
        fade
        speed={0}
      />
      <Suspense
        fallback={
          <Html center>
            <span className="scene-loading">
              {t("Preparing ")}
              {planet}…
            </span>
          </Html>
        }
      >
        <Planet name={planet} />
        {missions
          .filter(
            (m) =>
              m.planet === planet &&
              Number.isFinite(m.lat) &&
              Number.isFinite(m.lon),
          )
          .map((m) => (
            <Marker key={m.id} mission={m} onEnter={onEnter} />
          ))}
      </Suspense>
      <OrbitControls
        ref={ref}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.065}
        minDistance={4.8}
        maxDistance={13}
        autoRotate={
          rotating &&
          !descending &&
          !matchMedia("(prefers-reduced-motion: reduce)").matches
        }
        autoRotateSpeed={0.28}
      />
      <CameraRig controls={ref} />
    </>
  );
}
export default function SpaceScene({ onEnter }) {
  const rotating = useExplorerStore((state) => state.rotating);
  const [supported, setSupported] = useState(() => {
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (context) context.getExtension("WEBGL_lose_context")?.loseContext();
      return !!context;
    } catch {
      return false;
    }
  });
  const fallback = <LightGlobe onEnter={onEnter} />;
  return (
    <SceneBoundary fallback={fallback}>
      <div className="space-canvas">
        {supported ? (
          <Canvas
            frameloop={rotating ? "always" : "demand"}
            dpr={[1, 1.25]}
            camera={{
              position: [
                latLonToVector(-2, 105, 8.5).x,
                latLonToVector(-2, 105, 8.5).y,
                latLonToVector(-2, 105, 8.5).z,
              ],
              fov: 42,
              near: 0.04,
              far: 200,
            }}
            gl={{
              antialias: false,
              alpha: true,
              powerPreference: "high-performance",
            }}
          >
            <World
              onEnter={onEnter}
              onContextLost={() => setSupported(false)}
            />
          </Canvas>
        ) : (
          fallback
        )}
      </div>
    </SceneBoundary>
  );
}
