"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Volume2, VolumeX } from "lucide-react";
import { publicAsset } from "@/lib/public-asset";

type SoundState = {
  enabled: boolean;
  pending: boolean;
  waiting: boolean;
  toggle: () => void;
};
const SoundContext = createContext<SoundState | null>(null);
type AudioGraph = { context: AudioContext; music: GainNode };
const musicLevel = 0.24;

export function SoundToggle({ className }: { className?: string }) {
  const sound = useContext(SoundContext);
  if (!sound) return null;
  return (
    <button
      className={className}
      type="button"
      data-sound-toggle
      aria-label={sound.enabled ? "Mute sound" : "Enable sound"}
      aria-pressed={sound.enabled}
      aria-busy={sound.pending}
      title={
        sound.waiting
          ? "点击页面即可开始背景音乐"
          : sound.pending
            ? "正在加载背景音乐"
            : sound.enabled
              ? "关闭背景音乐与音效"
              : "播放 Fortnight 背景音乐与音效"
      }
      onClick={sound.toggle}
    >
      {sound.enabled ? <Volume2 /> : <VolumeX />}
    </button>
  );
}

export function SiteAudio({ children }: { children: React.ReactNode }) {
  const player = useRef<HTMLAudioElement>(null);
  const graph = useRef<AudioGraph | null>(null);
  const wanted = useRef(false);
  const attempt = useRef(0);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [pending, setPending] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState("");

  const remember = useCallback((on: boolean) => {
    try {
      localStorage.setItem("henry-bgm", on ? "on" : "off");
    } catch {
      /* Playback still works without storage. */
    }
  }, []);

  const stop = useCallback((persist = true) => {
    wanted.current = false;
    attempt.current++;
    setEnabled(false);
    setPending(false);
    setWaiting(false);
    if (persist) remember(false);
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    const audio = player.current;
    const nodes = graph.current;
    if (!nodes || nodes.context.state !== "running") {
      audio?.pause();
      return;
    }
    const now = nodes.context.currentTime;
    nodes.music.gain.cancelAndHoldAtTime(now);
    nodes.music.gain.linearRampToValueAtTime(0, now + 0.3);
    pauseTimer.current = setTimeout(() => {
      if (!wanted.current) audio?.pause();
    }, 320);
  }, [remember]);

  const start = useCallback(
    async (automatic = false) => {
      const audio = player.current;
      if (!audio) return;
      wanted.current = true;
      const request = ++attempt.current;
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
      setPending(true);
      setError("");
      setWaiting(false);
      try {
        let nodes = graph.current;
        if (!nodes) {
          const context = new AudioContext();
          const music = context.createGain();
          music.gain.value = 0;
          context
            .createMediaElementSource(audio)
            .connect(music)
            .connect(context.destination);
          nodes = { context, music };
          graph.current = nodes;
        }
        // Start both calls within the initiating click to retain browser activation.
        await Promise.all([nodes.context.resume(), audio.play()]);
        if (request !== attempt.current || !wanted.current) return;
        const now = nodes.context.currentTime;
        nodes.music.gain.cancelAndHoldAtTime(now);
        nodes.music.gain.linearRampToValueAtTime(musicLevel, now + 1.2);
        setEnabled(true);
        setPending(false);
        remember(true);
      } catch (reason) {
        if (request !== attempt.current) return;
        wanted.current = false;
        audio.pause();
        setEnabled(false);
        setPending(false);
        if (
          automatic &&
          reason instanceof DOMException &&
          reason.name === "NotAllowedError"
        ) {
          setWaiting(true);
          return;
        }
        setError("音乐暂时无法播放，请再次点击声音开关。");
      }
    },
    [remember],
  );

  const toggle = useCallback(() => {
    if (wanted.current) stop();
    else void start();
  }, [start, stop]);

  useEffect(() => {
    let preferred = true;
    try {
      preferred = localStorage.getItem("henry-bgm") !== "off";
    } catch {
      /* Use the default when storage is unavailable. */
    }
    if (!preferred) return;
    const initial = requestAnimationFrame(() => {
      void start(true);
    });
    const disarm = () => {
      document.removeEventListener("click", resume);
      document.removeEventListener("keydown", resume);
    };
    const resume = (event: Event) => {
      if ((event.target as Element | null)?.closest("[data-sound-toggle]")) {
        disarm();
        return;
      }
      if (
        event instanceof KeyboardEvent &&
        ["Shift", "Control", "Alt", "Meta"].includes(event.key)
      )
        return;
      disarm();
      if (player.current?.paused || graph.current?.context.state !== "running")
        void start();
    };
    document.addEventListener("click", resume);
    document.addEventListener("keydown", resume);
    return () => {
      cancelAnimationFrame(initial);
      disarm();
    };
  }, [start]);

  useEffect(() => {
    if (!enabled) return;
    function tone() {
      const context = graph.current?.context;
      if (!context || context.state !== "running") return;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.setValueAtTime(360, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        100,
        context.currentTime + 0.08,
      );
      gain.gain.setValueAtTime(0.025, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.1);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.11);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    }
    let previous = -1;
    function reel(event: Event) {
      const index = Math.round(
        (event as CustomEvent<{ rot: number }>).detail.rot,
      );
      if (index !== previous) {
        tone();
        previous = index;
      }
    }
    window.addEventListener("pointerdown", tone);
    window.addEventListener("mutoscope:reel", reel);
    return () => {
      window.removeEventListener("pointerdown", tone);
      window.removeEventListener("mutoscope:reel", reel);
    };
  }, [enabled]);

  useEffect(() => {
    const audio = player.current;
    const playbackAttempt = attempt;
    const audioGraph = graph;
    const timer = pauseTimer;
    return () => {
      playbackAttempt.current++;
      if (timer.current) clearTimeout(timer.current);
      audio?.pause();
      void audioGraph.current?.context.close();
    };
  }, []);

  return (
    <SoundContext.Provider value={{ enabled, pending, waiting, toggle }}>
      <audio
        ref={player}
        src={publicAsset("/sites/henry/audio/fortnight-instrumental.mp3")}
        loop
        preload="none"
        aria-hidden="true"
        onError={() => {
          if (wanted.current) {
            stop(false);
            setError("音乐暂时无法播放，请再次点击声音开关。");
          }
        }}
      />
      {children}
      {error && (
        <p className="audioNotice" role="status">
          {error}
        </p>
      )}
    </SoundContext.Provider>
  );
}
