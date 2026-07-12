import { z } from 'zod';
import {
  mockAlerts,
  mockAuditTrail,
  mockCases,
  type CaseStatus,
  type MockAlert,
  type MockCase,
} from './mockData';
import type { Language } from '../i18n';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000/api/v1';

export type DataSource = 'backend-api' | 'mock-fallback';

export interface ApiResult<T> {
  data: T;
  source: DataSource;
}

const providerIdSchema = z.enum(['BKASH', 'NAGAD', 'ROCKET']);
const caseStatusSchema = z.enum(['OPEN', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_REVIEW', 'ESCALATED', 'RESOLVED', 'CLOSED']);
const routingRoleSchema = z.enum(['AGENT', 'FIELD_OFFICER', 'PROVIDER_OPERATIONS', 'RISK_REVIEWER']);
const explanationAudienceSchema = z.enum(['AGENT', 'FIELD_OFFICER', 'PROVIDER_OPERATIONS', 'RISK_REVIEWER', 'MANAGEMENT']);

const incidentSchema = z.object({
  incident_id: z.string(),
  agent_id: z.string(),
  area: z.string(),
  provider_scope: z.array(providerIdSchema),
  priority: z.enum(['P1', 'P2', 'P3', 'P4']),
  title: z.string(),
  summary: z.string(),
  confidence: z.number(),
  receiver_role: routingRoleSchema,
  responsible_stakeholder: routingRoleSchema,
  recommended_next_step: z.string(),
  evidence: z.array(z.object({ message: z.string() }).passthrough()),
  uncertainty: z.array(z.string()),
  updated_at: z.string(),
});

const principalSchema = z.object({
  display_name: z.string(),
  role: routingRoleSchema,
});

const caseAuditSchema = z.object({
  audit_id: z.string(),
  case_id: z.string(),
  action: z.string(),
  actor: principalSchema.nullable(),
  note: z.string().nullable(),
  occurred_at: z.string(),
});

const coordinationCaseSchema = z.object({
  case_id: z.string(),
  incident_id: z.string(),
  agent_id: z.string(),
  area: z.string(),
  provider_scope: z.array(providerIdSchema),
  priority: z.enum(['P1', 'P2', 'P3', 'P4']),
  status: caseStatusSchema,
  receiver_role: routingRoleSchema,
  responsible_stakeholder: routingRoleSchema,
  case_owner: principalSchema.nullable(),
  escalation_target_role: routingRoleSchema.nullable(),
  resolution: z.object({ summary: z.string() }).nullable(),
  recommended_next_step: z.string(),
  human_review_required: z.boolean(),
  safe_fallback_active: z.boolean(),
  safe_fallback_reason: z.string().nullable(),
  notes: z.array(z.object({ body: z.string(), created_at: z.string() })),
  history: z.array(caseAuditSchema),
  created_at: z.string(),
  updated_at: z.string(),
});

const groundedExplanationSchema = z.object({
  incident_id: z.string(),
  language: z.enum(['en', 'bn', 'banglish']),
  audience: explanationAudienceSchema,
  generated_by: z.enum(['OPENAI', 'TEMPLATE_FALLBACK']),
  headline: z.string(),
  situation: z.string(),
  evidence: z.array(z.string()),
  uncertainty: z.string(),
  safe_next_step: z.string(),
  provider_boundary_notice: z.string(),
  full_text: z.string(),
  grounded: z.boolean(),
  safety_validated: z.boolean(),
  provider_data_redacted: z.boolean(),
  latency_ms: z.number(),
}).passthrough();

type CoordinationCase = z.infer<typeof coordinationCaseSchema>;
type RoutingRole = z.infer<typeof routingRoleSchema>;
type GroundedExplanation = z.infer<typeof groundedExplanationSchema>;

async function apiJson<T>(path: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: 'no-store',
      ...init,
      headers: init?.body ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers,
    });
    if (!response.ok) return null;
    return schema.parse(await response.json());
  } catch {
    return null;
  }
}

function displayRole(role: string): MockCase['owner'] {
  const roles: Record<string, MockCase['owner']> = {
    AGENT: 'Agent',
    FIELD_OFFICER: 'Field Officer',
    PROVIDER_OPERATIONS: 'Provider Operations',
    RISK_REVIEWER: 'Risk Reviewer',
  };
  return roles[role] ?? 'Risk Reviewer';
}

