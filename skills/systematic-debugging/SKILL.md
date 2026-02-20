---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes. Triggers - bug, error, failure, broken, 报错, 失败, 不工作
---

# Systematic Debugging

## Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

Haven't completed Phase 1? Cannot propose fixes.

## Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read error messages carefully** — full stack trace, line numbers, error codes. Don't skip past them.
2. **Reproduce consistently** — exact steps, every time. Not reproducible? Gather more data, don't guess.
3. **Check recent changes** — git diff, recent commits, new deps, config changes.
4. **Gather evidence at boundaries** — in multi-component systems, log what enters/exits each component. Run once to see WHERE it breaks.
5. **Trace data flow** — where does the bad value originate? Trace backward to source.

## Phase 2: Pattern Analysis

1. Find similar WORKING code in the codebase
2. Compare working vs broken — list every difference
3. Don't assume "that can't matter"

## Phase 3: Hypothesis and Fix

1. State hypothesis: "X is root cause because Y"
2. Make the SMALLEST change to test it
3. ONE variable at a time
4. Didn't work? New hypothesis. Don't stack fixes.

## Phase 4: Verification

1. Create failing test reproducing the bug (use TDD skill)
2. Apply fix
3. Test passes? Other tests still pass? Done.
4. Test fails? Back to Phase 1 with new info.

**If 3+ fixes failed:** STOP. Question the architecture. Discuss with user before attempting more.

## Red Flags — STOP, Return to Phase 1

- "Quick fix for now, investigate later"
- "Just try changing X and see"
- "I don't fully understand but this might work"
- Proposing solutions before reading error messages
- "One more fix attempt" after 2+ failures
- Each fix reveals new problem in different place

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Issue is simple" | Simple issues have root causes too |
| "Emergency, no time" | Systematic is faster than thrashing |
| "Just try this first" | First fix sets the pattern. Do it right. |
| "I see the problem" | Seeing symptoms ≠ understanding root cause |
