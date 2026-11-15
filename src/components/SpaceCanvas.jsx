import { useEffect, useRef } from "react";
import { clamp, smoothstep, stars } from "../scene/noise";
import {
  planetKeyframes,
  samplePlanet,
  textureSources,
} from "../scene/planets";
import { useScrollScene } from "../scene/useScrollScene";

const defaultTextureSize = 1024;
const linearColors = Float32Array.from({ length: 256 }, (_, i) => {
  const v = i / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
});
const displayColors = Uint8Array.from({ length: 4097 }, (_, i) => {
  const v = i / 4096;
  return Math.round(
    255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055),
  );
});

// Convert a real equirectangular planet map into a lit, antialiased sphere once at startup.
function bakeSphere(image, planet) {
  const textureSize =
    innerWidth < 700 ? 768 : planet.kind === "mars" ? 1536 : defaultTextureSize;
  const ct = Math.cos(planet.tilt || 0),
    st = Math.sin(planet.tilt || 0);
  const source = document.createElement("canvas");
  source.width = image.naturalWidth;
  source.height = image.naturalHeight;
  const sourceContext = source.getContext("2d", { willReadFrequently: true });
  sourceContext.drawImage(image, 0, 0);
  const map = sourceContext.getImageData(0, 0, source.width, source.height);
  const sphere = document.createElement("canvas");
  sphere.width = textureSize;
  sphere.height = textureSize;
  const context = sphere.getContext("2d");
  const output = context.createImageData(textureSize, textureSize);
  const radius = textureSize / 2;
  const [lx, ly, lz] = planet.light;
  const length = Math.hypot(lx, ly, lz) || 1;
  const light = [lx / length, ly / length, lz / length];
  const twoPi = Math.PI * 2;

  for (let y = 0; y < textureSize; y += 1) {
    const ny = -(y + 0.5 - radius) / radius;
    for (let x = 0; x < textureSize; x += 1) {
      const nx = (x + 0.5 - radius) / radius;
      const distanceSq = nx * nx + ny * ny;
      if (distanceSq > 1) continue;
      const nz = Math.sqrt(1 - distanceSq);
      const mapY = ny * ct - nz * st,
        mapZ = ny * st + nz * ct;
      const longitude = Math.atan2(nx, mapZ) + planet.longitude;
      const latitude = Math.asin(Math.max(-1, Math.min(1, mapY)));
      const u = (((longitude / twoPi + 0.5) % 1) + 1) % 1;
      const v = clamp(0.5 - latitude / Math.PI, 0, 0.999999);
      const sourceIndex =
        (Math.floor(v * source.height) * source.width +
          Math.floor(u * source.width)) *
        4;
      const outputIndex = (y * textureSize + x) * 4;
      const normalLight = Math.max(
        0,
        nx * light[0] + ny * light[1] + nz * light[2],
      );
      const ambient = planet.kind === "mars" ? 0.022 : 0.012;
      const illumination =
        ambient + (1 - ambient) * Math.pow(normalLight, 0.82) * 1.16;
      const edgeAlpha = clamp((1 - Math.sqrt(distanceSq)) * textureSize * 1.5);
      for (let channel = 0; channel < 3; channel++) {
        const linear = linearColors[map.data[sourceIndex + channel]];
        const lit = Math.min(1, linear * illumination);
        output.data[outputIndex + channel] =
          displayColors[Math.round(lit * 4096)];
      }
      output.data[outputIndex + 3] = Math.round(edgeAlpha * 255);
    }
  }
  context.putImageData(output, 0, 0);
  return sphere;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error(`Could not load planet map: ${src}`));
    image.src = src;
  });
}

