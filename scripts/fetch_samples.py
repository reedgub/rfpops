#!/usr/bin/env python3
"""
Fetch sample RFPs from SAM.gov for use in testing.
Targets 3 opportunities with different characteristics for the Stratus profile.
"""
import json
import re
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

FIXTURES_DIR = Path("tests/fixtures")
SAM_API_BASE = "https://api.sam.gov/opportunities/v2/search"

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text[:50].strip("-")

def fetch_sam_opportunities() -> list[dict]:
    """Fetch open NAICS 541512 opportunities from SAM.gov API."""
    params = {
        "index": "opp",
        "q": "",
        "naicsCode": "541512",
        "type": "s",  # solicitations
        "active": "true",
        "limit": "25",
        "offset": "0",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    url = f"https://sam.gov/api/prod/sgs/v1/search/?{query}"

    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; RFPOps/0.1)",
        "Accept": "application/json",
    }

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
        return data.get("_embedded", {}).get("results", [])
    except Exception as e:
        print(f"SAM.gov API error: {e}", file=sys.stderr)
        return []

def download_pdf(url: str, dest: Path) -> bool:
    """Download a PDF to dest. Returns True on success."""
    headers = {"User-Agent": "Mozilla/5.0 (compatible; RFPOps/0.1)"}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            content = resp.read()
        if len(content) > 1000 and content[:4] == b"%PDF":
            dest.write_bytes(content)
            return True
        return False
    except Exception as e:
        print(f"  PDF download failed: {e}", file=sys.stderr)
        return False

def save_fixture(opp: dict, index: int) -> Path | None:
    """Save an opportunity as a fixture."""
    notice_id = opp.get("opportunityId", opp.get("noticeId", f"opp-{index}"))
    title = opp.get("title", f"Opportunity {index}")
    slug = f"rfp_{slugify(title[:30])}_{slugify(notice_id[-8:])}"

    fixture_dir = FIXTURES_DIR / slug
    fixture_dir.mkdir(parents=True, exist_ok=True)

    # Save metadata
    meta = {
        "notice_id": notice_id,
        "title": title,
        "agency": opp.get("organizationHierarchy", [{}])[0].get("name", opp.get("agency", "Unknown")),
        "naics": "541512",
        "deadline": opp.get("responseDeadLine", opp.get("archiveDate", "Unknown")),
        "type": opp.get("type", "Unknown"),
        "sam_url": f"https://sam.gov/opp/{notice_id}/view",
        "posted_date": opp.get("postedDate", "Unknown"),
    }
    (fixture_dir / "meta.json").write_text(json.dumps(meta, indent=2))
    print(f"  Saved metadata: {fixture_dir}/meta.json")

    # Try to find and download a PDF
    description = opp.get("description", "")
    resource_links = opp.get("resourceLinks", [])
    pdf_downloaded = False

    for link in resource_links:
        url = link.get("url", "")
        if url.endswith(".pdf") or "pdf" in url.lower():
            print(f"  Downloading PDF: {url[:80]}...")
            if download_pdf(url, fixture_dir / "source.pdf"):
                pdf_downloaded = True
                break

    if not pdf_downloaded:
        # Save description as text fallback
        text_content = f"""SOLICITATION TITLE: {title}
SOLICITATION NUMBER: {notice_id}
ISSUING AGENCY: {meta['agency']}
NAICS CODE: 541512
RESPONSE DEADLINE: {meta['deadline']}
SOURCE URL: {meta['sam_url']}

DESCRIPTION:
{description}
"""
        (fixture_dir / "source.txt").write_text(text_content)
        print(f"  No PDF found, saved description as source.txt")

    return fixture_dir

def main():
    FIXTURES_DIR.mkdir(parents=True, exist_ok=True)
    print("Fetching sample RFPs from SAM.gov...")

    opps = fetch_sam_opportunities()

    if not opps:
        print("ERROR: Could not fetch opportunities from SAM.gov API.", file=sys.stderr)
        print("Check network access and SAM.gov availability.", file=sys.stderr)
        print("\nCreating placeholder fixtures for development...", file=sys.stderr)
        create_placeholder_fixtures()
        return

    print(f"Found {len(opps)} opportunities. Selecting 3...")

    # Try to pick diverse opportunities
    selected = opps[:3] if len(opps) >= 3 else opps

    saved = []
    for i, opp in enumerate(selected):
        print(f"\nProcessing {i+1}/3: {opp.get('title', 'Unknown')[:60]}...")
        fixture_dir = save_fixture(opp, i)
        if fixture_dir:
            saved.append(fixture_dir)
        time.sleep(1)  # be polite to the API

    print(f"\nDone. Saved {len(saved)} fixtures:")
    for d in saved:
        contents = list(d.iterdir())
        print(f"  {d}/  ({[f.name for f in contents]})")

