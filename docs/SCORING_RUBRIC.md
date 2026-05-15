# Scoring Rubric

RFPOps scores each RFP on a 0.0-5.0 scale and returns BID, MAYBE, or NO-BID.

## Weights

| Dimension | Weight |
| --- | ---: |
| Capability Match | 30% |
| Past Performance Relevance | 25% |
| Win Probability | 20% |
| Margin Viability | 15% |
| Strategic Fit | 10% |
| Effort / Timing | Displayed only |

## Verdict Logic

- Any hard disqualifier means NO-BID unless explicitly resolvable with teaming.
- Composite score >= 4.0 and no hard disqualifier means BID.
- Composite score >= 3.0 and < 4.0 means MAYBE.
- Composite score < 3.0 means NO-BID.
- Win probability < 2.0 plus high effort downgrades to NO-BID.
- Capability match < 2.5 and past performance < 2.5 downgrades to NO-BID.
- Strategic fit can justify MAYBE, but the memo must call it a strategic long shot.

## Hard Disqualifiers

- Required facility clearance missing.
- Required certification or contract vehicle missing.
- NAICS or size eligibility issue.
- Response window below company threshold.
- Mandatory past performance not present.
- Mandatory geographic delivery impossible.
- Fixed-price custom build below margin rules.

## Wiring Signals

- Very short response window.
- Requirements that appear unusually specific.
- Evaluation weighted toward prior agency-specific experience.
- Incumbent-like scope language.
- Narrow vendor or technology references.

## QA Checks

The QA function checks:

- Banned phrases.
- Evidence on every dimension.
- Verdict alignment with score and disqualifiers.
- Citations exist.
- Empty rationales.
- Unsupported claims.

## Banned Phrases

Do not use: leverage, synergy, world-class, best-in-class, robust, seamless, empower, cutting-edge, unlock value, drive transformation, holistic, innovative solution, next-generation, game-changing, tailored solution, strategic partner, proven track record unless tied to specific evidence.

## Prompt Strategy

The Anthropic path uses a skeptical capture analyst system prompt and asks for JSON only. The prompt includes RFP text, profile, capabilities, certifications, disqualifiers, past performance, strategic goals, user context, scoring rules, required schema, banned phrases, and QA requirements.
