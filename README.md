# Sticker Swap

A tiny offline-first PWA for tracking your **Panini FIFA World Cup 2026** sticker collection — built so my son and I could walk into a swap event and know, in under a second, whether the sticker someone is offering us is a `NEED`, a `HAVE`, or a `DUPE`.

**Try it now:** [**sticker-swap-phi.vercel.app**](https://sticker-swap-phi.vercel.app/) — open on your phone, then **Share → Add to Home Screen**. Works offline after the first load. No account, no signup, your collection stays on your phone.

Two things you might want from this repo:

1. **A clean machine-readable catalog of every WC 2026 Panini sticker** — 1,034 entries with `code`, `name`, and `team`. Drop it in your own tracker, spreadsheet, or bot. → [`data/raw/panini-wc-2026-catalog.json`](data/raw/panini-wc-2026-catalog.json)
2. **The app itself** — a small React + IndexedDB PWA that runs on your phone, fully offline, with sub-50ms code lookups. Useful if you actually attend swap events and want a faster answer than thumbing through the album.

If you only want the JSON, take it and go. The rest of this README is about the app.

---

## The catalog (`data/raw/panini-wc-2026-catalog.json`)

```json
{
  "source": "laststicker.com/cards/panini_world_cup_2026/checklist",
  "edition": "Panini FIFA World Cup 2026 - Standard Edition",
  "canonicalCount": 1034,
  "cutoffRule": "Everything up to and including FWC19; regionals start at CC-US1",
  "stickers": [
    { "code": "00",   "name": "Panini Logo",     "team": "We Are Panini" },
    { "code": "FWC1", "name": "Official Emblem1", "team": "FIFA World Cup 2026" },
    ...
  ]
}
```

The 1,034 rows cover the European edition (which prints 54 bonus shiny variants for Germany, Belgium, and France — codes ending in `s`). The app's default mode filters those out for the Singapore / "rest of world" edition (980 stickers, 48 shinies — every nation Emblem is foil-stamped). If you're in Europe, you want all 1,034; everywhere else, the 980 default. See [`src/data/transformCatalog.ts`](src/data/transformCatalog.ts) for the filter.

**Attribution.** The underlying checklist data was aggregated by [laststicker.com](https://www.laststicker.com/cards/panini_world_cup_2026/checklist) — they did the heavy lifting of collecting it; this repo just curates the regional cutoff and ships it as a clean JSON. If you build on this, please credit them too.

Factual checklist data (codes, names, team labels) isn't itself copyrightable in most jurisdictions, but the curation effort deserves the link.

---

## The app

A PWA optimised for one thing: **standing at a swap table, getting an instant answer**.

- **Lookup contract:** under 50ms from keypress to result, fully offline.
- **Local-first.** Sticker inventory lives in IndexedDB (via Dexie). No accounts, no servers, no sync — your data never leaves your phone.
- **Installable.** Add to Home Screen on iOS/Android; launches full-screen, works in airplane mode.
- **First-inventory mode.** Tap through every sticker once to seed `HAVE` / `NEED` / `DUPE`. After that, the app switches to lookup mode.
- **Designed for a phone.** Big buttons. One-handed. Card-at-a-time layout. The home-screen icon is a FIFA-red `00` block with a chrome bisecting line — references the Panini wrapper without infringing anyone's marks.

### Install (hosted)

The fastest path:

1. Open [**sticker-swap-phi.vercel.app**](https://sticker-swap-phi.vercel.app/) on your phone (Safari on iOS, Chrome on Android).
2. **Share → Add to Home Screen.**
3. Launch from the new icon — full-screen, no browser chrome.

Once the home-screen launch has run once, the service worker has precached the app shell and the bundled catalog. Airplane mode is fine after that.

### Install from source

If you'd rather run your own build:

```sh
npm install
npm run build
npm run preview -- --host
```

`preview --host` exposes the production build over your LAN at port `4173`. Open `http://<your-laptop-ip>:4173/` on your phone and follow steps 2-3 above.

For development:

```sh
npm run dev    # http://localhost:5173
npm run test   # Vitest
```

### Stack

Vite + React 18 + TypeScript, Tailwind CSS with FIFA 26 design tokens, Dexie.js for IndexedDB, Zustand for UI state, `vite-plugin-pwa` for the service worker and manifest, `@fontsource/archivo-black` for the display digit face.

---

## Status & contributions

This is a personal / learning project, not a maintained product. I'm not accepting issues or pull requests — but the MIT license means **you can fork it, modify it, and ship your own version freely**. If you build something cool on top of the catalog or the app, I'd love to hear about it (find me on Reddit / GitHub) but there's no obligation.

If you spot a bug, the most useful thing you can do is fork and fix it for yourself — and ideally drop a note in your fork's README pointing other forkers at the fix.

---

## License

MIT — see [`LICENSE`](LICENSE). The bundled catalog data is credited to [laststicker.com](https://www.laststicker.com/cards/panini_world_cup_2026/checklist); this repo's curation, code, and design are mine.

---

## For the curious

- [`CLAUDE.md`](CLAUDE.md) — the project brief every Claude Code session loads. High-density read if you want to understand the architecture quickly.
- [`MASTERCLASS.md`](MASTERCLASS.md) — this app was the hands-on project for a Claude Code masterclass; notes on the build process.
- [`journal/log.md`](journal/log.md) — append-only build journal, one entry per session.
- [`specs/`](specs/) — feature briefs in build order. Spec 05 is the design system.