def create_placeholder_fixtures():
    """Create realistic placeholder fixtures when SAM.gov is unreachable."""
    placeholders = [
        {
            "slug": "rfp_doi-cloud-migration-placeholder",
            "meta": {
                "notice_id": "140D0423R0012",
                "title": "DOI Cloud Infrastructure Modernization",
                "agency": "Department of the Interior",
                "naics": "541512",
                "deadline": "2026-07-01",
                "type": "solicitation",
                "sam_url": "https://sam.gov/opp/140D0423R0012/view",
                "posted_date": "2026-05-01",
            },
            "text": """SOLICITATION NUMBER: 140D0423R0012
SOLICITATION TITLE: DOI Cloud Infrastructure Modernization
ISSUING AGENCY: Department of the Interior, Office of the Chief Information Officer
NAICS CODE: 541512
RESPONSE DEADLINE: 2026-07-01
PLACE OF PERFORMANCE: Washington, DC and Reston, VA
SET-ASIDE: 8(a) Small Business

STATEMENT OF WORK

1. BACKGROUND
The Department of the Interior (DOI) requires cloud migration and modernization services
to migrate 35 legacy applications from on-premises data centers to AWS GovCloud.

2. SCOPE OF WORK
The contractor shall provide cloud migration planning, execution, and hypercare services.
The contractor shall maintain FedRAMP Moderate authorization throughout the engagement.
The contractor shall complete migration of all 35 applications within 18 months.
The contractor shall provide weekly status reports to the Contracting Officer's Representative.
The contractor shall develop and maintain a Migration Runbook for each application.
The contractor shall conduct performance testing before and after each migration event.
The contractor shall provide 90-day post-migration support for each migrated application.

3. EVALUATION CRITERIA
Factor 1: Technical Approach (40 points)
Factor 2: Past Performance (35 points)
Factor 3: Price/Cost (25 points)

PERIOD OF PERFORMANCE: 18 months
ESTIMATED VALUE: $2.5M - $3.5M
""",
        },
        {
            "slug": "rfp_dod-logistics-platform-placeholder",
            "meta": {
                "notice_id": "W15QKN-24-R-0047",
                "title": "DoD Logistics Data Platform Modernization",
                "agency": "Department of Defense, DLA",
                "naics": "541512",
                "deadline": "2026-06-14",
                "type": "solicitation",
                "sam_url": "https://sam.gov/opp/W15QKN-24-R-0047/view",
                "posted_date": "2026-04-20",
            },
            "text": """SOLICITATION NUMBER: W15QKN-24-R-0047
SOLICITATION TITLE: DoD Logistics Data Platform Modernization
ISSUING AGENCY: Defense Logistics Agency (DLA)
NAICS CODE: 541512
RESPONSE DEADLINE: 2026-06-14
PLACE OF PERFORMANCE: Fort Belvoir, VA (100% on-site required)
SET-ASIDE: Full and Open Competition

STATEMENT OF WORK

1. BACKGROUND
DLA requires modernization of its enterprise logistics data platform currently running on
Palantir Foundry. The incumbent, Booz Allen Hamilton, has operated this platform since 2018.

2. SCOPE
The contractor shall maintain and extend the existing Palantir Foundry implementation.
The contractor shall provide 75 FTEs on-site at Fort Belvoir within 45 days of award.
The contractor shall hold Top Secret/SCI facility clearances for all personnel.
The contractor shall integrate with DLA's existing Oracle-based ERP system.
The contractor shall provide 24/7 Tier 3 support for the logistics platform.

3. EVALUATION CRITERIA
Factor 1: Technical Approach — Palantir Foundry expertise (50 points)
Factor 2: Key Personnel — must include 3 Palantir-certified engineers (30 points)
Factor 3: Price (20 points)

PERIOD OF PERFORMANCE: 5 years (base + 4 options)
ESTIMATED VALUE: $45M
""",
        },
        {
            "slug": "rfp_hhs-fedramp-authorization-placeholder",
            "meta": {
                "notice_id": "75N98124R00018",
                "title": "HHS Cloud Security and FedRAMP Authorization Support",
                "agency": "Department of Health and Human Services",
                "naics": "541512",
                "deadline": "2026-07-22",
                "type": "solicitation",
                "sam_url": "https://sam.gov/opp/75N98124R00018/view",
                "posted_date": "2026-05-05",
            },
            "text": """SOLICITATION NUMBER: 75N98124R00018
SOLICITATION TITLE: Cloud Security and FedRAMP Authorization Support
ISSUING AGENCY: Department of Health and Human Services, Office of the CIO
NAICS CODE: 541512
RESPONSE DEADLINE: 2026-07-22
PLACE OF PERFORMANCE: Washington, DC
SET-ASIDE: 8(a) Small Business

STATEMENT OF WORK

1. BACKGROUND
HHS requires cloud security and FedRAMP authorization support services for three
cloud-hosted systems currently operating under interim authorization. Two systems
require FedRAMP Moderate authorization; one requires FedRAMP High.

2. SCOPE
The contractor shall provide FedRAMP authorization package development services.
The contractor shall develop System Security Plans (SSPs) for all three systems.
The contractor shall coordinate with a Third Party Assessment Organization (3PAO).
The contractor shall develop Plans of Action and Milestones (POA&Ms) for identified gaps.
The contractor shall provide continuous monitoring support post-authorization.
The contractor shall have experience with FedRAMP High authorization (not just Moderate).

3. EVALUATION CRITERIA
Section L.5.1: Technical Approach (40 points)
Section L.5.2: Past Performance — minimum 2 FedRAMP authorizations (35 points)
Section L.5.3: Price (25 points)

PERIOD OF PERFORMANCE: 24 months
ESTIMATED VALUE: $1.2M - $1.8M
""",
        },
    ]

    for p in placeholders:
        d = FIXTURES_DIR / p["slug"]
        d.mkdir(parents=True, exist_ok=True)
        (d / "meta.json").write_text(json.dumps(p["meta"], indent=2))
        (d / "source.txt").write_text(p["text"])
        print(f"  Created placeholder: {d}/")

if __name__ == "__main__":
    main()
