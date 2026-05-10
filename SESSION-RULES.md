# Session Rules (CRITICAL - Read Every Session)

## File Truncation Prevention

This project had a file truncation issue caused by sync conflicts between the Cowork bash sandbox and the host filesystem. Files over ~500 lines could get silently chopped during writes. The root cause (inline CSS duplication) was fixed but large files remain vulnerable.

**No file may be left in a truncated state. Ever. No exceptions.**

### Rules

1. NEVER use the Edit tool on ANY HTML file. Use sed via bash for ALL HTML edits regardless of line count. The 400-line threshold was proven insufficient in Session 46 (about.html at 340 lines truncated under sequential Edit calls).
2. After EVERY file modification, verify with `tail -5 filename` in bash.
3. Before declaring any task complete, run the site-wide verification script.
4. If a file IS truncated, recover from git: `git show HEAD:filename > recovered.html`
5. For HANDOFF.md: capture to .tmp, append, verify, then overwrite. Never single-pass if >300 lines.
6. Heredoc appends: cap at 80 lines per block. Multiple sequential appends > one massive write.
7. After every write: compare actual line count vs expected. Divergence = stop and diagnose.
8. The bash sandbox FUSE mount creates .fuse_hidden* files when it overwrites files during sed edits. These DO leak to the host filesystem and WILL be committed to git if not excluded. .gitignore now contains .fuse_hidden* to prevent future tracking. If any appear in git status, remove them with `git rm --cached` before committing. Recovery artifacts (e.g. *-recovered.html, *.tmp) may also leak; verify via the Read tool (host path) and instruct the user to delete from PowerShell.
9. SESSION-LOG.md must be archived every 20 sessions. When the current SESSION-LOG.md reaches Session N where N is a multiple of 20 past the last archive boundary (next trigger: Session 60), archive all sessions before the boundary into `_work/sessions/SESSION-LOG-ARCHIVE-SX-SY.md`. Keep the header, add an Archive note listing all archive files, and start the active file from the next session.

### At-Risk Files (over 400 lines, current as of Session 50)

contact.html (991), faq.html (957), casino-gaming.html (716), investors.html (701), government.html (667), insurance.html (660), energy-utilities.html (660), education.html (659), financial-services.html (658), law-firms.html (653), tribal-nations.html (646), products.html (640), pricing.html (640), defense-contractors.html (631), medical-practices.html (620), research-labs.html (613), index.html (618), technology.html (570), blog.html (524), solutions.html (519), why-island-mountain.html (513), blog/ai-sovereignty-framework-tribal-nations.html (506), blog/openwebui-admin-setup-guide.html (451), blog/cloud-ai-vs-local-hardware-tco.html (422), blog/h100-vs-h200-inference-comparison.html (418), blog/attorney-client-privilege-cloud-ai.html (408)

### Verification Script

```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"
cd "$SITE"
for f in *.html blog/*.html; do
  [ "$f" = "googlecff518dc414acaa3.html" ] && continue
  lines=$(wc -l < "$f")
  has_close=$(grep -c '</html>' "$f")
  if [ "$has_close" -eq 0 ]; then
    echo "TRUNCATED: $f ($lines lines, no closing tag)"
  fi
done
echo "Verification complete."

echo "NUL byte scan:"
for f in *.html blog/*.html css/*.css js/*.js; do
  count=$(tr -cd '\0' < "$f" | wc -c)
  if [ "$count" -gt 0 ]; then
    echo "NUL BYTES ($count): $f"
  fi
done
echo "NUL scan complete."
```

Replace SESSION-SLUG with your session's slug. Find it: `ls /sessions/*/mnt/`

---

## Path Mapping

The bash sandbox and file tools use different path schemes for the same files.

| Tool | Path Format |
|------|------------|
| Read, Write, Edit, Grep, Glob | C:\Users\17076\Documents\Claude\Island Mountain\filename |
| Bash sandbox | /sessions/SESSION-SLUG/mnt/Island Mountain/filename |

**Find your bash session path:** `ls /sessions/*/mnt/`

---

## Session Protocol

### Opening Steps

1. Read HANDOFF.md (or this memory library). Do not begin work until context is loaded.
2. Read relevant _work/skills/SKILL.md if the task type has a custom skill.
3. State your task clearly. Reference any _work/sessions/ prompt file if applicable.
4. Find bash session path: `ls /sessions/*/mnt/`

### During Work

5. Use sed via bash for ALL edits to HTML files.
6. Run `tail -5 filename` after every file modification.
7. Run site-wide verification before declaring complete.
8. Validate all JSON-LD with Python parse check after schema changes.

### Closing Steps

9. Run final site-wide verification (including NUL byte scan).
10. Update HANDOFF.md session table and line counts.
11. Append session narrative to SESSION-LOG.md.
12. Verify HANDOFF.md and SESSION-LOG.md not truncated.
13. Provide git commit command for PowerShell.
