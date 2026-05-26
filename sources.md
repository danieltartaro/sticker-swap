# Sources

External sources we ingested or relied on. Per doctrine §4.7 + §4.8, this is where verified external references live so we can re-find them, credit them, and audit dependencies later. Same-pass rule: when we ingest a new source, register it here.

## Panini FIFA WC 2026 Standard Edition — sticker catalog

- **URL:** `https://www.laststicker.com/cards/panini_world_cup_2026/checklist`
- **Date accessed:** 2026-05-26
- **Access method:** Cowork Chrome MCP (the site is Cloudflare-gated; raw HTTP via `web_fetch` or `curl` returns the security-challenge shell). Claude Code's terminal session cannot reach it without browser automation.
- **Extracted artifact:** `data/raw/panini-wc-2026-catalog.json` — 1,034 stickers, fields: `code`, `name`, `team`.
- **Cutoff rule applied:** include everything up to and including `FWC19`; the first row after (`CC-US1`) is regional promo and excluded along with all subsequent regionals.
- **Attribution requirement:** prominent credit to laststicker.com in the public README and in the JSON file's `source` field. They did the original aggregation; we curated the cutoff.
- **License posture:** factual checklist data (codes, player names, team affiliations) is non-copyrightable in most jurisdictions, but the curation effort deserves credit. We MIT-license our derivative work but link prominently to the source.
