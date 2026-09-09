# PROJECT KNOWLEDGE BASE

**Generated:** 2026-09-01

## OVERVIEW
Project: **rock-web-site** — single-page static site for a (fictional) bassist, "Dana Strum". No backend, no data fetching; all content is typed TypeScript rendered client-side.
Stack: **Vite 6 + React 18 + TypeScript 5.6 (strict)** + plain global CSS (no Tailwind, no CSS modules). No test runner, no linter — `tsc -b` in the build is the only automated check.

## STRUCTURE
```
index.html          # fonts (Jost/Barlow via Google Fonts), favicon, #root
vite.config.ts      # dev server pinned to port 5500
src/
  main.tsx          # entry point
  App.tsx           # ALL layout sections as local components (Nav, Hero, About, Tour, Music, Gear, Contact, Footer, NowPlaying, …)
  content.ts        # ALL site copy/data (artist, tourDates, tracks, bassStrings, gear) with typed shapes
  styles.css        # single global stylesheet (~1,600 lines): :root design tokens + BEM-ish classes
  components/       # heavy, self-contained interactive pieces only
    ParticleBass.tsx  # raw-WebGL instanced particle system (~2,700 particles) forming a bass silhouette in the hero
    Thunder.tsx       # storm <video> overlay, built imperatively (see NOTES)
    RiffPlayer.tsx    # module-level Web Audio singleton: riff engine + pub/sub
    BassNeck.tsx      # clickable 4-string neck (Karplus-Strong pluck)
    Ticker.tsx        # decorative CSS marquee
  hooks/useReveal.ts  # IntersectionObserver reveal hook (adds .is-visible to [data-reveal])
  lib/pluck.ts        # Karplus-Strong plucked-string synthesis → AudioBuffer
public/
  thunder.mp4       # the only media asset (1920×1080, 10s loop, real storm footage)
  bass-icon.svg     # favicon
images/             # source assets (originals), NOT referenced by the build
```

## COMMANDS
| Action | Command |
|--------|---------|
| Install | `npm install` |
| Dev    | `npm run dev` (port 5500) |
| Build  | `npm run build` (`tsc -b` type-check + `vite build` → `dist/`) |
| Preview | `npm run preview` |

There is **no test command**. Run `npm run build` after changes — it is the only automated check.

