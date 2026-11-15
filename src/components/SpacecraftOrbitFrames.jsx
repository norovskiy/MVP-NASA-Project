import { useEffect, useRef } from "react";
import { t } from "../i18n";

// GPU-free orbit frames rendered from the very same NASA mesh in Blender.
// This is explicitly a rendered orbit, with horizontal view/zoom, not free 3D navigation.
export default function SpacecraftOrbitFrames({
  model,
  decorative,
  actions,
  onReady,
}) {
  const canvas = useRef(null),
    drag = useRef(null);
  useEffect(() => {
    const node = canvas.current,
      ctx = node.getContext("2d"),
      img = new Image();
    let active = true,
      frame = 0,
      angle = model.startFrame || 0,
      zoom = 1,
      running = true,
      visible = false,
      loaded = false,
      last = 0;
    let reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function draw(now) {
      frame = 0;
      if (!active || !loaded || !visible || document.hidden) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (running && !reduced && !drag.current) angle += dt * 0.7;
      const a = ((angle % 24) + 24) % 24,
        i = Math.floor(a),
        f = a - i,
        n = (i + 1) % 24,
        w = node.width,
        h = node.height,
        size = Math.min(w, h) * zoom;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 1 - f;
      ctx.drawImage(
        img,
        (i % 6) * 640,
        Math.floor(i / 6) * 640,
        640,
        640,
        (w - size) / 2,
        (h - size) / 2,
        size,
        size,
      );
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = f;
      ctx.drawImage(
        img,
        (n % 6) * 640,
        Math.floor(n / 6) * 640,
        640,
        640,
        (w - size) / 2,
        (h - size) / 2,
        size,
        size,
      );
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      if (running && !reduced) request();
    }
    function request() {
      if (!frame && active && visible) {
        last = performance.now();
        frame = requestAnimationFrame(draw);
      }
    }
    actions.current = {
      reset: () => {
        angle = model.startFrame || 0;
        zoom = 1;
        request();
      },
      pause: (v) => {
        running = !v;
        request();
      },
      zoom: (factor) => {
        zoom = Math.max(0.6, Math.min(2, zoom / factor));
        request();
      },
      focus: (i) => {
        angle = (model.startFrame || 0) + i * 6;
        zoom = i ? 1.15 : 1;
        request();
      },
      turn: (delta) => {
        angle += delta;
        request();
      },
    };
    img.onload = () => {
      loaded = true;
      onReady();
      request();
    };
    img.onerror = () => {};
    img.src = model.frames;
    const resize = new ResizeObserver(() => {
      const r = node.getBoundingClientRect(),
        d = Math.min(devicePixelRatio || 1, 1.5);
      node.width = Math.round(r.width * d);
      node.height = Math.round(r.height * d);
      request();
    });
    resize.observe(node);
    const view = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) request();
        else {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { threshold: 0.01 },
    );
    view.observe(node);
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else request();
    };
    document.addEventListener("visibilitychange", visibility);
    const media = matchMedia("(prefers-reduced-motion: reduce)"),
      motion = (e) => {
        reduced = e.matches;
        request();
      };
    media.addEventListener("change", motion);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      resize.disconnect();
      view.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      media.removeEventListener("change", motion);
    };
  }, [model.frames]);
  return (
    <canvas
      ref={canvas}
      className="spacecraft-orbit-frames"
      aria-hidden={decorative || undefined}
      role={decorative ? undefined : "img"}
      tabIndex={decorative ? undefined : 0}
      aria-label={
        decorative
          ? undefined
          : t("Rendered NASA model. Drag horizontally to turn the view.")
      }
      onPointerDown={(e) => {
        if (decorative) return;
        drag.current = e.clientX;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (drag.current !== null) {
          actions.current.turn?.((drag.current - e.clientX) / 35);
          drag.current = e.clientX;
        }
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          actions.current.turn?.(e.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    />
  );
}