function roleToAudience(role: RoutingRole | null | undefined): z.infer<typeof explanationAudienceSchema> {
  return role ?? 'FIELD_OFFICER';
}

function displayStatus(status: z.infer<typeof caseStatusSchema>): CaseStatus {
  const statuses: Record<z.infer<typeof caseStatusSchema>, CaseStatus> = {
    OPEN: 'New',
    ACKNOWLEDGED: 'Acknowledged',
    ASSIGNED: 'Assigned',
    IN_REVIEW: 'Under Review',
    ESCALATED: 'Escalated',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
  };
  return statuses[status];
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('en-BD', { hour: 'numeric', minute: '2-digit' });
}

function mapCase(caseItem: CoordinationCase, explanation?: GroundedExplanation | null): MockCase {
  const provider = caseItem.provider_scope[0] ?? 'SHARED';
  const history = caseItem.history.map((entry) => ({
    timestamp: formatTime(entry.occurred_at),
    actor: entry.actor?.display_name ?? 'System',
    action: entry.note ?? entry.action.replaceAll('_', ' ').toLowerCase(),
  }));
  const latestNote = caseItem.notes.at(-1)?.body ?? 'No additional case note has been recorded.';

  return {
    id: caseItem.case_id,
    alertId: caseItem.incident_id,
    provider,
    outlet: `${caseItem.agent_id} operational position`,
    area: caseItem.area,
    severity: caseItem.priority === 'P1' ? 'critical' : caseItem.priority === 'P2' ? 'high' : caseItem.priority === 'P3' ? 'medium' : 'low',
    owner: displayRole(caseItem.case_owner?.role ?? caseItem.responsible_stakeholder),
    assignedTo: caseItem.case_owner?.display_name ?? displayRole(caseItem.responsible_stakeholder),
    receiver: displayRole(caseItem.receiver_role),
    nextStep: explanation?.safe_next_step ?? caseItem.recommended_next_step,
    ackStatus: displayStatus(caseItem.status),
    escalationLevel: caseItem.status === 'ESCALATED' ? 3 : caseItem.status === 'IN_REVIEW' ? 2 : 1,
    resolutionStatus: caseItem.resolution?.summary ?? (caseItem.safe_fallback_active ? caseItem.safe_fallback_reason ?? 'Safe fallback is active.' : 'Human review pending'),
    timestamp: formatTime(caseItem.updated_at),
    notes: explanation?.situation ?? latestNote,
    evidence: explanation?.evidence ?? [
      caseItem.human_review_required ? 'Human review is required.' : 'Human review is recorded.',
      caseItem.safe_fallback_active ? caseItem.safe_fallback_reason ?? 'Safe fallback is active.' : 'No safe fallback is active.',
    ],
    confidence: caseItem.safe_fallback_active ? 0.5 : 0.8,
    history,
  };
}

function mapIncident(incident: z.infer<typeof incidentSchema>, explanation?: GroundedExplanation | null): MockAlert {
  const provider = incident.provider_scope[0]?.toLowerCase() as MockAlert['provider'] | undefined;
  return {
    id: incident.incident_id,
    title: explanation?.headline ?? incident.title,
    messageBn: explanation?.language === 'bn' ? explanation.situation : 'এই সিমুলেটেড পরিস্থিতি মানব পর্যালোচনা প্রয়োজন। প্রমাণ ও অনিশ্চয়তা যাচাই করে পরবর্তী পদক্ষেপ নিন।',
    messageEn: explanation?.language === 'en' ? explanation.situation : incident.summary,
    evidence: explanation?.evidence ?? incident.evidence.map((item) => item.message),
    uncertainty: explanation?.uncertainty ?? incident.uncertainty.join(' '),
    nextStep: explanation?.safe_next_step ?? incident.recommended_next_step,
    owner: displayRole(incident.responsible_stakeholder),
    confidence: incident.confidence,
    severity: incident.priority === 'P1' ? 'critical' : incident.priority === 'P2' ? 'high' : incident.priority === 'P3' ? 'medium' : 'low',
    provider: provider ?? 'shared',
    agentId: incident.agent_id,
    agentName: incident.agent_id,
    timestamp: formatTime(incident.updated_at),
    dataStatus: 'fresh',
  };
}

const operator = { actor_id: 'ui-operator', display_name: 'MFSA Operator', role: 'RISK_REVIEWER' } as const;

