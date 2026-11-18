"use client";

import { useEffect, useRef } from "react";
import { createRippleRenderer } from "./rippleRenderer";

type Renderer = ReturnType<typeof createRippleRenderer>;
let renderer: Renderer | undefined;
let owner: HTMLSpanElement | null = null;
let releaseTimer: ReturnType<typeof setTimeout> | undefined;

/** Reuse the same wave field as different covers rotate into focus. */
export function WaterRipple() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const holder = ref.current;
    const image = holder?.parentElement?.querySelector("img");
    if (!holder || !image) return;
    clearTimeout(releaseTimer);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function detach() {
      if (owner !== holder) return;
      renderer?.detach();
      owner = null;
    }

    function move(event: PointerEvent) {
      if (!holder || !image) return;
      if (motion.matches || event.pointerType === "touch") {
        detach();
        return;
      }
      const rect = holder.getBoundingClientRect();
      const title = holder
        .closest("main, section")
        ?.querySelector("[data-reel-titles]");
      const bottom =
        title?.getBoundingClientRect().bottom ??
        rect.bottom + Math.max(60, rect.height * 0.28);
      const inside =
        rect.width > 0 &&
        rect.height > 0 &&
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= bottom;
      if (!inside) {
        if (owner === holder) renderer?.leave();
        return;
      }
      if (renderer === undefined) renderer = createRippleRenderer();
      if (!renderer?.attach(holder, image)) return;
      owner = holder;
      renderer.disturb(
        (event.clientX - rect.left) / rect.width,
        Math.max(0.005, 1 - (event.clientY - rect.top) / rect.height),
      );
    }

    function exit(event: PointerEvent) {
      if (!event.relatedTarget && owner === holder) renderer?.leave();
    }
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", exit);
    window.addEventListener("blur", detach);
    document.addEventListener("visibilitychange", detach);
    motion.addEventListener("change", detach);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", exit);
      window.removeEventListener("blur", detach);
      document.removeEventListener("visibilitychange", detach);
      motion.removeEventListener("change", detach);
      detach();
      // An active-card change mounts its replacement during the same commit.
      // Release GPU resources when navigation leaves the reel altogether.
      releaseTimer = setTimeout(() => {
        renderer?.destroy();
        renderer = undefined;
      }, 1000);
    };
  }, []);
  return (
    <span
      aria-hidden="true"
      ref={ref}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    />
  );
}
