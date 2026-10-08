# EVA: the right moment to sell

A concept demo for **EVA**, an emotion-aware sales voicebot for Telenet, built for a Vlerick Business School business case. EVA handles service calls and makes a sales offer only when the problem is solved **and** the customer's voice says the mood is genuinely positive. Emotion acts as a brake and a timer, not an accelerator.

The demo is one guided, single-screen story designed to be screen-recorded at 1920×1080 (it also fits 1366×768). Everything is scripted and fictional: there is no real AI, no backend and no external API.

## What works today

- Branded header, six-chapter story bar and the full three-column layout plus the "How EVA decides" flow strip
- Upload of a call recording (.mp3 or .mp4, drag-and-drop or "Choose file"); .mp4 files play their audio track only
- Player with play/pause, seekable progress bar, current time/duration and restart
- Global controls in the story bar, plus keyboard shortcuts: **Space** = play/pause, **R** = restart

## Tech

- Vite + React 19 + TypeScript, plain CSS (`src/styles.css`)
- Nunito from Google Fonts
- Deployed as a static site on Netlify (`dist/`)

## Run locally

```bash
npm install
npm run dev
```

## Brand assets

Place the official Telenet logo at `public/brand/telenet-logo.png` (unchanged). If the file is an SVG or JPG, update `LOGO_SRC` in `src/brand.ts`. Until the file is present the header shows a dashed placeholder. The brand yellow and grey in `src/styles.css` (`--yellow`, `--grey`) should be re-sampled from that file.

## Roadmap

See [PLAN.md](PLAN.md): scripted customer data, the transcript and emotion timeline, the sentiment curve, the offer decision and syncing everything to the audio.
