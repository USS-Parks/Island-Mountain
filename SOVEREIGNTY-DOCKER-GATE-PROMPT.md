# Fresh-session prompt — M1 Docker `compose up` live gate (D1 + D2)

Paste everything below the line into a new Claude Code session started in
`C:\Users\17076\Documents\Claude\Island Mountain`. It is self-contained.

---

You are continuing the **Island Mountain AOG/WSF Sovereignty STS build**. **M1 is
already feature-complete in code, committed, and its runtime core is live-verified.**
Your single job this session is the **final acceptance: the containerized
`docker compose up` live gate** for the D1 appliance and the D2 shadow artifact —
the one thing deferred last session for context/Docker-build budget.

**Mode:** relentless STS execution — build/verify/commit without stopping to ask
between steps; **push only if I explicitly say so** (CANON §4). Use the
`Authored and reviewed by Basho Parks, Copyright 2026` footer on every commit,
never an AI co-author (CANON §3).

## Where to work
- **Worktree (do ALL work here):**
  `C:\Users\17076\Documents\Claude\Island Mountain\Island Mountain Mighty Eel OS\mai-worktrees\mai-SOV-1`
- **Branch:** `session/SOV-1` (HEAD `d481f5b`), **not pushed**.
- **Read first:** top-level `SOVEREIGNTY-HANDOFF.md`, then in the worktree
  `docs/sessions/SOVEREIGNTY-DEVLOG.md` (§ Phase D) + `deployment/appliance/README.md`
  + `deployment/shadow/README.md`. Plan: `PLANNING/AOG-WSF-SOVEREIGNTY-STACK-PSPR.md` (D1/D2).

## What's already proven (so you know what's NOT the problem)
Last session ran the **debug binaries** against a dev-OpenBao container: `wsf-seed`
provisioned OpenBao + issued the demo token + seeded `vk_demo`; a governed chat
completion through `aog-gateway` (shadow) returned **200** with the full `x-aog-*`
governance headers + the model body; unknown key → 401; `/v1/status` → `shadow`.
**The seed → OpenBao AppRole → virtual-key → verify → classify/route → policy →
dispatch → meter logic works.** Any failure you hit is **container-specific**, not
core logic — debug the Docker layer, don't re-litigate the Rust.

## Task 1 — D1 appliance gate

```bash
# optional: reclaim leftover dev containers + confirm the ports are free
docker rm -f wsf-openbao-w1 2>/dev/null        # prior-session test OpenBao on :8250 (safe; dev mode)
# appliance uses host ports 8200, 8080, 8081, 8088 — make sure they're free

cd "…/mai-worktrees/mai-SOV-1/deployment/appliance"
docker compose up --build -d       # first build ~10–30 min (Rust release compiled in-image)
docker compose ps                  # openbao healthy; seed Exited(0); wsf-api/aog-gateway/console up
docker compose logs seed           # expect: "wsf-seed: OK — provisioned OpenBao … token_id=…"
```

Then the **gate** — a governed request succeeds:

```bash
curl -s -i http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer vk_demo" -H "Content-Type: application/json" \
  -d '{"model":"demo","messages":[{"role":"user","content":"hello"}]}'
```

**PASS criteria:**
- `200` + body is an OpenAI `chat.completion` (the mock model's canned reply).
- Headers include `x-aog-route`, `x-aog-classification`, `x-aog-policy-mode: shadow`,
  `x-aog-policy: allow`, `x-aog-policy-blocked: false`.
- `curl -s http://localhost:8080/v1/status` → `"mode":"shadow"`, providers/models present.
- `curl -s http://localhost:8080/v1/usage -H "Authorization: Bearer vk_demo"` → aggregates + `chain_verified: true`.
- Unknown key → `401`.
- Console loads at `http://localhost:8088`; log in by pasting the demo token
  (`docker compose exec wsf-api cat /seed/demo-token.json`) + virtual key `vk_demo`.

## Container-specific gotchas to watch (in likelihood order)
1. **Base image tags** must pull: `rust:1-bookworm`, `node:22-bookworm-slim`,
   `nginx:1.27-alpine`, `python:3.12-slim`, `openbao/openbao:latest`,
   `postgres:17-alpine`, `minio/minio:latest`. If `rust:1-bookworm` is missing, pin a
   concrete `rust:1.9x-bookworm` (workspace MSRV is 1.88 + uses let-chains).
2. **Seed `/seed` volume perms:** `seed` runs `user: "0:0"` and writes
   `/seed/appliance.env` (0644); `wsf-api`/`aog-gateway` mount `/seed:ro` as uid 10001 and
   **source it via `sh -c 'set -a && . /seed/appliance.env && exec …'`**. If a service
   exits complaining about a missing env var, the seed file didn't land / wasn't sourced.
3. **Ordering:** services `depends_on: seed (service_completed_successfully)` and seed
   `depends_on: openbao (service_healthy)` (healthcheck = `bao status`). If seed loops/fails,
   check OpenBao came up in dev mode (`server -dev -dev-root-token-id=root`).
4. **Service DNS + addr:** the seed writes `WSF_OPENBAO_ADDR=http://openbao:8200` into the
   env file (from its own compose env), so services reach OpenBao by service name. The
   gateway's local provider = `http://mock-llm:8000` (the mock binds 8000).
5. **nginx same-origin proxy:** the console fetches `/api/wsf` + `/api/aog`; nginx
   proxies to `wsf-api:8300` / `aog-gateway:8080`. If the console can't reach the APIs,
   inspect `deployment/appliance/nginx.conf`.

If the debug binaries are handy, you can re-confirm the core fast without the 30-min
build (see last session's method in the DEVLOG D1a note): a dev-OpenBao container +
`target/debug/wsf-seed.exe` + the two `serve` binaries + the `mock-llm/app.py`.

## On PASS
- Append a `### D1 live gate — PASSED` note to `docs/sessions/SOVEREIGNTY-DEVLOG.md`
  (record the 200 + headers + any fixes), and commit (`SOV-D1b` or similar) with the CANON footer.
- If you changed compose/Dockerfiles/binaries to make it pass, that's the commit content.
- `docker compose down -v` to tear down when done.

## Task 2 — D2 shadow gate (after D1 passes)
```bash
cd "…/mai-worktrees/mai-SOV-1/deployment/shadow"
echo "OPENAI_API_KEY=sk-...your key..." > .env      # or a real key from Basho
docker compose up --build -d
# point traffic at the gateway; the prospect uses gpt-4o-mini/gpt-4o → their OpenAI, shadow-governed
curl -s -i http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer vk_demo" -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"hello"}]}'
```
**PASS:** a real OpenAI response comes back, nothing is blocked (shadow), and the console
shows cost/risk. If no OpenAI key is available, verify config + startup and note the live
key run as owner-gated. DEVLOG + commit.

## Rules
- **Do not push.** M1's older commits predate CANON's footer; before any eventual push
  they need grandfathering in `.github/workflows/commit-msg-check.yml` `legacy_skip` or a
  squash — that's Basho's call.
- Worktree hygiene: stage files individually, `git diff --cached --stat` before commit,
  the `.integrity/hooks/pre-commit` runs automatically.
- When both gates pass, **M1 "sovereign shadow" is shippable**; next milestone is **M2**
  (G8 egress tokenization, G9 budget kill-switch, T1–T8 tool governance, C5–C7, D3–D5).
