import { useEffect, useRef, useState } from "react";
import { RotateCcw, Pause, Play } from "lucide-react";
import SpacecraftOrbitFrames from "./SpacecraftOrbitFrames";
import { t } from "../i18n";
import { spacecraftModels } from "../data/spacecraftModels";

let webGLUnavailable = false;

// A NASA model in an illustrative lighting setup. No live attitude/position is implied.
export default function SpacecraftScene({
  missionId = "pioneer10",
  decorative = false,
  focusIndex = 0,
  inspection = false,
}) {
  const host = useRef(null),
    actions = useRef({}),
    [status, setStatus] = useState("loading"),
    [paused, setPaused] = useState(inspection);
  useEffect(() => {
    if (status === "ready" || status === "fallback")
      actions.current.focus?.(focusIndex);
  }, [focusIndex, status]);
  const model = spacecraftModels[missionId] || spacecraftModels.pioneer10;
  useEffect(() => {
    const mount = host.current;
    let active = true,
      cleanup = () => {};
    setStatus("loading");
    setPaused(inspection);
    if (webGLUnavailable) {
      setStatus("failed");
      return () => {
        active = false;
      };
    }
    Promise.all([
      import("three"),
      import("three/addons/loaders/GLTFLoader.js"),
      import("three/addons/controls/OrbitControls.js"),
      import("three/addons/environments/RoomEnvironment.js"),
    ])
      .then(([T, { GLTFLoader }, { OrbitControls }, { RoomEnvironment }]) => {
        if (!active) return;
        let renderer;
        try {
          renderer = new T.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
          });
        } catch {
          webGLUnavailable = true;
          setStatus("failed");
          return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, inspection ? 2 : 1.5));
        renderer.outputColorSpace = T.SRGBColorSpace;
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.toneMappingExposure = inspection ? 1 : 1.25;
        if(inspection){renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;}
        renderer.setClearColor(0x000000, 0);
        mount.appendChild(renderer.domElement);
        const scene = new T.Scene(),
          camera = new T.PerspectiveCamera(35, 1, 0.01, 100);
        camera.position.set(...(inspection ? [4.5, 2.3, 8.1] : [3.1, 1.5, 5.4]));
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.055;
        controls.enablePan = false;
        controls.minDistance = 2.8;
        controls.maxDistance = 10;
        controls.enabled = !decorative;
        controls.autoRotateSpeed = 0.35;
        const pmrem = new T.PMREMGenerator(renderer),
          room = new RoomEnvironment();
        const environment = pmrem.fromScene(room, 0.04);
        scene.environment = environment.texture;
        room.dispose();
        pmrem.dispose();
        scene.environmentIntensity = inspection ? .28 : .65;
        scene.add(new T.HemisphereLight(0xc4d8ff, 0x171622, inspection ? .9 : 1.7));
        const sun = new T.DirectionalLight(0xffe4be, inspection ? 2.6 : 3.8);
        sun.position.set(-4, 5, 5);
        if(inspection){sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.near=.1;sun.shadow.camera.far=25;sun.shadow.camera.left=-3;sun.shadow.camera.right=3;sun.shadow.camera.top=3;sun.shadow.camera.bottom=-3;sun.shadow.normalBias=.012;sun.shadow.bias=-.0001;}
        scene.add(sun);
        const rim = new T.DirectionalLight(0x84b5ef, inspection ? 1 : 2.1);
        rim.position.set(4, -1, -3);
        scene.add(rim);
        // Seeded distant stars: no fabricated telemetry or animated signal beams.
        const points = [];
        let seed = 7283;
        const rand = () => {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          return seed / 4294967296;
        };
        for (let i = 0; i < 480; i++) {
          const a = rand() * Math.PI * 2,
            b = Math.acos(2 * rand() - 1),
            r = 24 + rand() * 12;
          points.push(
            r * Math.sin(b) * Math.cos(a),
            r * Math.cos(b),
            r * Math.sin(b) * Math.sin(a),
          );
        }
        const starGeometry = new T.BufferGeometry();
        starGeometry.setAttribute(
          "position",
          new T.Float32BufferAttribute(points, 3),
        );
        const starMaterial = new T.PointsMaterial({
          color: 0xbcd5ef,
          size: 0.045,
          transparent: true,
          opacity: decorative ? 0.35 : 0.55,
          depthWrite: false,
        });
        const sky = new T.Points(starGeometry, starMaterial);
        if (!decorative) scene.add(sky);
        let destination = null;
        let object,
          frame = 0,
          visible = false,
          running = !inspection,
          documentVisible = !document.hidden,
          motion = matchMedia("(prefers-reduced-motion: reduce)").matches,
          last = 0;
        const draw = () => {
          frame = 0;
          if (!active || !visible || !documentVisible) return;
          const now = performance.now(),
            delta = Math.min(0.05, (now - last) / 1000);
          last = now;
          controls.autoRotate = running && !motion;
          if (destination) {
            camera.position.lerp(destination, motion ? 1 : 0.075);
            if (camera.position.distanceTo(destination) < 0.005)
              destination = null;
          }
          controls.update(delta);
          renderer.render(scene, camera);
          if (((running && !motion) || destination) && !frame)
            frame = requestAnimationFrame(draw);
        };
        const request = () => {
          if (!frame && active && visible && documentVisible) {
            last = performance.now();
            frame = requestAnimationFrame(draw);
          }
        };
        controls.addEventListener("change", request);
        const resize = new ResizeObserver(() => {
          const r = mount.getBoundingClientRect();
          if (!r.width || !r.height) return;
          renderer.setSize(r.width, r.height, false);
          camera.aspect = r.width / r.height;
          camera.updateProjectionMatrix();
          request();
        });
        resize.observe(mount);
        const observer = new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
            if (visible) request();
            else {
              cancelAnimationFrame(frame);
              frame = 0;
            }
          },
          { threshold: 0.01 },
        );
        observer.observe(mount);
        const onVisibility = () => {
          documentVisible = !document.hidden;
          if (documentVisible) request();
          else {
            cancelAnimationFrame(frame);
            frame = 0;
          }
        };
        document.addEventListener("visibilitychange", onVisibility);
        const media = matchMedia("(prefers-reduced-motion: reduce)"),
          onMotion = (e) => {
            motion = e.matches;
            request();
          };
        media.addEventListener("change", onMotion);
        actions.current = {
          focus: (index) => {
            destination = new T.Vector3(
              ...(inspection ? [
                [1.2, .8, 3.2], [-1, .8, 3], [1, -.3, 3],
              ] : [
                [3.1, 1.5, 5.4],
                [-2, 1.1, 4.5],
                [1.6, -0.4, 4.2],
              ])[index % 3],
            );
            request();
          },
          reset: () => {
            destination = null;
            camera.position.set(...(inspection ? [1.2, .8, 3.2] : [3.1, 1.5, 5.4]));
            controls.target.set(0, 0, 0);
            controls.update();
            request();
          },
          pause: (value) => {
            running = !value;
            controls.autoRotate = running && !motion;
            request();
          },
          zoom: (factor) => {
            destination = null;
            camera.position.multiplyScalar(factor);
            controls.update();
            request();
          },
        };
        new GLTFLoader().load(
          model.url,
          (gltf) => {
            if (!active) {
              gltf.scene.traverse((n) => {
                n.geometry?.dispose();
                if (n.material)
                  (Array.isArray(n.material)
                    ? n.material
                    : [n.material]
                  ).forEach((m) => m.dispose());
              });
              return;
            }
            object = gltf.scene;
            object.traverse(node=>{if(node.isMesh){node.castShadow=inspection;node.receiveShadow=inspection;for(const material of (Array.isArray(node.material)?node.material:[node.material])){for(const map of [material.map,material.normalMap,material.roughnessMap,material.metalnessMap])if(map)map.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);}}});
            const box = new T.Box3().setFromObject(object),
              size = box.getSize(new T.Vector3()),
              center = box.getCenter(new T.Vector3());
            const pivot = new T.Group();
            object.position.sub(center);
            pivot.add(object);
            pivot.scale.setScalar(3.2 / Math.max(size.x, size.y, size.z));
            pivot.rotation.set(...(model.rotation || [0, 0, 0]));
            scene.add(pivot);
            setStatus("ready");
            request();
          },
          undefined,
          () => {
            if (active) {
              setStatus("failed");
              request();
            }
          },
        );
        cleanup = () => {
          cancelAnimationFrame(frame);
          resize.disconnect();
          observer.disconnect();
          document.removeEventListener("visibilitychange", onVisibility);
          media.removeEventListener("change", onMotion);
          controls.dispose();
          scene.traverse((n) => {
            n.geometry?.dispose();
            if (n.material)
              (Array.isArray(n.material) ? n.material : [n.material]).forEach(
                (m) => {
                  for (const value of Object.values(m))
                    if (value?.isTexture) value.dispose();
                  m.dispose();
                },
              );
          });
          environment.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
        request();
      })
      .catch(() => {
        if (active) setStatus("failed");
      });
    return () => {
      active = false;
      cleanup();
      actions.current = {};
    };
  }, [model.url, decorative, inspection]);
  return (
    <div
      className={
        "spacecraft-stage" + (decorative ? " spacecraft-decorative" : "")
      }
    >
      <div
        ref={host}
        className="spacecraft-render"
        aria-hidden={decorative || undefined}
        role={decorative ? undefined : "img"}
        aria-label={
          decorative ? undefined : t("Interactive NASA spacecraft model")
        }
      />
      {status === "loading" && (
        <span className="spacecraft-status">
          {t("Preparing the spacecraft…")}
        </span>
      )}
      {(status === "failed" || status === "fallback") && (
        <SpacecraftOrbitFrames
          model={model}
          decorative={decorative}
          actions={actions}
          onReady={() => setStatus("fallback")}
          initialPaused={inspection}
          framingScale={inspection ? 1.9 : 1}
        />
      )}
      {!decorative && (
        <>
          <div className="spacecraft-legend">
            <span>
              {t(
                status === "failed" || status === "fallback"
                  ? "NASA MODEL · RENDERED ORBIT VIEW"
                  : "NASA 3D MODEL · ILLUSTRATIVE VIEW",
              )}
            </span>
            <small>
              {t(
                model.note ||
                  (status === "fallback" || status === "failed"
                    ? "Drag horizontally · buttons to zoom"
                    : "Drag to orbit · scroll to approach"),
              )}
            </small>
          </div>
          <div className="spacecraft-tools">
            <button
              onClick={() => {
                const next = !paused;
                setPaused(next);
                actions.current.pause?.(next);
              }}
              aria-label={t(paused ? "Resume camera" : "Pause camera")}
            >
              {paused ? <Play size={15} /> : <Pause size={15} />}
            </button>
            <button
              onClick={() => actions.current.zoom?.(1.15)}
              aria-label={t("Zoom out")}
            >
              −
            </button>
            <button
              onClick={() => actions.current.zoom?.(0.87)}
              aria-label={t("Zoom in")}
            >
              +
            </button>
            <button
              onClick={() => actions.current.reset?.()}
              aria-label={t("Reset view")}
            >
              <RotateCcw size={16} />
            </button>
            <a href={model.source} target="_blank" rel="noreferrer">
              {t("Model source")} ↗
            </a>
          </div>
        </>
      )}
    </div>
  );
}
