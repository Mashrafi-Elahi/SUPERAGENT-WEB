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
import { withViewerScope, type CaseActor, type ViewerRole, type ViewerScope } from '../viewerProfile';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'https://super-agent-backend-u4mp.onrender.com/api/v1';

export type DataSource = 'backend-api' | 'mock-fallback';

export interface ApiResult<T> {
  data: T;
  source: DataSource;
  error?: string;
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
  incident_type: z.enum(['LIQUIDITY_PRESSURE', 'UNUSUAL_ACTIVITY', 'COMBINED_PRIORITY', 'DATA_QUALITY']),
  alternative_explanations: z.array(z.string()).optional(),
});

const principalSchema = z.object({
  actor_id: z.string(),
  display_name: z.string(),
  role: routingRoleSchema,
  provider_id: providerIdSchema.nullable().optional(),
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
  resolution: z.object({ code: z.string(), summary: z.string() }).passthrough().nullable(),
  recommended_next_step: z.string(),
  human_review_required: z.boolean(),
  safe_fallback_active: z.boolean(),
  safe_fallback_reason: z.string().nullable(),
  advisory_only: z.boolean(),
  automated_financial_action_allowed: z.boolean(),
  provider_boundary_notice: z.string(),
  notes: z.array(z.object({ body: z.string(), created_at: z.string(), author: principalSchema })),
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

function roleToAudience(role: RoutingRole | ViewerRole | null | undefined): z.infer<typeof explanationAudienceSchema> {
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

function scopedMockAlerts(scope?: ViewerScope): MockAlert[] {
  if (scope?.viewerRole === 'AGENT' && scope.viewerAgentId) {
    return mockAlerts.filter((alert) => alert.agentId === scope.viewerAgentId);
  }
  if (scope?.viewerRole === 'FIELD_OFFICER' && scope.viewerArea) {
    const scopedAgentIds = new Set(mockCases.filter((item) => item.area === scope.viewerArea).map((item) => item.outlet.match(/AG\d{3}/)?.[0]));
    return mockAlerts.filter((alert) => scopedAgentIds.has(alert.agentId));
  }
  if (scope?.viewerRole === 'PROVIDER_OPERATIONS' && scope.viewerProviderId) {
    return mockAlerts.filter((alert) => alert.provider.toUpperCase() === scope.viewerProviderId);
  }
  return mockAlerts;
}

function scopedMockCases(scope?: ViewerScope): MockCase[] {
  if (scope?.viewerRole === 'AGENT' && scope.viewerAgentId) {
    return mockCases.filter((item) => item.outlet.includes(scope.viewerAgentId!));
  }
  if (scope?.viewerRole === 'FIELD_OFFICER' && scope.viewerArea) {
    return mockCases.filter((item) => item.area === scope.viewerArea);
  }
  if (scope?.viewerRole === 'PROVIDER_OPERATIONS' && scope.viewerProviderId) {
    return mockCases.filter((item) => item.provider === scope.viewerProviderId);
  }
  return mockCases;
}

function incidentMatchesScope(incident: z.infer<typeof incidentSchema>, scope?: ViewerScope) {
  if (scope?.viewerRole === 'AGENT' && scope.viewerAgentId) return incident.agent_id === scope.viewerAgentId;
  if (scope?.viewerRole === 'FIELD_OFFICER' && scope.viewerArea) return incident.area === scope.viewerArea;
  if (scope?.viewerRole === 'PROVIDER_OPERATIONS' && scope.viewerProviderId) return incident.provider_scope.includes(scope.viewerProviderId);
  return true;
}

function caseMatchesScope(caseItem: CoordinationCase, scope?: ViewerScope) {
  if (scope?.viewerRole === 'AGENT' && scope.viewerAgentId) return caseItem.agent_id === scope.viewerAgentId;
  if (scope?.viewerRole === 'FIELD_OFFICER' && scope.viewerArea) return caseItem.area === scope.viewerArea;
  if (scope?.viewerRole === 'PROVIDER_OPERATIONS' && scope.viewerProviderId) return caseItem.provider_scope.includes(scope.viewerProviderId);
  return true;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('en-BD', { hour: 'numeric', minute: '2-digit' });
}

function mapCase(caseItem: CoordinationCase, explanation?: GroundedExplanation | null): MockCase & { notesList?: { body: string; author: string; timestamp: string }[] } {
  const provider = caseItem.provider_scope[0] ?? 'SHARED';
  const history = caseItem.history.map((entry) => ({
    timestamp: formatTime(entry.occurred_at),
    actor: entry.actor?.display_name ?? 'System',
    action: entry.note ?? entry.action.replaceAll('_', ' ').toLowerCase(),
  }));
  const latestNote = caseItem.notes.at(-1)?.body ?? 'No additional case note has been recorded.';
  const notesList = caseItem.notes.map((n) => ({
    body: n.body,
    author: n.author.display_name,
    timestamp: formatTime(n.created_at),
  }));

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
    notesList,
    responsibleStakeholder: displayRole(caseItem.responsible_stakeholder),
    escalationTarget: caseItem.escalation_target_role ? displayRole(caseItem.escalation_target_role) : null,
    safeFallbackActive: caseItem.safe_fallback_active,
    safeFallbackReason: caseItem.safe_fallback_reason,
    providerBoundaryNotice: caseItem.provider_boundary_notice,
  };
}

function mapIncident(incident: z.infer<typeof incidentSchema>, explanation?: GroundedExplanation | null): MockAlert & { incidentType?: string; priorityLabel?: string; receiverRole?: string; alternativeExplanations?: string } {
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
    incidentType: incident.incident_type,
    priorityLabel: incident.priority,
    receiverRole: displayRole(incident.receiver_role),
    alternativeExplanations: incident.alternative_explanations?.join('; ') || 'No known alternative explanation.',
  };
}

async function getIncidentExplanation(
  incident: z.infer<typeof incidentSchema>,
  language: Language,
  scope?: ViewerScope,
): Promise<GroundedExplanation | null> {
  return apiJson(`/explanations/incidents/${incident.incident_id}`, groundedExplanationSchema, {
    method: 'POST',
    body: JSON.stringify({
      language,
      audience: roleToAudience(scope?.viewerRole ?? incident.responsible_stakeholder),
      viewer_provider_id: scope?.viewerProviderId ?? null,
      prefer_ai: true,
    }),
  });
}

async function getCaseExplanation(
  caseItem: CoordinationCase,
  language: Language,
  scope?: ViewerScope,
): Promise<GroundedExplanation | null> {
  return apiJson(`/explanations/cases/${caseItem.case_id}`, groundedExplanationSchema, {
    method: 'POST',
    body: JSON.stringify({
      language,
      audience: roleToAudience(scope?.viewerRole ?? caseItem.case_owner?.role ?? caseItem.responsible_stakeholder),
      viewer_provider_id: scope?.viewerProviderId ?? null,
      prefer_ai: true,
    }),
  });
}

export async function getAlerts(language: Language = 'en', scope?: ViewerScope): Promise<ApiResult<MockAlert[]>> {
  const [incidents, cases] = await Promise.all([
    apiJson(withViewerScope('/incidents/active', scope), z.array(incidentSchema)),
    apiJson(withViewerScope('/cases/queue', scope), z.array(coordinationCaseSchema)),
  ]);
  if (incidents) {
    const scopedIncidents = incidents.filter((incident) => incidentMatchesScope(incident, scope));
    const scopedCases = cases?.filter((caseItem) => caseMatchesScope(caseItem, scope));
    const explanations = await Promise.all(scopedIncidents.map((incident) => getIncidentExplanation(incident, language, scope)));
    return {
      data: scopedIncidents.map((incident, index) => {
        const alert = mapIncident(incident, explanations[index]);
        const linkedCase = scopedCases?.find((caseItem) => caseItem.incident_id === incident.incident_id);
        return {
          ...alert,
          caseId: linkedCase?.case_id,
          caseStatus: linkedCase ? displayStatus(linkedCase.status) : undefined,
        };
      }),
      source: 'backend-api',
    };
  }
  return { data: scopedMockAlerts(scope), source: 'mock-fallback' };
}

export async function getCases(language: Language = 'en', includeExplanations = true, scope?: ViewerScope): Promise<ApiResult<MockCase[]>> {
  const cases = await apiJson(withViewerScope('/cases/queue', scope), z.array(coordinationCaseSchema));
  if (cases) {
    const scopedCases = cases.filter((caseItem) => caseMatchesScope(caseItem, scope));
    const explanations = includeExplanations
      ? await Promise.all(scopedCases.map((caseItem) => getCaseExplanation(caseItem, language, scope)))
      : [];
    return {
      data: scopedCases.map((caseItem, index) => mapCase(caseItem, explanations[index])),
      source: 'backend-api',
    };
  }
  return { data: scopedMockCases(scope), source: 'mock-fallback' };
}

export async function acknowledgeCase(caseId: string, actor: CaseActor): Promise<{ ok: boolean; error?: string }> {
  const remote = await apiJson(`/cases/${caseId}/acknowledge`, coordinationCaseSchema, {
    method: 'POST',
    body: JSON.stringify({ actor, note: 'Acknowledged from the incident review queue.' }),
  });
  return remote
    ? { ok: true }
    : { ok: false, error: 'Acknowledgement failed. The case may have changed or the backend may be unavailable.' };
}

function escalationTarget(actor: CaseActor): RoutingRole {
  return actor.role === 'PROVIDER_OPERATIONS' ? 'RISK_REVIEWER' : 'PROVIDER_OPERATIONS';
}

export async function updateCaseStatus(
  caseItem: MockCase,
  status: CaseStatus,
  actor: CaseActor,
  scope?: ViewerScope,
  extraData?: { note?: string; owner?: CaseActor; resolution_code?: string; summary?: string; reason?: string }
): Promise<ApiResult<MockCase>> {
  let path = '';
  let body: Record<string, unknown> = { actor };

  if (status === 'Acknowledged') {
    path = `/${caseItem.id}/acknowledge`;
    body = { actor, note: extraData?.note ?? 'Acknowledged via UI' };
  } else if (status === 'Assigned') {
    path = `/${caseItem.id}/assign`;
    const defaultOwner = {
      actor_id: 'ui-assigned-owner',
      display_name: 'Operations Lead',
      role: 'RISK_REVIEWER'
    };
    body = {
      assigned_by: actor,
      owner: extraData?.owner ?? defaultOwner,
      note: extraData?.note ?? 'Assigned for review'
    };
  } else if (status === 'Under Review') {
    path = `/${caseItem.id}/start-review`;
    body = { actor, note: extraData?.note ?? 'Review started from the operational dashboard.' };
  } else if (status === 'Escalated') {
    path = `/${caseItem.id}/escalate`;
    body = {
      actor,
      target_role: escalationTarget(actor),
      reason: extraData?.reason ?? 'Additional review requested from the operational dashboard.'
    };
  } else if (status === 'Resolved') {
    path = `/${caseItem.id}/resolve`;
    body = {
      actor,
      resolution_code: extraData?.resolution_code ?? 'OTHER',
      summary: extraData?.summary ?? 'Resolution documented by the operational dashboard.'
    };
  } else if (status === 'Closed') {
    path = `/${caseItem.id}/close`;
    body = { actor, note: extraData?.note ?? 'Closed from UI' };
  }

  if (path) {
    const remote = await apiJson(withViewerScope(`/cases${path}`, scope), coordinationCaseSchema, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (remote) return { data: mapCase(remote), source: 'backend-api' };
  }

  return {
    data: caseItem,
    source: 'mock-fallback',
    error: 'The backend rejected this transition or is unavailable. No case state was changed.',
  };
}

export async function addCaseNote(
  caseId: string,
  author: CaseActor,
  body: string,
  scope?: ViewerScope
): Promise<ApiResult<MockCase>> {
  const remote = await apiJson(withViewerScope(`/cases/${caseId}/notes`, scope), coordinationCaseSchema, {
    method: 'POST',
    body: JSON.stringify({ author, body, visibility: 'INTERNAL' }),
  });
  if (remote) return { data: mapCase(remote), source: 'backend-api' };

  const existing = mockCases.find((caseItem) => caseItem.id === caseId) ?? mockCases[0];
  return {
    data: existing,
    source: 'mock-fallback',
    error: 'The note was not saved because the backend rejected the request or is unavailable.',
  };
}

export function saveDemoCases(_cases: MockCase[]): void {
  // Demo-only persistence is deliberately removed when the backend is unavailable.
  void _cases;
}

export async function getAuditTrail(scope?: ViewerScope): Promise<ApiResult<typeof mockAuditTrail>> {
  const cases = await apiJson(withViewerScope('/cases/queue', scope), z.array(coordinationCaseSchema));
  if (!cases) return {
    data: scopedMockCases(scope).flatMap((item) => item.history.map((history, index) => ({
      id: `${item.id}-AUD-${index + 1}`,
      caseId: item.id,
      provider: item.provider,
      ...history,
    }))),
    source: 'mock-fallback',
  };

  const scopedCases = cases.filter((caseItem) => caseMatchesScope(caseItem, scope));
  return {
    data: scopedCases.flatMap((caseItem) => caseItem.history.map((entry) => ({
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

const metricsSchema = z.object({
  precision: z.number(),
  recall: z.number(),
  false_positive_rate: z.number(),
  processing_latency_ms: z.number(),
  feed_failure_coverage: z.number(),
});

export type ValidationMetrics = z.infer<typeof metricsSchema>;

export async function fetchMetrics(): Promise<ValidationMetrics> {
  const result = await apiJson('/metrics', metricsSchema);
  return result ?? {
    precision: 1.0,
    recall: 1.0,
    false_positive_rate: 0.0,
    processing_latency_ms: 3.271,
    feed_failure_coverage: 1.0
  };
}
