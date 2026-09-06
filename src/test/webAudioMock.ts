// ---------------------------------------------------------------------------
// Minimal Web Audio API stand-in for jsdom (which ships without AudioContext).
// Nodes are inert, but the graph-building and scheduling code paths in
// RiffPlayer and pluck.ts all run for real.
// ---------------------------------------------------------------------------

class MockParam {
  value = 0;
  setValueAtTime() {}
  linearRampToValueAtTime() {}
  exponentialRampToValueAtTime() {}
  setTargetAtTime() {}
}

class MockNode {
  gain = new MockParam();
  frequency = new MockParam();
  Q = new MockParam();
  type = "";
  onended: (() => void) | null = null;
  connect() {
    return this;
  }
  disconnect() {}
  start() {}
  stop() {}
}

export class MockAudioContext {
  /** Every context created through the installed mock, for test assertions. */
  static instances: MockAudioContext[] = [];

  state: "running" | "suspended" = "running";
  currentTime = 0;
  sampleRate = 44100;
  destination: unknown = {};
  startedSources = 0;
  lastBuffer: { length: number; data: Float32Array } | null = null;

  constructor() {
    MockAudioContext.instances.push(this);
  }

  createGain() {
    return new MockNode();
  }
  createOscillator() {
    return new MockNode();
  }
  createBiquadFilter() {
    return new MockNode();
  }
  createBufferSource() {
    const node = new MockNode();
    node.start = () => {
      this.startedSources += 1;
    };
    return node;
  }
  createBuffer(_channels: number, length: number) {
    const data = new Float32Array(length);
    this.lastBuffer = { length, data };
    return { getChannelData: () => data };
  }
  resume() {
    return Promise.resolve();
  }
}

/** Install the mock as window.AudioContext. */
export function installMockAudioContext() {
  (window as unknown as { AudioContext: typeof MockAudioContext }).AudioContext =
    MockAudioContext;
}

/** Remove AudioContext from window (simulate an unsupported browser). */
export function uninstallAudioContext() {
  delete (window as unknown as { AudioContext?: unknown }).AudioContext;
}
