# Current Task Plan

Fix agent-doc and tooling drift (option B-i: keep the installed tooling and make it real).

## Verified problems
1. `CLAUDE.md` deleted in `9cf6320`, but `AGENTS.md:53` still tells agents to keep it in sync.
2. `AGENTS.md` says "no test runner, no linter" while `eslint@10`, `prettier@3`, `vitest@4`, `jsdom`,
   `coverage-v8` are in devDependencies and `.eslintrc.js`, `.prettierrc`, `vitest.config.ts` exist.
3. ESLint cannot run: `.eslintrc.js` is legacy eslintrc format (and `module.exports` in a
   `"type": "module"` package); ESLint 10 requires `eslint.config.*`.
4. No `lint` / `test` / `format` scripts, so the installed tools are unreachable.
5. `vitest run` exits 1 — zero test files; `src/test/webAudioMock.ts` is orphaned.
6. `src/lib/audioUtils.ts` ("single source of truth") is imported by nobody; `midiToFreq` is still
   duplicated in `RiffPlayer.tsx` and `BassNeck.tsx`. (Documented, not wired — wiring is option C.)
7. Structure tree omits `src/lib/audioUtils.ts`, `src/test/webAudioMock.ts`, `scripts/diag-shape.mjs`,
   and all root tool configs.

## Tasks
- [x] Task 1 — Replace `.eslintrc.js` with a flat `eslint.config.js` (JS + TS, deliberate `any` in
      ParticleBass stays a warning); `npx eslint src` must run and exit 0.
- [x] Task 2 — Add `lint`, `lint:fix`, `test`, `test:watch`, `format`, `format:check` scripts to
      `package.json`; align `.prettierrc` `singleQuote` to the repo's existing double-quote style.
- [x] Task 3 — Add one real spec (`src/content.test.ts`) over the pure data in `content.ts` so
      `npm test` exits 0 instead of "No test files found".
- [x] Task 4 — Rewrite `AGENTS.md`: remove the `CLAUDE.md` reference, correct the commands table and
      structure tree, state the real verification gate, document the `audioUtils.ts` dead-code state.
- [x] Task 5 — Final verification: `npm run lint`, `npm test`, `npm run build` all pass; check
      `git status` for unintended churn.

## Explicitly out of scope (option C, not B)
- Importing `audioUtils.ts` from `RiffPlayer` / `BassNeck` / `pluck` (shares one AudioContext — real
  runtime behaviour change).
- Running `prettier --write` across the repo (~9 src files of formatting-only churn).
