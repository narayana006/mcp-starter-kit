import pytest

from my_mcp_server.tools import days_between, slugify


def test_slugify_strips_accents_and_punctuation():
    assert slugify("  Crème Brûlée: The Recipe! ") == "creme-brulee-the-recipe"


def test_slugify_truncates_without_trailing_hyphen():
    assert slugify("alpha beta gamma", 11) == "alpha-beta"


def test_slugify_rejects_text_with_nothing_sluggable():
    with pytest.raises(ValueError, match="slug would be empty"):
        slugify("!!! ???")


def test_days_between_counts_across_a_leap_day():
    assert days_between("2024-02-01", "2024-03-01") == {"days": 29, "weeks": 4, "remaining_days": 1}


def test_days_between_is_negative_when_end_is_earlier():
    assert days_between("2025-01-10", "2025-01-01")["days"] == -9


def test_days_between_rejects_dates_that_do_not_exist():
    with pytest.raises(ValueError, match="start is not a real calendar date"):
        days_between("2025-02-30", "2025-03-01")
