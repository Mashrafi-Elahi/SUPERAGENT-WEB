const { z } = require('zod');

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const providerIdSchema = z.enum(['BKASH', 'NAGAD', 'ROCKET']);
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

const feedStatusSchema = z.enum(['HEALTHY', 'STALE', 'MISSING', 'CONFLICTING']);

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
  net_depletion_per_minute: decimalSchema,
  minutes_to_safety_threshold: z.number().nullable(),
  safety_threshold_at: z.string().nullable(),
  confidence: z.number(),
  recommendation: z.string(),
});

const agentLiquiditySchema = z.object({
  agent_id: z.string(),
  provider_forecasts: z.array(liquidityResourceSchema),
});

const liquiditySummarySchema = z.object({
  agents: z.array(agentLiquiditySchema),
});

async function test() {
  console.log("Testing API endpoints...");

  // 1. /balances
  try {
    const res = await fetch(`${API_BASE_URL}/balances`);
    if (!res.ok) {
      console.log("/balances HTTP error:", res.status);
    } else {
      const data = await res.json();
      console.log("/balances count:", data.length);
      z.array(agentBalanceSchema).parse(data);
      console.log("/balances Zod validation: SUCCESS");
    }
  } catch (err) {
    console.error("/balances error:", err);
  }

  // 2. /data-quality
  try {
    const res = await fetch(`${API_BASE_URL}/data-quality`);
    if (!res.ok) {
      console.log("/data-quality HTTP error:", res.status);
    } else {
      const data = await res.json();
      dataQualitySummarySchema.parse(data);
      console.log("/data-quality Zod validation: SUCCESS");
    }
  } catch (err) {
    console.error("/data-quality error:", err);
  }

  // 3. /liquidity
  try {
    const res = await fetch(`${API_BASE_URL}/liquidity`);
    if (!res.ok) {
      console.log("/liquidity HTTP error:", res.status);
    } else {
      const data = await res.json();
      liquiditySummarySchema.parse(data);
      console.log("/liquidity Zod validation: SUCCESS");
    }
  } catch (err) {
    console.error("/liquidity error:", err);
  }
}

test();
