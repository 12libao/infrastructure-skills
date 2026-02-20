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
