import { z } from 'zod';
import { mockAgents, type MockAgent, type ProviderKey as MockProviderKey } from './mockData';
import { withViewerScope, type ViewerScope } from '../viewerProfile';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000/api/v1';

const providerIds = ['BKASH', 'NAGAD', 'ROCKET'] as const;
const providerKeys = ['bkash', 'nagad', 'rocket'] as const;

const providerIdSchema = z.enum(providerIds);
const providerKeySchema = z.enum(providerKeys);
const feedStatusSchema = z.enum(['HEALTHY', 'STALE', 'MISSING', 'CONFLICTING']);

const decimalSchema = z.coerce.number();

const providerBalanceSchema = z.object({
  provider_id: providerIdSchema,
  balance: decimalSchema,
  is_negative: z.boolean(),
});

const agentBalanceSchema = z.object({
  agent_id: z.string(),
  shared_cash: decimalSchema,
  provider_balances: z.array(providerBalanceSchema),
  total_provider_emoney: decimalSchema,
  total_operational_value: decimalSchema,
  processed_transactions: z.number(),
  ignored_failed_transactions: z.number(),
  last_updated_at: z.string(),
  warnings: z.array(z.string()),
});

const feedHealthSchema = z.object({
  agent_id: z.string(),
  provider_id: providerIdSchema,
  status: feedStatusSchema,
  confidence: z.number(),
  last_signal_at: z.string(),
  last_event_at: z.string(),
  reported_balance: decimalSchema.nullable().optional(),
  calculated_balance: decimalSchema.nullable().optional(),
  balance_difference: decimalSchema.nullable().optional(),
  reasons: z.array(z.string()),
  safe_fallback: z.string(),
  can_issue_strong_recommendation: z.boolean(),
});

const dataQualitySummarySchema = z.object({
  total_feeds: z.number(),
  healthy: z.number(),
  stale: z.number(),
  missing: z.number(),
  conflicting: z.number(),
  average_confidence: z.number(),
  fallback_required: z.boolean(),
  feeds: z.array(feedHealthSchema),
});

const liquidityResourceSchema = z.object({
  provider_id: providerIdSchema.nullable(),
  status: z.enum(['SAFE', 'WATCH', 'CRITICAL', 'DEPLETED', 'INSUFFICIENT_DATA']),
  current_balance: decimalSchema,
  net_depletion_per_minute: decimalSchema,
  minutes_to_safety_threshold: z.number().nullable(),
  safety_threshold_at: z.string().nullable(),
  confidence: z.number(),
  recommendation: z.string(),
});

const agentLiquiditySchema = z.object({
  agent_id: z.string(),
  overall_status: z.enum(['SAFE', 'WATCH', 'CRITICAL', 'DEPLETED', 'INSUFFICIENT_DATA']),
  shared_cash: liquidityResourceSchema,
  provider_forecasts: z.array(liquidityResourceSchema),
});

const liquiditySummarySchema = z.object({
  agents: z.array(agentLiquiditySchema),
});

const healthSchema = z.object({
  status: z.enum(['healthy', 'degraded']),
  service: z.string(),
  version: z.string(),
  environment: z.string(),
  database: z.enum(['connected', 'unavailable']),
  timestamp: z.string(),
});

const replayEventSchema = z.object({
  event_id: z.string(),
  event_type: z.enum(['TRANSACTION', 'FEED_EVENT']),
  timestamp: z.string(),
  agent_id: z.string(),
  provider_id: providerIdSchema,
  applied: z.boolean(),
  action: z.string(),
  details: z.string(),
});

const replayStatusSchema = z.object({
  status: z.enum(['READY', 'RUNNING', 'PAUSED', 'COMPLETED']),
  simulation_start: z.string(),
  simulation_end: z.string(),
  simulation_time: z.string(),
  total_events: z.number(),
  processed_events: z.number(),
  remaining_events: z.number(),
  processed_transactions: z.number(),
  processed_feed_events: z.number(),
  completion_percentage: z.number(),
  next_event_id: z.string().nullable().optional(),
  next_event_time: z.string().nullable().optional(),
  last_event: replayEventSchema.nullable().optional(),
});

