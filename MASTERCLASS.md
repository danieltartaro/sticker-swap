# Claude Code Masterclass
## Building the FIFA World Cup 2026 Sticker Swap App

> A living tutorial. Each module teaches one piece of Claude Code while we build one piece of the app. Read modules in order on a first pass — they build on each other. Come back to any module as reference once you've shipped.

## How to use this doc

1. Read the module text in your editor (or back here in Cowork).
2. Do the **Try it yourself** steps in your terminal — that's where you actually use Claude Code.
3. When you want to think out loud or get a concept explained, open this Cowork session and ask. Cowork is your sparring partner; Claude Code is your hands-on builder.

## The roadmap

| # | Module | What we build | Claude Code skill |
|---|---|---|---|
| 0 | Orientation | nothing yet | The Claude family, where Claude Code fits |
| 1 | Scaffold | Vite + React + TS + Tailwind + Dexie + PWA | `CLAUDE.md` as project memory |
| 2 | Plan mode | Sticker data model in code | Plan mode, ask-before-do |
| 3 | Data layer | IndexedDB schema + seed loader | Iterative editing, diff review |
| 4 | Lookup screen | The killer feature (instant ✅/❌/🔄) | TDD with Claude, test-first prompts |
| 5 | PWA shell | Service worker, manifest, install prompt | Bash + log-driven debugging |
| 6 | Custom commands | `/swap`, `/seed`, etc. | `.claude/commands/` |
| 7 | Hooks | Format on save, test on save | `.claude/settings.json` hooks |
| 8 | Subagents + MCP | A `ui-reviewer` subagent; an HTTP MCP | Specialist agents, MCP connectors |
| 9 | Plugins + ship | Package as a plugin; deploy | Plugin authoring, PWA deploy |

Modules 0 and 1 are below. Later modules land as we work through them.

---

## Module 0 — Orientation

### The Claude family in one chart

| Name | What it is | When to reach for it |
|---|---|---|
| **Claude** | The model itself (Opus 4.6, Sonnet 4.6, Haiku 4.5 as of May 2026) | n/a — it's the brain inside everything below |
| **Claude.ai** | The chat web app | Quick chat, no files |
| **Claude Desktop** | The desktop chat app | Chat + file uploads + MCP |
| **Cowork** | What you're using right now to read this | Organize files, scheduled tasks, computer use, scaffold documents in your iCloud folder |
| **Claude Code** | CLI tool you run in your terminal | **Real software work** — read/write your code, run your tests, iterate |
| **Claude Agent SDK** | Programmer's toolkit for building agents | You won't need it here; school-agent uses it |
| **Claude API** | Raw API access | Roll your own |

> **In one line:** want to *build software*, use Claude Code. Want to *organize your life and files*, use Cowork. Want to *chat*, use Claude.ai.

### Why Claude Code is different

It's not "chat about code." It's a session where Claude has:

- **Filesystem access** — `Read`, `Write`, `Edit`, `Glob`, `Grep` on your project files.
- **A shell** — runs `npm install`, `git status`, your test suite, anything you'd type in a terminal.
- **Memory** — `CLAUDE.md` gives every session the same context without you re-explaining.
- **Iteration** — sees its own output, runs tests, fixes the failure, repeats.
- **Plan mode** — proposes a plan before touching anything; you approve; then it executes.

In practice: instead of copy-pasting code blocks back and forth with a chat window, you describe an outcome and Claude does it end-to-end in your repo.

### The session loop

```
you say what you want
  └── Claude makes a plan (or jumps in, depending on mode)
        └── Claude reads files, edits, runs commands
              └── Claude shows you the diff and the test output
                    └── you say "yes, keep going" / "change this"
                          └── loop
```

The skill is mostly **what you say in step 1** (specificity) and **how you review in step 4** (catching bad guesses early).

### The three modes you'll touch

1. **Default mode.** Claude reads, writes, runs commands. Asks permission the first time it uses each tool in a session, then remembers.
2. **Plan mode.** Toggle with `Shift+Tab` (or launch with `claude --plan`). Claude can read and think, but cannot write or run commands until you approve a plan. Use for anything you don't fully understand yet.
3. **Auto-accept.** `Shift+Tab` again to cycle in. Claude stops asking permission. Power-user mode; only on a project you can blow away.

### Where Claude reads context from

When you launch `claude` in a folder, Claude reads (in order):

