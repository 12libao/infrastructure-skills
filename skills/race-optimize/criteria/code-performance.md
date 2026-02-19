# Code Performance Optimization Criteria

## Hard Constraints (must pass)
- **Correctness**: All tests must pass, behavior identical to original
- **No regression**: No new bugs, memory leaks, or security vulnerabilities

## Scoring Dimensions (10 points each)

### 1. Performance improvement (weight 35%)

**Anchored rubric:**
- 1-3: Performance worse than original, or negligible (<5%) improvement
- 4-5: Minor improvement (5-15%), no algorithmic change
- 6-7: Solid improvement (15-40%), clear algorithmic gains
- 8-9: Major improvement (40-80%), fundamentally better approach
- 10: Transformative improvement (>80%), optimal or near-optimal algorithm

**Evaluation points:**
- Execution speed improvement magnitude
- Algorithm complexity optimization (O(n^2) -> O(n log n), etc.)
- Memory usage optimization
- I/O efficiency improvement

### 2. Correctness (weight 25%)

**Anchored rubric:**
- 1-3: Introduces bugs or breaks existing functionality
- 4-5: Correct for common cases, misses edge cases
- 6-7: Handles most cases, minor boundary issues
- 8-9: Comprehensive handling including edge cases and errors
- 10: Provably correct, handles all conceivable scenarios

**Evaluation points:**
- Boundary condition handling
- Error handling completeness
- Type safety
- Concurrency safety (if applicable)

### 3. Readability (weight 20%)

**Anchored rubric:**
- 1-3: Harder to understand than original, cryptic optimizations
- 4-5: Readable but requires significant effort to follow
- 6-7: Reasonably clear, occasional complex sections
- 8-9: Clean and well-structured, easy to follow
- 10: Self-documenting, intent is immediately obvious

**Evaluation points:**
- Code structure clarity
- Naming accuracy (names reflect intent, not implementation)
- Comments are necessary and accurate
- Logic flow is easy to trace

### 4. Maintainability (weight 20%)

**Anchored rubric:**
- 1-3: Optimization makes future changes harder
- 4-5: Maintainable but tightly coupled
- 6-7: Reasonable modularity and separation
- 8-9: Well-modular, clear dependencies, easy to extend
- 10: Exemplary architecture, trivial to modify or extend

**Evaluation points:**
- Modularity
- Clear dependencies
- Testability
- Reasonable extensibility

## Scoring Rules
- Every score MUST include specific evidence (line numbers, quotes, metrics)
- Minimum 2-point spread across versions on each dimension
- Use the full scoring range — do NOT cluster around 7-8

## Essence Extraction Guide
When reviewing, for each version you MUST identify:
1. **Best algorithm choice** — which version's core algorithm is optimal?
2. **Best boundary handling** — which version handles edge cases most completely?
3. **Best code structure** — which version's code organization is clearest?
4. **Best innovation** — which version has a unique optimization insight?