async function getIncidentExplanation(
  incident: z.infer<typeof incidentSchema>,
  language: Language,
): Promise<GroundedExplanation | null> {
  return apiJson(`/explanations/incidents/${incident.incident_id}`, groundedExplanationSchema, {
    method: 'POST',
    body: JSON.stringify({
      language,
      audience: roleToAudience(incident.responsible_stakeholder),
      prefer_ai: true,
    }),
  });
}

async function getCaseExplanation(
  caseItem: CoordinationCase,
  language: Language,
): Promise<GroundedExplanation | null> {
  return apiJson(`/explanations/cases/${caseItem.case_id}`, groundedExplanationSchema, {
    method: 'POST',
    body: JSON.stringify({
      language,
      audience: roleToAudience(caseItem.case_owner?.role ?? caseItem.responsible_stakeholder),
      prefer_ai: true,
    }),
  });
}

export async function getAlerts(language: Language = 'en'): Promise<ApiResult<MockAlert[]>> {
  const incidents = await apiJson('/incidents/active', z.array(incidentSchema));
  if (incidents) {
    const explanations = await Promise.all(incidents.map((incident) => getIncidentExplanation(incident, language)));
    return {
      data: incidents.map((incident, index) => mapIncident(incident, explanations[index])),
      source: 'backend-api',
    };
  }
  return { data: mockAlerts, source: 'mock-fallback' };
}

export async function getCases(language: Language = 'en', includeExplanations = true): Promise<ApiResult<MockCase[]>> {
  const cases = await apiJson('/cases/queue', z.array(coordinationCaseSchema));
  if (cases) {
    const explanations = includeExplanations
      ? await Promise.all(cases.map((caseItem) => getCaseExplanation(caseItem, language)))
      : [];
    return {
      data: cases.map((caseItem, index) => mapCase(caseItem, explanations[index])),
      source: 'backend-api',
    };
  }
  return { data: mockCases, source: 'mock-fallback' };
}

export async function updateCaseStatus(caseItem: MockCase, status: CaseStatus): Promise<ApiResult<MockCase>> {
  const request = status === 'Under Review'
    ? { path: `/${caseItem.id}/start-review`, body: { actor: operator, note: 'Review started from the operational dashboard.' } }
    : status === 'Escalated'
      ? { path: `/${caseItem.id}/escalate`, body: { actor: operator, target_role: 'PROVIDER_OPERATIONS', reason: 'Additional provider operations review requested.' } }
      : status === 'Resolved'
        ? { path: `/${caseItem.id}/resolve`, body: { actor: operator, resolution_code: 'OTHER', summary: 'Resolution documented by the operational dashboard.' } }
        : null;

  if (request) {
    const remote = await apiJson(`/cases${request.path}`, coordinationCaseSchema, { method: 'POST', body: JSON.stringify(request.body) });
    if (remote) return { data: mapCase(remote), source: 'backend-api' };
  }

  const updated: MockCase = {
    ...caseItem,
    ackStatus: status,
    escalationLevel: status === 'Escalated' ? Math.max(3, caseItem.escalationLevel) : caseItem.escalationLevel,
    resolutionStatus: status === 'Resolved' ? 'Issue reviewed and resolution documented' : caseItem.resolutionStatus,
    history: [...caseItem.history, { timestamp: 'Scenario time', actor: 'Demo Operator', action: `Case marked ${status}.` }],
  };
  return { data: updated, source: 'mock-fallback' };
}

export function saveDemoCases(_cases: MockCase[]): void {
  // Demo-only persistence is deliberately removed when the backend is unavailable.
  void _cases;
}

export async function getAuditTrail(): Promise<ApiResult<typeof mockAuditTrail>> {
  const cases = await apiJson('/cases/queue', z.array(coordinationCaseSchema));
  if (!cases) return { data: mockAuditTrail, source: 'mock-fallback' };

  return {
    data: cases.flatMap((caseItem) => caseItem.history.map((entry) => ({
      id: entry.audit_id,
      caseId: entry.case_id,
      provider: caseItem.provider_scope[0] ?? 'SHARED',
      timestamp: formatTime(entry.occurred_at),
      actor: entry.actor?.display_name ?? 'System',
      action: entry.note ?? entry.action.replaceAll('_', ' ').toLowerCase(),
    }))),
    source: 'backend-api',
  };
}