1. `~/.claude/CLAUDE.md` — your global, cross-project notes.
2. `./CLAUDE.md` — the project's memory. **This is the most important file in your repo for Claude Code.**
3. `./.claude/settings.json` — hooks, model overrides, project-level config (we'll add this in Module 7).
4. Anything you reference with `@path/to/file` in your prompt.

When Claude needs more, it'll `Read` or `Glob`/`Grep` to find it. You don't have to preload everything.

---

## Module 1 — Scaffold

### What we just built

I scaffolded the project at `/AI/sticker-swap/`. The tree:

```
sticker-swap/
├── CLAUDE.md            ← project memory (read this next)
├── MASTERCLASS.md       ← you are here
├── README.md
├── package.json
├── vite.config.ts       ← Vite + the PWA plugin
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── .gitignore
└── src/
    ├── main.tsx         ← React entry
    ├── App.tsx          ← placeholder UI
    ├── index.css        ← Tailwind directives
    └── vite-env.d.ts    ← Vite + PWA type hints
```

That's a runnable scaffold. No app logic yet — that comes Module 3 onwards.

### The lesson: `CLAUDE.md` is the contract

Open `CLAUDE.md` now and read it. Notice what it does:

- **States the goal in one paragraph.** Not marketing — a *constraint*. "Instant offline lookup at swap events. <50ms keypress-to-result."
- **Calls out non-negotiables.** Performance contract. No server until Module 9.
- **Names the stack and why.** Future-Claude doesn't have to guess.
- **Documents the data model.** A typed example beats a paragraph of prose.
- **Maps the folders.** Saves a `Glob` round-trip.
- **Lists conventions.** "Functional React. No `any`. Tests colocated."
- **Lists anti-patterns.** What NOT to do matters as much as what to do.

The principle: **`CLAUDE.md` is the brief you'd give a senior engineer joining your project tomorrow.** Concrete, opinionated, terse. Not a tutorial.

#### Anti-patterns to avoid in `CLAUDE.md`

- ❌ Treating it as a README. The README is for humans browsing your repo. CLAUDE.md is for Claude.
- ❌ Stuffing it with every dependency version. Claude can read `package.json`.
- ❌ Writing like documentation ("This project aims to..."). Write like instructions ("Performance contract: <50ms. No server-side state until Module 9.").
- ❌ Letting it grow past ~200 lines. Past that, split into focused docs and link from CLAUDE.md.

### Try it yourself

**Step 1 — install dependencies.** In your terminal:

```sh
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/AI/sticker-swap
npm install
```

This installs Vite, React, TypeScript, Tailwind, Dexie, Zustand, and the PWA plugin. ~30 seconds.

**Step 2 — start the dev server.**

```sh
npm run dev
```

You should see `Local: http://localhost:5173/`. Open it. The "Sticker Swap" placeholder appears.

> **If `npm install` errors:** check Node — `node -v` should report v20 or higher. If older, `brew install node@20` and re-run.

**Step 3 — launch Claude Code in the project.** Open a new terminal tab (leave the dev server running):

```sh
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/AI/sticker-swap
claude
```

You're now in a Claude Code session. It greets you with the working directory. It's already read `CLAUDE.md` and `~/.claude/CLAUDE.md` (if you have one).

**Step 4 — three prompts to feel the loop.** Try these in order:

```
Read CLAUDE.md and summarize the project in 5 bullets.
```

Pure-read prompt. Notice Claude uses the `Read` tool, then answers. No edits.

```
What's the highest-risk part of this project, based on what you've read?
```

Opinion prompt. Notice Claude reasons about the *performance contract* and the *offline-first* constraint. That's what good context buys you.

```
List the files in src/ and tell me what each is for.
```

Uses `Glob` or `Bash` (`ls`) plus `Read`. You can see Claude planning its own information-gathering.

**Step 5 — try plan mode.** Press `Shift+Tab` until you see "plan mode" in the status bar. Now ask:

```
Plan how we'd add a Sticker type to src/data/stickers.ts.
Don't write the file — just show me the plan.
```

Claude will propose: create `src/data/`, create `stickers.ts`, define the type, maybe an interface for the seed loader. You approve or push back. **You'll use this every time you start something non-trivial.**

### What you learned in Module 1

- Where the Claude family pieces fit (Claude Code vs Cowork vs the rest).
- The session loop and the three modes.
- `CLAUDE.md` as a contract, not a README — and how to write one well.
- The default tool set: `Read`, `Write`, `Edit`, `Glob`, `Grep`, `Bash`.
- Plan mode as a safety net for anything non-trivial.

### Homework before Module 2

1. Run `npm install` and `npm run dev`. Confirm the placeholder loads.
2. In Claude Code, ask: `Suggest 3 things you'd add to CLAUDE.md to make your job easier next session.` Read what it says. Don't apply blindly — judge each suggestion. This is a *great* prompt to run periodically.
3. Try plan mode (`Shift+Tab`) once on any small task so the muscle memory clicks.

When you come back, we do **Module 2 — Plan mode + the sticker data model**. We'll write our first real code, but only after Claude makes a plan and you approve it. That's where the productivity gains start to show.

---

*Modules 2–9 will be appended as we work through them. Each one keeps this same shape: what we built, the concept it taught, try-it-yourself, homework.*
