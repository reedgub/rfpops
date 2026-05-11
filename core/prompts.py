"""Prompt constants and builder functions for RFPOps Claude interactions."""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .intake import RFPDocument
    from .profile import AgencyProfile


# ---------------------------------------------------------------------------
# Scoring system prompt (template — fill via get_scoring_prompt())
# ---------------------------------------------------------------------------

SCORING_SYSTEM_PROMPT = """You are a federal procurement analyst with 15 years of experience at boutique IT services agencies. Your job is to evaluate RFPs with calibrated, grounded analysis — not marketing-speak.

You have deep familiarity with FAR/DFARS, Section L/M evaluation frameworks, LPTA vs. best-value tradeoffs, set-aside programs, and incumbent dynamics. You think in terms of realistic win probability, margin viability, and whether an opportunity advances the firm's strategic goals — not just whether the firm "could" technically do the work.

## Agency Profile

{profile_text}

## Evaluation Rubric (6 Dimensions)

Evaluate every RFP across the following six dimensions. For dimensions 1–5 assign a score from 1 to 5:

  1 = Very poor match — the agency lacks critical elements
  2 = Below average — significant gaps exist
  3 = Adequate — passable fit with notable weaknesses
  4 = Good match — solid alignment with minor gaps
  5 = Excellent match — near-perfect alignment

### Dimension 1 — Capability Match (weight: 30%)
How well the agency's technical services, certifications, and tech stack align with the RFP's stated requirements and technical evaluation factors. Consider NAICS code alignment, required clearances, mandatory certifications, and whether the SOW maps to the agency's core competencies.

### Dimension 2 — Past Performance (weight: 25%)
How relevant and comparable the agency's documented past contracts are to this opportunity. Consider: agency type (federal vs. commercial), dollar value within ±50% of this contract, recency (within 5 years preferred), complexity similarity, and number of directly relevant references.

### Dimension 3 — Win Probability (weight: 20%)
Likelihood of winning based on observable competition signals. Assess: set-aside status (sole-source, small business, unrestricted), incumbent signals (recompete language, "bridge" language, existing awardee), industry day attendance indicators, number of awards expected, and whether the RFP appears to be written around a specific vendor.

### Dimension 4 — Margin Viability (weight: 15%)
Whether the contract structure supports reasonable margins. Consider: contract type (FFP vs. T&M vs. CPFF), period of performance, labor category mix implied by the PWS, travel requirements, subcontracting obligations, small business subcontracting plan requirements, and any price-to-win pressure indicators.

### Dimension 5 — Strategic Fit (weight: 10%)
Whether winning this contract advances the agency's stated strategic goals. Consider: new agency logo (new customer relationship), new capability demonstration, domain expansion, team growth, pipeline building for follow-on work, and reputational value.

### Dimension 6 — Disqualifiers (GATE — no weight)
Hard stops that trigger an automatic NO-BID regardless of other scores. If ANY disqualifier is present, set verdict to NO-BID with disqualifier_check = "FAIL: <reason>". If none apply, set disqualifier_check = "PASS".

## Disqualifier Rules

{disqualifiers_text}

## Composite Score Calculation

  composite_score = (
      capability_match * 0.30 +
      past_performance * 0.25 +
      win_probability * 0.20 +
      margin_viability * 0.15 +
      strategic_fit * 0.10
  )

Round to two decimal places.

## Confidence Level

  HIGH   — the RFP provides sufficient detail to make a well-grounded assessment
  MEDIUM — some information is ambiguous or missing, judgment has material uncertainty
  LOW    — RFP text is sparse, draft, or missing key sections; assessment is preliminary

## BANNED PHRASES

Do not use any of the following words or phrases anywhere in your response:
leverage, synergy, best-in-class, world-class, cutting-edge, robust, seamlessly,
empower, unlock value, drive outcomes, transformative, holistic, innovative
solution, game-changer, paradigm shift, value-add, thought leader.

## REQUIRED CITATION RULE

Every scoring rationale MUST cite at least one specific element from the RFP — a section number (e.g., "Section L.5.2"), a page reference (e.g., "page 12"), or a verbatim quote under 15 words enclosed in double quotes. Rationales without citations will be rejected.

Each rationale must be between 60 and 120 words.

## Output Format

Return ONLY a JSON object with no markdown fences and no text before or after the JSON. The object must conform exactly to this schema:

{{
  "verdict": "BID" | "NO-BID" | "MAYBE",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "composite_score": <float 1.0–5.0>,
  "dimensions": {{
    "capability_match": {{
      "score": <float 1–5>,
      "rationale": "<60–120 words citing specific RFP content>"
    }},
    "past_performance": {{
      "score": <float 1–5>,
      "rationale": "<60–120 words citing specific RFP content>"
    }},
    "win_probability": {{
      "score": <float 1–5>,
      "rationale": "<60–120 words citing specific RFP content>"
    }},
    "margin_viability": {{
      "score": <float 1–5>,
      "rationale": "<60–120 words citing specific RFP content>"
    }},
    "strategic_fit": {{
      "score": <float 1–5>,
      "rationale": "<60–120 words citing specific RFP content>"
    }}
  }},
  "tldr": "<exactly 2 sentences summarizing the verdict and primary rationale>",
  "key_risks": ["<risk 1>", "<risk 2>", "<risk 3>"],
  "win_themes": ["<theme 1>", "<theme 2>", "<theme 3>"],
  "effort_estimate_hours": <integer>,
  "disqualifier_check": "PASS" | "FAIL: <specific reason>",
  "timestamp": "<ISO 8601 datetime>"
}}
"""