const replayBatchSchema = z.object({
  state: replayStatusSchema,
  events: z.array(replayEventSchema),
});

const backendStatusSchema = z.object({
  health: healthSchema.nullable(),
  replay: replayStatusSchema.nullable(),
  recentEvents: z.array(replayEventSchema),
});

const providerBalanceViewSchema = z.object({
  provider: providerKeySchema,
  balance: z.number().nullable(),
  dataQuality: z.enum(['fresh', 'stale', 'missing', 'conflicting']),
  lastUpdated: z.string(),
});

const agentSchema = z.object({
  id: z.string(),
  name: z.string(),
  area: z.string(),
  physicalCash: z.number(),
  providers: z.object({
    bkash: providerBalanceViewSchema,
    nagad: providerBalanceViewSchema,
    rocket: providerBalanceViewSchema,
  }),
  alerts: z.number(),
  status: z.string(),
});

const summarySchema = z.object({
  totalAgents: z.number(),
  activeAlerts: z.number(),
  criticalCases: z.number(),
  avgConfidence: z.number(),
  staleFeeds: z.number(),
  missingFeeds: z.number(),
  conflictingFeeds: z.number(),
  fallbackRequired: z.boolean(),
});

export const dashboardSummaryResponseSchema = summarySchema;
export const agentsResponseSchema = z.array(agentSchema);

export type DashboardSummary = z.infer<typeof summarySchema>;
export type DashboardAgent = MockAgent;

type ProviderId = (typeof providerIds)[number];
type ProviderKey = (typeof providerKeys)[number];
type FeedStatus = z.infer<typeof feedStatusSchema>;
type AgentBalance = z.infer<typeof agentBalanceSchema>;
type FeedHealth = z.infer<typeof feedHealthSchema>;
type DataQualitySummary = z.infer<typeof dataQualitySummarySchema>;
type LiquiditySummary = z.infer<typeof liquiditySummarySchema>;
type LiquidityResource = z.infer<typeof liquidityResourceSchema>;
type ReplayBatch = z.infer<typeof replayBatchSchema>;

export type BackendStatus = z.infer<typeof backendStatusSchema>;
export type ReplayEvent = z.infer<typeof replayEventSchema>;

const providerIdToKey: Record<ProviderId, ProviderKey> = {
  BKASH: 'bkash',
  NAGAD: 'nagad',
  ROCKET: 'rocket',
};

const feedStatusToQuality: Record<FeedStatus, DashboardAgent['providers']['bkash']['dataQuality']> = {
  HEALTHY: 'fresh',
  STALE: 'stale',
  MISSING: 'missing',
  CONFLICTING: 'conflicting',
};

const agentDirectory: Record<string, { name: string; area: string }> = {
  AG001: { name: 'Zindabazar Digital Point', area: 'Zindabazar' },
  AG002: { name: 'Amberkhana Agent Corner', area: 'Amberkhana' },
  AG003: { name: 'Mirabazar Mobile Banking', area: 'Mirabazar' },
  AG004: { name: 'Zindabazar Express', area: 'Zindabazar' },
  AG005: { name: 'Subidbazar Finance Point', area: 'Subidbazar' },
  AG006: { name: 'Bondor Bazar Agent', area: 'Bondor Bazar' },
};

async function readJson<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: 'no-store',
      headers: init?.body ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers,
      ...init,
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return schema.parse(data);
  } catch {
    return null;
  }
}

async function getBalances(scope?: ViewerScope): Promise<AgentBalance[]> {
  return (await readJson(withViewerScope('/balances', scope), z.array(agentBalanceSchema))) ?? [];
}

async function getDataQualitySummary(scope?: ViewerScope): Promise<DataQualitySummary | null> {
  return readJson(withViewerScope('/data-quality', scope), dataQualitySummarySchema);
}

async function getLiquiditySummary(scope?: ViewerScope): Promise<LiquiditySummary | null> {
  return readJson(withViewerScope('/liquidity', scope), liquiditySummarySchema);
}

async function getReplayStatus() {
  return readJson('/replay/status', replayStatusSchema);
}

async function getHealth() {
  return readJson('/health', healthSchema);
}

async function getRecentEvents(): Promise<ReplayEvent[]> {
  return (await readJson('/replay/recent-events?limit=6', z.array(replayEventSchema))) ?? [];
}

