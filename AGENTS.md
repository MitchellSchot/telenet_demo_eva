# AGENTS.md

Single-page, static concept demo (Vite + React 19 + TypeScript, plain CSS). No backend, no AI, no APIs. Continue from the roadmap in `PLAN.md`; the user delivers the work in numbered prompts and wants each step to stop when done.

## Layout

- `src/App.tsx`: page frame (header, story bar, three columns, flow strip, footer) and global keyboard shortcuts (Space, R).
- `src/hooks/useCallAudio.ts`: owns the single `HTMLAudioElement`. Exposes `file`, `duration`, `currentTime` (updated every animation frame while playing), `isPlaying`, and `load/toggle/restart/seek/clear`. `.mp4` is loaded into an audio element, so only audio plays. Future sync should read `currentTime` from here.
- `src/story.ts`: static story structure (chapters, flow-node ids/labels, offer states). `DEMO_DURATION_S` comes from the scenario file.
- `src/data/demoCall.json`: ALL scenario content (segments with timings/scores/emotions, customer data, next best action, decision checks, rules). The user edits this file directly; never hard-code scenario text in components.
- `src/data/demoCall.ts`: types for the JSON plus `isCustomer` and `groupBySource`. The live scenario is React state in `App.tsx` (starts as the JSON; the calibration panel can replace it).
- `src/sync/timeline.ts`: pure `computeView(scenario, t)` → everything every panel shows, including the decision engine (`walk`): from `decisionMomentSec` one check per `CHECK_S` (0.5 s) while the audio keeps playing. Customer-turn updates (graph points, emotion chips/bars, offer window, callout) happen at each turn's `graphPointSec` (falls back to `end`). Keep it pure so play/pause/seek/restart stay consistent.
- `src/hooks/useDemo.ts`: phases (`empty → processing → live`), restart and seek. The audio never stops by itself (no decision pause). Panels must use its `toggle/restart/seek`, not the raw audio ones.
- `src/sync/calibrate.ts` + `components/Calibration.tsx`: timing tool (key T, stamp with M, Apply/Export/Import JSON).
- Keys: Space play/pause/continue, R restart, P preview all (toggle only visible while on), T calibration, M stamp, F recording mode (fullscreen, hides tools, hides idle cursor after 2 s).
- `src/components/*`: one file per panel; panels take `focus` (yellow outline) while a decision check looks at them. The decision engine checks render inside `NextBestAction`.
- `src/brand.ts`: logo path. The official logo must be used unmodified (no recolor/crop/stretch); it is displayed with fixed height and `object-fit: contain`.
- `src/styles.css`: all styling and design tokens (brand yellow, charcoal, grey, muted red/amber/green).

## Conventions and decisions

- Sizes are in `rem`; the root font size scales with the viewport (`min(100vh/67.5, 100vw/120)`) so the layout is identical at 1920×1080 and 1366×768. The page never scrolls; panels scroll internally via `.scroll`.
- Desktop only (body min-width 1280px). No mobile layout.
- No gradients, robot or "AI brain" imagery. Keep the look calm and editorial.
- All UI text in English. The footer disclaimer must stay.
- Never add an opt-out button, cancellation link or opt-out flow; the opt-out is only in EVA's spoken line.
- Text sizes: nothing below 0.8rem; transcript and key content at 1rem (16 px at 1080p); chart labels 0.85rem. Animations use `--ease` (ease-in-out) and 300–600 ms; elements reserve their space so nothing jumps.