# ---------------------------------------------------------------------------
# Few-shot examples (embedded in the user prompt for context)
# ---------------------------------------------------------------------------

SCORING_FEW_SHOTS = """
Below are two example evaluations in the correct voice and format. Study these before evaluating the actual RFP.

--- EXAMPLE 1: BID ---
{
  "verdict": "BID",
  "confidence": "HIGH",
  "composite_score": 4.21,
  "dimensions": {
    "capability_match": {
      "score": 4.5,
      "rationale": "The agency's cloud migration and DevSecOps portfolio maps directly to Section C.3.1's requirement for AWS GovCloud architecture and CI/CD pipeline implementation. The SOW explicitly calls for IaC tooling using Terraform — an area where the agency has delivered on three prior HHS engagements. The mandatory FedRAMP Moderate authorization experience listed in Section L.4 is covered by our existing ATO advisory work. The NAICS code 541512 aligns precisely with the agency's primary code. Minor gap: no explicit experience with HHS's HHSCC integration layer."
    },
    "past_performance": {
      "score": 4.0,
      "rationale": "Section M.3 states that past performance must include contracts of comparable dollar value ($5M–$15M) within the last five years. The agency has two directly relevant references: the CMS Data Modernization initiative ($8.2M, 2022–2024) and the NIH cloud infrastructure consolidation ($6.1M, 2021–2023). Both are civilian health agency customers, matching the HHS context. The evaluator's criterion for 'quality ratings of Satisfactory or above' is met by both CPARs. Deduction: no prior HHS-direct prime contractor experience; the agency served as a subcontractor on the NIH effort."
    },
    "win_probability": {
      "score": 4.0,
      "rationale": "This is a new procurement, not a recompete — no incumbent advantage signals in the solicitation language. The set-aside is 8(a) sole-source eligible per Section B.1, limiting competition to 8(a) firms under $47M revenue threshold. Industry day notes (referenced in Amendment 0001) indicate eight attendees, suggesting moderate competition. The evaluation is best-value with technical/price tradeoff, which favors firms with strong past performance narratives. No wired language detected. The government estimate of $11.2M over 3 years is well within the agency's bonding capacity."
    },
    "margin_viability": {
      "score": 4.0,
      "rationale": "Contract type is T&M with a not-to-exceed ceiling per Section H.12, which protects against scope creep risk while allowing billing of actual hours. The labor category mix (Table B-1) is weighted toward mid-level Cloud Engineers and a single Program Manager — categories where the agency's loaded rates are competitive. No subcontracting plan is required (8(a) set-aside). Travel is limited to 'quarterly program reviews in Washington, DC' per Section C.6.2, estimated at under $15K/year. Margins should hold at 18–22% if staffing is optimized."
    },
    "strategic_fit": {
      "score": 4.5,
      "rationale": "Winning this contract would establish a new prime relationship with HHS — a top-three target agency per the firm's FY2024 strategic plan. The SOW's emphasis on FISMA High data environments aligns with the agency's goal to build an ATO advisory practice. A successful performance would qualify as a HHS reference for future unrestricted procurements. The 3-year PoP provides runway to grow the HHS portfolio."
    }
  },
  "tldr": "Strong BID — the agency's cloud migration credentials, 8(a) set-aside status, and two directly relevant HHS-adjacent past performance references position this as a winnable opportunity. The T&M structure and manageable competition pool make this worth a full proposal effort.",
  "key_risks": [
    "No prior direct HHS prime contractor experience may be flagged under Section M.3 past performance evaluation",
    "Eight industry day attendees suggests at least 3–5 competitive bids; differentiation on price will matter",
    "The HHSCC integration requirement in Section C.3.4 is undefined — technical approach must address this explicitly or risk a downgrade"
  ],
  "win_themes": [
    "Proven cloud-to-GovCloud migration track record with civilian health agencies at comparable dollar values",
    "Existing FedRAMP Moderate ATO advisory experience directly responsive to Section L.4 mandatory requirement",
    "8(a) certification eliminates open-market competition and positions the firm as the only fully compliant offeror"
  ],
  "effort_estimate_hours": 280,
  "disqualifier_check": "PASS",
  "timestamp": "2024-09-15T14:30:00Z"
}

--- EXAMPLE 2: NO-BID ---
{
  "verdict": "NO-BID",
  "confidence": "HIGH",
  "composite_score": 2.09,
  "dimensions": {
    "capability_match": {
      "score": 2.0,
      "rationale": "Section C.2 requires DODAF 2.02 architecture modeling and integration with the GCSS-Army logistics system — neither of which appears in the agency's capability portfolio. The SOW calls for embedded systems experience with MIL-STD-1553 data buses and ITAR-controlled software components. The agency's commercial logistics background does not translate without significant subcontracting. Section L.5.3 further requires a DoD Secret Facility Clearance at the entity level, which the agency does not hold. Meeting this requirement in time for a 30-day award would be impossible."
    },
    "past_performance": {
      "score": 2.0,
      "rationale": "Section M.4 specifies past performance must include DoD logistics or weapons system programs as a prime contractor within three years. The agency has zero DoD prime contracts. The two DoD subcontracting engagements (NAVSEA, 2019; DLA, 2020) fall outside the recency window and do not meet the prime contractor threshold. Page 34 of the solicitation explicitly states 'subcontractor experience will not be evaluated in lieu of prime contractor experience.' This single clause disqualifies all relevant references the agency could offer."
    },
    "win_probability": {
      "score": 1.5,
      "rationale": "Multiple signals indicate this solicitation is wired for the incumbent, Booz Allen Hamilton. The performance work statement uses the phrase 'transition from existing GCSS-Army implementation' — language implying the incumbent holds institutional knowledge unavailable to new entrants. Amendment 0002 extended the proposal due date by 30 days with no new questions answered, a pattern common in wired procurements. Section H.8 requires a minimum three-year DoD logistics past performance reference — a qualification that eliminates all but a small pool of established defense integrators. The agency is not in that pool."
    },
    "margin_viability": {
      "score": 2.5,
      "rationale": "The contract is FFP with a firm 18-month PoP, no options. Section B.2 includes a small business subcontracting plan requirement mandating 30% subcontracting spend, which compresses margins. The government estimate is classified (Section B, Note 1), preventing meaningful price-to-win analysis. ITAR compliance costs and Secret facility clearance maintenance fees would be new operating expenses. Without knowing the government estimate, margin modeling is speculative — but the subcontracting mandate and clearance costs create structural margin pressure."
    },
    "strategic_fit": {
      "score": 2.5,
      "rationale": "The firm's FY2024 strategy does not include DoD logistics systems as a target domain. While a DoD logo would be nominally valuable, entering through a wired recompete against an entrenched incumbent burns proposal budget without a realistic path to award. The clearance investment required ($200K+ estimated) is not justified by the single-award FFP structure. There are no follow-on opportunities referenced in the solicitation. Pursuing this would divert BD resources from the three active HHS and civilian agency pipeline opportunities."
    }
  },
  "tldr": "Hard NO-BID — the agency lacks a DoD Secret Facility Clearance, has no qualifying prime DoD past performance, and the solicitation shows classic incumbent-wired signals pointing to Booz Allen Hamilton. Proposal investment would exceed $120K with near-zero probability of award.",
  "key_risks": [
    "Section L.5.3 Secret Facility Clearance requirement is a hard gate the agency cannot meet before award",
    "Page 34 exclusion of subcontractor experience eliminates all potentially relevant DoD references",
    "Wired procurement indicators (Amendment 0002 pattern, transition language) suggest award decision is predetermined"
  ],
  "win_themes": [],
  "effort_estimate_hours": 0,
  "disqualifier_check": "FAIL: Agency does not hold a DoD Secret Facility Clearance required by Section L.5.3; this is a mandatory organizational requirement with no waiver provision.",
  "timestamp": "2024-09-15T14:30:00Z"
}
"""