function healthForAgent(feeds: FeedHealth[], agentId: string) {
  return new Map(
    feeds
      .filter((feed) => feed.agent_id === agentId)
      .map((feed) => [feed.provider_id, feed]),
  );
}

function buildProviderView(
  agentBalance: AgentBalance,
  providerId: ProviderId,
  feedHealth: FeedHealth | undefined,
  forecast: LiquidityResource | undefined,
): DashboardAgent['providers'][MockProviderKey] {
  const providerBalance = agentBalance.provider_balances.find((balance) => balance.provider_id === providerId);
  const quality = feedHealth ? feedStatusToQuality[feedHealth.status] : 'missing';

  return {
    provider: providerIdToKey[providerId],
    balance: providerBalance?.balance ?? null,
    dataQuality: quality,
    lastUpdated: feedHealth?.last_signal_at ?? agentBalance.last_updated_at,
    demandRate: Math.abs(forecast?.net_depletion_per_minute ?? 0),
    capacityMinutes: forecast?.minutes_to_safety_threshold ?? null,
    projectedShortageTime: forecast?.safety_threshold_at ?? null,
    confidence: forecast?.confidence ?? feedHealth?.confidence ?? 0,
    safeFallback: forecast?.recommendation ?? feedHealth?.safe_fallback ?? 'No forecast is available for this provider.',
  };
}

function buildAgentStatus(feeds: FeedHealth[]): DashboardAgent['status'] {
  const hasConflicting = feeds.some((feed) => feed.status === 'CONFLICTING');
  const hasMissing = feeds.some((feed) => feed.status === 'MISSING');
  const hasStale = feeds.some((feed) => feed.status === 'STALE');

  if (hasConflicting || hasMissing) {
    return 'Continue Staged + Fast Review';
  }

  if (hasStale) {
    return 'Continue + Shadow Review';
  }

  return 'Continue Normal';
}

function mapAgent(agentBalance: AgentBalance, feeds: FeedHealth[], liquidity: LiquiditySummary | null): DashboardAgent {
  const directoryEntry = agentDirectory[agentBalance.agent_id];
  const feedByProvider = healthForAgent(feeds, agentBalance.agent_id);
  const agentFeeds = feeds.filter((feed) => feed.agent_id === agentBalance.agent_id);
  const forecastByProvider = new Map(
    liquidity?.agents.find((agent) => agent.agent_id === agentBalance.agent_id)?.provider_forecasts
      .filter((forecast) => forecast.provider_id !== null)
      .map((forecast) => [forecast.provider_id!, forecast]) ?? [],
  );
  const liquidityForecast = liquidity?.agents.find((agent) => agent.agent_id === agentBalance.agent_id);

  return {
    id: agentBalance.agent_id,
    name: directoryEntry?.name ?? agentBalance.agent_id,
    area: directoryEntry?.area ?? 'Unknown area',
    physicalCash: agentBalance.shared_cash,
    providers: {
      bkash: buildProviderView(agentBalance, 'BKASH', feedByProvider.get('BKASH'), forecastByProvider.get('BKASH')),
      nagad: buildProviderView(agentBalance, 'NAGAD', feedByProvider.get('NAGAD'), forecastByProvider.get('NAGAD')),
      rocket: buildProviderView(agentBalance, 'ROCKET', feedByProvider.get('ROCKET'), forecastByProvider.get('ROCKET')),
    },
    alerts: agentFeeds.filter((feed) => feed.status !== 'HEALTHY').length + agentBalance.warnings.length,
    status: buildAgentStatus(agentFeeds),
    sharedCashForecast: liquidityForecast ? {
      status: liquidityForecast.shared_cash.status,
      capacityMinutes: liquidityForecast.shared_cash.minutes_to_safety_threshold,
      projectedShortageTime: liquidityForecast.shared_cash.safety_threshold_at,
      confidence: liquidityForecast.shared_cash.confidence,
      recommendation: liquidityForecast.shared_cash.recommendation,
    } : undefined,
  };
}

