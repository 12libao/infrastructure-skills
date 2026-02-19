# Prompt Engineering Optimization Criteria

## Hard Constraints
- **No hallucination induction**: Optimized prompt must not be more likely to trigger model hallucination
- **Intent preservation**: Optimized prompt must maintain the original intent and goals

## Scoring Dimensions (10 points each)

### 1. Accuracy (weight 30%)

**Anchored rubric:**
- 1-3: Worse accuracy than original, more misunderstandings
- 4-5: Similar accuracy, no meaningful improvement
- 6-7: Clearer instructions, fewer misinterpretations
- 8-9: Highly precise, model consistently understands intent
- 10: Near-perfect instruction clarity, virtually zero misinterpretation

**Evaluation points:**
- Output correctness rate on test input set
- Reduced probability of model misunderstanding
- Instruction clarity (no ambiguous statements)
- Constraint condition explicitness

### 2. Consistency (weight 25%)

**Anchored rubric:**
- 1-3: Less consistent output than original prompt
- 4-5: Similar consistency
- 6-7: More stable outputs across multiple runs
- 8-9: Highly consistent, reliable format compliance
- 10: Near-deterministic outputs, rock-solid format

**Evaluation points:**
- Output stability across multiple runs
- Consistent performance across different models
- Format output reliability
- Boundary input robustness

### 3. Conciseness (weight 25%)

**Anchored rubric:**
- 1-3: More verbose than original with no quality gain
- 4-5: Similar length, minor structural improvements
- 6-7: Meaningfully shorter while maintaining quality
- 8-9: Significantly more token-efficient, well-structured
- 10: Maximally efficient, every token earns its place

**Evaluation points:**
- Token efficiency (fewer tokens for equivalent effect)
- Redundant instructions removed
- Structured for easy model parsing
- Avoids over-constraining

### 4. Robustness (weight 20%)

**Anchored rubric:**
- 1-3: More fragile than original, breaks on edge inputs
- 4-5: Similar robustness
- 6-7: Better handling of unusual inputs
- 8-9: Graceful handling of edge cases and adversarial inputs
- 10: Rock-solid against all input variations and model quirks

**Evaluation points:**
- Handling of abnormal inputs
- Resistance to jailbreaking
- Cross-model compatibility
- Long-term stability (not relying on model-specific behavior)

## Verification Methods
- Run optimized prompt against test input set
- Compare output quality (human or AI review)
- Multiple runs to check consistency
- Cross-model testing (if available)

## Scoring Rules
- Every score MUST include specific evidence
- Minimum 2-point spread across versions on each dimension
- Use the full scoring range

## Essence Extraction Guide
1. **Best instruction structure** — which version's prompt structure is clearest?
2. **Best constraint expression** — which version's constraints are most effective?
3. **Best example design** — which version's few-shot examples are best?
4. **Best token efficiency** — which version achieves the best result with fewest tokens?
