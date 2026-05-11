"""Interactive onboarding flow: collects agency info and generates profile markdown files."""

from __future__ import annotations

import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def run_onboard(profile_dir: Path) -> None:
    """Run the interactive 8-question onboarding flow and write profile markdown files.

    Collects company information through a guided questionnaire, then calls
    Claude to generate four structured markdown profile files:
        capabilities.md, past-performance.md, team.md, disqualifiers.md

    Args:
        profile_dir: Directory where the markdown files will be written.
                     Will be created if it does not exist.

    Raises:
        SystemExit: If the user cancels at the confirmation prompt.
    """
    try:
        from rich.console import Console
        from rich.panel import Panel
        from rich.prompt import Confirm, Prompt
        from rich.text import Text
    except ImportError:
        _run_plain_onboard(profile_dir)
        return

    console = Console()

    console.print(
        Panel.fit(
            Text("RFPOps Agency Onboarding", style="bold cyan"),
            subtitle="Answer 8 questions to generate your agency profile",
            border_style="cyan",
        )
    )
    console.print()

    answers: dict[str, str] = {}

    # --- Question 1: Company name ---
    console.print("[bold]1/8[/bold] — [cyan]Company Name[/cyan]")
    answers["company_name"] = Prompt.ask("  What is your company's legal name?").strip()
    console.print()

    # --- Question 2: Core services ---
    console.print("[bold]2/8[/bold] — [cyan]Core Services[/cyan]")
    console.print(
        "  Describe the IT services your agency offers (e.g., cloud migration,\n"
        "  cybersecurity, DevSecOps, data engineering, software development)."
    )
    answers["core_services"] = Prompt.ask("  Services").strip()
    console.print()

    # --- Question 3: NAICS codes ---
    console.print("[bold]3/8[/bold] — [cyan]NAICS Codes[/cyan]")
    console.print("  Enter your primary NAICS codes, comma-separated (e.g., 541511, 541512).")
    answers["naics_codes"] = Prompt.ask("  NAICS codes").strip()
    console.print()

    # --- Question 4: Certifications ---
    console.print("[bold]4/8[/bold] — [cyan]Certifications & Set-Aside Status[/cyan]")
    console.print(
        "  List applicable certifications and set-aside statuses\n"
        "  (e.g., 8(a), SDVOSB, HUBZone, ISO 9001, CMMI Level 3, FedRAMP)."
    )
    answers["certifications"] = Prompt.ask("  Certifications").strip()
    console.print()

    # --- Question 5: Typical contract size ---
    console.print("[bold]5/8[/bold] — [cyan]Typical Contract Size[/cyan]")
    console.print(
        "  What is your typical federal contract size range?\n"
        "  (e.g., $500K–$5M, $2M–$15M)"
    )
    answers["contract_size"] = Prompt.ask("  Contract range").strip()
    console.print()

    # --- Question 6: Recent wins ---
    console.print("[bold]6/8[/bold] — [cyan]Recent Contract Wins (Past 5 Years)[/cyan]")
    console.print(
        "  Describe up to 3 recent federal contracts. For each, include:\n"
        "  agency name, dollar value, period of performance, and what you delivered.\n"
        "  Separate contracts with a semicolon (;)."
    )
    answers["recent_wins"] = Prompt.ask("  Recent contracts").strip()
    console.print()

    # --- Question 7: Team clearances ---
    console.print("[bold]7/8[/bold] — [cyan]Team & Clearances[/cyan]")
    console.print(
        "  Describe your key personnel and clearance levels\n"
        "  (e.g., 12 FTEs, 4 hold Secret clearances, 1 TS/SCI)."
    )
    answers["team_clearances"] = Prompt.ask("  Team profile").strip()
    console.print()

    # --- Question 8: Disqualifiers ---
    console.print("[bold]8/8[/bold] — [cyan]Automatic NO-BID Conditions[/cyan]")
    console.print(
        "  What conditions should trigger an automatic NO-BID decision?\n"
        "  Examples: 'requires TS/SCI clearance we don't hold', 'contract > $50M',\n"
        "  'requires ITAR facility', 'hardware-only deliverables'.\n"
        "  Separate conditions with a semicolon (;)."
    )
    answers["disqualifiers"] = Prompt.ask("  Disqualifier conditions").strip()
    console.print()

    # --- Confirmation ---
    console.print("[bold cyan]Generating profile files with Claude...[/bold cyan]")
    console.print()

    # Check for existing files
    existing_files = _check_existing_files(profile_dir)
    if existing_files:
        console.print(
            f"[yellow]Warning:[/yellow] The following files already exist in {profile_dir}:"
        )
        for f in existing_files:
            console.print(f"  - {f}")
        console.print()
        if not Confirm.ask("  Overwrite existing files?", default=False):
            console.print("[red]Onboarding cancelled.[/red]")
            sys.exit(0)
        console.print()

    # Generate and write profile files
    try:
        _generate_and_write_profiles(profile_dir, answers, console=console)
    except Exception as exc:
        console.print(f"[red]Error generating profile files: {exc}[/red]")
        raise

    console.print()
    console.print(
        Panel.fit(
            Text(
                f"Profile files written to {profile_dir}/\n\n"
                f"  capabilities.md\n"
                f"  past-performance.md\n"
                f"  team.md\n"
                f"  disqualifiers.md\n\n"
                f"Review and edit these files to refine your profile.",
                style="green",
            ),
            title="Onboarding Complete",
            border_style="green",
        )
    )


