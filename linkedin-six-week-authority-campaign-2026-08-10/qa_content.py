"""Campaign gate for the 30-pair LinkedIn campaign.

Default run: structural variation checks (word bands, randomized paragraph and
sentence rhythm). `python qa_content.py --full` additionally runs the
distinctiveness gate (device budgets, cross-piece overlap, opener rotation,
form declarations, LinkedIn-tell blacklist), the Basho voice floor, and the
slop checker, then writes QA-REPORT.md.
"""

from __future__ import annotations

import datetime
import re
import statistics
import sys
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SKILL = ROOT.parent / "_work" / "skills" / "im-blog-post"
sys.path.insert(0, str(SKILL))

POST_RE = re.compile(r"(?ms)^## (\d{2}): (.+?)\n(.*?)(?=^---\s*$|\Z)")
LONG_RE = re.compile(
    r"(?ms)^### Long-form article\s*\n(.*?)^### LinkedIn summary post\s*\n(.*)"
)
SENTENCE_RE = re.compile(r"(?<=[.!?])(?:[\"”’)]*)\s+(?=[A-Z0-9“\"(])")
WORD_RE = re.compile(r"\b[\w’'-]+\b", re.UNICODE)
FORM_RE = re.compile(r"^\*\*Form:\*\*\s*(F[1-8])\b", re.M)
COMMENT_RE = re.compile(r"^\*\*First comment:\*\*\s*(\S.*)$", re.M)
CONTRACTION = re.compile(r"[A-Za-z]+['’](?:s|t|re|ve|ll|d|m)(?![A-Za-z])")
FIRSTP = re.compile(r"\bI\b|\bI['’](?:m|d|ll|ve)\b|\b[Mm]y\b|\b[Ww]e\b|\b[Oo]ur\b")
REFRAME = re.compile(r"n['’]t[^.!?]*[.!?]\s+(?:It|That|This)['’]s\b")
ANTITHESIS_TITLE = re.compile(r",\s*Not\b", re.I)
VOICE_FLOOR = 3.0

TELLS = [
    "here's the thing", "here’s the thing", "let that sink in",
    "read that again", "that's it. that's the post", "that’s it. that’s the post",
    "unpopular opinion", "hot take", "i'll say it again", "i’ll say it again",
    "gentle reminder", "psa:", "agree?", "thoughts?", "a thread",
    "game-changer", "game changer", "♻", "\U0001f447",
    "\U0001f680", "\U0001f4a1", "\U0001f525", "✅", "\U0001f449", "→",
]

# Regulatory or proper phrases whose 8-word shingles may legitimately recur.
ALLOW_SHINGLE = [
    "cloud and ai development act",
    "first nations information governance centre",
    "nist ai risk management framework",
    "operation cascadian shadow",
    "business associate agreement",
]

IMPERATIVE_LEADS = {
    "start", "ask", "measure", "read", "bring", "test", "count", "inventory",
    "write", "map", "run", "give", "keep", "name", "watch", "take", "walk",
    "open", "put", "hold", "treat", "separate", "classify", "record", "define",
}
CONDITIONAL_LEADS = {"if", "when", "until", "unless", "before", "after"}
SCENE_LEADS = {"picture", "imagine"}


@dataclass
class Post:
    post_id: str
    title: str
    form: str | None
    comment: str | None
    article: str
    summary: str


@dataclass
class Piece:
    post_id: str
    title: str
    kind: str
    text: str
    metrics: dict = field(default_factory=dict)


def clean_paragraphs(text: str) -> list[str]:
    paragraphs = []
    for raw in re.split(r"\n\s*\n", text.strip()):
        p = raw.strip()
        if not p or p.startswith("**") or p.startswith("#"):
            continue
        if p.startswith("---"):
            continue
        paragraphs.append(p.replace("\n", " "))
    return paragraphs


def sentences(paragraph: str) -> list[str]:
    return [s.strip() for s in SENTENCE_RE.split(paragraph) if s.strip()]


def load_posts() -> list[Post]:
    posts: list[Post] = []
    for path in sorted(ROOT.glob("WEEK-*.md")):
        source = path.read_text(encoding="utf-8")
        for post_id, title, body in POST_RE.findall(source):
            match = LONG_RE.search(body)
            if not match:
                raise ValueError(f"{path.name} post {post_id}: missing sections")
            form = FORM_RE.search(body)
            comment = COMMENT_RE.search(body)
            posts.append(Post(
                post_id, title.strip(),
                form.group(1) if form else None,
                comment.group(1).strip() if comment else None,
                match.group(1).strip(), match.group(2).strip(),
            ))
    return sorted(posts, key=lambda p: p.post_id)


def pieces_of(posts: list[Post]) -> list[Piece]:
    out = []
    for p in posts:
        out.append(Piece(p.post_id, p.title, "article", p.article))
        out.append(Piece(p.post_id, p.title, "summary", p.summary))
    return out


