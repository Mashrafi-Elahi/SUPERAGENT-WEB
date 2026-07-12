# MFSA Code Defense Guide

Use this file as the technical map during judging. Start from the product flow, then open the referenced code if a judge asks how it works.

## 30-second architecture answer

"The Next.js frontend is a role-scoped decision-support interface. It calls a FastAPI backend that replays synthetic provider events through a shared-cash/provider-ledger engine, feed-health checks, liquidity forecasting, anomaly assessment, incident fusion, and a human case state machine. Provider data stays separate, and every risk output includes evidence, uncertainty, confidence, and a safe next step."

## Frontend map

| Question | File |
|---|---|
| Main operational dashboard | `app/page.tsx` |
| Profile selector and AG001-AG006 subsection | `app/components/layout/Sidebar.tsx` |
| Role definitions and query scope | `lib/viewerProfile.ts` |
| Balance, feed-health, liquidity and replay API mapping | `lib/api/dashboard.ts` |
| Incident, explanation, case and metrics APIs | `lib/api/operations.ts` |
| Explainable incident review | `app/alerts/page.tsx` |
| Human case state machine UI | `app/cases/page.tsx` |
| Validation metrics and audit trail | `app/audit/page.tsx` |
| Vercel-safe synthetic fallback | `lib/api/mockData.ts` |

## Role scoping

`lib/viewerProfile.ts` creates a scope that is attached to supported API requests:

```ts
export function viewerScopeQuery(scope?: ViewerScope): string {
  const params = new URLSearchParams();
  params.set('viewer_role', scope.viewerRole);
  if (scope.viewerAgentId) params.set('viewer_agent_id', scope.viewerAgentId);
  if (scope.viewerArea) params.set('viewer_area', scope.viewerArea);
  if (scope.viewerProviderId) params.set('viewer_provider_id', scope.viewerProviderId);
  return params.toString();
}
```

The six agent choices are generated rather than duplicated:

```ts
export const agentViewerProfiles = Array.from({ length: 6 }, (_, index) => {
  const agentId = `AG${String(index + 1).padStart(3, '0')}`;
  return { scope: { viewerRole: 'AGENT', viewerAgentId: agentId } };
});
```

What to say: "The selector is not cosmetic. AG003 sends `viewer_role=AGENT&viewer_agent_id=AG003`; Provider Operations sends its provider identity; Field Officer sends its area. The Vercel fallback applies the same logical filters for a stable demo."

## Shared cash versus provider e-money

`lib/api/dashboard.ts` maps the backend without combining balances:

```ts
return {
  physicalCash: agentBalance.shared_cash,
  providers: {
    bkash: buildProviderView(agentBalance, 'BKASH', ...),
    nagad: buildProviderView(agentBalance, 'NAGAD', ...),
    rocket: buildProviderView(agentBalance, 'ROCKET', ...),
  },
};
```

What to say: "Shared physical cash is one outlet resource. Each provider e-money position remains a distinct ledger and forecast. We combine context, not money or authority."

## Safe degraded-data behavior

Feed health is converted to a visible posture in `lib/api/dashboard.ts`:

```ts
if (hasConflicting || hasMissing) return 'Continue Staged + Fast Review';
if (hasStale) return 'Continue + Shadow Review';
return 'Continue Normal';
```

What to say: "Missing or conflicting data does not disappear. It lowers confidence, activates fallback guidance, and suppresses precise recommendations until a human verifies the position."

## Explainable unusual activity

`lib/api/operations.ts` requests grounded explanations with role and provider context:

```ts
body: JSON.stringify({
  language,
  audience: roleToAudience(scope?.viewerRole),
  viewer_provider_id: scope?.viewerProviderId ?? null,
  prefer_ai: true,
})
```

What to say: "AI wording is downstream of deterministic evidence. The backend validates grounding and safety; unavailable or unsafe AI output falls back to a deterministic template. We say unusual activity and requires review, never fraud."

## Case workflow correctness

`app/cases/page.tsx` exposes only transitions accepted by the backend:

```text
OPEN -> ACKNOWLEDGED -> ASSIGNED -> IN_REVIEW
IN_REVIEW -> ESCALATED or RESOLVED
ESCALATED -> ASSIGNED, IN_REVIEW, or RESOLVED
RESOLVED -> CLOSED
```

`lib/api/operations.ts` does not fake success:

```ts
return {
  data: caseItem,
  source: 'mock-fallback',
  error: 'The backend rejected this transition or is unavailable. No case state was changed.',
};
```

What to say: "Receiver, responsible stakeholder, individual owner, and escalation target are separate fields. A failed backend transition stays failed in the UI and never becomes optimistic fake state."

## Validation answer

Open `/audit` or the backend artifact `artifacts/validation/simulation_v2_report.json`.

- precision: 100%
- recall: 100%
- hard-negative false-positive rate: 0%
- feed-failure coverage: 100%
- shortage lead time: 121.05 minutes
- average processing latency: 3.271 ms
- P95 latency: 4.521 ms

What to say: "These numbers are deterministic synthetic scenario coverage, not production accuracy claims. The legitimate demand spike is a hard negative, and hidden labels are evaluator-only."

## Vercel behavior

The deployed frontend uses `NEXT_PUBLIC_API_BASE_URL` when configured. Without a public backend URL, browsers cannot reach the Windows-only `127.0.0.1:8000`, so the interface clearly labels and uses scoped synthetic fallback data.

To connect a public backend, set this Vercel environment variable and redeploy:

```text
NEXT_PUBLIC_API_BASE_URL=https://YOUR-BACKEND/api/v1
```

The backend must also allow `https://superagent-web-virid.vercel.app` in `CORS_ORIGINS`.

## Honest limitations

- The profile selector demonstrates authorization scope; it is not authentication.
- Live replay and cases are process-local in the prototype.
- Case actors are client-supplied in the current backend.
- Synthetic tests establish engineering behavior, not real-world field performance.
- Production requires authenticated tenancy, durable workflow storage, approved provider connectors, monitoring, and governance.
