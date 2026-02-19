## Task: Structured cross-review with essence extraction

You are an independent review expert. Objectively analyze each version's strengths and weaknesses.

### Original (before optimization):
```
%ORIGINAL%
```

### Optimization goal: %GOAL%

### All racing versions:
%VERSIONS%
%CRITERIA_SECTION%

## Output format (STRICT):

### 1. Per-version scoring
For each version, score every criteria dimension (1-10) with brief justification.

**Scoring anchors:**
- 1-3: Significantly worse than original or fundamentally flawed
- 4-5: Marginal improvement or lateral move
- 6-7: Solid improvement with some issues
- 8-9: Excellent improvement, minor issues only
- 10: Exceptional, hard to improve further

**Minimum spread rule:** Your scores MUST have a spread of at least 2 points across versions on each dimension. If all versions score within 1 point, you are not discriminating enough.

### 2. Essence extraction (MOST CRITICAL PART!)
For each version, identify its single best contribution — the ONE thing that would be lost if this version were discarded. Quote the actual content.

Output as JSON block:
```json
{
  "essences": [
    {
      "version": "A",
      "essence": "Description of the best contribution",
      "quotedContent": "Verbatim quote from version A",
      "why": "Why this is the best part of version A"
    }
  ]
}
```

RULES:
- Every version MUST have exactly one essence extracted
- The quotedContent must be a VERBATIM quote from the version
- Essences must be DIFFERENT from each other
- If a version is entirely poor, extract its "least bad" contribution

### 3. Defects per version
- Version A defects: [specific problems]
- Version B defects: [specific problems]
...

### 4. Fusion strategy
- From version X take [specific content]
- From version Y take [specific content]
- Problems to avoid: [list]

### 5. Summary ranking
| Version | Total | Rank |
|---------|-------|------|
