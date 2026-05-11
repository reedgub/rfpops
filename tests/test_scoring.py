import pytest
import json
from unittest.mock import MagicMock, patch
from core.scoring import score_rfp, Evaluation, Verdict, Confidence, DimensionScore
from core.intake import RFPDocument
from core.profile import AgencyProfile
from core.claude_client import ClaudeClient

SAMPLE_RFP = RFPDocument(
    title="Cloud Infrastructure Modernization",
    agency="U.S. Army Corps of Engineers",
    notice_id="W912HQ-24-R-0001",
    naics="541512",
    deadline="2026-07-15",
    place_of_performance="Washington, DC",
    evaluation_criteria=["Technical Approach (40%)", "Past Performance (30%)", "Price (30%)"],
    mandatory_requirements=[
        "The contractor shall provide cloud migration planning services.",
        "The contractor shall maintain 99.9% uptime during migration windows.",
        "The contractor shall deliver a FedRAMP authorization package within 90 days.",
    ],
    scope_summary="Cloud migration services for legacy applications to AWS GovCloud.",
    page_count=45,
    raw_text="Sample RFP text for testing",
    source_url="https://sam.gov/opp/test/view",
)

SAMPLE_PROFILE = AgencyProfile(
    name="Stratus Federal Solutions",
    naics_codes=["541512", "541519", "541611"],
    certifications=["CMMC L2", "ISO 27001", "FedRAMP", "8(a)", "GSA MAS"],
    capabilities_raw="Cloud migration, FedRAMP authorization, DevSecOps",
    past_performance_raw="VA Cloud Migration $2.1M, DHS FedRAMP $890K",
    team_raw="6 key personnel, Secret clearances",
    disqualifiers_raw="Under $250K, TS/SCI required",
    disqualifier_rules=["Under $250K", "TS/SCI required", "50+ FTE in 90 days"],
)

MOCK_EVALUATION_JSON = {
    "verdict": "BID",
    "confidence": "HIGH",
    "composite_score": 4.1,
    "dimensions": {
        "capability_match": {"score": 5, "rationale": "Section 2.1 requires FedRAMP Moderate authorization support — Stratus has delivered 3 FedRAMP authorizations including the DHS CISA engagement (2022-2023). The RFP's requirement for 'AWS GovCloud migration experience' (Section 3.2) matches the agency's primary cloud platform."},
        "past_performance": {"score": 4, "rationale": "The VA Cloud Migration ($2.1M, 14 months) is directly comparable in scope and dollar value. The RFP specifies 'prior federal cloud migration experience' in Section L.5 as a key evaluation factor."},
        "win_probability": {"score": 4, "rationale": "8(a) set-aside with no incumbent signals. No industry day was held but the requirements are broadly written without proprietary tooling references."},
        "margin_viability": {"score": 4, "rationale": "At $2.8M over 18 months, the contract supports a 4-5 person team with healthy margins. Section B.1 pricing structure allows labor-hour flexibility."},
        "strategic_fit": {"score": 4, "rationale": "Army Corps is a new federal logo for Stratus. Winning this contract would establish a DoD foothold and demonstrate interagency breadth."},
        "disqualifiers": {"score": 5, "rationale": "No disqualifiers triggered. Contract value above $250K threshold. No TS/SCI requirement. Staffing requirement is 4 FTE maximum."},
    },
    "tldr": "Strong technical and past performance fit for an 8(a) set-aside opportunity. Army Corps is a new logo worth pursuing.",
    "key_risks": ["Competition from other 8(a) firms with existing Army relationships", "18-month PoP is tight for full FedRAMP authorization if scope expands"],
    "win_themes": ["FedRAMP authorization track record", "VA and DHS agency experience", "AWS GovCloud specialization"],
    "effort_estimate_hours": 240,
    "disqualifier_check": "PASS",
    "timestamp": "2026-05-11T12:00:00",
}

# Test 1: successful evaluation returns Evaluation model
def test_score_rfp_returns_evaluation():
    mock_client = MagicMock(spec=ClaudeClient)
    mock_client.complete_json.return_value = MOCK_EVALUATION_JSON

    result = score_rfp(SAMPLE_RFP, SAMPLE_PROFILE, mock_client)

    assert isinstance(result, Evaluation)
    assert result.verdict == Verdict.BID
    assert result.confidence == Confidence.HIGH
    assert result.composite_score == pytest.approx(4.1, abs=0.01)

# Test 2: disqualifier check is performed
def test_disqualifier_check_in_result():
    mock_client = MagicMock(spec=ClaudeClient)
    mock_client.complete_json.return_value = MOCK_EVALUATION_JSON

    result = score_rfp(SAMPLE_RFP, SAMPLE_PROFILE, mock_client)
    assert result.disqualifier_check == "PASS"

# Test 3: NO-BID verdict correctly parsed
def test_no_bid_verdict():
    no_bid_json = MOCK_EVALUATION_JSON.copy()
    no_bid_json["verdict"] = "NO-BID"
    no_bid_json["confidence"] = "HIGH"
    no_bid_json["composite_score"] = 1.8
    no_bid_json["win_themes"] = []

    mock_client = MagicMock(spec=ClaudeClient)
    mock_client.complete_json.return_value = no_bid_json

    result = score_rfp(SAMPLE_RFP, SAMPLE_PROFILE, mock_client)
    assert result.verdict == Verdict.NO_BID

# Test 4: all 6 dimensions present
def test_all_dimensions_present():
    mock_client = MagicMock(spec=ClaudeClient)
    mock_client.complete_json.return_value = MOCK_EVALUATION_JSON

    result = score_rfp(SAMPLE_RFP, SAMPLE_PROFILE, mock_client)
    expected_dims = {"capability_match", "past_performance", "win_probability", "margin_viability", "strategic_fit", "disqualifiers"}
    assert set(result.dimensions.keys()) == expected_dims
