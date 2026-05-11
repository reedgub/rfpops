"""RFP document ingestion: URL, PDF path, or raw text → RFPDocument."""

from __future__ import annotations

import re
from pathlib import Path

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------


class RFPDocument(BaseModel):
    """Structured representation of a parsed federal RFP document."""

    title: str
    agency: str
    notice_id: str
    naics: str
    deadline: str  # ISO date string or "Unknown"
    place_of_performance: str
    evaluation_criteria: list[str]
    mandatory_requirements: list[str]  # "shall" statements
    scope_summary: str
    page_count: int
    raw_text: str
    source_url: str


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def parse_rfp(source: str) -> RFPDocument:
    """Parse an RFP from a URL, local PDF path, or raw text string.

    Args:
        source: One of:
            - An http/https URL (fetched with Playwright)
            - A local path ending in .pdf (extracted with pdfplumber)
            - Any other string (treated as raw RFP text)

    Returns:
        A fully populated RFPDocument.
    """
    raw_text: str
    page_count: int = 0
    source_url: str = source if source.startswith("http") else ""

    if source.startswith("http://") or source.startswith("https://"):
        raw_text = _fetch_url(source)
        page_count = 1
    elif _is_pdf_path(source):
        raw_text, page_count = _extract_pdf(source)
        source_url = f"file://{Path(source).resolve()}"
    else:
        raw_text = source
        page_count = max(1, len(source) // 3000)

    doc = _extract_metadata(raw_text, source_url)
    # page_count from extraction overrides the placeholder in metadata helper
    return doc.model_copy(update={"page_count": page_count, "raw_text": raw_text})


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _is_pdf_path(source: str) -> bool:
    """Return True when *source* looks like a local PDF file path."""
    return source.lower().endswith(".pdf") and not source.startswith("http")


def _fetch_url(url: str) -> str:
    """Fetch page text via Playwright's sync API."""
    from playwright.sync_api import sync_playwright  # type: ignore[import]

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, timeout=30_000, wait_until="domcontentloaded")
        content = page.inner_text("body")
        browser.close()
    return content


def _extract_pdf(path: str) -> tuple[str, int]:
    """Extract text from a local PDF file. Returns (text, page_count)."""
    import pdfplumber  # type: ignore[import]

    pages: list[str] = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                pages.append(extracted)
    return "\n\n".join(pages), len(pages)


def _extract_metadata(text: str, source: str) -> RFPDocument:
    """Derive structured fields from raw RFP text using regex heuristics."""
    title = _find_title(text)
    agency = _find_agency(text)
    notice_id = _find_notice_id(text)
    naics = _find_naics(text)
    deadline = _find_deadline(text)
    place_of_performance = _find_place_of_performance(text)
    mandatory_requirements = _extract_shall_statements(text)
    evaluation_criteria = _find_evaluation_criteria(text)
    scope_summary = _find_scope_summary(text)

    return RFPDocument(
        title=title,
        agency=agency,
        notice_id=notice_id,
        naics=naics,
        deadline=deadline,
        place_of_performance=place_of_performance,
        evaluation_criteria=evaluation_criteria,
        mandatory_requirements=mandatory_requirements,
        scope_summary=scope_summary,
        page_count=0,  # overwritten by caller
        raw_text=text,
        source_url=source,
    )


# ---------------------------------------------------------------------------
# Field-level extractors
# ---------------------------------------------------------------------------


