"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OrbitSeal } from "./OrbitSeal";

export function Socials() {
  return (
    <div className="socials">
      {[
        ["LinkedIn", "https://www.linkedin.com/"],
        ["Dribbble", "https://dribbble.com/"],
        ["Instagram", "https://www.instagram.com/"],
      ].map(([label, url]) => (
        <a key={label} href={url} target="_blank" rel="noreferrer">
          {label} ↗
        </a>
      ))}
    </div>
  );
}
export function Header() {
  const route = usePathname().replace(/\/$/, "") || "/",
    menu = useRef<HTMLDialogElement>(null),
    audio = useRef<AudioContext | null>(null);
  const [menuTime, setMenuTime] = useState("");
  const [dark, setDark] = useState(false),
    [sound, setSound] = useState(false);
  useEffect(() => {
    const sync = () => {
      const value = localStorage.getItem("muto-theme") === "dark";
      document.documentElement.dataset.theme = value ? "dark" : "light";
      setDark(value);
      setSound(localStorage.getItem("muto-sound") === "on");
    };
    const frame = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (!sound) return;
    function tone() {
      const ctx = audio.current;
      if (!ctx || ctx.state !== "running") return;
      const oscillator = ctx.createOscillator(),
        gain = ctx.createGain();
      oscillator.frequency.setValueAtTime(360, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        100,
        ctx.currentTime + 0.08,
      );
      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.11);
    }
    let previous = -1;
    function reel(e: Event) {
      const n = Math.round((e as CustomEvent).detail.rot);
      if (n !== previous) {
        tone();
        previous = n;
      }
    }
    window.addEventListener("pointerdown", tone);
    window.addEventListener("mutoscope:reel", reel);
    return () => {
      window.removeEventListener("pointerdown", tone);
      window.removeEventListener("mutoscope:reel", reel);
    };
  }, [sound]);
  if (route.startsWith("/work/")) return null;
  const nav = ["Work", "About", "Contact"].map((label) => (
    <Link
      key={label}
      href={"/" + label.toLowerCase()}
      onClick={() => menu.current?.close()}
    >
      {label}
    </Link>
  ));
  return (
    <header className={"topbar " + (route === "/" ? "overlay" : "")}>
      <Link className="brand" href="/">
        Miles Okoro
      </Link>
      <nav>{nav}</nav>
      <div className="tools">
        <button
          aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          onClick={() => {
            const mode = dark ? "light" : "dark";
            document.documentElement.dataset.theme = mode;
            localStorage.setItem("muto-theme", mode);
            setDark(!dark);
          }}
        >
          {dark ? <Sun /> : <Moon />}
        </button>
        <button
          aria-label={sound ? "Mute sound" : "Enable sound"}
          aria-pressed={sound}
          onClick={() => {
            if (!sound) {
              audio.current ??= new AudioContext();
              void audio.current.resume();
            }
            setSound(!sound);
            localStorage.setItem("muto-sound", sound ? "off" : "on");
          }}
        >
          {sound ? <Volume2 /> : <VolumeX />}
        </button>
      </div>
      <button
        className="menuToggle"
        onClick={() => {
          setMenuTime(
            new Intl.DateTimeFormat("en-US", {
              hour: "numeric",
              minute: "2-digit",
              timeZone: "America/Chicago",
            }).format(new Date()),
          );
          menu.current?.showModal();
        }}
      >
        Menu
      </button>
      <dialog ref={menu} aria-label="Navigation">
        <button onClick={() => menu.current?.close()}>Close</button>
        <section className="menuLinks">{nav}</section>
        <section className="menuInfo">
          <a className="menuMail" href="mailto:hello@milesokoro.com">
            hello@milesokoro.com
          </a>
          <p>Chicago, Illinois · {menuTime} local</p>
          <Socials />
          <Link href="/privacy" onClick={() => menu.current?.close()}>
            Privacy · © 2026 Miles Okoro
          </Link>
        </section>
      </dialog>
    </header>
  );
}
export function Footer() {
  const route = usePathname().replace(/\/$/, "") || "/",
    [time, setTime] = useState("");
  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "America/Chicago",
        }).format(new Date()),
      );
    const timer = setInterval(update, 1000);
    const frame = requestAnimationFrame(update);
    return () => {
      clearInterval(timer);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <>
      {route !== "/" && !route.startsWith("/work/") && (
        <footer className="siteFooter">
          <div className="cta">
            <OrbitSeal />
            <Link href="/contact">
              Planning a new website? Tell me about it.
            </Link>
          </div>
          <div className="footerRow">
            <a className="email" href="mailto:hello@milesokoro.com">
              hello@milesokoro.com
            </a>
            <Socials />
          </div>
          <div className="footerRow fine">
            <span>Chicago, Illinois · Local time {time}</span>
            <span>
              <Link href="/privacy">Privacy</Link>　 © 2026 Miles Okoro
            </span>
          </div>
        </footer>
      )}
      <a
        className="framerBadge"
        href="https://www.framer.com"
        target="_blank"
        rel="noreferrer"
      >
        <svg width="12" height="18" viewBox="0 0 12 18" aria-hidden="true">
          <path d="M0 0h12v6H6zm0 6h6l6 6H6v6l-6-6z" />
        </svg>
        Made in Framer
      </a>
    </>
  );
}
