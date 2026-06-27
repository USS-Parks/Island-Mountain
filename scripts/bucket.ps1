# BUCKET — deploy the Island Mountain funnel Worker to Cloudflare.
# Usage:  pwsh scripts/bucket.ps1
#
# This is the "Cloudflare update" step. It typechecks, runs tests, and deploys
# the Worker (`wrangler deploy`). The static site (GitHub Pages) deploys
# separately via `git push` to main. Requires `npx wrangler login` once.

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$worker = Join-Path $repo 'worker'

Write-Host '== Island Mountain — BUCKET (Worker deploy) ==' -ForegroundColor Cyan
Set-Location $worker

if (-not (Test-Path (Join-Path $worker 'node_modules'))) {
  Write-Host '-> npm install' -ForegroundColor Yellow
  npm install
}

Write-Host '-> typecheck' -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) { throw 'typecheck failed' }

Write-Host '-> tests' -ForegroundColor Yellow
node --test src/qualifier.test.ts
if ($LASTEXITCODE -ne 0) { throw 'tests failed' }

# Guard: refuse to deploy while placeholder resource ids are still in wrangler.toml.
$toml = Get-Content (Join-Path $worker 'wrangler.toml') -Raw
if ($toml -match 'PLACEHOLDER_RUN_') {
  throw 'wrangler.toml still has PLACEHOLDER ids. Create KV + D1 (see DEPLOY.md) and paste real ids first.'
}

Write-Host '-> wrangler deploy' -ForegroundColor Yellow
npx wrangler deploy
if ($LASTEXITCODE -ne 0) { throw 'wrangler deploy failed' }

Write-Host ''
Write-Host 'Deployed. Verify health:' -ForegroundColor Green
Write-Host '  curl https://<worker-subdomain>.workers.dev/api/health'
Write-Host 'Static site (GitHub Pages) updates separately on: git push origin main' -ForegroundColor DarkGray
