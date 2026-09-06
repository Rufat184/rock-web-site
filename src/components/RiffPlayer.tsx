import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { Track } from "../content";

const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/* --------------------------------------------------------------------------
 * Module-level riff engine.
 *
 * One bass riff plays at a time across the whole site (hero CTA, track
 * rows, now-playing chip). The engine broadcasts:
 *   - which track is active  -> subscribeRiff
 *   - the current 16th-note step -> subscribeSteps
 * so every RiffPlayer row can light its step-sequencer bars in sync
 * with the audio, no matter which control started the playback.
 * ------------------------------------------------------------------------ */

let ctx: AudioContext | null = null;
let activeTimer = 0;
let activeMaster: GainNode | null = null;
let activeId: string | null = null;

const riffListeners = new Set<(id: string | null) => void>();
const stepListeners = new Set<(step: number) => void>;

export function subscribeRiff(cb: (id: string | null) => void) {
  riffListeners.add(cb);
  return () => {
    riffListeners.delete(cb);
  };
}

export function subscribeSteps(cb: (step: number) => void) {
  stepListeners.add(cb);
  return () => {
    stepListeners.delete(cb);
  };
}

function ensureCtx(): AudioContext {
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function stopRiff() {
  if (!ctx || !activeId) return;
  window.clearInterval(activeTimer);
  activeTimer = 0;
  if (activeMaster) {
    const m = activeMaster;
    m.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
    window.setTimeout(() => m.disconnect(), 150);
    activeMaster = null;
  }
  activeId = null;
  stepListeners.forEach((l) => l(-1));
  riffListeners.forEach((l) => l(null));
}

/** Start the track's riff. Calling with the active track toggles it off. */
export function startRiff(track: Track) {
  if (activeId === track.title) {
    stopRiff();
    return;
  }
  stopRiff();

  const ac = ensureCtx();
  const master = ac.createGain();
  master.gain.value = 0.5;
  master.connect(ac.destination);
  activeMaster = master;

  // Schedule every note up front: saw + sub sine through a resonant
  // lowpass, plucky envelope. Pure low end, zero audio files.
  let t = ac.currentTime + 0.06;
  for (const midi of track.riff) {
    const osc = ac.createOscillator();
    const sub = ac.createOscillator();
    const filter = ac.createBiquadFilter();
    const env = ac.createGain();

    osc.type = "sawtooth";
    sub.type = "sine";
    osc.frequency.value = midiToFreq(midi);
    sub.frequency.value = midiToFreq(midi);
    filter.type = "lowpass";
    filter.frequency.value = 950;
    filter.Q.value = 5;

    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.85, t + 0.012);
    env.gain.exponentialRampToValueAtTime(0.001, t + track.tempo * 1.7);

    osc.connect(filter);
    sub.connect(filter);
    filter.connect(env);
    env.connect(master);

    const dur = track.tempo * 1.9;
    osc.start(t);
    osc.stop(t + dur);
    sub.start(t);
    sub.stop(t + dur);
    t += track.tempo;
  }

  // Step sequencer clock — mirrors the scheduled notes.
  let step = 0;
  const n = track.riff.length;
  stepListeners.forEach((l) => l(step));
  activeTimer = window.setInterval(() => {
    step += 1;
    if (step >= n) {
      stopRiff();
      return;
    }
    stepListeners.forEach((l) => l(step));
  }, track.tempo);

  activeId = track.title;
  riffListeners.forEach((l) => l(track.title));
}

/* ------------------------------ Component ------------------------------ */

export function RiffPlayer({ track }: { track: Track }) {
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);

  useEffect(() => {
    const u1 = subscribeRiff((id) => {
      const on = id === track.title;
      setPlaying(on);
      if (!on) setStep(-1);
    });
    const u2 = subscribeSteps((s) => {
      if (s >= 0) setStep(s);
    });
    return () => {
      u1();
      u2();
    };
  }, [track.title]);

  // Bar heights are derived from the actual riff — the idle visual IS the
  // note contour, and the lit bar follows the playback step.
  const heights = useMemo(() => {
    const min = Math.min(...track.riff);
    const max = Math.max(...track.riff);
    const span = Math.max(1, max - min);
    return track.riff.map((m) => 20 + ((m - min) / span) * 80);
  }, [track]);

  return (
    <div className={`riff${playing ? " is-playing" : ""}`}>
      <button
        className="riff__btn"
        onClick={() => startRiff(track)}
        aria-label={playing ? `Stop riff: ${track.title}` : `Play riff: ${track.title}`}
      >
        {playing ? <StopIcon /> : <PlayIcon />}
      </button>
      <div className="riff__meta">
        <strong>{track.title}</strong>
        <span>
          {track.album} — {track.year}
        </span>
      </div>
      <div className="riff__eq" aria-hidden="true">
        {heights.map((h, i) => (
          <i
            key={i}
            className={step === i ? "is-lit" : ""}
            style={{ "--h": `${h}%` } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" />
    </svg>
  );
}
