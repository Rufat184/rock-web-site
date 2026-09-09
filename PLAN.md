# Current Task Plan

## Goal: Make the bass silhouette in the hero more legible (user-approved: denser particles, tighter float, stronger glow)

All changes are in `src/components/ParticleBass.tsx`.

- [x] Task 1 — Denser silhouette: raise particle size (`uSize` 0.062 → ~0.085) and fragment alpha (`mix(0.50, 0.80)` → ~`mix(0.62, 0.92)`). Verify: `npm run build` + browser.
- [x] Task 2 — Tighter, more anchored shape: reduce idle float (`uLoose` 0.3 → 0.15) and strengthen the center glow (factor 0.3 → ~0.45, range 8 → 10). Verify: `npm run build` + browser.
- [x] Task 3 — Final verification: desktop + mobile visual check in browser, final `npm run build`, tune if over-bright.
