"""Persistent storage for RFP evaluations and extracted documents."""

from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path
from typing import TYPE_CHECKING

from pydantic import BaseModel

if TYPE_CHECKING:
    from .intake import RFPDocument
    from .scoring import Evaluation

RFP_DIR = Path("rfps")


# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------


class RFPSummary(BaseModel):
    """Lightweight summary of an RFP for list views."""

    slug: str
    title: str
    agency: str
    verdict: str | None
    composite_score: float | None
    deadline: str
    status: str  # "Evaluated" | "Drafting" | "Extracted"


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def slugify(title: str, notice_id: str) -> str:
    """Create a kebab-case slug from title + notice_id.

    Example:
        slugify("Cloud Infrastructure Modernization", "W912HQ-24-R-0001")
        -> "cloud-infrastructure-modernization-w912hq-24-r-0001"
    """
    combined = f"{title} {notice_id}"
    # Lowercase, replace any non-alphanumeric run with a dash
    slug = re.sub(r"[^a-z0-9]+", "-", combined.lower()).strip("-")
    # Collapse multiple consecutive dashes
    slug = re.sub(r"-{2,}", "-", slug)
    # Truncate to keep paths sane
    return slug[:80]


def save_evaluation(slug: str, evaluation: "Evaluation") -> Path:
    """Persist an Evaluation as both JSON and Markdown under rfps/<slug>/.

    Args:
        slug:       Directory name under RFP_DIR.
        evaluation: The Evaluation object to save.

    Returns:
        Path to the rfps/<slug>/ directory.
    """
    rfp_path = _ensure_dir(slug)

    # --- JSON ---
    json_path = rfp_path / "evaluation.json"
    json_path.write_text(
        evaluation.model_dump_json(indent=2),
        encoding="utf-8",
    )

    # --- Markdown ---
    md_path = rfp_path / "evaluation.md"
    md_path.write_text(
        _evaluation_to_markdown(evaluation),
        encoding="utf-8",
    )

    return rfp_path


def save_extracted(slug: str, rfp: "RFPDocument") -> Path:
    """Save a parsed RFPDocument as JSON under rfps/<slug>/rfp_extracted.json.

    Args:
        slug: Directory name under RFP_DIR.
        rfp:  The RFPDocument to save.

    Returns:
        Path to the saved file.
    """
    rfp_path = _ensure_dir(slug)
    out_path = rfp_path / "rfp_extracted.json"

    # Exclude raw_text from the JSON to keep file sizes reasonable;
    # raw_text is available via the source file anyway.
    data = rfp.model_dump()
    data.pop("raw_text", None)

    out_path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    return out_path


def list_rfps() -> list[RFPSummary]:
    """Scan the rfps/ directory and return a summary for each stored RFP.

    Returns:
        List of RFPSummary objects sorted by slug (callers may re-sort).
    """
    if not RFP_DIR.exists():
        return []

    summaries: list[RFPSummary] = []

    for rfp_dir in sorted(RFP_DIR.iterdir()):
        if not rfp_dir.is_dir():
            continue
        slug = rfp_dir.name
        summary = _load_summary(rfp_dir, slug)
        if summary:
            summaries.append(summary)

    return summaries


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _ensure_dir(slug: str) -> Path:
    """Create rfps/<slug>/ if needed and return the Path."""
    path = RFP_DIR / slug
    path.mkdir(parents=True, exist_ok=True)
    return path


def _load_summary(rfp_dir: Path, slug: str) -> RFPSummary | None:
    """Build an RFPSummary by reading whichever files exist in rfp_dir."""
    eval_json = rfp_dir / "evaluation.json"
    extracted_json = rfp_dir / "rfp_extracted.json"

    title = "Unknown"
    agency = "Unknown"
    deadline = "Unknown"
    verdict: str | None = None
    composite_score: float | None = None
    status = "Extracted"

    # Try evaluation.json first (richest source of truth)
    if eval_json.exists():
        try:
            data = json.loads(eval_json.read_text(encoding="utf-8"))
            verdict = data.get("verdict")
            composite_score = data.get("composite_score")
            status = "Evaluated"
        except (json.JSONDecodeError, KeyError):
            pass

    # Try rfp_extracted.json for title/agency/deadline
    if extracted_json.exists():
        try:
            data = json.loads(extracted_json.read_text(encoding="utf-8"))
            title = data.get("title", title)
            agency = data.get("agency", agency)
            deadline = data.get("deadline", deadline)
        except (json.JSONDecodeError, KeyError):
            pass

    # Fall back to reading a draft if status is still Extracted but drafts exist
    if status == "Evaluated":
        draft_files = list(rfp_dir.glob("draft_*.md"))
        if draft_files:
            status = "Drafting"

    return RFPSummary(
        slug=slug,
        title=title,
        agency=agency,
        verdict=verdict,
        composite_score=composite_score,
        deadline=deadline,
        status=status,
    )


def _evaluation_to_markdown(evaluation: "Evaluation") -> str:
    """Render an Evaluation as a human-readable Markdown report."""
    lines: list[str] = []

    lines.append(f"# RFP Evaluation Report")
    lines.append(f"")
    lines.append(f"**Generated:** {evaluation.timestamp}")
    lines.append(f"")
    lines.append(f"## Verdict: {evaluation.verdict.value}  |  Score: {evaluation.composite_score:.1f}  |  Confidence: {evaluation.confidence.value}")
    lines.append(f"")
    lines.append(f"### TL;DR")
    lines.append(f"")
    lines.append(evaluation.tldr)
    lines.append(f"")
    lines.append(f"### Disqualifier Check")
    lines.append(f"")
    lines.append(f"`{evaluation.disqualifier_check}`")
    lines.append(f"")
    lines.append(f"### Dimension Scores")
    lines.append(f"")
    lines.append(f"| Dimension | Score | Rationale |")
    lines.append(f"|-----------|-------|-----------|")
    for dim_name, dim in evaluation.dimensions.items():
        lines.append(f"| {dim_name} | {dim.score:.1f}/5 | {dim.rationale[:120]}... |")
    lines.append(f"")
    lines.append(f"### Key Risks")
    lines.append(f"")
    for risk in evaluation.key_risks:
        lines.append(f"- {risk}")
    lines.append(f"")
    lines.append(f"### Win Themes")
    lines.append(f"")
    for theme in evaluation.win_themes:
        lines.append(f"- {theme}")
    lines.append(f"")
    lines.append(f"### Effort Estimate")
    lines.append(f"")
    lines.append(f"~{evaluation.effort_estimate_hours} hours to prepare proposal")
    lines.append(f"")

    return "\n".join(lines)
