"""Anthropic Claude API client wrapper with retry logic."""

from __future__ import annotations

import json
import os
import time
from typing import Any

import anthropic


class ClaudeClient:
    """Wraps the Anthropic Python SDK with retry logic and JSON helpers."""

    DEFAULT_MODEL = "claude-sonnet-4-5"
    RETRY_DELAYS = [2, 4, 8, 16]  # seconds, up to 4 retries

    def __init__(
        self,
        api_key: str | None = None,
        model: str = DEFAULT_MODEL,
    ) -> None:
        resolved_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not resolved_key:
            raise ValueError(
                "Anthropic API key is required. Set the ANTHROPIC_API_KEY environment "
                "variable or pass api_key= to ClaudeClient()."
            )
        self.model = model
        self._client = anthropic.Anthropic(api_key=resolved_key)

    # ------------------------------------------------------------------
    # Public interface
    # ------------------------------------------------------------------

    def complete(
        self,
        system: str,
        user: str,
        max_tokens: int = 4096,
    ) -> str:
        """Send a single-turn message and return the text response.

        Retries on rate-limit and server errors with exponential backoff.
        """
        response = self._call_with_retry(
            system=system,
            user=user,
            max_tokens=max_tokens,
        )
        for block in response.content:
            if block.type == "text":
                return block.text
        return ""

    def complete_json(
        self,
        system: str,
        user: str,
        schema: dict[str, Any],
    ) -> dict[str, Any]:
        """Return a validated JSON dict by instructing Claude to output JSON.

        The schema is embedded in the system prompt so Claude knows the exact
        shape expected. The response is parsed with json.loads().
        """
        json_system = (
            f"{system}\n\n"
            "IMPORTANT: Your response MUST be valid JSON that matches the following "
            f"schema exactly. Output ONLY the JSON object, no markdown fences, no "
            f"explanatory text before or after.\n\n"
            f"Required schema:\n{json.dumps(schema, indent=2)}"
        )
        text = self.complete(
            system=json_system,
            user=user,
            max_tokens=4096,
        )
        # Strip accidental markdown fences if Claude adds them anyway.
        text = text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            # Remove leading fence line (```json or ```)
            lines = lines[1:]
            # Remove trailing fence
            if lines and lines[-1].strip().startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines)

        return json.loads(text)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _call_with_retry(
        self,
        system: str,
        user: str,
        max_tokens: int,
    ) -> anthropic.types.Message:
        last_exc: Exception | None = None
        for attempt, delay in enumerate([0] + self.RETRY_DELAYS):
            if delay:
                time.sleep(delay)
            try:
                return self._client.messages.create(
                    model=self.model,
                    max_tokens=max_tokens,
                    system=system,
                    messages=[{"role": "user", "content": user}],
                )
            except anthropic.RateLimitError as exc:
                last_exc = exc
                if attempt == len(self.RETRY_DELAYS):
                    raise
            except anthropic.APIStatusError as exc:
                if exc.status_code >= 500:
                    last_exc = exc
                    if attempt == len(self.RETRY_DELAYS):
                        raise
                else:
                    raise
        # Should never reach here, but satisfy the type checker.
        raise last_exc or RuntimeError("Unexpected retry loop exit")
