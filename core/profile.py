"""Agency profile loading and parsing."""

from __future__ import annotations

import re
from pathlib import Path

from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------


class AgencyProfile(BaseModel):
    """Represents the boutique IT services agency's profile and capabilities."""

    name: str
    naics_codes: list[str]
    certifications: list[str]
    capabilities_raw: str
    past_performance_raw: str
    team_raw: str
    disqualifiers_raw: str
    disqualifier_rules: list[str]  # parsed simple rules from bullet points


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def load_profile(profile_dir: Path) -> AgencyProfile:
    """Load an AgencyProfile from a directory of markdown files.

    Expected files (all optional; missing files yield empty strings):
        capabilities.md      — services, NAICS codes, certifications
        past-performance.md  — contract history
        team.md              — staff, clearances, key personnel
        disqualifiers.md     — automatic NO-BID conditions

    Args:
        profile_dir: Path to the directory containing the markdown files.

    Returns:
        A populated AgencyProfile instance.
    """
    caps_text = _read_file(profile_dir / "capabilities.md")
    past_text = _read_file(profile_dir / "past-performance.md")
    team_text = _read_file(profile_dir / "team.md")
    disq_text = _read_file(profile_dir / "disqualifiers.md")

    name = _parse_agency_name(caps_text, profile_dir)
    naics_codes = _parse_naics_codes(caps_text)
    certifications = _parse_certifications(caps_text)
    disqualifier_rules = _parse_bullet_rules(disq_text)

    return AgencyProfile(
        name=name,
        naics_codes=naics_codes,
        certifications=certifications,
        capabilities_raw=caps_text,
        past_performance_raw=past_text,
        team_raw=team_text,
        disqualifiers_raw=disq_text,
        disqualifier_rules=disqualifier_rules,
    )


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _read_file(path: Path) -> str:
    """Return file contents or empty string if the file doesn't exist."""
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return ""


def _parse_agency_name(caps_text: str, profile_dir: Path) -> str:
    """Try to extract the agency name from capabilities.md heading or dir name."""
    # Look for # Agency Name or ## Company: ... at the top of the file
    for pattern in [
        r"^#\s+(.+)",
        r"^##\s+(?:Company|Agency|Firm)[:\s]+(.+)",
        r"Company Name[:\s]+(.+)",
        r"Agency Name[:\s]+(.+)",
    ]:
        m = re.search(pattern, caps_text, re.MULTILINE | re.IGNORECASE)
        if m:
            return m.group(1).strip()

    # Fall back to the parent directory name, humanised
    return profile_dir.name.replace("-", " ").replace("_", " ").title()


def _parse_naics_codes(caps_text: str) -> list[str]:
    """Extract all 6-digit NAICS codes from capabilities.md."""
    # Matches bare codes and labelled codes: "NAICS: 541511" or "541512"
    codes = re.findall(r"\b(\d{6})\b", caps_text)
    # Deduplicate while preserving order
    seen: set[str] = set()
    unique: list[str] = []
    for code in codes:
        if code not in seen:
            seen.add(code)
            unique.append(code)
    return unique


def _parse_certifications(caps_text: str) -> list[str]:
    """Extract certifications from labelled lines or bullet lists."""
    certs: list[str] = []

    # Explicit label: "Certifications: ISO 9001, CMMI Level 3"
    label_match = re.search(
        r"Certifications?[:\s]+(.+)",
        caps_text,
        re.IGNORECASE,
    )
    if label_match:
        raw = label_match.group(1).strip()
        for cert in re.split(r"[,;|]", raw):
            cert = cert.strip().strip("*-").strip()
            if cert:
                certs.append(cert)
        return certs

    # Bullet or dash items under a "Certifications" heading
    section = _extract_section(caps_text, "Certifications")
    if section:
        for line in section.splitlines():
            line = line.strip().lstrip("-*•").strip()
            if line and len(line) < 100:
                certs.append(line)

    # Known cert keywords anywhere in the text
    known_certs = [
        "ISO 9001",
        "ISO 27001",
        "ISO 20000",
        "CMMI",
        "FedRAMP",
        "SOC 2",
        "PCI DSS",
        "HIPAA",
        "8(a)",
        "HUBZone",
        "SDVOSB",
        "WOSB",
        "EDWOSB",
        "SBA",
        "SDB",
        "ITAR",
        "Secret Facility Clearance",
        "Top Secret Facility Clearance",
    ]
    if not certs:
        for cert in known_certs:
            if re.search(re.escape(cert), caps_text, re.IGNORECASE):
                certs.append(cert)

    # Deduplicate
    seen: set[str] = set()
    unique: list[str] = []
    for c in certs:
        if c.lower() not in seen:
            seen.add(c.lower())
            unique.append(c)
    return unique


def _parse_bullet_rules(disq_text: str) -> list[str]:
    """Extract bullet-point disqualifier rules from disqualifiers.md."""
    rules: list[str] = []
    for line in disq_text.splitlines():
        stripped = line.strip()
        # Accept lines that start with -, *, •, or a number followed by a period
        m = re.match(r"^(?:[-*•]|\d+\.)\s+(.+)", stripped)
        if m:
            rule = m.group(1).strip()
            if rule and len(rule) >= 5:
                rules.append(rule)
    return rules


def _extract_section(text: str, heading: str) -> str:
    """Return text under *heading* until the next heading or end of file."""
    pattern = re.compile(
        rf"^#+\s+{re.escape(heading)}\s*$(.+?)(?=^#+\s|\Z)",
        re.IGNORECASE | re.MULTILINE | re.DOTALL,
    )
    m = pattern.search(text)
    return m.group(1).strip() if m else ""
