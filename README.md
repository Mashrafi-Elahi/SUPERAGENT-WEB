# MFSA — MFS Super Agent

Liquidity & Risk Intelligence dashboard for the SUST Carnival 2026 Codex Community AI Hackathon.

MFSA is a responsible decision-support prototype for multi-provider mobile financial service agents. It combines shared physical-cash visibility with logically separate provider e-money balances, explainable liquidity forecasts, unusual-activity review, data-quality fallback and human-owned case coordination.

## Safety boundary

- Uses synthetic identifiers and simulated balances only.
- Never converts or transfers value between providers.
- Never executes a transaction, refill, reversal or account action.
- Statistical patterns require human review and are not final determinations.
- Low-quality, missing or conflicting provider data reduces confidence and suppresses strong guidance.

## Included routes

- `/` — operational overview and projections
- `/agents` — filterable outlet prioritization
- `/agents/[id]` — provider-separated position, forecast and cases
- `/alerts` — explainable review queue with evidence and uncertainty
- `/cases` — ownership, acknowledgement, escalation and resolution workflow
- `/audit` — traceable case-history events

## API-first with safe fallback

Set the backend URL in `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=https://super-agent-backend-u4mp.onrender.com/api/v1
```

The frontend keeps these backend contracts open:

- `GET /balances`
- `GET /data-quality`
- `GET /liquidity`
- `GET /anomalies`
- `GET /incidents/active`
- `GET /cases/queue`
- `POST /cases/{case_id}/start-review`
- `POST /cases/{case_id}/escalate`
- `POST /cases/{case_id}/resolve`
- `GET /health`
- `GET/POST /replay/*`

Responses are validated at the `lib/api/*` boundary. When the backend is unavailable, the interface falls back to the synthetic dataset in `lib/api/mockData.ts`. Case actions use the backend workflow endpoints when available; fallback mode remains read-only apart from the displayed demo state.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Production validation:

```bash
npm run lint
npm run build
```

## Visual system

- Pearl warm-white cards on a pale sage canvas
- Pearl pink and teal/light-green accent stripe
- Charcoal navigation
- Accessible day/night themes saved in `localStorage`
- Responsive desktop table and mobile outlet-card layouts
- Fixed scenario timestamps; no real-time clock or streaming claims

## Backend integration

The dashboard reads balances, feed quality and liquidity forecasts from the FastAPI service. Alerts, case queues, case workflow actions and audit entries are also backed by the service when it is running. The data-source badges identify when a route is using its synthetic fallback.
