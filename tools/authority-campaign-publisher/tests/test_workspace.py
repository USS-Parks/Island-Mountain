import subprocess
from pathlib import Path

import pytest

from island_mountain_publisher.workspace import (
    GitWorkspace,
    PlannedFile,
    WorkspaceError,
    WorkspaceTransaction,
)


@pytest.fixture
def repository(tmp_path: Path) -> Path:
    subprocess.run(["git", "init", "-q"], cwd=tmp_path, check=True)
    subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=tmp_path, check=True)
    subprocess.run(["git", "config", "user.name", "Test Owner"], cwd=tmp_path, check=True)
    (tmp_path / "a.txt").write_text("original a\n", encoding="utf-8")
    (tmp_path / "b.txt").write_text("original b\n", encoding="utf-8")
    subprocess.run(["git", "add", "a.txt", "b.txt"], cwd=tmp_path, check=True)
    subprocess.run(["git", "commit", "-q", "-m", "fixture"], cwd=tmp_path, check=True)
    return tmp_path


def _snapshot(repository: Path) -> dict[str, bytes]:
    return {
        path.relative_to(repository).as_posix(): path.read_bytes()
        for path in repository.rglob("*")
        if path.is_file() and ".git" not in path.relative_to(repository).parts
    }


def _plan() -> tuple[PlannedFile, ...]:
    return (
        PlannedFile("a.txt", b"changed a\n"),
        PlannedFile("new.txt", b"created\n"),
    )


def test_validated_plan_applies_as_one_reviewable_patch(repository: Path) -> None:
    validated: list[str] = []

    def validate(root: Path, planned: tuple[PlannedFile, ...]) -> None:
        validated.extend(item.path for item in planned)
        assert (root / "a.txt").read_bytes() == b"changed a\n"

    patch = WorkspaceTransaction(
        GitWorkspace(repository), _plan(), validators=(validate,)
    ).apply()

    assert validated == ["a.txt", "new.txt"]
    assert (repository / "a.txt").read_bytes() == b"changed a\n"
    assert (repository / "new.txt").read_bytes() == b"created\n"
    assert len(patch.tree_sha256) == 64
    assert patch.files[0].unified_diff.startswith("--- a/a.txt")


@pytest.mark.parametrize(
    "failure_point",
    [
        "before_apply",
        "before_replace:a.txt",
        "after_replace:a.txt",
        "before_replace:new.txt",
        "after_replace:new.txt",
        "after_apply",
    ],
)
def test_failure_at_every_mutation_point_restores_exact_tree(
    repository: Path,
    failure_point: str,
) -> None:
    before = _snapshot(repository)

    def fail(point: str) -> None:
        if point == failure_point:
            raise RuntimeError(f"injected:{point}")

    with pytest.raises(RuntimeError, match="injected"):
        WorkspaceTransaction(
            GitWorkspace(repository), _plan(), failure_injector=fail
        ).apply()

    assert _snapshot(repository) == before
    assert GitWorkspace(repository).dirty_paths() == frozenset()


def test_overlapping_dirty_path_blocks_without_mutation(repository: Path) -> None:
    (repository / "a.txt").write_text("owner edit\n", encoding="utf-8")
    before = _snapshot(repository)

    with pytest.raises(WorkspaceError, match="overlap dirty"):
        WorkspaceTransaction(GitWorkspace(repository), _plan()).apply()

    assert _snapshot(repository) == before


def test_unrelated_dirty_path_is_preserved(repository: Path) -> None:
    (repository / "b.txt").write_text("owner edit\n", encoding="utf-8")

    WorkspaceTransaction(GitWorkspace(repository), _plan()).apply()

    assert (repository / "b.txt").read_text(encoding="utf-8") == "owner edit\n"
    assert "b.txt" in GitWorkspace(repository).dirty_paths()


def test_path_escape_is_rejected(repository: Path) -> None:
    with pytest.raises(WorkspaceError, match="escapes repository"):
        WorkspaceTransaction(
            GitWorkspace(repository), (PlannedFile("../escape.txt", b"no"),)
        ).apply()