# ---------------------------------------------------------------------------
# Plain-text fallback (no rich)
# ---------------------------------------------------------------------------


def _run_plain_onboard(profile_dir: Path) -> None:
    """Plain text onboarding flow for environments without rich installed."""
    print("=" * 60)
    print("RFPOps Agency Onboarding")
    print("Answer 8 questions to generate your agency profile.")
    print("=" * 60)
    print()

    answers: dict[str, str] = {}

    answers["company_name"] = input("1/8 Company legal name: ").strip()
    answers["core_services"] = input("2/8 Core IT services offered: ").strip()
    answers["naics_codes"] = input("3/8 NAICS codes (comma-separated): ").strip()
    answers["certifications"] = input("4/8 Certifications and set-aside status: ").strip()
    answers["contract_size"] = input("5/8 Typical contract size range: ").strip()
    answers["recent_wins"] = input("6/8 Recent contracts (semicolon-separated): ").strip()
    answers["team_clearances"] = input("7/8 Team and clearance levels: ").strip()
    answers["disqualifiers"] = input("8/8 Automatic NO-BID conditions (semicolon-separated): ").strip()
    print()

    existing_files = _check_existing_files(profile_dir)
    if existing_files:
        print(f"Warning: The following files already exist in {profile_dir}:")
        for f in existing_files:
            print(f"  - {f}")
        confirm = input("Overwrite existing files? [y/N] ").strip().lower()
        if confirm != "y":
            print("Onboarding cancelled.")
            sys.exit(0)

    print("Generating profile files with Claude...")
    _generate_and_write_profiles(profile_dir, answers, console=None)

    print()
    print("Profile files written successfully:")
    print(f"  {profile_dir}/capabilities.md")
    print(f"  {profile_dir}/past-performance.md")
    print(f"  {profile_dir}/team.md")
    print(f"  {profile_dir}/disqualifiers.md")
    print()
    print("Review and edit these files to refine your profile.")


# ---------------------------------------------------------------------------
# File generation
# ---------------------------------------------------------------------------


def _check_existing_files(profile_dir: Path) -> list[str]:
    """Return list of profile markdown filenames that already exist."""
    files = ["capabilities.md", "past-performance.md", "team.md", "disqualifiers.md"]
    return [f for f in files if (profile_dir / f).exists()]


