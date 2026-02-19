# Race Optimize

Multi-model competitive optimization: N models generate independently, cross-review extracts essences, deep-thinking synthesizes all contributions, adversarial review stress-tests, evidence-based verification confirms improvement.

## Trigger Keywords

- "race optimize", "race-optimize", "racing"
- "multi-model optimize", "competitive optimization"

## Pipeline

```
DIVERGE → EVALUATE → CONVERGE → STRESS → VERIFY → [Loop if improved > 5%]
```

**Phase 1: DIVERGE** — N models generate in parallel, each with a different strategy bias.
**Phase 2: EVALUATE** — Cross-review all versions + extract structured essences (JSON).
**Phase 3: CONVERGE** — Deep-thinking judge: strategy analysis → essence fusion.
**Phase 4: STRESS** — Adversarial attack + auto-patch critical issues.
**Phase 5: VERIFY** — Code: run tests/benchmarks. Text: independent jury scoring (median).

Loop until convergence (improvement < 5%) or max rounds reached.

## Scenes (auto-detected)

| Scene            | Detection                                  | Verification        | Criteria              |
| ---------------- | ------------------------------------------ | ------------------- | --------------------- |
| code-performance | Code file extensions (.js, .py, .ts, etc.) | Tests + benchmark   | code-performance.md   |
| code-refactor    | Keywords: "refactor", "YAGNI"              | Tests               | code-refactor.md      |
| prompt           | Keywords: "prompt"                         | Multi-model scoring | prompt-engineering.md |
| text             | Default                                    | Multi-model scoring | text-general.md       |

## Invocation

CLI (simple):

```bash
node lib/race.js <file> "<goal>"
```

Programmatic API:

```javascript
import { Race } from "./lib/race.js";
const result = await new Race({ target: "sort.py", goal: "faster" }).run();
```

## Key Innovation: Essence Extraction

Every model's output contributes. Phase 2 extracts the single best contribution from each version as structured JSON. Phase 3 MUST incorporate all essences — nothing is wasted.

## Model Roles

- **Racers**: claude-opus-4-6, gpt-5, gpt-5-codex, claude-opus-4-5, deepseek (generate competing versions)
- **Judge**: claude-thinking (strategy analysis + essence fusion)
- **Adversary**: claude-thinking (attack merged output)
- **Scorers**: racers excluding judge (independent jury)
- **Fallback**: gpt-5-chat, grok (when primary models fail)

## Output

Results saved to `race_output/`:

- `original.md` — backup of original
- `round{N}/version_{A,B,C...}.md` — each racer's output
- `round{N}/review_{1,2,3}.md` — cross-reviews
- `round{N}/strategy.md` — judge's strategy analysis
- `round{N}/merged.md` — fused version
- `round{N}/adversarial.md` — adversarial review
- `round{N}/fixed.md` — patched version (if needed)
- `round{N}/verification.json` — scores and evidence
- `final.*` — final optimized version
- `report.md` — full optimization report
