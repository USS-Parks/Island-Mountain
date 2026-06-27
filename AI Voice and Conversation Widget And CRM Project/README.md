# AI Voice & Conversation Widget + CRM Project

All files for the Island Mountain AI conversational/voice funnel + self-owned
CRM live here. This is the canonical project folder
(`C:\Users\17076\Documents\Claude\Island Mountain\AI Voice and Conversation Widget And CRM Project`).

## Contents

| File / Dir | Purpose |
|---|---|
| `P-SPR-AI-Conversational-Funnel.md` | The canonical plan (Plan - Sequential Prompt Roster). **DRAFT — awaiting approval.** |
| `DEVLOG.md` | Per-prompt work log (created once STS execution begins). |
| `worker/` | Cloudflare Worker backend (created in PROMPT 01). Holds API keys via Wrangler secrets — never in files. |
| `widget/` | Chat widget source, if kept separate from the site's `js/`. |

## Notes

- **Secrets never live in this folder as files.** API keys go into Cloudflare
  Worker secrets (`wrangler secret put`). `.dev.vars`, `.env*`, `node_modules/`,
  and `.wrangler/` under this folder are gitignored.
- This folder is **tracked on the feature branch** (`claude/customer-form-ai-bot-x1cpi9`)
  so files sync back from the remote session. It is **not** published — GitHub
  Pages serves only `main`. Decide what stays internal before any merge to `main`.