## CODING STANDARDS
- **Language**: TypeScript strict (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`) — unused variables/parameters fail the build. Avoid `any` (the WebGL fallback in `ParticleBass.tsx` casts deliberately).
- **Style**: functional React components, hooks for state/effects. Layout sections stay as local functions in `App.tsx`; only genuinely heavy/interactive pieces go in `src/components/` (PascalCase, one per file).
- **Content**: all copy/data in `src/content.ts` — never hardcode text in components.
- **Styling**: single `src/styles.css`; reuse `:root` tokens (`--bg`, `--ink`, `--accent`, `--font-display`, …); BEM-ish `block__element--modifier` class names.
- **Motion**: animated effects must check `prefers-reduced-motion` and disable/quiet themselves (Thunder and ParticleBass do).

## WHERE TO LOOK
- **Source**: `src/App.tsx` (page), `src/content.ts` (copy/data)
- **Interactive effects**: `src/components/`
- **Styling**: `src/styles.css`
- **Docs**: `CLAUDE.md` (longer sibling with the same architecture details — keep in sync if conventions change)

## NOTES
- **Audio is synthesized live — two independent Web Audio systems, each with its own module-level `AudioContext`** (no audio files):
  - `RiffPlayer.tsx` is a **module-level singleton, not React state**: `startRiff(track)` schedules all notes up front (sawtooth + sub sine → resonant lowpass, plucky gain envelope) and runs a `setInterval` step clock. Components sync via pub/sub: `subscribeRiff(cb)` (active track id or `null`) and `subscribeSteps(cb)` (current 16th-note step, `-1` idle) — subscribe in `useEffect`, clean up on unmount. This keeps the hero CTA, track rows, and "now playing" chip in sync.
  - `lib/pluck.ts` (`pluckString(freq)`) is Karplus-Strong synthesis, used only by `BassNeck`.
  - `midiToFreq` is duplicated in `RiffPlayer.tsx` and `BassNeck.tsx`; consolidate if adding more audio.
- **Thunder.tsx (hero lightning on hover over the name)**: the `<video>` is created **imperatively** (hand-built, appended to `.hero`, managed via DOM so React re-renders don't clear inline styles). `mix-blend-mode: screen` drops out the dark sky so only the bolt reads through. Current tuning (all in 1920×1080 video space, scaled by hero size in `applyTransform`):
  - `BOLT_BOX` (left 900, w 700) + `BOLT_HEIGHT_FRAC` 0.55 + `BOLT_SHIFT_X_PX` 384 position the bolt in the hero's top-left corner.
  - `CROP_RIGHT` 880 and `CROP_BOTTOM` 10% are beveled into a **120° corner** via `clip-path: polygon(...)` (`CHAMFER_A` 150, `CHAMFER_B` = A·√3 → 60° cut).
  - Opacity 0.7 while active (`.thunder--on` in styles.css); flash lasts ~1s (`THUNDER_FLASH_MS` in `App.tsx`), then fades out.
  - The bolt moves around the frame across the 10s loop (bright core roughly x=180–1000); the crop/chamfer values assume that. Disabled under `prefers-reduced-motion`.
- **Scroll reveals**: elements opt in with `data-reveal` + staggered `--reveal-delay` (via the `delay(ms)` helper in `App.tsx`); `useReveal` flips them to `.is-visible` on scroll.
- **Verification workflow**: `npm run build` must pass; for visual work (Thunder, particles) check in the browser at `http://localhost:5500` — the dev server is already the standard review loop.

## TASK EXECUTION WORKFLOW

For any non-trivial assignment, do not implement the entire request in one pass.

### 1. PLAN FIRST

Before making code changes:

1. Inspect the relevant existing code and architecture.
2. Understand the user's requested outcome.
3. Break the assignment into small, logically independent tasks.
4. Create or update `PLAN.md` in the project root.
5. Present the plan to the user before starting implementation.

The plan should use this format:

- [ ] Task 1 — short description
- [ ] Task 2 — short description
- [ ] Task 3 — short description
- [ ] Task 4 — short description

Each task should have a clear completion criterion.

Do not create unnecessarily small tasks. Prefer tasks that can be implemented and verified independently.

### 2. EXECUTE SEQUENTIALLY

After the plan is approved, execute tasks strictly in order.

For each task:

1. Select the first unchecked task.
2. Inspect the code needed for that task.
3. Implement only that task.
4. Run the appropriate verification.
5. If verification fails, diagnose and fix the problem before continuing.
6. Re-run verification.
7. Only after verification passes, mark the task `[x]`.
8. Continue automatically with the next unchecked task.

Never skip an unfinished task in order to work on a later task.

### 3. VERIFICATION

For this project:

- Run `npm run build` after every completed implementation task.
- For visual/UI changes, also inspect the result in the browser at `http://localhost:5500`.
- Do not mark a task complete if `npm run build` fails.
- If a visual task cannot be verified automatically, inspect it manually before marking it complete.

### 4. PLAN STATE

`PLAN.md` is the persistent source of truth for the current assignment.

Example:

# Current Task Plan

- [x] Analyze existing hero implementation
- [x] Update hero typography
- [ ] Add responsive mobile layout
- [ ] Verify desktop and mobile layout
- [ ] Run final build

Keep the plan updated as work progresses.

If implementation reveals that the original plan is incorrect or incomplete:

1. Stop before proceeding with dependent tasks.
2. Explain what was discovered.
3. Update `PLAN.md`.
4. Continue from the corrected plan.

Do not silently change the scope.

### 5. TASK COMPLETION

A task is complete only when:

- The requested implementation is finished.
- Existing functionality has not been unnecessarily broken.
- `npm run build` passes.
- Required visual verification has been performed.
- The corresponding item in `PLAN.md` is marked `[x]`.

### 6. FINAL REVIEW

After all tasks are complete:

1. Run `npm run build` one final time.
2. Review the changes against the original request.
3. Check for unused imports, dead code, accidental changes, and obvious regressions.
4. If appropriate, inspect the final result in the browser.
5. Report what was completed and any limitations.

Do not claim the assignment is complete if any planned task remains unchecked.

### 7. CONTEXT MANAGEMENT

Do not repeatedly load the entire project into context.

For each task:

- Read only the files relevant to the current task.
- Prefer targeted searches over reading large files unnecessarily.
- Do not re-read files whose relevant content is already known.
- Use the context-management tools when the task becomes large.
- Keep `PLAN.md` concise so the current state survives context compaction.
- After context compaction, use `PLAN.md` to determine the current task and continue from the first unchecked item.
