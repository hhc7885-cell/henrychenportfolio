"use client";

import { publicAsset } from "@/lib/public-asset";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import projects from "./work/projects.json";
import { WaterRipple } from "./WaterRipple";
import { OrbitSeal } from "./OrbitSeal";
import { ReelTitles } from "./ReelTitles";
import styles from "./hero.module.css";

const slots = 11;
const wrap = (n: number) =>
  ((n % projects.length) + projects.length) % projects.length;
const clamp = (value: number, low: number, high: number) =>
  Math.max(low, Math.min(high, value));
type Phase = "opening" | "landing" | "browse";
let seenInDocument = false;

function geometry(width: number, height: number) {
  const phone = width < 760;
  const w = phone
    ? width - 32
    : width < 1100
      ? Math.min(width * 0.8, height * 0.832)
      : Math.min(width * 0.56, height * 0.96);
  const h = w / 1.6,
    radius = h * (phone ? 2.9 : width < 1100 ? 2.5 : 2.4);
  const angle = (31 * Math.PI) / 180;
  const projected = 2200 / (2200 + radius * (1 - Math.cos(angle)));
  const band = Math.max(
    60,
    (radius * Math.sin(angle) - (h / 2) * Math.cos(angle)) * projected - h / 2,
  );
  const mid = height / 2 - Math.round(band / 2);
  const fontSize = Math.min(
    width * (phone ? 0.115 : 0.075),
    band * (phone ? 0.86 : 0.8),
  );
  return { w, h, radius, band, mid, fontSize, phone };
}

