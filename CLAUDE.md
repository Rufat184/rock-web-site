# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page static site for a (fictional) bassist, "Dana Strum". No backend, no build-time data fetching — all content is hard-coded in TypeScript and rendered client-side.

## Commands

- `npm run dev` — Vite dev server (port 5500)
- `npm run build` — `tsc -b` (type-check) + production build → `dist/`. Run this after changes; it is the only automated check.
- `npm run preview` — serve the production build locally

There is **no test runner and no linter**. TypeScript is strict (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`) — unused variables/parameters fail the build.

## Architecture

### Content lives in `src/content.ts`
All site copy and data — `artist`, `tourDates`, `tracks`, `bassStrings`, `gear` — is centralized here, each with a typed shape (`Track`, `TourDate`, `GearItem`, …). **Edit content in this file, never inline in components.**

### `src/App.tsx` is the whole page
The full page composition (Nav, Hero, Ticker, About, Tour, Music, Gear, Contact, Footer, NowPlaying) is written as local function components inside `App.tsx`. The `src/components/` directory holds only the heavy, self-contained interactive pieces (below). Don't expect one-section-per-file for the layout sections.

### Audio is synthesized live — two separate Web Audio systems
No audio files are used for the music (the only media asset is `public/thunder.mp4`). Two independent engines exist, each with its **own module-level `AudioContext`**:

- **`src/components/RiffPlayer.tsx` — the riff engine.** This is a **module-level singleton, not React state.** It plays one bass riff at a time for the whole site and exposes pub/sub: `subscribeRiff(cb)` (active track id, or `null`) and `subscribeSteps(cb)` (current 16th-note step, `-1` when idle). `startRiff(track)` schedules every note up front (sawtooth + sub sine through a resonant lowpass, plucky gain envelope) and runs a `setInterval` step clock that mirrors the notes. This is what keeps the hero CTA, the track rows, and the "now playing" chip in sync — components subscribe in `useEffect` and clean up on unmount; the step bars in each row light up from `subscribeSteps`.
- **`src/lib/pluck.ts` — Karplus-Strong plucked-string synthesis.** `pluckString(freq)` renders a noise burst through a decaying feedback delay into an `AudioBuffer`. Used only by `BassNeck` (the clickable neck).

`midiToFreq` is defined separately in both `RiffPlayer.tsx` and `BassNeck.tsx`; if you add more audio, consider consolidating.

### `src/components/` — the heavy interactive pieces
- **`ParticleBass.tsx`** — self-contained raw-WebGL (2 preferred, 1 fallback) instanced-quad particle system (~2,700 particles) that assembles a bass silhouette in the hero. `sampleBass()` draws a bass on an offscreen canvas and samples luminance to derive particle targets. Zero dependencies.
- **`Thunder.tsx`** — builds the storm `<video>` **imperatively** (created by hand, appended to `.hero`, managed via DOM to avoid React clearing inline styles). `mix-blend-mode: screen` drops out the dark sky. Disabled under `prefers-reduced-motion`.
- **`BassNeck.tsx`** — interactive 4-string neck; the click position selects the fret and calls `pluckString`.
- **`Ticker.tsx`** — decorative CSS marquee.

### Scroll reveals
`src/hooks/useReveal.ts` returns a ref; an `IntersectionObserver` adds `is-visible` to any `[data-reveal]` element when it scrolls into view. Throughout `App.tsx`, elements opt in with the `data-reveal` attribute plus a `--reveal-delay` CSS custom property (via the `delay(ms)` helper) for staggered timing.

### Styling
Single global stylesheet `src/styles.css` (~1,600 lines). Design tokens are CSS variables on `:root` (`--bg`, `--ink`, `--accent`, `--font-display`, …); class names follow a BEM-ish `block__element--modifier` scheme. Fonts (Jost, Barlow) load from Google Fonts in `index.html`. Add new rules to `styles.css` and reuse the existing tokens.

### Motion preferences
Several effects (Thunder, ParticleBass) check `prefers-reduced-motion` and disable/quiet themselves. Keep that in mind when adding new animated effects.

## Conventions
- Content/text → `src/content.ts`, not components.
- Styling → `src/styles.css`; reuse tokens, follow the existing class naming.
- Layout sections stay in `App.tsx`; genuinely heavy/interactive components go in `src/components/` (PascalCase, one per file).
- TypeScript strict mode; avoid `any` (the WebGL fallback in `ParticleBass.tsx` casts to `any` deliberately).
- Verify with `npm run build` after changes.

A shorter sibling, `AGENTS.md`, covers the same ground at a high level — keep them in sync if you change conventions.
