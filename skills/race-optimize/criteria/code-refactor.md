# Code Refactoring (YAGNI) Criteria

## Core Principle
**YAGNI — You Aren't Gonna Need It**
Aggressively delete unnecessary features, abstractions, and indirection layers. Simplicity is the primary goal.

## Hard Constraints (must pass)
- **Correctness**: All tests must pass, behavior identical to original
- **No feature loss**: Do not delete features that are actually in use

## Scoring Dimensions (10 points each)

### 1. Simplicity (weight 30%)

**Anchored rubric:**
- 1-3: More complex than original, added unnecessary abstractions
- 4-5: Minor simplification, most complexity remains
- 6-7: Meaningful reduction in complexity, some unnecessary code removed
- 8-9: Significantly simpler, most unnecessary abstractions eliminated
- 10: Maximally simple, every line earns its place

**Evaluation points:**
- Lines of code reduction (fewer is better)
- Unnecessary abstraction layers removed
- Unused code/features deleted
- Indirection reduced (fewer wrappers, adapters, factories)
- Configuration/options simplified

### 2. Maintainability (weight 25%)

**Anchored rubric:**
- 1-3: Harder to maintain than original
- 4-5: Similar maintenance burden, different structure
- 6-7: Clearer structure, easier to understand
- 8-9: Obvious structure, new developer can understand quickly
- 10: Self-evident architecture, trivial to modify

**Evaluation points:**
- Code structure clarity
- Single responsibility per module
- Simplified dependencies
- Reduced learning curve for new developers

### 3. Correctness (weight 25%)

**Anchored rubric:**
- 1-3: Refactoring broke existing functionality
- 4-5: Mostly correct, some edge cases affected
- 6-7: All common paths work, minor boundary issues
- 8-9: Functionally equivalent, comprehensive testing
- 10: Provably equivalent, all behaviors preserved

**Evaluation points:**
- Functional equivalence (before and after behavior is identical)
- Boundary conditions preserved
- Error handling not degraded
- Type safety

### 4. Performance (weight 20%)

**Anchored rubric:**
- 1-3: Performance degraded by refactoring
- 4-5: No significant performance change
- 6-7: Slight performance improvement from removing overhead
- 8-9: Notable improvement from eliminating unnecessary work
- 10: Significant gains from removing runtime overhead

**Evaluation points:**
- No performance regression from refactoring
- Reduced unnecessary runtime overhead
- Reasonable memory usage

## YAGNI Checklist
When reviewing, for each version you MUST answer:
1. **Can more code be deleted?** — every line must justify its existence
2. **Can modules be merged?** — would combining two small modules be simpler?
3. **Are abstractions necessary?** — do interfaces/factories/strategy patterns earn their keep?
4. **Is there over-engineering?** — "might need it someday" is NOT a reason to keep it

## Scoring Rules
- Every score MUST include specific evidence
- Minimum 2-point spread across versions on each dimension
- Use the full scoring range

## Essence Extraction Guide
1. **Best deletion decision** — which version most accurately identified and removed redundancy?
2. **Best structural simplification** — which version's code structure is most intuitive?
3. **Best naming** — which version's names most accurately reflect intent?
4. **Best balance** — which version found the best tradeoff between simplicity and functionality?
