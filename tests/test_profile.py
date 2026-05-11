import pytest
from pathlib import Path
import tempfile
import os
from core.profile import load_profile, AgencyProfile

CAPABILITIES_MD = """# Stratus Federal Solutions — Capabilities

Services: Cloud migration, FedRAMP authorization support, DevSecOps

NAICS Codes: 541512, 541519, 541611

Certifications: CMMC Level 2, ISO 27001, FedRAMP, 8(a) certified, GSA MAS Schedule

GSA Schedule: MAS IT Schedule 70, SIN 54151S
"""

PAST_PERF_MD = """## VA Cloud Migration — VA OIT, 2023
**Contract value:** $2.1M | **Duration:** 14 months | **Role:** Prime
**Scope:** Migration of 47 legacy applications.
**Outcome:** Completed 6 weeks early.
**Relevance:** Demonstrates cloud migration leadership.
"""

TEAM_MD = """## Key Personnel

**Dr. Patricia Ashworth** — CTO | Secret Clearance
**Marcus Delgado** — Cloud Practice Lead | Top Secret Clearance
"""

DISQUALIFIERS_MD = """# Hard No-Go Criteria

- Contracts valued under $250,000
- Requirements for Top Secret/SCI cleared personnel
- Any RFP requiring more than 50 FTE within 90 days
- Prime roles on contracts exceeding $15M
"""

@pytest.fixture
def profile_dir(tmp_path):
    (tmp_path / "capabilities.md").write_text(CAPABILITIES_MD)
    (tmp_path / "past-performance.md").write_text(PAST_PERF_MD)
    (tmp_path / "team.md").write_text(TEAM_MD)
    (tmp_path / "disqualifiers.md").write_text(DISQUALIFIERS_MD)
    return tmp_path

def test_load_profile_returns_agency_profile(profile_dir):
    profile = load_profile(profile_dir)
    assert isinstance(profile, AgencyProfile)
    assert profile.name  # should have a name

def test_naics_codes_parsed(profile_dir):
    profile = load_profile(profile_dir)
    assert "541512" in profile.naics_codes
    assert "541519" in profile.naics_codes

def test_certifications_parsed(profile_dir):
    profile = load_profile(profile_dir)
    assert len(profile.certifications) >= 2
    certs_upper = [c.upper() for c in profile.certifications]
    assert any("CMMC" in c or "ISO" in c or "FEDRAMP" in c for c in certs_upper)

def test_disqualifier_rules_parsed(profile_dir):
    profile = load_profile(profile_dir)
    assert len(profile.disqualifier_rules) >= 2

def test_raw_markdown_preserved(profile_dir):
    profile = load_profile(profile_dir)
    assert len(profile.capabilities_raw) > 50
    assert len(profile.past_performance_raw) > 50
