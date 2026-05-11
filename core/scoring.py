"""RFP scoring engine: calls Claude to produce a structured Evaluation."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING

from pydantic import BaseModel, field_validator

if TYPE_CHECKING:
    from .claude_client import ClaudeClient
    from .intake import RFPDocument
    from .profile import AgencyProfile


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------


class Verdict(str, Enum):
    BID = "BID"
    NO_BID = "NO-BID"
    MAYBE = "MAYBE"


class Confidence(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class DimensionScore(BaseModel):
    """Score and rationale for a single evaluation dimension."""

    score: float  # 1–5
    rationale: str  # 60–120 words citing specific RFP content

    @field_validator("score")
    @classmethod
    def clamp_score(cls, v: float) -> float:
        return max(1.0, min(5.0, float(v)))


class Evaluation(BaseModel):
    """Complete RFP evaluation produced by Claude."""

    verdict: Verdict
    confidence: Confidence
    composite_score: float
    dimensions: dict[str, DimensionScore]
    tldr: str  # exactly 2 sentences
    key_risks: list[str]
    win_themes: list[str]
    effort_estimate_hours: int
    disqualifier_check: str  # "PASS" or "FAIL: <reason>"
    timestamp: str

    @field_validator("composite_score")
    @classmethod
    def clamp_composite(cls, v: float) -> float:
        return round(max(1.0, min(5.0, float(v))), 2)


# ---------------------------------------------------------------------------
# Scoring schema for complete_json()
# ---------------------------------------------------------------------------

_EVALUATION_SCHEMA: dict = {
    "type": "object",
    "required": [
        "verdict",
        "confidence",
        "composite_score",
        "dimensions",
        "tldr",
        "key_risks",
        "win_themes",
        "effort_estimate_hours",
        "disqualifier_check",
        "timestamp",
    ],
    "properties": {
        "verdict": {"type": "string", "enum": ["BID", "NO-BID", "MAYBE"]},
        "confidence": {"type": "string", "enum": ["HIGH", "MEDIUM", "LOW"]},
        "composite_score": {"type": "number"},
        "dimensions": {
            "type": "object",
            "properties": {
                "capability_match": {"$ref": "#/$defs/DimensionScore"},
                "past_performance": {"$ref": "#/$defs/DimensionScore"},
                "win_probability": {"$ref": "#/$defs/DimensionScore"},
                "margin_viability": {"$ref": "#/$defs/DimensionScore"},
                "strategic_fit": {"$ref": "#/$defs/DimensionScore"},
            },
            "required": [
                "capability_match",
                "past_performance",
                "win_probability",
                "margin_viability",
                "strategic_fit",
            ],
        },
        "tldr": {"type": "string"},
        "key_risks": {"type": "array", "items": {"type": "string"}},
        "win_themes": {"type": "array", "items": {"type": "string"}},
        "effort_estimate_hours": {"type": "integer"},
        "disqualifier_check": {"type": "string"},
        "timestamp": {"type": "string"},
    },
    "$defs": {
        "DimensionScore": {
            "type": "object",
            "required": ["score", "rationale"],
            "properties": {
                "score": {"type": "number"},
                "rationale": {"type": "string"},
            },
        }
    },
}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def score_rfp(
    rfp: "RFPDocument",
    profile: "AgencyProfile",
    client: "ClaudeClient",
) -> Evaluation:
    """Score an RFP against an agency profile using Claude.

    Args:
        rfp:     Parsed RFP document.
        profile: Loaded agency profile.
        client:  Configured ClaudeClient instance.

    Returns:
        A validated Evaluation object.

    Raises:
        ValueError: If the Claude response cannot be parsed into a valid Evaluation.
    """
    from .prompts import get_scoring_prompt  # avoid circular import at module level

    system_prompt, user_prompt = get_scoring_prompt(profile, rfp)

    try:
        raw = client.complete_json(
            system=system_prompt,
            user=user_prompt,
            schema=_EVALUATION_SCHEMA,
        )
    except Exception as exc:
        raise ValueError(f"Claude API call failed during scoring: {exc}") from exc

    # Inject a timestamp if Claude forgot to include one (shouldn't happen given prompt)
    if not raw.get("timestamp"):
        raw["timestamp"] = datetime.now(timezone.utc).isoformat()

    # Validate and coerce into the Evaluation model
    try:
        evaluation = Evaluation.model_validate(raw)
    except Exception as exc:
        raise ValueError(
            f"Claude response did not match Evaluation schema: {exc}\n\nRaw response: {raw}"
        ) from exc

    # Recompute composite score from dimension scores to ensure consistency
    # in case Claude's arithmetic is off.
    evaluation = _recompute_composite(evaluation)

    return evaluation


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _recompute_composite(evaluation: Evaluation) -> Evaluation:
    """Recalculate composite_score from dimension scores using defined weights."""
    weights = {
        "capability_match": 0.30,
        "past_performance": 0.25,
        "win_probability": 0.20,
        "margin_viability": 0.15,
        "strategic_fit": 0.10,
    }

    weighted_sum = 0.0
    total_weight = 0.0
    for dim_name, weight in weights.items():
        if dim_name in evaluation.dimensions:
            weighted_sum += evaluation.dimensions[dim_name].score * weight
            total_weight += weight

    if total_weight > 0:
        computed = round(weighted_sum / total_weight * sum(weights.values()), 2)
        # Use computed score but don't override if Claude's score is reasonable
        # (within 0.3 of computed). If divergent, use computed.
        if abs(computed - evaluation.composite_score) > 0.3:
            return evaluation.model_copy(update={"composite_score": computed})

    return evaluation
