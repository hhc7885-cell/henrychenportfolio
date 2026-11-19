"use client";
import { publicAsset } from "@/lib/public-asset";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import projects from "./projects.json";
const mod = (v: number, n: number) => ((v % n) + n) % n;
export function Gallery({
  project: p,
}: {
  project: (typeof projects)[number];
}) {
  const router = useRouter(),
    root = useRef<HTMLElement>(null);
  const [view, setView] = useState({ width: 1440, height: 900, x: 0, y: 0 });
  useEffect(() => {
    const surface = root.current;
    if (!surface) return;
    let x = 0,
      y = 0,
      toX = 0,
      toY = 0,
      dx = 0,
      dy = 0,
      lastX = 0,
      lastY = 0,
      drag = false,
      frame = 0;
    const paint = () =>
      setView({ width: innerWidth, height: innerHeight, x, y });
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      toX -= e.deltaX;
      toY -= e.deltaY;
    };
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a")) return;
      surface.setPointerCapture(e.pointerId);
      drag = true;
      lastX = e.clientX;
      lastY = e.clientY;
      dx = dy = 0;
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      dx = e.clientX - lastX;
      dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      x = toX += dx;
      y = toY += dy;
      paint();
    };
    const up = () => {
      if (drag) {
        toX += dx * 7;
        toY += dy * 7;
      }
      drag = false;
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push("/work");
        return;
      }
      const distance =
        innerWidth < 760
          ? innerWidth * 0.88
          : Math.min(innerWidth * 0.74, innerHeight * 1.209);
      switch (e.key) {
        case "ArrowRight":
          toX -= distance + 16;
          break;
        case "ArrowLeft":
          toX += distance + 16;
          break;
        case "ArrowDown":
        case "PageDown":
          toY -= distance / 1.55 + 16;
          break;
        case "ArrowUp":
        case "PageUp":
          toY += distance / 1.55 + 16;
          break;
        default:
          return;
      }
      e.preventDefault();
    };
    function update() {
      if (!drag && (Math.abs(toX - x) > 0.05 || Math.abs(toY - y) > 0.05)) {
        const rate = matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 1
          : 0.14;
        x += (toX - x) * rate;
        y += (toY - y) * rate;
        paint();
      }
      frame = requestAnimationFrame(update);
    }
    paint();
    frame = requestAnimationFrame(update);
    surface.addEventListener("wheel", wheel, { passive: false });
    surface.addEventListener("pointerdown", down);
    surface.addEventListener("pointermove", move);
    surface.addEventListener("pointerup", up);
    surface.addEventListener("pointercancel", up);
    window.addEventListener("keydown", key);
    window.addEventListener("resize", paint);
    return () => {
      cancelAnimationFrame(frame);
      surface.removeEventListener("wheel", wheel);
      surface.removeEventListener("pointerdown", down);
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerup", up);
      surface.removeEventListener("pointercancel", up);
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", paint);
    };
  }, [router]);
  const mobile = view.width < 760,
    columns = mobile ? 2 : 3,
    gap = mobile ? 12 : Math.round(Math.min(22, view.width * 0.014)),
    w = Math.round(
      mobile
        ? view.width * 0.88
        : Math.min(view.width * 0.74, view.height * 1.209),
    ),
    h = Math.round(w / 1.55);
  const left = (view.width - w) / 2 + view.x,
    top = (view.height - h) / 2 + view.y,
    tiles = [];
  const facts = [
    "client",
    "industry",
    "services",
    "year",
    "timeline",
    "location",
  ] as const;
  const meta = (
    <dl>
      {facts.map((k) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{p[k]}</dd>
        </div>
      ))}
    </dl>
  );
  for (
    let col = Math.floor((-left - w) / (w + gap));
    col <= Math.ceil((view.width - left) / (w + gap));
    col++
  ) {
    const start = top + mod(col, columns) * Math.round((h + gap) * 0.34);
    for (
      let row = Math.floor((-start - h) / (h + gap));
      row <= Math.ceil((view.height - start) / (h + gap));
      row++
    ) {
      const kind = mod(row * columns + col, 7),
        src = [
          p.cover,
          p.screens[0],
          "",
          p.screens[1],
          "",
          p.screens[0],
          p.screens[1],
        ][kind];
      tiles.push(
        <div
          className="tile"
          key={col + ":" + row}
          style={{
            width: w,
            height: h,
            left: left + col * (w + gap),
            top: start + row * (h + gap),
          }}
        >
          {src ? (
            <Image
              unoptimized
              width={2496}
              height={1560}
              src={publicAsset(src)}
              alt={p.title + " project screen"}
              draggable={false}
              style={{
                transform:
                  kind === 5
                    ? "scale(1.85) translate(-17%,-13%)"
                    : kind === 6
                      ? "scale(2.15) translate(15%,11%)"
                      : undefined,
              }}
            />
          ) : kind === 4 ? (
            meta
          ) : (
            <section className="projectNotes">
              <div>
                <h2>项目背景</h2>
                {p.about}
              </div>
              <div>
                <h2>我的工作</h2>
                {p.did}
              </div>
            </section>
          )}
        </div>,
      );
    }
  }
  return (
    <main
      ref={root}
      className="gallery"
      aria-label={p.title + " project gallery"}
    >
      {tiles}
      <div className="galShade" />
      <Link className="back" href="/work">
        ❮　All work
      </Link>
      <span className="galTag">{p.title}</span>
      <aside>
        <h1>{p.title}</h1>
        <p>{p.essence}</p>
        {meta}
        <a
          className="projectSource"
          href={p.source.startsWith("/") ? publicAsset(p.source) : p.source}
          target="_blank"
          rel="noreferrer"
        >
          {p.sourceLabel}
        </a>
      </aside>
      <span className="galHint">
        Drag or scroll to move through the screens
      </span>
    </main>
  );
}
