---
name: call-model
description: Use when calling an external AI model through the unified API gateway. Triggers - call external model, use external model, 调用外部模型
---

# Call External Model

Call any configured AI model with a prompt. Zero dependencies, unified API gateway.

## Trigger Keywords

- "call external model", "use external model"

## Invocation

```bash
node $HOME/git/infrastructure-skills/lib/ai.js call <model-alias> "<prompt>"
```

## Available Models

| Alias           | Model                    | Role            |
| --------------- | ------------------------ | --------------- |
| claude-opus-4-6 | claude-opus-4-6          | Primary         |
| gpt-5           | gpt-5.2                  | Primary         |
| gpt-5-codex     | gpt-5.2-codex-2026-01-14 | Code specialist |
| claude-opus-4-5 | claude-opus-4-5-20251101 | Primary         |
| deepseek        | deepseek-r1              | Reasoning       |
| gpt-5-chat      | gpt-5.2-chat             | Fallback        |
| grok            | grok-4.1                 | Fallback        |
| claude-thinking | claude-opus-4-6-thinking | Deep thinking   |
| deepseek-search | deepseek-r1-searching    | Web search      |

## List All Models

```bash
node $HOME/git/infrastructure-skills/lib/ai.js list
```

## Programmatic API

```javascript
import { AI } from "$HOME/git/infrastructure-skills/lib/ai.js";
const ai = new AI();
const result = await ai.call("claude-opus-4-6", "Your prompt here");
console.log(result.content);
```
