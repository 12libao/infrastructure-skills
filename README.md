# Infrastructure Skills

AI skill library providing reusable infrastructure. Zero dependencies, Node.js >= 18.

## Skills

### Race Optimize

Multi-model competitive optimization. N models generate independently, cross-review extracts essences from each, deep-thinking judge fuses all contributions, adversarial review stress-tests, evidence-based verification confirms improvement.

```bash
node lib/race.js <file> "<goal>"
```

**Pipeline**: DIVERGE → EVALUATE → CONVERGE → STRESS → VERIFY → [Loop if improved]

**Scenes** (auto-detected): code-performance, code-refactor, prompt engineering, text optimization.

**Key design**: Essence extraction ensures every model's output contributes — nothing is wasted.

### Call External Model

Call any configured AI model through unified API gateway.

```bash
node lib/ai.js call <model-alias> "<prompt>"
node lib/ai.js list
```

## Architecture

```
skills/                          # Skill definitions (platform-agnostic)
  race-optimize/
    SKILL.md                     # Workflow definition
    prompts/                     # Externalized prompt templates
      generate.md                # Phase 1: DIVERGE
      review.md                  # Phase 2: EVALUATE
      synthesize.md              # Phase 3: CONVERGE
      adversarial.md             # Phase 4: STRESS
      score.md                   # Phase 5: VERIFY
    criteria/                    # Evaluation criteria (anchored rubrics)
      code-performance.md
      code-refactor.md
      text-general.md
      prompt-engineering.md
  call-model/
    SKILL.md
lib/
  ai.js                         # Model client (283 lines, zero deps)
  race.js                       # Race engine (~500 lines, zero deps)
config/
  models.json                   # Model registry
```

## Models

| Alias | Role | Description |
|-------|------|-------------|
| claude-opus-4-6 | racer | Claude Opus 4.6 |
| gpt-5 | racer | GPT-5.2 |
| gpt-5-codex | racer | GPT-5.2 Codex (code specialist) |
| claude-opus-4-5 | racer | Claude Opus 4.5 |
| deepseek | racer | DeepSeek R1 (reasoning) |
| claude-thinking | judge | Claude Opus 4.6 Thinking (synthesis + adversarial) |
| gpt-5-chat | fallback | GPT-5.2 Chat |
| grok | fallback | Grok 4.1 |

## Setup

```bash
# 1. Clone
git clone <repo> infrastructure-skills

# 2. Configure API keys
cp .env.local.example .env.local
# Edit .env.local with your keys

# No npm install needed - zero dependencies
```

## Programmatic API

```javascript
import { Race } from './lib/race.js';
import { AI } from './lib/ai.js';

// Race optimize
await new Race({ target: 'sort.py', goal: 'faster execution' }).run();

// Call model
const ai = new AI();
const result = await ai.call('claude-opus-4-6', 'Your prompt');
```
