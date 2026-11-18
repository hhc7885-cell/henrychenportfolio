"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useRef } from "react";
import projects from "./work/projects.json";
import styles from "./hero.module.css";

const count = projects.length;
const copies = [...projects, ...projects, ...projects];
const wrap = (n: number) => ((n % count) + count) % count;

type Props = {
  top: number;
  fontSize: number;
  position: number;
  select: (index: number) => void;
};

export function ReelTitles({ top, fontSize, position, select }: Props) {
  const belt = useRef<HTMLDivElement>(null);
  const centers = useRef<number[]>([]);
  const progress = useRef(0);

  function translate() {
    const coords = centers.current;
    if (!belt.current || !coords.length) return;
    const value = progress.current;
    const lower = Math.floor(value);
    const index = count + wrap(lower);
    const offset =
      coords[index] + (value - lower) * (coords[index + 1] - coords[index]);
    belt.current.style.transform = `translate3d(${-offset}px, -50%, 0)`;
  }

  useLayoutEffect(() => {
    const el = belt.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    let disposed = false;
    let glyphs: { element: HTMLElement; center: number }[][] = [];
    const measure = () => {
      if (disposed) return;
      centers.current = items.map(
        (item) => item.offsetLeft + item.offsetWidth / 2,
      );
      glyphs = items.map((item) =>
        Array.from(item.querySelectorAll("i")).map((element) => ({
          element,
          center: element.offsetLeft + element.offsetWidth / 2,
        })),
      );
      translate();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();
    void document.fonts.ready.then(measure);

    let pointerX = 0,
      energy = 0,
      frame = 0,
      previous = 0,
      lastIndex = -1;
    const clear = (index: number) =>
      glyphs[index]?.forEach(({ element }) =>
        element.style.removeProperty("transform"),
      );
    const tick = (now: number) => {
      const lower = Math.floor(progress.current);
      const index = count + wrap(lower) + Math.round(progress.current - lower);
      if (lastIndex !== index) clear(lastIndex);
      lastIndex = index;
      const left = items[index].getBoundingClientRect().left;
      for (const { element, center } of glyphs[index]) {
        const dx = (left + center - pointerX) / fontSize;
        const wave =
          Math.exp((-dx * dx) / 2.42) *
          (0.78 + 0.3 * Math.sin(dx / 0.42 - now / 130));
        element.style.transform = `translateY(${-fontSize * 0.13 * energy * wave}px)`;
      }
      energy *= Math.pow(0.957, Math.min(now - previous, 50) / 16.67);
      previous = now;
      if (energy > 0.005) frame = requestAnimationFrame(tick);
      else {
        clear(index);
        frame = 0;
      }
    };
    const move = (e: PointerEvent) => {
      if (
        e.pointerType === "touch" ||
        matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;
      const target = e.target as Element;
      if (
        !target.closest(
          "[data-reel-titles], [data-reel-card][aria-current=true]",
        )
      )
        return;
      pointerX = e.clientX;
      energy = 1;
      if (!frame) {
        previous = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    window.addEventListener("pointermove", move);
    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
      clear(lastIndex);
    };
  }, [fontSize]);

  useLayoutEffect(() => {
    progress.current = position;
    translate();
  }, [position]);
  const floor = Math.floor(position);
  const active = count + wrap(floor) + Math.round(position - floor);
  const nearest = Math.round(position);
  const labels = useMemo(
    () =>
      copies.map((project, index) => (
        <Link
          key={index}
          data-title-item
          href={"/work/" + project.slug}
          aria-label={project.title}
          aria-hidden={Math.abs(index - active) > 2}
          tabIndex={index === active ? 0 : -1}
          data-current={index === active}
          onClick={(e) => {
            if (index !== active) {
              e.preventDefault();
              select(nearest + index - active);
            }
          }}
        >
          {[...project.title.toUpperCase()].map((letter, i) => (
            <i key={i} aria-hidden="true">
              {letter === " " ? "\u00a0" : letter}
            </i>
          ))}
        </Link>
      )),
    [nearest, active, select],
  );
  return (
    <div className={styles.names} data-reel-titles style={{ top, fontSize }}>
      <div ref={belt} className={styles.belt}>
        {labels}
      </div>
    </div>
  );
}
