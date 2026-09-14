# Current Task Plan

## Goal: Mouse-follow light + scatter should sit exactly under the cursor when hovering the hero bass

Root cause: in `ParticleBass.tsx`, the smoothed mouse position is lerped with a
per-frame factor of `MOUSE.decay` (0.85) — i.e. it jumps 85% of the remaining
distance every frame, so it only reaches the cursor after ~10 frames (~300ms),
which reads as a lagging, offset light/scatter.

- [ ] Task 1 — Make the mouse smoothing frame-rate independent and snappy: lerp with `1 - pow(0.0005, dt)` (settles in ~1 frame) instead of the fixed 0.85 factor. Verify: `npm run build` + browser (light/scatter tracks the cursor with no visible offset).
