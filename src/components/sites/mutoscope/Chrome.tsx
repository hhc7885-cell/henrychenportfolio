"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OrbitSeal } from "./OrbitSeal";
import { SoundToggle } from "./SiteAudio";

export function Socials() {
  return (
    <div className="socials">
      {[["GitHub", "https://github.com/hhc7885-cell"]].map(([label, url]) => (
        <a key={label} href={url} target="_blank" rel="noreferrer">
          {label} ↗
        </a>
      ))}
    </div>
  );
}
export function Header() {
  const route = usePathname().replace(/\/$/, "") || "/",
    menu = useRef<HTMLDialogElement>(null);
  const [menuTime, setMenuTime] = useState("");
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const sync = () => {
      const value = localStorage.getItem("muto-theme") === "dark";
      document.documentElement.dataset.theme = value ? "dark" : "light";
      setDark(value);
    };
    const frame = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(frame);
  }, []);
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
        henrychenportfolio
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
        <SoundToggle />
      </div>
      <button
        className="menuToggle"
        onClick={() => {
          setMenuTime(
            new Intl.DateTimeFormat("en-US", {
              hour: "numeric",
              minute: "2-digit",
              timeZone: "Asia/Shanghai",
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
          <a className="menuMail" href="mailto:hhc7885@gmail.com">
            hhc7885@gmail.com
          </a>
          <p>Guangzhou, China · {menuTime} local</p>
          <Socials />
          <Link href="/privacy" onClick={() => menu.current?.close()}>
            Privacy · © 2026 Henry Chen
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
          timeZone: "Asia/Shanghai",
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
      {route !== "/" && (
        <footer className="siteFooter">
          <div className="cta">
            <OrbitSeal />
            <Link href="/contact">联系陈豪辉</Link>
          </div>
          <div className="footerRow">
            <a className="email" href="mailto:hhc7885@gmail.com">
              hhc7885@gmail.com
            </a>
            <Socials />
          </div>
          <div className="footerRow fine">
            <span>Guangzhou, China · Local time {time}</span>
            <span>
              <Link href="/privacy">Privacy</Link>　 © 2026 Henry Chen
            </span>
          </div>
        </footer>
      )}
    </>
  );
}
