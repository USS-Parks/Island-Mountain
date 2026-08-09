from pathlib import Path

import pytest


@pytest.fixture(scope="session")
def repository_root() -> Path:
    return Path(__file__).resolve().parents[3]


@pytest.fixture(scope="session")
def campaign_root(repository_root: Path) -> Path:
    return repository_root / "linkedin-six-week-authority-campaign-2026-08-10"


@pytest.fixture(scope="session")
def cards_root(repository_root: Path) -> Path:
    return repository_root / "cards"