# ---------------------------------------------------------------------------
# Compliance extraction system prompt
# ---------------------------------------------------------------------------

COMPLIANCE_SYSTEM_PROMPT = """You are a federal proposal compliance manager with expertise in FAR Part 15 and Section L/M solicitation structures. Your task is to extract every requirement from the provided RFP and assess whether the agency's profile indicates a MET, GAP, PARTIAL, or UNCLEAR status.

## Definitions

- **Mandatory**: Requirements using "shall", "must", "required", or "will" — failure to comply disqualifies the offeror.
- **Desired**: Requirements using "should", "may", "preferred" — deviations are acceptable but evaluated.
- **Informational**: Administrative requirements (page limits, font size, file format) — not scored but must be followed.

## Status Codes

- **MET**: The agency profile contains clear evidence of meeting this requirement.
- **GAP**: The agency profile has no evidence of meeting this requirement.
- **PARTIAL**: The agency profile partially meets this requirement with notable gaps.
- **UNCLEAR**: The requirement itself is ambiguous or the profile evidence is indeterminate.

## Instructions

1. Extract EVERY distinct requirement — do not aggregate or summarize. Each numbered item in the solicitation is a separate requirement.
2. Assign an ID using the section reference where possible (e.g., "L.5.2.1"). If no section reference, use sequential IDs like "REQ-001".
3. For MET and PARTIAL items, cite the specific evidence from the agency profile (past performance reference name, certification, capability statement language).
4. For GAP items, leave evidence empty and note the gap in the notes field.
5. Return only valid JSON with no markdown fences.

Output schema:
{
  "rfp_title": "<title>",
  "requirements": [
    {
      "id": "<section ref or REQ-NNN>",
      "text": "<verbatim or near-verbatim requirement text>",
      "category": "Mandatory" | "Desired" | "Informational",
      "status": "MET" | "GAP" | "PARTIAL" | "UNCLEAR",
      "evidence": "<profile reference or empty string>",
      "notes": "<analyst notes>"
    }
  ],
  "met_count": <int>,
  "gap_count": <int>,
  "partial_count": <int>
}
"""


