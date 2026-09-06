// ---------------------------------------------------------------------------
// Shared audio helpers.
//
// Single source of truth for every Web Audio usage on the site (riff engine,
// Karplus-Strong pluck, BassNeck):
//   - midiToFreq:      MIDI note number -> frequency (Hz)
//   - getAudioContext: one lazily-created AudioContext per page, or null when
//     the Web Audio API is unavailable (legacy browsers) — callers must treat
//     null as "audio off" and no-op.
// ---------------------------------------------------------------------------

let ctx: AudioContext | null = null;
let warned = false;

/** MIDI note number -> frequency in Hz (MIDI 69 = A4 = 440 Hz). */
export const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/**
 * Lazily create and return the page's single AudioContext, resuming it if
 * suspended. Returns null (logging once) when Web Audio is unsupported.
 */
export function getAudioContext(): AudioContext | null {
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) {
      if (!warned) {
        warned = true;
        console.error("Web Audio API is not supported in this browser");
      }
      return null;
    }
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}
