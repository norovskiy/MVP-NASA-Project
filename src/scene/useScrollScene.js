import { useCallback, useEffect, useRef } from "react";
import { clamp } from "./noise";

// Read page geometry only on resize; scroll frames use the cached stage bounds.
export function useScrollScene(drawFrameRef, sectionRef) {
  const canvasRef = useRef(null);
  const invalidateRef = useRef(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return undefined;

    let width = 1;
    let height = 1;
    let pixelRatio = 1;
    let sectionTop = 0;
    let sectionHeight = window.innerHeight * 3;
    let targetProgress = 0;
    let targetOpacity = 0;
    let currentProgress = 0;
    let currentOpacity = 0;
    let frameId = 0;
    let reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const measure = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      const section = sectionRef?.current;
      if (section) {
        const bounds = section.getBoundingClientRect();
        sectionTop = bounds.top + (window.scrollY || 0);
        sectionHeight = Math.max(height, bounds.height);
      }
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      updateTarget();
    };

    const schedule = () => {
      if (!frameId) frameId = requestAnimationFrame(render);
    };

    // Normalize scroll only across the hero track, then fade the fixed canvas out below it.
    function updateTarget() {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const travel = Math.max(1, sectionHeight - height);
      targetProgress = clamp((scrollY - sectionTop) / travel);
      targetOpacity = 1;
      schedule();
    }

    function render() {
      frameId = 0;
      const previous = currentProgress;
      const factor = reducedMotion ? 1 : 0.09;
      currentProgress += (targetProgress - currentProgress) * factor;
      currentOpacity += (targetOpacity - currentOpacity) * factor;
      const velocity = reducedMotion ? 0 : currentProgress - previous;
      ctx.clearRect(0, 0, width, height);
      drawFrameRef.current?.(
        ctx,
        width,
        height,
        currentProgress,
        velocity,
        currentOpacity,
      );
      if (
        Math.abs(targetProgress - currentProgress) > 0.0002 ||
        Math.abs(targetOpacity - currentOpacity) > 0.002
      ) {
        schedule();
      } else {
        ctx.clearRect(0, 0, width, height);
        drawFrameRef.current?.(
          ctx,
          width,
          height,
          targetProgress,
          0,
          targetOpacity,
        );
      }
    }

    const onMotionChange = (event) => {
      reducedMotion = event.matches;
      schedule();
    };
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    measure();
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    media.addEventListener?.("change", onMotionChange);
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);
    if (sectionRef?.current) observer.observe(sectionRef.current);
    invalidateRef.current = schedule;

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", measure);
      media.removeEventListener?.("change", onMotionChange);
      observer.disconnect();
      invalidateRef.current = () => {};
    };
  }, [drawFrameRef]);

  const invalidate = useCallback(() => invalidateRef.current(), []);
  return { canvasRef, invalidate };
}
