"""Rich table view for listing stored RFPs with colour-coded deadlines."""

from __future__ import annotations

from datetime import date, datetime


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def list_rfps_table() -> None:
    """Print a Rich table of all stored RFPs to stdout.

    Columns: RFP (title + agency), Score, Verdict, Due, Status

    Deadline colouring:
        - Red:    past due
        - Yellow: due within 7 days
        - Green:  more than 7 days away
        - Dim:    deadline is "Unknown"

    Rows are sorted by deadline ascending (unknown deadlines at the end).
    """
    from .storage import list_rfps  # avoid circular imports at module level

    summaries = list_rfps()

    try:
        from rich.console import Console
        from rich.table import Table
        from rich.text import Text

        _render_rich_table(summaries)
    except ImportError:
        _render_plain_table(summaries)


# ---------------------------------------------------------------------------
# Rich renderer
# ---------------------------------------------------------------------------


def _render_rich_table(summaries: list) -> None:
    """Render summaries using rich."""
    from rich.console import Console
    from rich.table import Table
    from rich.text import Text

    console = Console()

    if not summaries:
        console.print("[dim]No RFPs found. Use [cyan]rfpops intake[/cyan] to add one.[/dim]")
        return

    table = Table(
        title="RFP Pipeline",
        show_header=True,
        header_style="bold magenta",
        border_style="dim",
        show_lines=False,
        expand=False,
    )

    table.add_column("RFP", min_width=30, max_width=50, no_wrap=False)
    table.add_column("Score", justify="center", min_width=6)
    table.add_column("Verdict", justify="center", min_width=8)
    table.add_column("Due", justify="center", min_width=12)
    table.add_column("Status", justify="center", min_width=10)

    # Sort by deadline (unknown → end)
    sorted_summaries = sorted(summaries, key=_deadline_sort_key)

    today = date.today()

    for s in sorted_summaries:
        # --- RFP cell (title + agency on second line) ---
        rfp_text = Text()
        rfp_text.append(s.title[:45], style="bold")
        if s.agency and s.agency != "Unknown":
            rfp_text.append(f"\n{s.agency[:45]}", style="dim")

        # --- Score cell ---
        if s.composite_score is not None:
            score_str = f"{s.composite_score:.1f}"
            score_style = _score_style(s.composite_score)
            score_text = Text(score_str, style=score_style)
        else:
            score_text = Text("—", style="dim")

        # --- Verdict cell ---
        if s.verdict:
            verdict_style = _verdict_style(s.verdict)
            verdict_text = Text(s.verdict, style=verdict_style)
        else:
            verdict_text = Text("—", style="dim")

        # --- Due date cell ---
        due_text = _format_deadline(s.deadline, today)

        # --- Status cell ---
        status_style = _status_style(s.status)
        status_text = Text(s.status, style=status_style)

        table.add_row(rfp_text, score_text, verdict_text, due_text, status_text)

    console.print()
    console.print(table)
    console.print(
        f"[dim]  {len(summaries)} RFP{'s' if len(summaries) != 1 else ''} total[/dim]"
    )
    console.print()


# ---------------------------------------------------------------------------
# Plain text fallback
# ---------------------------------------------------------------------------


def _render_plain_table(summaries: list) -> None:
    """Fallback renderer when rich is not installed."""
    if not summaries:
        print("No RFPs found.")
        return

    sorted_summaries = sorted(summaries, key=_deadline_sort_key)
    today = date.today()

    header = f"{'RFP':<40} {'Score':>6}  {'Verdict':<8}  {'Due':<12}  {'Status':<10}"
    print()
    print(header)
    print("-" * len(header))

    for s in sorted_summaries:
        title_trunc = s.title[:38] if len(s.title) > 38 else s.title
        score_str = f"{s.composite_score:.1f}" if s.composite_score is not None else "—"
        verdict_str = s.verdict or "—"
        due_str = _deadline_display(s.deadline, today)
        print(
            f"{title_trunc:<40} {score_str:>6}  {verdict_str:<8}  {due_str:<12}  {s.status:<10}"
        )

    print()
    print(f"  {len(summaries)} RFP(s) total")
    print()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _deadline_sort_key(summary: object) -> tuple[int, str]:
    """Sort key: (0 for known date, 1 for unknown), then ISO date string."""
    deadline = getattr(summary, "deadline", "Unknown")
    parsed = _parse_deadline_date(deadline)
    if parsed is None:
        return (1, "9999-12-31")
    return (0, parsed.isoformat())


def _parse_deadline_date(deadline: str) -> date | None:
    """Try to parse a deadline string into a date object."""
    if not deadline or deadline.lower() == "unknown":
        return None

    formats = [
        "%Y-%m-%d",
        "%m/%d/%Y",
        "%B %d, %Y",
        "%B %d %Y",
        "%b %d, %Y",
        "%b %d %Y",
        "%d %B %Y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(deadline.strip(), fmt).date()
        except ValueError:
            continue
    return None


def _format_deadline(deadline: str, today: date) -> "object":
    """Return a rich Text object for the deadline cell."""
    try:
        from rich.text import Text
    except ImportError:
        return deadline

    parsed = _parse_deadline_date(deadline)
    if parsed is None:
        return Text(deadline[:12] if deadline else "Unknown", style="dim")

    display = parsed.strftime("%Y-%m-%d")
    delta = (parsed - today).days

    if delta < 0:
        return Text(display, style="bold red")
    elif delta <= 7:
        return Text(display, style="bold yellow")
    else:
        return Text(display, style="green")


def _deadline_display(deadline: str, today: date) -> str:
    """Plain text deadline display with basic markers."""
    parsed = _parse_deadline_date(deadline)
    if parsed is None:
        return deadline[:12] if deadline else "Unknown"

    display = parsed.strftime("%Y-%m-%d")
    delta = (parsed - today).days

    if delta < 0:
        return f"{display} [PAST]"
    elif delta <= 7:
        return f"{display} [SOON]"
    return display


def _score_style(score: float) -> str:
    """Map a composite score to a rich style string."""
    if score >= 4.0:
        return "bold green"
    elif score >= 3.0:
        return "yellow"
    elif score >= 2.0:
        return "orange3"
    return "bold red"


def _verdict_style(verdict: str) -> str:
    """Map a verdict string to a rich style string."""
    mapping = {
        "BID": "bold green",
        "NO-BID": "bold red",
        "MAYBE": "bold yellow",
    }
    return mapping.get(verdict.upper(), "dim")


def _status_style(status: str) -> str:
    """Map a status string to a rich style string."""
    mapping = {
        "Evaluated": "cyan",
        "Drafting": "magenta",
        "Extracted": "dim",
    }
    return mapping.get(status, "dim")