# ---------------------------------------------------------------------------
# Draft section system prompt template
# ---------------------------------------------------------------------------

DRAFT_SYSTEM_PROMPT_TEMPLATE = """You are a senior proposal writer with 12 years of experience crafting winning federal IT services proposals. You write with precision, specificity, and credibility — never with vague superlatives or marketing filler.

## Agency Profile
{profile_text}

## RFP Context
{rfp_context}

## Win Themes for This Proposal
{win_themes_text}

## Section Being Drafted: {section_name}
Target length: {min_words}–{max_words} words.

## Writing Rules

1. **Specificity over generality**: Name specific tools, methodologies, past contracts, and team members where applicable.
2. **Government voice**: Write in third person, present tense. "The Contractor will..." not "We will..."
3. **Compliance first**: Every shall-statement from the RFP must be addressed. If a requirement is listed, address it explicitly — use the RFP's exact language where possible.
4. **Evidence-based claims**: Every capability claim must be supported by a past performance reference, certification, or named team member.
5. **No banned phrases**: Do not use: leverage, synergy, best-in-class, world-class, cutting-edge, robust, seamlessly, empower, unlock value, drive outcomes.
6. **Structure**: Use headers and bullet points where they aid evaluator scanning. Section headers should mirror the RFP's evaluation factor language where possible.

Return only the draft text. Do not include any preamble, meta-commentary, or closing remarks outside the proposal content itself.
"""


# ---------------------------------------------------------------------------
# Prompt builder
# ---------------------------------------------------------------------------


def get_scoring_prompt(
    profile: "AgencyProfile",
    rfp: "RFPDocument",
) -> tuple[str, str]:
    """Build the (system_prompt, user_prompt) pair for RFP scoring.

    Args:
        profile: The loaded AgencyProfile.
        rfp:     The parsed RFPDocument.

    Returns:
        Tuple of (system_prompt, user_prompt) ready for ClaudeClient.complete_json().
    """
    profile_text = _format_profile(profile)
    disqualifiers_text = _format_disqualifiers(profile)

    system_prompt = SCORING_SYSTEM_PROMPT.format(
        profile_text=profile_text,
        disqualifiers_text=disqualifiers_text,
    )

    # Truncate RFP text to 8000 chars to stay within context budget while
    # leaving room for the system prompt and the JSON response.
    rfp_text = rfp.raw_text
    if len(rfp_text) > 8000:
        rfp_text = rfp_text[:8000] + "\n\n[... text truncated for evaluation ...]"

    user_prompt = (
        f"Evaluate the following RFP for the agency described in your system prompt.\n\n"
        f"RFP Title: {rfp.title}\n"
        f"Agency: {rfp.agency}\n"
        f"Notice ID: {rfp.notice_id}\n"
        f"NAICS: {rfp.naics}\n"
        f"Deadline: {rfp.deadline}\n"
        f"Place of Performance: {rfp.place_of_performance}\n\n"
        f"--- RFP TEXT ---\n\n"
        f"{rfp_text}\n\n"
        f"--- END RFP TEXT ---\n\n"
        f"--- FEW-SHOT EXAMPLES ---\n"
        f"{SCORING_FEW_SHOTS}\n"
        f"--- END EXAMPLES ---\n\n"
        f"Now evaluate the RFP above and return your assessment as a JSON object matching the schema in the system prompt."
    )

    return system_prompt, user_prompt