export async function getDashboardSummary(scope?: ViewerScope): Promise<DashboardSummary> {
  const [balances, dataQuality] = await Promise.all([
    getBalances(scope),
    getDataQualitySummary(scope),
  ]);

  const activeAlerts = dataQuality
    ? dataQuality.stale + dataQuality.missing + dataQuality.conflicting
    : balances.reduce((total, balance) => total + balance.warnings.length, 0);

  if (balances.length === 0) {
    return {
      totalAgents: mockAgents.length,
      activeAlerts: mockAgents.reduce((total, agent) => total + agent.alerts, 0),
      criticalCases: 2,
      avgConfidence: 72,
      staleFeeds: 0,
      missingFeeds: 0,
      conflictingFeeds: 0,
      fallbackRequired: false,
    };
  }

  return {
    totalAgents: balances.length,
    activeAlerts,
    criticalCases: dataQuality ? dataQuality.missing + dataQuality.conflicting : 0,
    avgConfidence: dataQuality ? Math.round(dataQuality.average_confidence * 100) : 0,
    staleFeeds: dataQuality?.stale ?? 0,
    missingFeeds: dataQuality?.missing ?? 0,
    conflictingFeeds: dataQuality?.conflicting ?? 0,
    fallbackRequired: dataQuality?.fallback_required ?? false,
  };
}

export async function getAgents(scope?: ViewerScope): Promise<DashboardAgent[]> {
  const [balances, dataQuality, liquidity] = await Promise.all([getBalances(scope), getDataQualitySummary(scope), getLiquiditySummary(scope)]);
  const feeds = dataQuality?.feeds ?? [];

  if (balances.length === 0) {
    return mockAgents;
  }

  return balances.map((balance) => mapAgent(balance, feeds, liquidity));
}

export async function getDashboardData(scope?: ViewerScope): Promise<{ agents: DashboardAgent[]; summary: DashboardSummary; source: 'backend-api' | 'mock-fallback' }> {
  const [balances, dataQuality, liquidity] = await Promise.all([getBalances(scope), getDataQualitySummary(scope), getLiquiditySummary(scope)]);
  if (balances.length === 0) {
    return {
      agents: mockAgents,
      summary: {
        totalAgents: mockAgents.length,
        activeAlerts: mockAgents.reduce((total, agent) => total + agent.alerts, 0),
        criticalCases: 2,
        avgConfidence: 72,
        staleFeeds: 0,
        missingFeeds: 0,
        conflictingFeeds: 0,
        fallbackRequired: false,
      },
      source: 'mock-fallback',
    };
  }

  const feeds = dataQuality?.feeds ?? [];
  return {
    agents: balances.map((balance) => mapAgent(balance, feeds, liquidity)),
    summary: {
      totalAgents: balances.length,
      activeAlerts: dataQuality ? dataQuality.stale + dataQuality.missing + dataQuality.conflicting : balances.reduce((total, balance) => total + balance.warnings.length, 0),
      criticalCases: dataQuality ? dataQuality.missing + dataQuality.conflicting : 0,
      avgConfidence: dataQuality ? Math.round(dataQuality.average_confidence * 100) : 0,
      staleFeeds: dataQuality?.stale ?? 0,
      missingFeeds: dataQuality?.missing ?? 0,
      conflictingFeeds: dataQuality?.conflicting ?? 0,
      fallbackRequired: dataQuality?.fallback_required ?? false,
    },
    source: 'backend-api',
  };
}

export async function getBackendStatus(): Promise<BackendStatus> {
  const [health, replay, recentEvents] = await Promise.all([
    getHealth(),
    getReplayStatus(),
    getRecentEvents(),
  ]);

  return backendStatusSchema.parse({
    health,
    replay,
    recentEvents,
  });
}

export async function stepReplay(eventCount = 10): Promise<ReplayBatch | null> {
  return readJson('/replay/step', replayBatchSchema, {
    method: 'POST',
    body: JSON.stringify({ event_count: eventCount }),
  });
}

export async function advanceReplay(minutes = 30): Promise<ReplayBatch | null> {
  return readJson('/replay/advance', replayBatchSchema, {
    method: 'POST',
    body: JSON.stringify({ minutes }),
  });
}

export async function resetReplay() {
  return readJson('/replay/reset', replayStatusSchema, {
    method: 'POST',
  });
}
