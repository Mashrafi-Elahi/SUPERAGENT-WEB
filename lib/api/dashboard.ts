import { z } from 'zod';

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
});

export const dashboardSummaryResponseSchema = summarySchema;
export const agentsResponseSchema = z.array(agentSchema);

export type DashboardSummary = z.infer<typeof summarySchema>;
export type DashboardAgent = z.infer<typeof agentSchema>;

type ProviderId = (typeof providerIds)[number];
type ProviderKey = (typeof providerKeys)[number];
type FeedStatus = z.infer<typeof feedStatusSchema>;
type AgentBalance = z.infer<typeof agentBalanceSchema>;
type FeedHealth = z.infer<typeof feedHealthSchema>;
type DataQualitySummary = z.infer<typeof dataQualitySummarySchema>;

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

async function readJson<T>(path: string, schema: z.ZodType<T>): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { cache: 'no-store' });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return schema.parse(data);
  } catch {
    return null;
  }
}

async function getBalances(): Promise<AgentBalance[]> {
  return (await readJson('/balances', z.array(agentBalanceSchema))) ?? [];
}

async function getDataQualitySummary(): Promise<DataQualitySummary | null> {
  return readJson('/data-quality', dataQualitySummarySchema);
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
): DashboardAgent['providers'][ProviderKey] {
  const providerBalance = agentBalance.provider_balances.find((balance) => balance.provider_id === providerId);
  const quality = feedHealth ? feedStatusToQuality[feedHealth.status] : 'missing';

  return {
    provider: providerIdToKey[providerId],
    balance: providerBalance?.balance ?? null,
    dataQuality: quality,
    lastUpdated: feedHealth?.last_signal_at ?? agentBalance.last_updated_at,
  };
}

function buildAgentStatus(feeds: FeedHealth[]): string {
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

function mapAgent(agentBalance: AgentBalance, feeds: FeedHealth[]): DashboardAgent {
  const directoryEntry = agentDirectory[agentBalance.agent_id];
  const feedByProvider = healthForAgent(feeds, agentBalance.agent_id);
  const agentFeeds = feeds.filter((feed) => feed.agent_id === agentBalance.agent_id);

  return {
    id: agentBalance.agent_id,
    name: directoryEntry?.name ?? agentBalance.agent_id,
    area: directoryEntry?.area ?? 'Unknown area',
    physicalCash: agentBalance.shared_cash,
    providers: {
      bkash: buildProviderView(agentBalance, 'BKASH', feedByProvider.get('BKASH')),
      nagad: buildProviderView(agentBalance, 'NAGAD', feedByProvider.get('NAGAD')),
      rocket: buildProviderView(agentBalance, 'ROCKET', feedByProvider.get('ROCKET')),
    },
    alerts: agentFeeds.filter((feed) => feed.status !== 'HEALTHY').length + agentBalance.warnings.length,
    status: buildAgentStatus(agentFeeds),
  };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [balances, dataQuality] = await Promise.all([
    getBalances(),
    getDataQualitySummary(),
  ]);

  const activeAlerts = dataQuality
    ? dataQuality.stale + dataQuality.missing + dataQuality.conflicting
    : balances.reduce((total, balance) => total + balance.warnings.length, 0);

  return {
    totalAgents: balances.length,
    activeAlerts,
    criticalCases: dataQuality ? dataQuality.missing + dataQuality.conflicting : 0,
    avgConfidence: dataQuality ? Math.round(dataQuality.average_confidence * 100) : 0,
  };
}

export async function getAgents(): Promise<DashboardAgent[]> {
  const [balances, dataQuality] = await Promise.all([getBalances(), getDataQualitySummary()]);
  const feeds = dataQuality?.feeds ?? [];

  return agentsResponseSchema.parse(balances.map((balance) => mapAgent(balance, feeds)));
}
