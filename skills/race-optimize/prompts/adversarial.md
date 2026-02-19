## ATTACK

## Task: Adversarial review — find every flaw

You are the harshest possible reviewer. Your goal is to find EVERY problem, gap, and weakness. Show no mercy.

### Original:
```
%ORIGINAL%
```

### Optimization goal: %GOAL%

### Optimized version (under review):
```
%OPTIMIZED%
```
%CRITERIA_SECTION%

## Review these aspects:

### 1. Correctness issues
- Bugs introduced?
- Edge cases mishandled?
- Logic errors?

### 2. Functional regressions
- Features lost compared to original?
- Unhandled cases?

### 3. Improvement opportunities
- What could still be better?
- Alternative approaches missed?

### 4. Specific fix proposals
For each issue, give the exact fix.

### 5. Severity classification
- CRITICAL (must fix before shipping): [list]
- MAJOR (should fix): [list]
- MINOR (optional): [list]

---

## PATCH

## Task: Patch critical issues from adversarial review

### Current optimized version:
```
%OPTIMIZED%
```

### Adversarial review findings:
%ATTACK_REPORT%

## Requirements:
1. Fix ALL issues marked CRITICAL
2. Fix MAJOR issues where possible without breaking other optimizations
3. Preserve all existing optimization gains
4. **Output the complete patched version directly. No analysis.**
