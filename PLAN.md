# Current Task Plan

Fix guitar shape: horn not visible, dots too big (ParticleBass.tsx).

## Root cause (verified with scripts/diag-shape.mjs rasterization)
1. Fragment shader `smoothstep` inverted → particles render as hollow rings; the thin horn (3–5 px in the 110px sample grid) falls out.
2. `drawBass` scales by RES/2000 but coordinates are authored in 1500 space → shape 25% too small, horn thinner.
3. Neck + headstock paths were deleted → tuning machines float, horn reads weaker.
4. `uSize` 0.085 ≈ full particle spacing (0.118) → dots overlap into blobs.
5. Dead detail (15%-white sliver, sub-pixel black dots) adds nothing at 110px sampling.

## Tasks
- [x] Task 1 — Restore neck + headstock paths in drawBass; scale RES/1500; drop dead detail
- [x] Task 2 — Fix fragment shader: filled dots (smoothstep 0.55→0.35) + center glow
- [x] Task 3 — Reduce dot size uSize 0.085 → 0.058
- [x] Task 4 — npm run build + visual check at http://localhost:5500
