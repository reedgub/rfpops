"""Proposal section drafter: generates government proposal text via Claude."""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .claude_client import ClaudeClient
    from .intake import RFPDocument
    from .profile import AgencyProfile
    from .scoring import Evaluation


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SUPPORTED_SECTIONS = [
    "exec-summary",
    "technical-approach",
    "methodology",
    "past-performance",
    "management-plan",
]

LENGTH_TARGETS: dict[str, tuple[int, int]] = {
    "exec-summary": (400, 600),
    "technical-approach": (1200, 1800),
    "methodology": (600, 1000),
    "past-performance": (600, 1000),
    "management-plan": (600, 1000),
}

_SECTION_GUIDANCE: dict[str, str] = {
    "exec-summary": (
        "The Executive Summary must: (1) immediately state the offeror's understanding "
        "of the government's core problem, (2) articulate the primary win theme in the "
        "first paragraph, (3) summarize the technical approach in 2–3 sentences, and "
        "(4) close with a confidence statement about past performance relevance. "
        "Evaluators read this section first — it must stand alone."
    ),
    "technical-approach": (
        "The Technical Approach must mirror the SOW structure so evaluators can cross-reference. "
        "Use headers that match or closely paraphrase the PWS task headings. For each major task, "
        "describe: (a) the specific methodology, (b) named tools or frameworks, (c) how the "
        "agency has applied this approach in prior work. Include a transition plan if this is a "
        "recompete. Describe how the approach reduces risk to the government."
    ),
    "methodology": (
        "The Methodology section should describe the project management and delivery framework: "
        "Agile vs. waterfall vs. hybrid, sprint cadence, artifact delivery schedule, quality "
        "assurance approach, and how the agency will handle scope changes. Reference specific "
        "methodologies (e.g., SAFe, Scrum, PMBOK) and explain why they suit this contract."
    ),
    "past-performance": (
        "Past Performance must present 3–5 reference contracts in a consistent format: "
        "contract name, contracting agency, contract number, dollar value, period of "
        "performance, scope description (2–3 sentences), relevance to this RFP (1–2 sentences), "
        "and CPARS/reference contact. Lead with the most directly relevant reference. "
        "Quantify outcomes where possible (e.g., '23% reduction in mean time to resolution')."
    ),
    "management-plan": (
        "The Management Plan must address: key personnel (name, role, clearance level if applicable), "
        "organizational chart or staffing structure, subcontracting approach if applicable, "
        "risk management plan (top 3 risks with mitigation), communication cadence with the COR, "
        "and the small business subcontracting plan if required. Reference the agency's existing "
        "management infrastructure (PMO, ISO certifications, etc.)."
    ),
}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def draft_section(
    rfp: "RFPDocument",
    profile: "AgencyProfile",
    evaluation: "Evaluation",
    section: str,
    client: "ClaudeClient",
) -> str:
    """Draft a single proposal section using Claude.

    Args:
        rfp:        Parsed RFP document.
        profile:    Loaded agency profile.
        evaluation: Prior evaluation (provides win themes and key risks).
        section:    One of SUPPORTED_SECTIONS (e.g., "exec-summary").
        client:     Configured ClaudeClient instance.

    Returns:
        The drafted proposal section as plain text (may include Markdown headers).

    Raises:
        ValueError: If *section* is not in SUPPORTED_SECTIONS.
    """
    if section not in SUPPORTED_SECTIONS:
        raise ValueError(
            f"Unsupported section '{section}'. "
            f"Choose one of: {', '.join(SUPPORTED_SECTIONS)}"
        )

    from .prompts import get_draft_prompt  # avoid circular import

    min_words, max_words = LENGTH_TARGETS[section]
    section_guidance = _SECTION_GUIDANCE.get(section, "")

    system_prompt, user_prompt = get_draft_prompt(
        profile=profile,
        rfp=rfp,
        section=section,
        win_themes=evaluation.win_themes,
        min_words=min_words,
        max_words=max_words,
    )

    # Augment user prompt with section-specific guidance
    if section_guidance:
        user_prompt = (
            f"{user_prompt}\n\n"
            f"Section-specific guidance:\n{section_guidance}"
        )

    # Also surface key risks so the draft can address them proactively
    if evaluation.key_risks:
        risks_text = "\n".join(f"  - {r}" for r in evaluation.key_risks[:3])
        user_prompt = (
            f"{user_prompt}\n\n"
            f"Key risks the evaluators may probe (address proactively if relevant to this section):\n"
            f"{risks_text}"
        )

    # max_tokens: generous allocation for longest section
    max_tokens = _tokens_for_section(section)

    draft_text = client.complete(
        system=system_prompt,
        user=user_prompt,
        max_tokens=max_tokens,
    )

    return draft_text.strip()


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _tokens_for_section(section: str) -> int:
    """Return a generous max_tokens allocation for the given section."""
    # Rough estimate: 1 word ≈ 1.3 tokens; add 20% buffer
    _, max_words = LENGTH_TARGETS.get(section, (600, 1000))
    return int(max_words * 1.3 * 1.2) + 256
