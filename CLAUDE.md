# Infrastructure Skills

AI skill library providing reusable infrastructure for any project.

## Available Skills

### 1. Race Optimize
**Trigger**: "race optimize", "multi-model optimize"
**Skill file**: `skills/race-optimize/SKILL.md`
**Usage**: `node lib/race.js <file> "<goal>"`

Multi-model competitive optimization. Multiple AI models generate independently, cross-review extracts essences, deep-thinking judge synthesizes all contributions, adversarial review stress-tests, evidence-based verification confirms improvement.

### 2. Call External Model
**Trigger**: "call external model", "use external model"
**Skill file**: `skills/call-model/SKILL.md`
**Usage**: `node lib/ai.js call <model-alias> "<prompt>"`

Call any configured AI model through unified API gateway.

## Rules

- When a trigger keyword is detected, read the corresponding SKILL.md and follow its workflow
- Model configuration is in `config/models.json`
- API keys are in `.env.local`
- All runtime code is in `lib/` (zero dependencies, Node.js >= 18)
