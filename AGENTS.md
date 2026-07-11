# Agent Rules — Super Agent Liquidity & Risk Intelligence Platform

## Project context
See `docs/ai-guidelines/project_skill.md` (local only, gitignored) for full design/business rules. Do not ask for it to be re-explained — it's the source of truth for fusion logic, role visibility, tiered response, and language rules.

## Non-negotiable constraints
- No customer-facing login/role. Ever.
- No binary "send cash / pause cash" logic. Always the 3-tier fail-open model: Continue Normal / Continue + Shadow Review / Continue Staged + Fast Review. Every anomaly path must still deliver some replenishment.
- Provider boundary enforcement (bKash Ops never sees Nagad data, etc.) must be enforced server-side, not just hidden in the UI.
- Never use the words "fraud," "flagged," "suspicious," or "blocked" in any agent-facing (public) string. Use "routine review," "additional balance is on the way," "restocking."
- Risk Analyst role may only "mark reviewed" — never a final fraud determination, anywhere in code, comments, or UI copy.
- Management role is view-only, aggregates only. No case-action buttons should ever be reachable from that role's routes.

## Stack rules
- Next.js 16 App Router, TypeScript strict mode. No Pages Router.
- Server Components for initial data fetch. `"use client"` only at interactive leaves.
- All backend calls go through `lib/api/*` — never `fetch()` directly inside a component. Every response validated with zod at that boundary.
- Tailwind v4 `@theme` tokens only — no ad hoc hex values in component files.
- Mobile-view suppoeted highly recomended
## Commit rules
- Every commit message must end with a short, cleaned-up **paraphrase** of what was asked — not the raw prompt verbatim. Rewrite it as a clear, professional one-liner even if the original request was casual, multi-topic, or messy. Example:
  ```
  feat: add role-scoped alert routing

  Prompt summary: add server-side filtering so each role only queries its own data scope.
  ```
   Never paste the actual prompt text. Never include placeholder text like "[AI-assisted]" without the summary — the summary is the point, not a disclaimer.
- When a design is based on a Lovable source, state that inspiration in the cleaned-up prompt summary and name the product capability delivered. Example: `Prompt summary: create a Lovable-inspired liquidity operations frontend with validated backend integration.`
- Keep commits scoped — one logical change per commit, since SonarQube analyzes per-commit. Avoid single giant commits mixing unrelated files; it makes SonarQube issue attribution useless.
- Run lint (`npm run lint`) before committing. Fix or explicitly justify any new SonarQube issue introduced, don't silently suppress.
- SonarQube results are meant to be visible to judges as evidence of code-quality practice — do not exclude `.scannerwork/` reports or SonarCloud badges/links from what's shown in the README or PR descriptions. (Local scan cache files themselves are still gitignored — see below — that's just avoiding repo bloat, not hiding results. The dashboard/report link stays public.)

## What NOT to commit
- Any file under `docs/ai-guidelines/` (skill/prompt docs) — local context only.
- `.env*.local` (OpenAI key, DB URL, backend URL).
- Anything under `node_modules/`, `.next/`.
