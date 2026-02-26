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
| Behavior changed | Live API output showing new behavior | "pytest passed" or "code looks right" |

## Verification Level Decision Tree

Not all changes need the same level of verification. Use this tree to determine what's required:

```
Is the project a running service (e.g. Jarvis)?
├─ NO → Unit tests + build = sufficient
└─ YES → Continue ↓

Does this change affect server-side behavior?
(API response content, tool execution, SSE events, database, agent loop)
├─ YES → FULL VERIFICATION required:
│    1. All automated tests (pytest + build + E2E)
│    2. Restart server
│    3. Health check (correct version)
│    4. Targeted live API test for the specific change
│    5. Report actual output as evidence
│
└─ NO (pure frontend/styling/refactor with no behavior change)
   → STANDARD VERIFICATION sufficient:
      1. All automated tests (pytest + build + E2E)
      2. Note explicitly: "Pure UI change, Live API test not applicable"
```

When in doubt: do the full verification. The cost of a 30-second curl is zero compared to shipping a broken feature.

## Live API Behavioral Verification

For projects with a running server (e.g. Jarvis), unit tests are necessary but NOT sufficient. Before claiming a behavior change works:

1. **Restart** — server must load the new code
2. **Health check** — confirm version matches what was just built
3. **Design** — construct a request that triggers the specific change
4. **Send** — real API call (curl/script), not mock
5. **Read** — parse the actual response content
6. **Evaluate** — does the output match the intended behavior change?
7. **Report** — show the actual output as evidence to the user

See project's `docs/LIVE_API_TESTING.md` for protocol details and command templates.

### What to verify per change type

| Change type | Targeted test |
|-------------|---------------|
| New API parameter | Send request with the new param, verify it's accepted and affects output |
| New tool | Send message that triggers the tool, verify tool_call + tool_result events |
| SSE event change | Parse the raw SSE stream, verify new event type/fields appear |
| Frontend toggle/setting | Verify the setting is sent in POST body (capture via server logs or targeted request) |
| Database persistence | Send message, restart server, load history, verify data survives |
| Agent loop change | Trigger multi-round tool use, verify correct iteration behavior |

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
