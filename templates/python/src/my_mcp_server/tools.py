"""Example tool logic, kept free of MCP imports so it is easy to unit-test.

Replace these functions with your own and register them in server.py.
Raise ValueError for input the caller can fix; server.py turns it into an
error result the calling model can read.
"""

from __future__ import annotations

import re
import unicodedata
from datetime import date
from typing import TypedDict


def slugify(text: str, max_length: int = 60) -> str:
    """Return a lowercase, hyphen-separated URL slug for ``text``."""
    decomposed = unicodedata.normalize("NFKD", text)
    ascii_text = "".join(ch for ch in decomposed if not unicodedata.combining(ch))
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-")
    slug = slug[:max_length].rstrip("-")
    if not slug:
        raise ValueError("text contains no letters or digits, so the slug would be empty")
    return slug


class DaysBetween(TypedDict):
    days: int
    weeks: int
    remaining_days: int


def _parse_date(value: str, field: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError:
        raise ValueError(f"{field} is not a real calendar date: {value}") from None


def days_between(start: str, end: str) -> DaysBetween:
    """Whole days from ``start`` to ``end`` (YYYY-MM-DD); negative if end is earlier."""
    days = (_parse_date(end, "end") - _parse_date(start, "start")).days
    weeks, remaining = divmod(abs(days), 7)
    return {"days": days, "weeks": weeks, "remaining_days": remaining}