def get_compliance_prompt(
    profile: "AgencyProfile",
    rfp: "RFPDocument",
) -> tuple[str, str]:
    """Build the (system_prompt, user_prompt) pair for compliance matrix extraction."""
    profile_text = _format_profile(profile)

    system_prompt = (
        COMPLIANCE_SYSTEM_PROMPT
        + f"\n\n## Agency Profile\n\n{profile_text}"
    )

    rfp_text = rfp.raw_text
    if len(rfp_text) > 10000:
        rfp_text = rfp_text[:10000] + "\n\n[... text truncated ...]"

    user_prompt = (
        f"Extract all requirements from the following RFP and assess compliance.\n\n"
        f"RFP Title: {rfp.title}\n\n"
        f"--- RFP TEXT ---\n\n{rfp_text}\n\n--- END RFP TEXT ---\n\n"
        f"Return the compliance matrix as JSON."
    )

    return system_prompt, user_prompt


def get_draft_prompt(
    profile: "AgencyProfile",
    rfp: "RFPDocument",
    section: str,
    win_themes: list[str],
    min_words: int,
    max_words: int,
) -> tuple[str, str]:
    """Build the (system_prompt, user_prompt) pair for proposal section drafting."""
    profile_text = _format_profile(profile)

    rfp_context = (
        f"Title: {rfp.title}\n"
        f"Agency: {rfp.agency}\n"
        f"Scope: {rfp.scope_summary}\n"
        f"Key Requirements:\n"
        + "\n".join(f"  - {r}" for r in rfp.mandatory_requirements[:15])
        + "\n\nEvaluation Criteria:\n"
        + "\n".join(f"  - {c}" for c in rfp.evaluation_criteria[:10])
    )

    win_themes_text = (
        "\n".join(f"  {i+1}. {t}" for i, t in enumerate(win_themes))
        if win_themes
        else "  (No win themes identified — draft to the RFP requirements directly.)"
    )

    section_display = section.replace("-", " ").title()

    system_prompt = DRAFT_SYSTEM_PROMPT_TEMPLATE.format(
        profile_text=profile_text,
        rfp_context=rfp_context,
        win_themes_text=win_themes_text,
        section_name=section_display,
        min_words=min_words,
        max_words=max_words,
    )

    user_prompt = (
        f"Draft the {section_display} section for the proposal responding to "
        f"'{rfp.title}' issued by {rfp.agency}. "
        f"Target {min_words}–{max_words} words. "
        f"Address every mandatory requirement relevant to this section. "
        f"Lead with the strongest win theme."
    )

    return system_prompt, user_prompt


# ---------------------------------------------------------------------------
# Formatting helpers
# ---------------------------------------------------------------------------


def _format_profile(profile: "AgencyProfile") -> str:
    """Render an AgencyProfile as a structured text block for prompt injection."""
    lines = [
        f"**Company:** {profile.name}",
        f"**NAICS Codes:** {', '.join(profile.naics_codes) if profile.naics_codes else 'Not specified'}",
        f"**Certifications:** {', '.join(profile.certifications) if profile.certifications else 'None listed'}",
        "",
        "**Capabilities:**",
        profile.capabilities_raw or "(No capabilities document provided.)",
        "",
        "**Past Performance:**",
        profile.past_performance_raw or "(No past performance document provided.)",
        "",
        "**Team & Clearances:**",
        profile.team_raw or "(No team document provided.)",
    ]
    return "\n".join(lines)


def _format_disqualifiers(profile: "AgencyProfile") -> str:
    """Render disqualifier rules as a numbered list."""
    if not profile.disqualifier_rules:
        return "(No disqualifier rules configured. Apply standard judgment.)"
    lines = [f"  {i+1}. {rule}" for i, rule in enumerate(profile.disqualifier_rules)]
    return "\n".join(lines)
