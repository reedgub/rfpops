import pytest
from unittest.mock import MagicMock
from core.compliance import extract_compliance, ComplianceMatrix, Requirement
from core.intake import RFPDocument
from core.profile import AgencyProfile
from core.claude_client import ClaudeClient

SAMPLE_RFP = RFPDocument(
    title="Test RFP",
    agency="Test Agency",
    notice_id="TEST-001",
    naics="541512",
    deadline="2026-07-15",
    place_of_performance="Washington, DC",
    evaluation_criteria=["Technical Approach", "Past Performance"],
    mandatory_requirements=["The contractor shall provide cloud migration services."],
    scope_summary="Cloud migration services",
    page_count=30,
    raw_text="Section L.5.1: The contractor shall provide cloud migration services. Section L.5.2: The contractor shall maintain 99.9% uptime. The contractor must have FedRAMP experience.",
    source_url="https://sam.gov/test",
)

SAMPLE_PROFILE = AgencyProfile(
    name="Stratus Federal Solutions",
    naics_codes=["541512"],
    certifications=["FedRAMP", "CMMC L2"],
    capabilities_raw="Cloud migration and FedRAMP authorization services",
    past_performance_raw="VA Cloud Migration, DHS FedRAMP",
    team_raw="Secret cleared team",
    disqualifiers_raw="Under $250K",
    disqualifier_rules=["Under $250K"],
)

MOCK_COMPLIANCE_JSON = {
    "rfp_title": "Test RFP",
    "requirements": [
        {
            "id": "L.5.1",
            "text": "The contractor shall provide cloud migration services.",
            "category": "Mandatory",
            "status": "MET",
            "evidence": "VA Cloud Migration ($2.1M, 2023-2024) — 47 applications migrated to AWS GovCloud",
            "notes": "Direct match to past performance"
        },
        {
            "id": "L.5.2",
            "text": "The contractor shall maintain 99.9% uptime during migration windows.",
            "category": "Mandatory",
            "status": "MET",
            "evidence": "VA Cloud Migration outcome: 99.97% uptime maintained during all migration windows",
            "notes": "Exceeds requirement"
        },
        {
            "id": "L.5.3",
            "text": "The contractor must have FedRAMP experience.",
            "category": "Mandatory",
            "status": "MET",
            "evidence": "DHS FedRAMP Authorization Support ($890K) — full authorization delivered",
            "notes": "Multiple FedRAMP engagements"
        },
    ],
    "met_count": 3,
    "gap_count": 0,
    "partial_count": 0,
}

def test_extract_compliance_returns_matrix():
    mock_client = MagicMock(spec=ClaudeClient)
    mock_client.complete_json.return_value = MOCK_COMPLIANCE_JSON

    result = extract_compliance(SAMPLE_RFP, SAMPLE_PROFILE, mock_client)
    assert isinstance(result, ComplianceMatrix)
    assert len(result.requirements) == 3

def test_compliance_met_count():
    mock_client = MagicMock(spec=ClaudeClient)
    mock_client.complete_json.return_value = MOCK_COMPLIANCE_JSON

    result = extract_compliance(SAMPLE_RFP, SAMPLE_PROFILE, mock_client)
    assert result.met_count == 3
    assert result.gap_count == 0

def test_requirement_fields_populated():
    mock_client = MagicMock(spec=ClaudeClient)
    mock_client.complete_json.return_value = MOCK_COMPLIANCE_JSON

    result = extract_compliance(SAMPLE_RFP, SAMPLE_PROFILE, mock_client)
    req = result.requirements[0]
    assert req.id == "L.5.1"
    assert req.status == "MET"
    assert len(req.evidence) > 0
