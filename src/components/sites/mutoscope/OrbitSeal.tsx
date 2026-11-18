"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import styles from "./hero.module.css";

export function OrbitSeal({ className = "" }: { className?: string }) {
  const pathId = useId();
  const rim = useRef<SVGGElement>(null);
  useEffect(() => {
    function turn(event: Event) {
      const rotation = (event as CustomEvent<{ rot: number }>).detail.rot;
      rim.current?.style.setProperty(
        "transform",
        `rotate(${rotation * 62}deg)`,
      );
    }
    window.addEventListener("mutoscope:reel", turn);
    return () => window.removeEventListener("mutoscope:reel", turn);
  }, []);
  return (
    <Link
      href="/contact"
      className={`${styles.seal} ${className}`}
      aria-label="Start a project"
    >
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <path id={pathId} d="M28 100a72 72 0 1 1 144 0 72 72 0 1 1-144 0" />
        </defs>
        <g ref={rim} className={styles.rim}>
          <g className={styles.rotor}>
            <text>
              <textPath
                href={`#${pathId}`}
                textLength={2 * Math.PI * 72}
                lengthAdjust="spacing"
              >
                START A PROJECT · START A PROJECT ·{" "}
              </textPath>
            </text>
          </g>
        </g>
        <circle className={styles.fill} cx="100" cy="100" r="55" />
        <circle className={styles.outline} cx="100" cy="100" r="55" />
      </svg>
      <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true">
        <path d="m8 16 8.4-8.4M9.6 7.6h6.8v6.8" />
      </svg>
    </Link>
  );
}
