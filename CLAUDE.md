# Infrastructure Skills — Development Guide

This project provides reusable AI infrastructure: tool skills (race-optimize, call-model) and process skills (TDD, debugging, verification, critical review). Core engineering principles live in `global/CLAUDE.md`.

## Install

```bash
./install.sh
```

One-time setup. Creates symlinks from `~/.claude/` to this project. After install, edits here take effect globally — no re-install needed. Re-run only when adding new skills.

## Project Structure

- `lib/ai.js` — AI model API gateway (zero dependencies)
- `lib/race.js` — Multi-model race optimization engine
- `config/models.json` — Model aliases and role configuration
- `config/criteria/` — Scene-specific evaluation criteria templates
- `.env.local` — API keys (not committed)
- `skills/` — All skill docs (source of truth, symlinked to `~/.claude/skills/`)
- `global/CLAUDE.md` — Global engineering principles (symlinked to `~/.claude/CLAUDE.md`)
- `install.sh` — Symlink installer
- `test/` — Tests

## Development Rules

- Runtime code in `lib/` must remain zero-dependency (Node.js >= 18 built-ins only)
- Run tests before claiming changes work: `node --test test/`
- Edit skills in `skills/*/SKILL.md` — changes are live via symlinks

## Skills

### Tool Skills

| Skill | Usage |
|-------|-------|
| race-optimize | `node $HOME/git/infrastructure-skills/lib/race.js <file> "<goal>"` |
| call-model | `node $HOME/git/infrastructure-skills/lib/ai.js call <alias> "<prompt>"` |

### Process Skills

| Skill | Triggers on |
|-------|-------------|
| tdd | Implementing features or bugfixes |
| systematic-debugging | Bugs, errors, test failures |
| verify-before-claim | Before claiming work is complete |
| critical-review | Receiving feedback or suggestions |