export default function Hero() {
  const [position, setPosition] = useState(0);
  const [size, setSize] = useState([1440, 900]);
  const [phase, setPhase] = useState<Phase>("opening");
  const [reveal, setReveal] = useState(0);
  const target = useRef(0),
    lastInput = useRef(0),
    dragged = useRef(false);
  const root = useRef<HTMLElement>(null),
    drum = useRef<HTMLDivElement>(null),
    cursor = useRef<HTMLSpanElement>(null);
  const { w, h, radius, band, mid, fontSize, phone } = geometry(
    size[0],
    size[1],
  );
  const active = Math.round(position),
    p = projects[wrap(active)];

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(pointer: coarse)");
    const began = performance.now();
    let state: Phase = seenInDocument || reduced.matches ? "browse" : "opening";
    let current = state === "opening" ? 2.15 : 0,
      last = began,
      landAt = 0,
      landFrom = 0,
      frame = 0;
    let finger: number | null = null,
      previousY = 0,
      velocity = 0,
      travel = 0;
    let aimX = 0,
      aimY = 0,
      tiltX = 0,
      tiltY = 0;
    function setMode(next: Phase) {
      state = next;
      setPhase(next);
    }
    function land(now: number) {
      if (state !== "opening") return;
      landAt = now;
      landFrom = current - Math.round(current - 1.04);
      current = landFrom;
      target.current = 0;
      seenInDocument = true;
      setMode("landing");
    }
    function takeControl(now: number) {
      if (state === "opening") {
        land(now);
        return false;
      }
      if (state === "landing") {
        target.current = Math.round(current);
        setReveal(1);
        setMode("browse");
      }
      return !document.querySelector("dialog[open]");
    }
    function wheel(e: WheelEvent) {
      if (document.querySelector("dialog[open]") || e.ctrlKey) return;
      e.preventDefault();
      const now = performance.now();
      if (!takeControl(now)) return;
      if (root.current) root.current.dataset.browsed = "true";
      const pixels =
        e.deltaY *
        (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
      target.current += clamp(pixels * 0.0024, -0.55, 0.55);
      lastInput.current = now;
    }
    function key(e: KeyboardEvent) {
      if (document.querySelector("dialog[open]")) return;
      const direction = ["ArrowDown", "ArrowRight"].includes(e.key)
        ? 1
        : ["ArrowUp", "ArrowLeft"].includes(e.key)
          ? -1
          : 0;
      if (!direction) return;
      e.preventDefault();
      if (!takeControl(performance.now())) return;
      if (root.current) root.current.dataset.browsed = "true";
      target.current = Math.round(target.current) + direction;
      lastInput.current = 0;
    }
    function down(e: PointerEvent) {
      if (!root.current?.contains(e.target as Node)) return;
      dragged.current = false;
      if (!takeControl(performance.now()) || e.pointerType === "mouse") return;
      finger = e.pointerId;
      previousY = e.clientY;
      velocity = 0;
      travel = 0;
    }
    function move(e: PointerEvent) {
      if (e.pointerType === "mouse") {
        aimX = clamp((2 * e.clientX) / innerWidth - 1, -1, 1) * 5;
        aimY = clamp(1 - (2 * e.clientY) / innerHeight, -1, 1) * 1.2;
      }
      if (finger !== e.pointerId) return;
      const dy = e.clientY - previousY;
      previousY = e.clientY;
      travel += Math.abs(dy);
      if (travel > 5) {
        dragged.current = true;
        if (root.current) root.current.dataset.browsed = "true";
      }
      velocity = dy / (geometry(innerWidth, innerHeight).h * 0.6);
      target.current += velocity;
      lastInput.current = performance.now();
    }
    function up(e: PointerEvent) {
      if (finger !== e.pointerId) return;
      finger = null;
      if (e.type !== "pointercancel")
        target.current += velocity * (coarse.matches ? 4.5 : 7);
      lastInput.current = performance.now();
    }
    function resize() {
      setSize([innerWidth, innerHeight]);
    }
    const initial = requestAnimationFrame(() => {
      resize();
      setMode(state);
      setReveal(state === "browse" ? 1 : 0);
    });
    function animate(now: number) {
      const dt = clamp(now - last, 0, 50);
      last = now;
      if (state === "opening") {
        current -=
          0.00038 *
          dt *
          (1 + 0.3 * Math.sin(now / 620) + 0.12 * Math.sin(now / 213));
        if (now - began >= 2330 || reduced.matches) land(now);
      } else if (state === "landing") {
        const t = reduced.matches ? 1 : Math.min(1, (now - landAt) / 2600);
        const eased = 1 - (1 - t) ** 2;
        current = landFrom * (1 - eased);
        setReveal(eased);
        if (t === 1) setMode("browse");
      } else {
        const idle = now - lastInput.current - (coarse.matches ? 620 : 260);
        if (idle > 0 && finger === null) {
          const rate =
            (coarse.matches ? 0.055 : 0.11) * Math.min(1, idle / 420);
          const snapped = Math.round(target.current);
          target.current += (snapped - target.current) * rate;
          if (Math.abs(target.current - snapped) < 0.0004)
            target.current = snapped;
        }
        current += (target.current - current) * (reduced.matches ? 1 : 0.2);
        if (Math.abs(current - target.current) < 0.0004)
          current = target.current;
        const tiltRate = reduced.matches ? 1 : 0.06;
        tiltX += ((reduced.matches ? 0 : aimX) - tiltX) * tiltRate;
        tiltY += ((reduced.matches ? 0 : aimY) - tiltY) * tiltRate;
        if (drum.current)
          drum.current.style.setProperty(
            "--tilt",
            `rotateY(${tiltX.toFixed(2)}deg) rotateX(${tiltY.toFixed(2)}deg)`,
          );
      }
      setPosition(current);
      window.dispatchEvent(
        new CustomEvent("mutoscope:reel", { detail: { rot: current } }),
      );
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", key);
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(initial);
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", key);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  const select = useCallback((index: number) => {
    if (root.current) root.current.dataset.browsed = "true";
    target.current = index;
    lastInput.current = 0;
  }, []);
  // Keep the cylinder's axis centered while showing its small, side-on opening view.
  const yaw = (67 * Math.PI) / 180,
    pitch = (-13 * Math.PI) / 180,
    depth = -radius * 0.24;
  const projected = 2200 / (2200 - depth * Math.cos(pitch) * Math.cos(yaw));
  const introTransform = `translate(${-depth * Math.cos(pitch) * Math.sin(yaw) * projected}px,${depth * Math.sin(pitch) * projected}px) rotateY(67deg) rotateX(-13deg) scale3d(.24,.24,.24)`;
  return (
    <main
      ref={root}
      className={styles.hero}
      data-phase={phase}
      aria-label="Miles Okoro, independent web designer in Chicago"
      onClickCapture={(e) => {
        if (dragged.current) {
          e.preventDefault();
          e.stopPropagation();
          dragged.current = false;
        }
      }}
    >
      <div className={styles.stage} style={{ top: mid }}>
        <div
          ref={drum}
          className={styles.drum}
          style={{
            transform: phase === "opening" ? introTransform : undefined,
          }}
        >
          {Array.from({ length: slots }, (_, i) => active + i - 5).map((n) => {
            const project = projects[wrap(n)],
              angle =
                (n - position) * (360 / slots + (31 - 360 / slots) * reveal);
            const cosine = Math.cos((angle * Math.PI) / 180);
            const focus = Math.max(0, cosine) ** (phone ? 13 : 7);
            const introOpacity = 0.45 + 0.55 * (0.5 + 0.5 * cosine);
            const browseOpacity = cosine < 0 ? 0.08 : 0.1 + 0.9 * focus;
            const opacity =
              introOpacity + (browseOpacity - introOpacity) * reveal;
            const blur =
              Math.min(cosine < 0 ? 16 : 12, (1 - cosine) * (phone ? 46 : 26)) *
              reveal;
            return (
              <Link
                key={n}
                data-reel-card
                draggable={false}
                href={"/work/" + project.slug}
                className={styles.card}
                aria-current={n === active}
                aria-label={"Open " + project.title}
                tabIndex={n === active ? 0 : -1}
                style={{
                  width: w,
                  height: h,
                  marginLeft: -w / 2,
                  marginTop: -h / 2,
                  transform: `translateZ(${-radius}px) rotateX(${angle}deg) translateZ(${radius}px)`,
                  pointerEvents: Math.abs(n - active) <= 1 ? "auto" : "none",
                }}
                onClick={(e) => {
                  if (n !== active) {
                    e.preventDefault();
                    select(n);
                  }
                }}
                onPointerMove={(e) => {
                  if (cursor.current && n === active) {
                    cursor.current.style.left = e.clientX + "px";
                    cursor.current.style.top = e.clientY + "px";
                    cursor.current.style.opacity = "1";
                  }
                }}
                onPointerLeave={() => {
                  if (cursor.current) cursor.current.style.opacity = "0";
                }}
              >
                <div
                  className={styles.face}
                  style={{
                    opacity,
                    filter: `blur(${blur.toFixed(2)}px) saturate(${1 - 0.2 * (1 - focus) * reveal})`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={publicAsset(project.cover)}
                    alt={"First screen of the " + project.title + " website"}
                    draggable={false}
                  />
                  {n === active && phase !== "opening" && <WaterRipple />}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div
        className={styles.plate}
        aria-live="polite"
        style={{
          top: Math.max(phone ? 66 : 84, mid - h / 2 - (phone ? 27 : 40)),
        }}
      >
        {p.industry} / {p.services} / {p.year}
      </div>
      <ReelTitles
        top={mid + h / 2 + band / 2}
        fontSize={fontSize}
        position={position}
        select={select}
      />
      <div className={styles.sealSlot} style={{ top: mid }}>
        <OrbitSeal />
      </div>
      <div className={styles.rail} style={{ top: mid }}>
        {projects.map((project, i) => {
          const distance =
            wrap(i - position + projects.length / 2) - projects.length / 2;
          const weight = Math.max(0, 1 - Math.abs(distance)) ** 2;
          return (
            <button
              key={project.slug}
              aria-label={"Show " + project.title}
              aria-current={p === project}
              onClick={() =>
                select(Math.round(position) + Math.round(distance))
              }
            >
              <i
                style={{
                  width: 12 + 30 * weight,
                  opacity: 0.24 + 0.76 * weight,
                }}
              />
            </button>
          );
        })}
      </div>
      <div className={styles.foot}>
        <span>{p.essence}</span>
        <span>﹀ {phone ? "Swipe" : "Scroll"} to browse</span>
        <span>
          {phone
            ? String(wrap(active) + 1).padStart(2, "0") + " / 08"
            : "Independent web designer · Chicago, Illinois"}
        </span>
      </div>
      <span ref={cursor} className={styles.cursor}>
        Open project
      </span>
      {phase !== "browse" && (
        <div className={styles.intro} aria-hidden="true">
          <span style={{ top: mid }}>Miles Okoro</span>
          <small>Independent web designer · Chicago, Illinois</small>
        </div>
      )}
    </main>
  );
}