// Fixed 2D canvas stays behind the real page text; only canvas pixels animate with scroll.
export default function SpaceCanvas({ sectionRef, timeline }) {
  const drawFrameRef = useRef(null);
  const textureRef = useRef({});
  const themeRef = useRef("midnight");
  const { canvasRef, invalidate } = useScrollScene(drawFrameRef, sectionRef);

  // Repaint a settled canvas when the shared DOM theme changes: no scrolling required.
  useEffect(() => {
    const syncTheme = () => {
      themeRef.current = document.documentElement.dataset.theme || "midnight";
      invalidate();
    };
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [invalidate]);

  useEffect(() => {
    let cancelled = false;
    // A missing map must not hide every other body.
    for (const planet of planetKeyframes) {
      loadImage(textureSources[planet.kind])
        .then((image) => {
          if (cancelled) return;
          const started = performance.now();
          textureRef.current[planet.kind] = bakeSphere(image, planet);
          if (canvasRef.current)
            canvasRef.current.dataset.lastBakeMs = String(
              Math.round(performance.now() - started),
            );
          performance.measure?.(`journey-bake-${planet.kind}`, {
            start: started,
            end: performance.now(),
          });
          invalidate();
        })
        .catch((error) => console.warn(error.message));
    }
    return () => {
      cancelled = true;
    };
  }, [invalidate]);

  drawFrameRef.current = (ctx, width, height, progress, velocity, opacity) => {
    timeline?.publish(progress);
    const warm = 1 - smoothstep(clamp((progress - 0.14) / 0.27));
    const nebula = themeRef.current === "nebula";
    const background = ctx.createLinearGradient(0, 0, 0, height);
    background.addColorStop(
      0,
      nebula ? `rgb(${Math.round(23 + warm * 6)},18,43)` : `rgb(${Math.round(10 + warm * 10)},${Math.round(16 + warm * 2)},${Math.round(29 - warm * 9)})`,
    );
    background.addColorStop(1, nebula ? "#111d36" : "#091321");
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
    // Broad faint color clouds add depth without changing planetary lighting.
    const haze = ctx.createRadialGradient(width * .75, height * .32, 0, width * .75, height * .32, width * .65);
    haze.addColorStop(0, nebula ? "#8461be36" : "#315d8030");
    haze.addColorStop(1, "#315d8000");
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = opacity;
    const centerX = width / 2;
    const rise = smoothstep(clamp((progress - 0.62) / 0.3));
    const centerY = height * (0.5 + rise * 0.18);
    const halfDiagonal = Math.hypot(width, height) / 2;
    for (const star of stars) {
      const speed = 0.3 + star.brightness * 0.7;
      const q = (((star.depth + progress * 3 * speed) % 1) + 1) % 1;
      const radius = q * halfDiagonal * 1.05;
      const x = centerX + Math.cos(star.angle) * radius;
      const y =
        centerY + Math.sin(star.angle) * radius - rise * height * 0.2 * speed;
      const alpha = clamp(q * 5) * star.brightness * 0.72;
      const streak =
        clamp(velocity * 3 * speed * halfDiagonal * 22, -30, 30) * q;
      ctx.strokeStyle = `rgba(208,226,255,${alpha})`;
      ctx.fillStyle = `rgba(230,240,255,${alpha})`;
      ctx.lineWidth = star.size * (0.5 + q);
      ctx.beginPath();
      if (Math.abs(streak) > 1) {
        ctx.moveTo(
          x - Math.cos(star.angle) * streak,
          y - Math.sin(star.angle) * streak,
        );
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.arc(x, y, star.size * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // A distant Sun keeps a consistent camera-space direction; bodies naturally occult it.
    const sunX = width * 0.89,
      sunY = height * 0.19;
    const sunGlow = ctx.createRadialGradient(
      sunX,
      sunY,
      0,
      sunX,
      sunY,
      Math.min(width, height) * 0.15,
    );
    sunGlow.addColorStop(0, `rgba(255,224,176,${0.28 + warm * 0.15})`);
    sunGlow.addColorStop(0.08, "rgba(241,192,128,.11)");
    sunGlow.addColorStop(1, "rgba(200,142,85,0)");
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#fff4da";
    ctx.beginPath();
    ctx.arc(sunX, sunY, 2.1, 0, Math.PI * 2);
    ctx.fill();
    const unit = Math.max(width, height) * 0.5;
    // Real mapped spheres follow scroll keyframes; the spacecraft uses its own NASA mesh.
    for (const planet of planetKeyframes) {
      const position = samplePlanet(planet, progress);
      const texture = textureRef.current[planet.kind];
      if (!position || !texture) continue;

      const alpha = position.alpha;
      let x = position.x * width;
      let y = position.y * height;
      let radius = position.radius * unit;
      // Portrait: horizons stay below the text, while the Moon remains a visible right limb.
      if (height > width) {
        if (planet.kind === "mars") {
          x = width * 1.04;
          y = height * (0.8 + (position.y - 0.69) * 0.47);
          radius *= 0.78;
        } else {
          x = width * 1.12;
          y = height * (0.9 + (position.y - 0.8) * 0.72);
          radius *= 0.72;
        }
      }
      if (alpha <= 0.002 || radius < 1) continue;

      ctx.save();
      ctx.globalAlpha = opacity * alpha;
      if (planet.atmosphere) {
        ctx.save();
        const lightAngle = Math.atan2(-planet.light[1], planet.light[0]);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(
          x,
          y,
          radius * 1.05,
          lightAngle - Math.PI / 2,
          lightAngle + Math.PI / 2,
        );
        ctx.closePath();
        ctx.clip();
        ctx.globalCompositeOperation = "screen";
        const atmosphere = ctx.createRadialGradient(
          x,
          y,
          radius * 0.997,
          x,
          y,
          radius * 1.014,
        );
        atmosphere.addColorStop(0, `${planet.glow}00`);
        atmosphere.addColorStop(0.48, `${planet.glow}08`);
        atmosphere.addColorStop(0.91, `${planet.glow}16`);
        atmosphere.addColorStop(1, `${planet.glow}00`);
        ctx.fillStyle = atmosphere;
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.014, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(texture, x - radius, y - radius, radius * 2, radius * 2);

      ctx.restore();
    }
    ctx.restore();
  };

  return <canvas ref={canvasRef} className="space-canvas" aria-hidden="true" />;
}