def _generate_and_write_profiles(
    profile_dir: Path,
    answers: dict[str, str],
    console: object | None,
) -> None:
    """Call Claude to generate the four profile markdown files and write them to disk."""
    import os

    import anthropic

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError(
            "ANTHROPIC_API_KEY environment variable is required for onboarding."
        )

    client = anthropic.Anthropic(api_key=api_key)

    system = (
        "You are an expert federal contracting consultant who writes agency capability "
        "profiles for boutique IT services firms. Write clear, factual, and specific "
        "markdown documents. Never use: leverage, synergy, best-in-class, world-class, "
        "cutting-edge, robust, seamlessly, empower, unlock value, or drive outcomes.\n\n"
        "You will generate FOUR separate markdown documents based on the agency information "
        "provided. Return a single JSON object with four keys: "
        "'capabilities', 'past_performance', 'team', 'disqualifiers'. "
        "Each value is the full markdown content for that file. "
        "Return ONLY the JSON object, no markdown fences."
    )

    disqualifier_list = [
        d.strip() for d in answers.get("disqualifiers", "").split(";") if d.strip()
    ]
    disqualifiers_formatted = "\n".join(f"- {d}" for d in disqualifier_list)

    user = f"""Generate four agency profile markdown documents for this firm:

Company Name: {answers.get('company_name', 'Unknown')}
Core Services: {answers.get('core_services', '')}
NAICS Codes: {answers.get('naics_codes', '')}
Certifications: {answers.get('certifications', '')}
Typical Contract Size: {answers.get('contract_size', '')}
Recent Contracts: {answers.get('recent_wins', '')}
Team & Clearances: {answers.get('team_clearances', '')}
Automatic NO-BID Conditions: {answers.get('disqualifiers', '')}

For each document, follow these formats:

### capabilities.md
Start with: # <Company Name>
Include sections: ## Overview, ## Core Services, ## NAICS Codes (list each code with description), ## Certifications (list each), ## Technical Stack (infer from services described)

### past-performance.md
Start with: # Past Performance
For each contract mentioned, create a subsection with: ## <Agency> — <Brief Title>, then fields: Contract value, Period of performance, Relevance, Description (2–3 sentences), Outcomes (quantified where possible)

### team.md
Start with: # Team Profile
Include sections: ## Staff Overview, ## Clearance Levels, ## Key Personnel (infer 2–3 plausible named roles from the services described), ## Hiring Capacity

### disqualifiers.md
Start with: # Automatic NO-BID Conditions
Write a brief intro paragraph, then list each condition as a bullet point:
{disqualifiers_formatted if disqualifiers_formatted else '- No explicit disqualifiers defined — use standard judgment'}

Return JSON with keys: capabilities, past_performance, team, disqualifiers
"""

    import time

    for attempt in range(4):
        try:
            response = client.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=4096,
                system=system,
                messages=[{"role": "user", "content": user}],
            )
            break
        except anthropic.RateLimitError:
            if attempt == 3:
                raise
            wait = 2 ** (attempt + 1)
            if console:
                try:
                    from rich.console import Console
                    if isinstance(console, Console):
                        console.print(f"  Rate limited — waiting {wait}s...")
                except ImportError:
                    pass
            time.sleep(wait)

    text = ""
    for block in response.content:
        if block.type == "text":
            text = block.text
            break

    # Strip markdown fences if present
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")[1:]
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines)

    import json

    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Claude returned invalid JSON during onboarding: {exc}\n\nResponse: {text[:500]}") from exc

    profile_dir.mkdir(parents=True, exist_ok=True)

    file_map = {
        "capabilities.md": data.get("capabilities", ""),
        "past-performance.md": data.get("past_performance", ""),
        "team.md": data.get("team", ""),
        "disqualifiers.md": data.get("disqualifiers", ""),
    }

    for filename, content in file_map.items():
        if not content:
            content = f"# {filename.replace('.md', '').replace('-', ' ').title()}\n\n(No content generated.)\n"
        (profile_dir / filename).write_text(content, encoding="utf-8")
        if console:
            try:
                from rich.console import Console
                if isinstance(console, Console):
                    console.print(f"  [green]✓[/green] {filename}")
            except ImportError:
                pass
