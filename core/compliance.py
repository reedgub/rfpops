"""Compliance matrix extraction: maps RFP requirements to agency capabilities."""

from __future__ import annotations

from typing import TYPE_CHECKING

from pydantic import BaseModel, field_validator

if TYPE_CHECKING:
    from .claude_client import ClaudeClient
    from .intake import RFPDocument
    from .profile import AgencyProfile


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------


class Requirement(BaseModel):
    """A single RFP requirement assessed against the agency profile."""

    id: str  # e.g. "L.5.2.1" or "REQ-001"
    text: str  # verbatim or near-verbatim requirement text
    category: str  # "Mandatory" | "Desired" | "Informational"
    status: str  # "MET" | "GAP" | "PARTIAL" | "UNCLEAR"
    evidence: str  # reference to past performance or capability; empty if GAP
    notes: str  # analyst notes


class ComplianceMatrix(BaseModel):
    """Full compliance matrix for an RFP evaluation."""

    rfp_title: str
    requirements: list[Requirement]
    met_count: int
    gap_count: int
    partial_count: int

    @field_validator("met_count", "gap_count", "partial_count", mode="before")
    @classmethod
    def non_negative(cls, v: int) -> int:
        return max(0, int(v))


# ---------------------------------------------------------------------------
# Schema for complete_json()
# ---------------------------------------------------------------------------

_COMPLIANCE_SCHEMA: dict = {
    "type": "object",
    "required": ["rfp_title", "requirements", "met_count", "gap_count", "partial_count"],
    "properties": {
        "rfp_title": {"type": "string"},
        "requirements": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["id", "text", "category", "status", "evidence", "notes"],
                "properties": {
                    "id": {"type": "string"},
                    "text": {"type": "string"},
                    "category": {
                        "type": "string",
                        "enum": ["Mandatory", "Desired", "Informational"],
                    },
                    "status": {
                        "type": "string",
                        "enum": ["MET", "GAP", "PARTIAL", "UNCLEAR"],
                    },
                    "evidence": {"type": "string"},
                    "notes": {"type": "string"},
                },
            },
        },
        "met_count": {"type": "integer"},
        "gap_count": {"type": "integer"},
        "partial_count": {"type": "integer"},
    },
}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def extract_compliance(
    rfp: "RFPDocument",
    profile: "AgencyProfile",
    client: "ClaudeClient",
) -> ComplianceMatrix:
    """Extract a compliance matrix from the RFP against the agency profile.

    Calls Claude to identify each requirement and assess MET/GAP/PARTIAL/UNCLEAR
    status based on the agency's capabilities and past performance.

    Args:
        rfp:     Parsed RFP document.
        profile: Loaded agency profile.
        client:  Configured ClaudeClient instance.

    Returns:
        A populated ComplianceMatrix.

    Raises:
        ValueError: If the Claude response cannot be parsed or validated.
    """
    from .prompts import get_compliance_prompt  # avoid circular import

    system_prompt, user_prompt = get_compliance_prompt(profile, rfp)

    try:
        raw = client.complete_json(
            system=system_prompt,
            user=user_prompt,
            schema=_COMPLIANCE_SCHEMA,
        )
    except Exception as exc:
        raise ValueError(
            f"Claude API call failed during compliance extraction: {exc}"
        ) from exc

    # Ensure counts are consistent with actual requirements list
    raw = _reconcile_counts(raw)

    try:
        matrix = ComplianceMatrix.model_validate(raw)
    except Exception as exc:
        raise ValueError(
            f"Claude response did not match ComplianceMatrix schema: {exc}\n\nRaw: {raw}"
        ) from exc

    return matrix


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _reconcile_counts(raw: dict) -> dict:
    """Recount met/gap/partial from the requirements list to fix any Claude arithmetic errors."""
    requirements = raw.get("requirements", [])
    met = sum(1 for r in requirements if r.get("status") == "MET")
    gap = sum(1 for r in requirements if r.get("status") == "GAP")
    partial = sum(1 for r in requirements if r.get("status") == "PARTIAL")

    raw["met_count"] = met
    raw["gap_count"] = gap
    raw["partial_count"] = partial
    return raw
