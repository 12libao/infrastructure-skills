---
name: verify-before-claim
description: Use when about to claim work is complete, fixed, or passing. Evidence before assertions, always.
---

# Verification Before Completion

## Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

Haven't run the verification command in THIS message? Cannot claim it passes.

## The Gate

```
BEFORE claiming any status:

1. IDENTIFY — What command proves this claim?
2. RUN — Execute the FULL command (fresh, not cached)
3. READ — Full output, check exit code, count failures
4. VERIFY — Does output confirm the claim?
   - NO → State actual status with evidence
   - YES → State claim WITH evidence
5. ONLY THEN — Make the claim

Skip any step = lying, not verifying
```

## What Counts as Evidence

| Claim | Requires | NOT Sufficient |
|-------|----------|----------------|
| Tests pass | Test output: 0 failures | Previous run, "should pass" |
| Build succeeds | Build output: exit 0 | Linter passing |
| Bug fixed | Original symptom gone | "Code changed, should work" |
| Requirements met | Line-by-line checklist | "Tests pass" alone |

## Red Flags — STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Done!")
- About to commit/push/PR without running tests
- Relying on previous run results
- Thinking "just this once"

## Forbidden Phrases

- "应该可以了"
- "Should work now"
- "Looks correct"
- "I'm confident"
- Any success claim without showing command output

## The Rule

Run the command. Read the output. THEN claim the result. Non-negotiable.
