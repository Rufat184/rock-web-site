import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { bassStrings } from "../content";
import { pluckString } from "../lib/pluck";

const FRET_COUNT = 6;
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const midiToName = (m: number) => `${NOTE_NAMES[m % 12]}${Math.floor(m / 12) - 1}`;

/**
 * Interactive 4-string bass neck. Clicking a string plucks it —
 * the note depends on where along the neck you click (fret position).
 */
export function BassNeck() {
  const [vib, setVib] = useState<boolean[]>(() => bassStrings.map(() => false));
  const [lastNote, setLastNote] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => timers.current.forEach((t) => window.clearTimeout(t)),
    [],
  );

  const pluck = (s: number) => (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const fret = Math.min(FRET_COUNT, Math.max(1, Math.floor(x * FRET_COUNT) + 1));
    const midi = bassStrings[s].midi + fret;
    const freq = midiToFreq(midi);
    pluckString(freq);
    setLastNote(`${midiToName(midi)} · fret ${fret} · ${Math.round(freq)} Hz`);
    setVib((v) => v.map((on, i) => (i === s ? true : on)));
    window.clearTimeout(timers.current[s]);
    timers.current[s] = window.setTimeout(
      () => setVib((v) => v.map((on, i) => (i === s ? false : on))),
      380,
    );
  };

  return (
    <div className="bassneck" data-reveal>
      <div className="bassneck__bar">
        <div className="bassneck__head" aria-hidden="true">
          {bassStrings.map((s) => (
            <span className="bassneck__peg" key={s.name} />
          ))}
          <span className="bassneck__plate">DS-4</span>
        </div>
        <div className="bassneck__neck">
          <div className="bassneck__frets" aria-hidden="true">
            {Array.from({ length: FRET_COUNT + 1 }, (_, i) => (
              <i key={i} style={{ left: `${(i / FRET_COUNT) * 100}%` }} />
            ))}
          </div>
          {bassStrings.map((s, i) => {
            const gauge = bassStrings.length - 1 - i; // 0 = thinnest (G)
            return (
              <button
                key={s.name}
                type="button"
                className={`bassneck__string${vib[i] ? " is-vib" : ""}`}
                style={
                  {
                    "--th": `${1.5 + gauge * 1.2}px`,
                    "--amp": `${3 + gauge * 2.5}`,
                  } as CSSProperties
                }
                onClick={pluck(i)}
                aria-label={`Pluck the ${s.name} string`}
              >
                <span className="bassneck__string-line" aria-hidden="true" />
                <span className="bassneck__string-label">{s.name}</span>
              </button>
            );
          })}
        </div>
        <div className="bassneck__tail" aria-hidden="true">
          {bassStrings.map((s) => (
            <span className="bassneck__stub" key={s.name} />
          ))}
          <span className="bassneck__bridge" />
        </div>
      </div>
      <p className="bassneck__readout" aria-live="polite">
        {lastNote ?? "Click a string — the note depends on where you hit it."}
      </p>
    </div>
  );
}