def _find_title(text: str) -> str:
    patterns = [
        r"Solicitation Title[:\s]+(.+)",
        r"RFP[:\s]+(.+)",
        r"REQUEST FOR PROPOSAL[:\s]+(.+)",
        r"SOLICITATION FOR[:\s]+(.+)",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            candidate = m.group(1).strip()
            if candidate:
                return candidate[:200]

    # Fall back: first line that looks like a heading (ALL CAPS, ≥ 10 chars)
    for line in text.splitlines():
        line = line.strip()
        if len(line) >= 10 and line.isupper():
            return line[:200]

    return "Unknown"


_COMMON_AGENCIES = [
    "Department of Defense",
    "Department of Veterans Affairs",
    "Department of Health and Human Services",
    "Department of Homeland Security",
    "Department of Energy",
    "Department of Transportation",
    "Department of State",
    "Department of the Treasury",
    "Department of Justice",
    "Department of Agriculture",
    "Department of Commerce",
    "Department of Education",
    "Department of Housing and Urban Development",
    "General Services Administration",
    "NASA",
    "National Institutes of Health",
    "National Security Agency",
    "Army",
    "Navy",
    "Air Force",
    "Marines",
    "Coast Guard",
    "Centers for Medicare",
    "Social Security Administration",
]


def _find_agency(text: str) -> str:
    patterns = [
        r"Issuing Agency[:\s]+(.+)",
        r"Contracting Agency[:\s]+(.+)",
        r"Contracting Office[:\s]+(.+)",
        r"Awarding Agency[:\s]+(.+)",
        r"Agency[:\s]+(.{5,80})",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            candidate = m.group(1).strip().rstrip(",.")
            if candidate:
                return candidate[:150]

    # Scan for known agency names appearing near the top of the document.
    top = text[:3000]
    for agency in _COMMON_AGENCIES:
        if re.search(re.escape(agency), top, re.IGNORECASE):
            return agency

    return "Unknown"


def _find_notice_id(text: str) -> str:
    # Explicit label first
    label_patterns = [
        r"Solicitation Number[:\s]+([A-Z0-9\-]{6,25})",
        r"RFP Number[:\s]+([A-Z0-9\-]{6,25})",
        r"Contract Number[:\s]+([A-Z0-9\-]{6,25})",
        r"Notice ID[:\s]+([A-Z0-9\-]{6,25})",
        r"Solicitation No\.?[:\s]+([A-Z0-9\-]{6,25})",
    ]
    for pat in label_patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            return m.group(1).strip()

    # Bare DoD-style solicitation number (e.g. W912HQ-24-R-0001)
    m = re.search(r"\b([A-Z]{1,6}\d{2,6}-\d{2,4}-[A-Z]-\d{4,6})\b", text)
    if m:
        return m.group(1)

    return "Unknown"


def _find_naics(text: str) -> str:
    m = re.search(r"NAICS\s*(?:Code)?[:\s]+(\d{6})", text, re.IGNORECASE)
    if m:
        return m.group(1)
    return "Unknown"


def _find_deadline(text: str) -> str:
    patterns = [
        r"Response Deadline[:\s]+(.{5,40})",
        r"Offers Due[:\s]+(.{5,40})",
        r"Due Date[:\s]+(.{5,40})",
        r"Proposal Due[:\s]+(.{5,40})",
        r"Submission Deadline[:\s]+(.{5,40})",
    ]
    date_re = re.compile(
        r"(\d{4}-\d{2}-\d{2})|(\w+ \d{1,2},?\s+\d{4})|(\d{1,2}/\d{1,2}/\d{4})"
    )
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            snippet = m.group(1).strip()
            dm = date_re.search(snippet)
            if dm:
                return dm.group(0)
            # Return first 40 chars as-is if it's plausible
            if len(snippet) <= 40:
                return snippet

    # Direct date pattern after deadline keywords
    m = date_re.search(text[:5000])
    if m:
        return m.group(0)

    return "Unknown"


def _find_place_of_performance(text: str) -> str:
    m = re.search(
        r"Place of Performance[:\s]+(.{5,200})",
        text,
        re.IGNORECASE | re.DOTALL,
    )
    if m:
        # Take only the first line or up to 200 chars
        raw = m.group(1).strip()
        first_line = raw.split("\n")[0].strip()
        return first_line[:200] if first_line else raw[:200]
    return "Unknown"


def _find_evaluation_criteria(text: str) -> list[str]:
    """Extract numbered evaluation factors or criteria items."""
    # Find the section that discusses evaluation
    section_pattern = re.compile(
        r"(Evaluation\s+(?:Criteria|Factors|Methodology|Method).*?)(?=\n[A-Z]{3,}|\Z)",
        re.IGNORECASE | re.DOTALL,
    )
    m = section_pattern.search(text)
    section = m.group(1) if m else text

    criteria: list[str] = []

    # Numbered items: 1. ... or (1) ... or L.5.1 ...
    numbered = re.findall(
        r"(?:^|\n)\s*(?:\d+\.|\(\d+\)|[A-Z]\.\d+(?:\.\d+)*)\s+([^\n]{10,200})",
        section,
    )
    for item in numbered:
        item = item.strip()
        if item:
            criteria.append(item)

    # Bullet items under the section
    if not criteria:
        bullets = re.findall(r"(?:^|\n)\s*[-•]\s+([^\n]{10,200})", section)
        for item in bullets:
            item = item.strip()
            if item:
                criteria.append(item)

    return criteria[:20]  # cap at 20


_EXCLUDE_SHALL = re.compile(
    r"shall mean|shall not be construed|shall not be limited to|shall include but",
    re.IGNORECASE,
)


def _extract_shall_statements(text: str) -> list[str]:
    """Return sentences containing ' shall ' that represent hard requirements."""
    sentences: list[str] = []
    # Split on sentence boundaries (period followed by space/newline)
    raw_sentences = re.split(r"(?<=[.!?])\s+", text)
    for sentence in raw_sentences:
        if " shall " in sentence and not _EXCLUDE_SHALL.search(sentence):
            clean = sentence.strip()
            if 20 <= len(clean) <= 500:
                sentences.append(clean)
    return sentences[:50]  # cap at 50


def _find_scope_summary(text: str) -> str:
    """Return the first 500 chars of substantive text after SOW or Background."""
    patterns = [
        r"Statement of Work\s*\n(.+)",
        r"Statement of Objectives\s*\n(.+)",
        r"Background\s*\n(.+)",
        r"Scope of Work\s*\n(.+)",
        r"Purpose\s*\n(.+)",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE | re.DOTALL)
        if m:
            snippet = m.group(1).strip()
            # Remove leading blank lines
            snippet = re.sub(r"^\s+", "", snippet)
            return snippet[:500]

    # Fall back to first 500 chars of the document after skipping the header
    # (skip first 200 chars which is usually boilerplate).
    return text[200:700].strip()