def opener_shape(text: str) -> str:
    paras = clean_paragraphs(text)
    if not paras:
        return "empty"
    first = sentences(paras[0])[0]
    word = re.sub(r"[^\w’']", "", first.split()[0]).lower()
    if first.endswith("?"):
        return "question"
    if first.startswith(("“", '"')):
        return "quote"
    if first.startswith(("To ", "Dear ", "You ")):
        return "address"
    if word in SCENE_LEADS or re.match(r"^(It['’]s \d|\d)", first):
        return "scene"
    if word in CONDITIONAL_LEADS:
        return "conditional"
    if word in IMPERATIVE_LEADS:
        return "imperative"
    return "declarative"


def inspect_variation(piece: Piece) -> list[str]:
    paras = clean_paragraphs(piece.text)
    groups = [sentences(p) for p in paras]
    all_s = [s for g in groups for s in g]
    lens = [len(WORD_RE.findall(s)) for s in all_s]
    counts = [len(g) for g in groups]
    words = len(WORD_RE.findall(" ".join(paras)))
    fails: list[str] = []

    lo, hi = (240, 700) if piece.kind == "article" else (80, 260)
    if not lo <= words <= hi:
        fails.append(f"word count {words} outside {lo}-{hi}")
    if len(paras) < (6 if piece.kind == "article" else 4):
        fails.append(f"only {len(paras)} prose paragraphs")
    if len(set(counts)) < 2:
        fails.append(f"paragraph sentence counts do not vary: {counts}")
    if max(counts, default=0) < 2:
        fails.append("no multi-sentence paragraph")
    if len(set(lens)) < (8 if piece.kind == "article" else 5):
        fails.append(f"too few distinct sentence lengths: {sorted(set(lens))}")
    if lens and max(lens) - min(lens) < 10:
        fails.append("sentence word-count spread under ten")
    if len(lens) > 1 and statistics.pstdev(lens) < 3.5:
        fails.append("sentence word-count stdev under 3.5")
    for i in range(len(lens) - 2):
        if lens[i] == lens[i + 1] == lens[i + 2]:
            fails.append(f"three consecutive {lens[i]}-word sentences")
            break

    piece.metrics = {
        "words": words, "paras": len(paras), "sentences": len(all_s),
        "pattern": tuple(counts),
        "mean": round(statistics.mean(lens), 1) if lens else 0,
        "sd": round(statistics.pstdev(lens), 1) if len(lens) > 1 else 0,
    }
    return fails


def norm_tokens(text: str) -> list[str]:
    return re.findall(r"[a-z0-9’']+", text.lower())


