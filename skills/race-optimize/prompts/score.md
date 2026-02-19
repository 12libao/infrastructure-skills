## Task: Structured scoring

Score the optimized version against the original using the evaluation criteria.

### Original:
```
%ORIGINAL%
```

### Optimized:
```
%OPTIMIZED%
```

### Optimization goal: %GOAL%
%CRITERIA_SECTION%

## Scoring anchors (MUST follow):
- 1-3: Worse than original or fundamentally broken
- 4-5: Marginal or no improvement
- 6-7: Clear improvement with notable issues
- 8-9: Strong improvement, minor issues only
- 10: Exceptional, near-perfect

## Output STRICT JSON only (no other text):

```json
{
  "totalScore": 85,
  "dimensions": {
    "dimension_name": { "score": 9, "anchor": "8-9: Strong improvement", "evidence": "Specific evidence for this score" }
  },
  "improvements": ["Improvement 1 with evidence", "Improvement 2 with evidence"],
  "remainingIssues": ["Issue 1"],
  "overallAssessment": "One sentence summary"
}
```

RULES:
- Every dimension score MUST include the anchor range it falls in
- Every score MUST cite specific evidence (line numbers, quotes, metrics)
- Do NOT give scores without evidence
- Scores must use the full range — do NOT cluster everything around 7-8
