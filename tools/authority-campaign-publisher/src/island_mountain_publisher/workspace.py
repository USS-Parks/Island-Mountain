"""Transactional multi-file workspace mutation with overlap protection."""

from __future__ import annotations

import difflib
import hashlib
import os
import subprocess
import tempfile
from collections.abc import Callable, Iterable, Mapping
from dataclasses import dataclass
from pathlib import Path


class WorkspaceError(RuntimeError):
    """A workspace plan is unsafe, stale, overlapping, or failed to apply."""


Validator = Callable[[Path, tuple["PlannedFile", ...]], None]
FailureInjector = Callable[[str], None]


def _sha256(value: bytes | None) -> str | None:
    return hashlib.sha256(value).hexdigest() if value is not None else None


@dataclass(frozen=True)
class PlannedFile:
    path: str
    content: bytes


@dataclass(frozen=True)
class PatchFile:
    path: str
    before_sha256: str | None
    after_sha256: str
    unified_diff: str


@dataclass(frozen=True)
class WorkspacePatch:
    files: tuple[PatchFile, ...]

    @property
    def tree_sha256(self) -> str:
        digest = hashlib.sha256()
        for file in self.files:
            digest.update(file.path.encode("utf-8"))
            digest.update(b"\0")
            digest.update(file.after_sha256.encode("ascii"))
            digest.update(b"\n")
        return digest.hexdigest()


def _text_diff(path: str, before: bytes | None, after: bytes) -> str:
    try:
        before_text = before.decode("utf-8") if before is not None else ""
        after_text = after.decode("utf-8")
    except UnicodeDecodeError:
        return "binary files differ\n"
    return "".join(
        difflib.unified_diff(
            before_text.splitlines(keepends=True),
            after_text.splitlines(keepends=True),
            fromfile=f"a/{path}",
            tofile=f"b/{path}",
        )
    )


class GitWorkspace:
    def __init__(self, repository_root: Path) -> None:
        self.repository_root = repository_root.resolve()

    def dirty_paths(self) -> frozenset[str]:
        result = subprocess.run(
            [
                "git",
                "status",
                "--porcelain=v1",
                "-z",
                "--untracked-files=all",
            ],
            cwd=self.repository_root,
            check=True,
            capture_output=True,
        )
        records = result.stdout.decode("utf-8", errors="strict").split("\0")
        dirty: set[str] = set()
        index = 0
        while index < len(records) and records[index]:
            record = records[index]
            if len(record) < 4:
                raise WorkspaceError(f"unrecognized git status record: {record!r}")
            status = record[:2]
            dirty.add(record[3:].replace("\\", "/"))
            index += 1
            if "R" in status or "C" in status:
                if index >= len(records) or not records[index]:
                    raise WorkspaceError("truncated git rename/copy status")
                dirty.add(records[index].replace("\\", "/"))
                index += 1
        return frozenset(dirty)

    def resolve_target(self, relative_path: str) -> Path:
        candidate = (self.repository_root / relative_path).resolve(strict=False)
        try:
            candidate.relative_to(self.repository_root)
        except ValueError as exc:
            raise WorkspaceError(f"planned path escapes repository: {relative_path}") from exc
        if candidate.is_symlink():
            raise WorkspaceError(f"planned target is a symlink: {relative_path}")
        return candidate


class WorkspaceTransaction:
    """Validate a temporary output set, then apply it with complete rollback."""

    def __init__(
        self,
        workspace: GitWorkspace,
        planned: Iterable[PlannedFile],
        *,
        validators: Iterable[Validator] = (),
        failure_injector: FailureInjector | None = None,
    ) -> None:
        self.workspace = workspace
        self.planned = tuple(sorted(planned, key=lambda item: item.path))
        self.validators = tuple(validators)
        self.failure_injector = failure_injector
        paths = [item.path for item in self.planned]
        if not paths:
            raise WorkspaceError("workspace transaction has no planned files")
        if len(paths) != len(set(paths)):
            raise WorkspaceError("workspace transaction contains duplicate paths")

    def _inject(self, point: str) -> None:
        if self.failure_injector is not None:
            self.failure_injector(point)

    def _baseline(self) -> dict[str, bytes | None]:
        baseline: dict[str, bytes | None] = {}
        for item in self.planned:
            target = self.workspace.resolve_target(item.path)
            baseline[item.path] = target.read_bytes() if target.exists() else None
        return baseline

    def _ensure_no_overlap(self) -> None:
        planned_paths = {item.path for item in self.planned}
        overlap = sorted(planned_paths & self.workspace.dirty_paths())
        if overlap:
            raise WorkspaceError(f"planned paths overlap dirty workspace paths: {overlap}")

    def _patch(self, baseline: Mapping[str, bytes | None]) -> WorkspacePatch:
        return WorkspacePatch(
            tuple(
                PatchFile(
                    path=item.path,
                    before_sha256=_sha256(baseline[item.path]),
                    after_sha256=_sha256(item.content) or "",
                    unified_diff=_text_diff(item.path, baseline[item.path], item.content),
                )
                for item in self.planned
            )
        )

    def apply(self) -> WorkspacePatch:
        self._ensure_no_overlap()
        baseline = self._baseline()
        with tempfile.TemporaryDirectory(prefix="im-publisher-") as temporary:
            temporary_root = Path(temporary)
            for item in self.planned:
                staged = temporary_root / item.path
                staged.parent.mkdir(parents=True, exist_ok=True)
                staged.write_bytes(item.content)
            for validator in self.validators:
                validator(temporary_root, self.planned)
            patch = self._patch(baseline)
            self._inject("before_apply")
            self._ensure_no_overlap()
            if self._baseline() != baseline:
                raise WorkspaceError("planned target changed after validation")

            replaced: list[str] = []
            temporary_targets: list[Path] = []
            try:
                for item in self.planned:
                    self._inject(f"before_replace:{item.path}")
                    target = self.workspace.resolve_target(item.path)
                    target.parent.mkdir(parents=True, exist_ok=True)
                    staged_target = target.with_name(f".{target.name}.publisher-tmp")
                    if staged_target.exists():
                        raise WorkspaceError(f"stale transaction file exists: {staged_target}")
                    temporary_targets.append(staged_target)
                    staged_target.write_bytes(item.content)
                    os.replace(staged_target, target)
                    replaced.append(item.path)
                    self._inject(f"after_replace:{item.path}")
                self._inject("after_apply")
            except BaseException:
                try:
                    self._rollback(replaced, baseline)
                finally:
                    for temporary_target in temporary_targets:
                        temporary_target.unlink(missing_ok=True)
                raise
            return patch

    def _rollback(self, replaced: list[str], baseline: Mapping[str, bytes | None]) -> None:
        errors: list[str] = []
        for relative_path in reversed(replaced):
            target = self.workspace.resolve_target(relative_path)
            original = baseline[relative_path]
            try:
                if original is None:
                    target.unlink(missing_ok=True)
                else:
                    rollback_target = target.with_name(f".{target.name}.publisher-rollback")
                    rollback_target.write_bytes(original)
                    os.replace(rollback_target, target)
            except OSError as exc:
                errors.append(f"{relative_path}: {exc}")
        if errors:
            raise WorkspaceError(f"rollback failed: {errors}")