def full_checks(posts: list[Post], pieces: list[Piece]) -> list[str]:
    fails: list[str] = []
    import slopcheck
    import voicecheck  # noqa: F401  (import proves the shared gate is present)

    # G4 form declarations + rotation; R7 titles; funnel line present.
    weeks = [posts[i:i + 5] for i in range(0, len(posts), 5)]
    for p in posts:
        if not p.form:
            fails.append(f"{p.post_id}: missing **Form:** declaration")
        if not p.comment:
            fails.append(f"{p.post_id}: missing **First comment:** funnel line")
        elif "utm_campaign=authority-2026" not in p.comment:
            fails.append(f"{p.post_id}: first-comment link lacks campaign UTM")
        if ANTITHESIS_TITLE.search(p.title):
            fails.append(f"{p.post_id}: antithesis title: {p.title}")
    for w, week in enumerate(weeks, 1):
        forms = [p.form for p in week if p.form]
        if len(set(forms)) != len(forms):
            fails.append(f"week {w}: repeated form {forms}")
    for a, b in zip(posts, posts[1:]):
        if a.form and a.form == b.form:
            fails.append(f"{a.post_id}->{b.post_id}: same form on consecutive posts")

    # G3 opener rotation (articles).
    shapes = {p.post_id: opener_shape(p.article) for p in posts}
    for a, b in zip(posts, posts[1:]):
        if shapes[a.post_id] == shapes[b.post_id]:
            fails.append(f"{a.post_id}->{b.post_id}: same opener shape "
                         f"({shapes[a.post_id]})")
    for w, week in enumerate(weeks, 1):
        if len({shapes[p.post_id] for p in week}) < 3:
            fails.append(f"week {w}: fewer than three opener shapes")

    # Per-piece: G1 devices, R6 tells, voice floor, first person, slop.
    for pc in pieces:
        paras = clean_paragraphs(pc.text)
        body = " ".join(paras)
        low = body.lower()
        tag = f"{pc.post_id} {pc.kind}"
        hits = REFRAME.findall(body)
        if hits:
            fails.append(f"{tag}: negation-reframe device present ({len(hits)}x, budget 0)")
        if paras and paras[-1].startswith("Ask "):
            fails.append(f"{tag}: ask-closer as final paragraph")
        for t in TELLS:
            if t in low:
                fails.append(f"{tag}: LinkedIn tell {t!r}")
        if "—" in body:
            fails.append(f"{tag}: em-dash in copy")
        w = len(body.split()) or 1
        c = len(CONTRACTION.findall(body))
        per100 = 100.0 * c / w
        pc.metrics["contr100"] = round(per100, 1)
        if per100 < VOICE_FLOOR:
            fails.append(f"{tag}: {per100:.1f} contractions/100w under {VOICE_FLOOR}")
        if not FIRSTP.search(body):
            fails.append(f"{tag}: no first person")
        for label, phrase, _ctx in slopcheck.scan_text(body):
            fails.append(f"{tag}: slop [{label}] {phrase!r}")

    # Caveat 7: paragraph rhythm unique across all pieces.
    seen_pattern: dict[tuple, str] = {}
    for pc in pieces:
        pat = pc.metrics.get("pattern")
        tag = f"{pc.post_id} {pc.kind}"
        if pat in seen_pattern:
            fails.append(f"{tag}: paragraph pattern {pat} duplicates {seen_pattern[pat]}")
        else:
            seen_pattern[pat] = tag

    # G2 cross-piece overlap: shared 8-word shingles and repeated sentences.
    shingles: dict[tuple, str] = {}
    sent_seen: dict[str, str] = {}
    reported = set()
    for pc in pieces:
        tag = f"{pc.post_id} {pc.kind}"
        toks = norm_tokens(" ".join(clean_paragraphs(pc.text)))
        for i in range(len(toks) - 7):
            sh = tuple(toks[i:i + 8])
            joined = " ".join(sh)
            if any(a in joined for a in ALLOW_SHINGLE):
                continue
            prev = shingles.get(sh)
            if prev is None:
                shingles[sh] = tag
            elif prev.split()[0] != pc.post_id and (prev, tag, sh[:3]) not in reported:
                fails.append(f"{tag}: 8-word overlap with {prev}: \"{joined}\"")
                reported.add((prev, tag, sh[:3]))
        for para in clean_paragraphs(pc.text):
            for s in sentences(para):
                key = " ".join(norm_tokens(s))
                if len(key.split()) < 5:
                    continue
                prev = sent_seen.get(key)
                if prev is None:
                    sent_seen[key] = tag
                elif prev != tag:
                    fails.append(f"{tag}: sentence repeats {prev}: \"{s[:60]}\"")
    return fails


def write_report(posts, pieces, var_fails, full_fails):
    lines = [
        "# Campaign QA Report",
        "",
        f"Generated {datetime.date.today().isoformat()} by `python qa_content.py --full`.",
        "",
        f"Posts: {len(posts)}  Pieces: {len(pieces)}",
        f"Variation gate: {'clean' if not var_fails else f'{len(var_fails)} failure(s)'}",
        f"Distinctiveness + voice gate: {'clean' if not full_fails else f'{len(full_fails)} failure(s)'}",
        "",
        "| # | Form | Opener | Article w / c100 | Summary w / c100 | Pattern (article) |",
        "|---|---|---|---|---|---|",
    ]
    arts = {p.post_id: p for p in pieces if p.kind == "article"}
    sums = {p.post_id: p for p in pieces if p.kind == "summary"}
    for p in posts:
        a, s = arts[p.post_id], sums[p.post_id]
        lines.append(
            f"| {p.post_id} | {p.form or '?'} | {opener_shape(p.article)} "
            f"| {a.metrics['words']} / {a.metrics.get('contr100', '-')} "
            f"| {s.metrics['words']} / {s.metrics.get('contr100', '-')} "
            f"| {'-'.join(str(n) for n in a.metrics['pattern'])} |"
        )
    if var_fails or full_fails:
        lines += ["", "## Failures", ""]
        lines += [f"- {f}" for f in var_fails + full_fails]
    (ROOT / "QA-REPORT.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    full = "--full" in sys.argv
    posts = load_posts()
    pieces = pieces_of(posts)
    var_fails: list[str] = []
    print(f"pairs={len(posts)} pieces={len(pieces)}")
    if len(pieces) != 60:
        var_fails.append(f"expected 60 pieces, found {len(pieces)}")
    for pc in pieces:
        for f in inspect_variation(pc):
            var_fails.append(f"{pc.post_id} {pc.kind}: {f}")
    full_fails = full_checks(posts, pieces) if full else []
    for f in var_fails + full_fails:
        print("FAIL " + f)
    if full:
        write_report(posts, pieces, var_fails, full_fails)
        print("QA-REPORT.md written")
    total = len(var_fails) + len(full_fails)
    print("campaign gate: " + ("clean" if not total else f"{total} failure(s)"))
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())
