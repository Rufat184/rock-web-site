// ---------------------------------------------------------------------------
// Karplus-Strong plucked-string synthesis.
//
// Renders a short noise burst through a decaying feedback delay into an
// AudioBuffer — sounds like a real plucked string, zero audio files.
// ---------------------------------------------------------------------------

let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext {
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Pluck a string at the given frequency (Hz). velocity 0..1. */
export function pluckString(freq: number, velocity = 1) {
  const ac = ensureCtx();
  const sr = ac.sampleRate;
  const dur = 2.2;
  const len = Math.floor(sr * dur);
  const buffer = ac.createBuffer(1, len, sr);
  const out = buffer.getChannelData(0);

  // One period of low-passed noise seeds the resonant ring.
  const period = Math.max(2, Math.round(sr / freq));
  const ring = new Float32Array(period);
  let last = 0;
  for (let i = 0; i < period; i++) {
    last = 0.5 * (last + (Math.random() * 2 - 1));
    ring[i] = last;
  }

  // Karplus-Strong loop: average each sample with its delayed neighbour.
  let prev = ring[0];
  const damp = 0.9955;
  for (let i = 0; i < len; i++) {
    const idx = i % period;
    const cur = ring[idx];
    ring[idx] = damp * 0.5 * (cur + prev);
    prev = cur;
    out[i] = cur * velocity;
  }

  const src = ac.createBufferSource();
  src.buffer = buffer;
  const gain = ac.createGain();
  gain.gain.value = 0.7 * velocity;
  src.connect(gain);
  gain.connect(ac.destination);
  src.start();
  src.onended = () => {
    src.disconnect();
    gain.disconnect();
  };
}
