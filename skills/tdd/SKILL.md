---
name: tdd
description: Use when implementing any feature or bugfix, before writing implementation code. Triggers - implement, add feature, fix bug, write code, 实现, 修复, 写代码
---

# Test-Driven Development

## Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before test? Delete it. Start over. No exceptions without explicit user approval.

## Red-Green-Refactor

### RED — Write Failing Test

Write ONE minimal test showing expected behavior.

Requirements:
- One behavior per test
- Clear name describing the behavior
- Real code, no mocks unless unavoidable

```bash
# Run test — MUST fail
npm test path/to/test.js
```

Confirm: test FAILS (not errors), failure message matches expectation, fails because feature is missing.

Test passes immediately? You're testing existing behavior. Fix the test.

### GREEN — Minimal Code

Write the SIMPLEST code to pass the test. Nothing more.

```bash
# Run test — MUST pass
npm test path/to/test.js
```

Confirm: test passes, no other tests broken.

Don't add features, don't refactor other code, don't "improve" beyond the test.

### REFACTOR — Clean Up (only after green)

- Remove duplication
- Improve names
- Extract helpers if warranted

Keep tests green throughout. Don't add behavior.

### Repeat

Next failing test for next behavior.

## When to Use

**Always:** New features, bug fixes, refactoring, behavior changes.

**Exceptions (require explicit user approval):** Throwaway prototypes, generated code, config files.

## Red Flags — STOP and Start Over

- Code before test
- Test passes immediately (not catching the right thing)
- Can't explain why test failed
- Thinking "skip TDD just this once"
- "Too simple to test" (simple code breaks too)
- "I'll write tests after" (tests-after prove nothing — they pass immediately)

## Bug Fix Flow

1. Write failing test reproducing the bug
2. Watch it fail (confirms test catches the bug)
3. Write minimal fix
4. Watch it pass
5. Verify no regressions

## Checklist Before Completion

- [ ] Every new function has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for expected reason
- [ ] Wrote minimal code to pass
- [ ] All tests pass
- [ ] Output clean (no warnings/errors)

## Handoff Gate — MANDATORY

```
TDD IS NOT THE END OF THE WORKFLOW.
Tests green = code correct. Code correct ≠ feature working.
```

After the TDD cycle completes, you MUST invoke the `verify-before-claim` skill before claiming completion. This is not optional, not skippable, not "obvious". The handoff is:

1. **TDD done** → all tests green, output clean
2. **Trigger verify-before-claim** → run the full verification gate
3. **Only after verify passes** → claim completion to user

Skipping this gate is the #1 cause of "tests pass but feature broken" failures. The verify skill will determine what level of verification is needed (unit-only vs live API) based on the change type.

If you find yourself writing "All done" or "Here's the summary" without having invoked verify-before-claim — STOP. You are about to make an unverified claim.
