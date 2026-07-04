# Session 51 PML Update Script   # slop-ok: PML session-log tooling; "Session" is the log entry name
# Run from PowerShell in the Island Mountain directory

$PML = ".claude\Project Memory Library"
$SRC = "_pml-updates"

# Copy updated files (overwrites existing)
Copy-Item "$SRC\ARCHITECTURE.md" "$PML\ARCHITECTURE.md" -Force
Copy-Item "$SRC\CONVENTIONS.md" "$PML\CONVENTIONS.md" -Force
Copy-Item "$SRC\INDEX.md" "$PML\INDEX.md" -Force
Copy-Item "$SRC\KNOWN-ISSUES.md" "$PML\KNOWN-ISSUES.md" -Force

# Append Session 51 entry to SESSION-LOG.md   # slop-ok: writes the session log itself
Get-Content "$SRC\SESSION-LOG-APPEND.md" | Add-Content "$PML\SESSION-LOG.md"

Write-Host "PML updates applied. Verify with:"
Write-Host "  Select-String 'Session 51' $PML\*.md"   # slop-ok: session-log lookup string

# Cleanup
Write-Host ""
Write-Host "To clean up staging files:"
Write-Host "  Remove-Item _pml-updates -Recurse -Force"
