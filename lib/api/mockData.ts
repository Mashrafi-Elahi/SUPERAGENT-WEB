export const demoScenario = {
  mode: 'Demo Mode',
  date: '18 June 2026',
  currentTime: '4:35 PM',
  currentTimestamp: '2026-06-18T16:35:00+06:00',
  projectedShortageTime: '5:20 PM',
  forecastMinutes: 45,
  analysisWindowMinutes: 12,
  analysisWindow: '4:23 PM–4:35 PM',
  dataSource: 'Simulated provider feeds',
  status: 'Prototype demonstration',
} as const;

export type ProviderKey = 'bkash' | 'nagad' | 'rocket';
export type DataQuality = 'fresh' | 'stale' | 'missing' | 'conflicting';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type CaseStatus = 'New' | 'Assigned' | 'Acknowledged' | 'Under Review' | 'Escalated' | 'Resolved' | 'Closed';

export interface ProviderView {
  provider: ProviderKey;
  balance: number | null;
  dataQuality: DataQuality;
  lastUpdated: string;
  demandRate: number;
  capacityMinutes: number | null;
  projectedShortageTime: string | null;
  confidence: number;
  safeFallback: string;
}

export interface SharedCashForecast {
  status: 'SAFE' | 'WATCH' | 'CRITICAL' | 'DEPLETED' | 'INSUFFICIENT_DATA';
  capacityMinutes: number | null;
  projectedShortageTime: string | null;
  confidence: number;
  recommendation: string;
}

export interface MockAgent {
  id: string;
  name: string;
  area: string;
  physicalCash: number;
  providers: Record<ProviderKey, ProviderView>;
  alerts: number;
  status: 'Continue Normal' | 'Continue + Shadow Review' | 'Continue Staged + Fast Review';
  sharedCashForecast?: SharedCashForecast;
}

const provider = (
  key: ProviderKey,
  balance: number | null,
  dataQuality: DataQuality,
  lastUpdated: string,
  demandRate: number,
  capacityMinutes: number | null,
  projectedShortageTime: string | null,
  confidence: number,
  safeFallback: string,
): ProviderView => ({
  provider: key,
  balance,
  dataQuality,
  lastUpdated,
  demandRate,
  capacityMinutes,
  projectedShortageTime,
  confidence,
  safeFallback,
});

export const mockAgents: MockAgent[] = [
  {
    id: 'AGT-1042', name: 'Zindabazar Digital Point', area: 'Zindabazar', physicalCash: 84_500, alerts: 2,
    status: 'Continue + Shadow Review',
    providers: {
      bkash: provider('bkash', 145_000, 'fresh', '2026-06-18T16:35:00+06:00', 12_400, 45, '5:20 PM', 0.82, 'Review demand and contact the assigned field officer through an approved channel.'),
      nagad: provider('nagad', 35_000, 'stale', '2026-06-18T16:15:00+06:00', 5_900, 22, null, 0.42, 'Use the last verified balance only as a reference and confirm manually before a major response.'),
      rocket: provider('rocket', 98_000, 'fresh', '2026-06-18T16:34:00+06:00', 3_400, 120, null, 0.91, 'Continue normal service and monitor the scenario window.'),
    },
  },
  {
    id: 'AGT-1043', name: 'Amberkhana Agent Corner', area: 'Amberkhana', physicalCash: 12_000, alerts: 2,
    status: 'Continue Staged + Fast Review',
    providers: {
      bkash: provider('bkash', 254_000, 'fresh', '2026-06-18T16:35:00+06:00', 8_200, 90, null, 0.90, 'Continue normal service while the shared cash position is reviewed.'),
      nagad: provider('nagad', 120_000, 'fresh', '2026-06-18T16:32:00+06:00', 4_100, 110, null, 0.88, 'Continue normal service and monitor demand.'),
      rocket: provider('rocket', null, 'missing', '2026-06-18T16:00:00+06:00', 0, null, null, 0.20, 'Do not issue a precise forecast; verify the Rocket balance through an approved manual channel.'),
    },
  },
  {
    id: 'AGT-1044', name: 'Mirabazar Mobile Banking', area: 'Mirabazar', physicalCash: 110_000, alerts: 1,
    status: 'Continue Staged + Fast Review',
    providers: {
      bkash: provider('bkash', 5_000, 'conflicting', '2026-06-18T16:35:00+06:00', 0, null, null, 0.30, 'Avoid a strong recommendation until the provider-reported and calculated balances are reconciled.'),
      nagad: provider('nagad', 180_000, 'fresh', '2026-06-18T16:34:00+06:00', 3_800, 140, null, 0.92, 'Continue normal service and monitor demand.'),
      rocket: provider('rocket', 45_000, 'fresh', '2026-06-18T16:33:00+06:00', 2_900, 95, null, 0.87, 'Continue normal service and monitor demand.'),
    },
  },
  {
    id: 'AGT-1045', name: 'Zindabazar Express', area: 'Zindabazar', physicalCash: 24_500, alerts: 1,
    status: 'Continue + Shadow Review',
    providers: {
      bkash: provider('bkash', 12_000, 'fresh', '2026-06-18T16:35:00+06:00', 4_500, 18, '4:53 PM', 0.78, 'Review the projected shortage with the assigned provider operations role.'),
      nagad: provider('nagad', 8_000, 'fresh', '2026-06-18T16:31:00+06:00', 1_700, 35, '5:10 PM', 0.75, 'Review the projected shortage with the assigned provider operations role.'),
      rocket: provider('rocket', 15_000, 'fresh', '2026-06-18T16:32:00+06:00', 1_100, 80, null, 0.81, 'Continue service and monitor demand.'),
    },
  },
  {
    id: 'AGT-1046', name: 'Subidbazar Finance Point', area: 'Subidbazar', physicalCash: 95_000, alerts: 0,
    status: 'Continue Normal',
    providers: {
      bkash: provider('bkash', 75_000, 'fresh', '2026-06-18T16:35:00+06:00', 3_200, 150, null, 0.94, 'Continue normal service.'),
      nagad: provider('nagad', 65_000, 'fresh', '2026-06-18T16:33:00+06:00', 2_700, 160, null, 0.92, 'Continue normal service.'),
      rocket: provider('rocket', 55_000, 'fresh', '2026-06-18T16:34:00+06:00', 2_100, 170, null, 0.93, 'Continue normal service.'),
    },
  },
  {
    id: 'AGT-1047', name: 'Bondor Bazar Agent', area: 'Bondor Bazar', physicalCash: 5_000, alerts: 1,
    status: 'Continue Staged + Fast Review',
    providers: {
      bkash: provider('bkash', 15_000, 'fresh', '2026-06-18T16:35:00+06:00', 4_900, 14, '4:49 PM', 0.84, 'Contact the assigned field officer to review approved support options.'),
      nagad: provider('nagad', 10_000, 'fresh', '2026-06-18T16:33:00+06:00', 2_800, 28, '5:03 PM', 0.79, 'Contact the assigned field officer to review approved support options.'),
      rocket: provider('rocket', 12_000, 'fresh', '2026-06-18T16:34:00+06:00', 1_300, 65, null, 0.86, 'Continue service and monitor demand.'),
    },
  },
];

export interface MockAlert {
  id: string;
  title: string;
  messageBn: string;
  messageEn: string;
  evidence: string[];
  uncertainty: string;
  nextStep: string;
  owner: string;
  confidence: number;
  severity: Severity;
  provider: ProviderKey | 'shared';
  agentId: string;
  agentName: string;
  timestamp: string;
  dataStatus: DataQuality;
  incidentType?: string;
  priorityLabel?: string;
  receiverRole?: string;
  alternativeExplanations?: string;
  caseId?: string;
  caseStatus?: CaseStatus;
}

export const mockAlerts: MockAlert[] = [
  {
    id: 'ALT-001', title: 'Shared Cash Pressure', severity: 'critical', provider: 'bkash', agentId: 'AGT-1042',
    agentName: 'Zindabazar Digital Point', timestamp: '4:35 PM', confidence: 0.82, dataStatus: 'fresh', owner: 'Field Officer',
    messageBn: 'বর্তমান সিমুলেটেড লেনদেনের ধারা অনুযায়ী বিকেল ৫টা ২০ মিনিটের মধ্যে নগদ অর্থের চাপ তৈরি হতে পারে। সবচেয়ে বেশি চাপ আসছে বিকাশ ক্যাশ-আউট থেকে।',
    messageEn: 'Based on the current simulated transaction pattern, the outlet may run out of physical cash by 5:20 PM. Most pressure is associated with bKash cash-out demand.',
    evidence: ['Cash-out demand increased by 38% in the last 12 minutes.', 'bKash contributes 61% of current cash-out pressure.', 'Available physical cash: ৳84,500.', 'Estimated minimum reserve: ৳105,000.'],
    uncertainty: 'The estimate assumes the recent demand rate continues; event-related demand may ease.',
    nextStep: 'Review projected demand and contact the assigned field officer through an approved support channel.',
  },
  {
    id: 'ALT-002', title: 'Unusual Transaction Pattern', severity: 'high', provider: 'nagad', agentId: 'AGT-1042',
    agentName: 'Zindabazar Digital Point', timestamp: '4:31 PM', confidence: 0.74, dataStatus: 'fresh', owner: 'Risk Reviewer',
    messageBn: 'গত ১২ মিনিটে লেনদেনের গতি স্বাভাবিকের তুলনায় বেড়েছে। কয়েকটি লেনদেনের পরিমাণ প্রায় একই এবং অল্প কয়েকটি সিমুলেটেড অ্যাকাউন্ট থেকে অনুরোধ এসেছে। এটি মানব পর্যালোচনা প্রয়োজন।',
    messageEn: 'During the 12-minute analysis window, transaction velocity increased. Several near-identical requests came from a small group of synthetic accounts and require human review.',
    evidence: ['6 simulated transactions of BDT 25,000 within 4 minutes.', 'Requests originated from 2 synthetic account identifiers.', 'Affected provider: Nagad.', 'Velocity is 2.1× the contextual baseline.'],
    uncertainty: 'This may reflect normal event demand, repeated customer behaviour, or a data-quality issue.',
    nextStep: 'Review supporting evidence and operational context before any major response.',
  },
  {
    id: 'ALT-003', title: 'Provider Feed Missing', severity: 'medium', provider: 'rocket', agentId: 'AGT-1043',
    agentName: 'Amberkhana Agent Corner', timestamp: '4:30 PM', confidence: 0.20, dataStatus: 'missing', owner: 'Provider Operations',
    messageBn: 'রকেট সিমুলেটেড ফিড থেকে ৩০ মিনিটের বেশি সময় কোনো সিগন্যাল পাওয়া যায়নি। নির্ভুল পূর্বাভাস না দিয়ে ম্যানুয়াল যাচাই প্রয়োজন।',
    messageEn: 'No simulated Rocket feed signal has arrived for more than 30 minutes. A precise forecast is withheld until manual verification.',
    evidence: ['Last scenario signal: 4:00 PM.', 'Feed confidence: 20%.', 'Calculated balance may differ from the provider-reported position.'],
    uncertainty: 'The current Rocket balance and depletion time are unknown.',
    nextStep: 'Verify the provider balance through an approved channel and use only the last verified value as context.',
  },
  {
    id: 'ALT-004', title: 'Provider Balance Conflict', severity: 'critical', provider: 'bkash', agentId: 'AGT-1044',
    agentName: 'Mirabazar Mobile Banking', timestamp: '4:35 PM', confidence: 0.30, dataStatus: 'conflicting', owner: 'Provider Operations',
    messageBn: 'বিকাশ সিমুলেটেড ফিডের ব্যালেন্স এবং স্থানীয় হিসাবের মধ্যে অমিল পাওয়া গেছে। সমন্বয় না হওয়া পর্যন্ত শক্তিশালী সুপারিশ দেখানো হচ্ছে না।',
    messageEn: 'The simulated bKash feed conflicts with the locally calculated balance. Strong recommendations are withheld until reconciliation.',
    evidence: ['Provider-reported balance: ৳5,000.', 'Locally calculated balance: ৳150,000.', 'Absolute difference: ৳145,000.'],
    uncertainty: 'Either source may be delayed or incomplete; the true balance is not established.',
    nextStep: 'Reconcile the two values and document the verified balance before acting on the estimate.',
  },
];

export interface CaseHistoryItem {
  timestamp: string;
  actor: string;
  action: string;
}

export interface MockCase {
  id: string;
  alertId: string;
  provider: 'BKASH' | 'NAGAD' | 'ROCKET' | 'SHARED';
  outlet: string;
  area: string;
  severity: Severity;
  owner: 'Agent' | 'Field Officer' | 'Area Manager' | 'Provider Operations' | 'Risk Reviewer';
  assignedTo: string;
  receiver: string;
  nextStep: string;
  ackStatus: CaseStatus;
  escalationLevel: number;
  resolutionStatus: string;
  timestamp: string;
  notes: string;
  evidence: string[];
  confidence: number;
  history: CaseHistoryItem[];
  responsibleStakeholder?: string;
  escalationTarget?: string | null;
  safeFallbackActive?: boolean;
  safeFallbackReason?: string | null;
  providerBoundaryNotice?: string;
  notesList?: Array<{ body: string; author: string; timestamp: string }>;
}

export const mockCases: MockCase[] = [
  {
    id: 'CASE-001', alertId: 'ALT-001', provider: 'SHARED', outlet: 'Zindabazar Digital Point (AGT-1042)', area: 'Zindabazar', severity: 'critical',
    owner: 'Field Officer', assignedTo: 'Territory Officer — Zindabazar', receiver: 'Field Officer queue',
    nextStep: 'Review projected demand and coordinate approved liquidity-support options with the agent.', ackStatus: 'Under Review', escalationLevel: 2,
    resolutionStatus: 'Approved support options under review', timestamp: '4:35 PM', confidence: 0.82,
    notes: 'The agent reported elevated Eid shopping demand. No financial action is executed by this prototype.',
    evidence: ['Cash-out velocity: ৳12,400/min.', 'Shared cash: ৳84,500.', 'Forecast depletion: 5:20 PM.'],
    history: [{ timestamp: '4:35 PM', actor: 'System', action: 'Case created and routed to Field Officer.' }, { timestamp: '4:38 PM', actor: 'Field Officer', action: 'Acknowledged and started routine review.' }],
  },
  {
    id: 'CASE-002', alertId: 'ALT-002', provider: 'NAGAD', outlet: 'Zindabazar Digital Point (AGT-1042)', area: 'Zindabazar', severity: 'high',
    owner: 'Risk Reviewer', assignedTo: 'Provider Risk Review Queue', receiver: 'Nagad Provider Operations',
    nextStep: 'Review the synthetic transaction evidence and contextual demand; do not make an automated account decision.', ackStatus: 'Acknowledged', escalationLevel: 2,
    resolutionStatus: 'Human review pending', timestamp: '4:31 PM', confidence: 0.74,
    notes: 'Near-identical amounts may still have a legitimate operational explanation.',
    evidence: ['6 simulated transactions in 4 minutes.', '2 synthetic source identifiers.', 'Event-demand context is active.'],
    history: [{ timestamp: '4:31 PM', actor: 'System', action: 'Pattern routed for provider-specific review.' }, { timestamp: '4:34 PM', actor: 'Risk Reviewer', action: 'Marked as acknowledged; evidence review pending.' }],
  },
  {
    id: 'CASE-003', alertId: 'ALT-003', provider: 'ROCKET', outlet: 'Amberkhana Agent Corner (AGT-1043)', area: 'Amberkhana', severity: 'medium',
    owner: 'Provider Operations', assignedTo: 'Rocket Operations Queue', receiver: 'Rocket Provider Operations',
    nextStep: 'Check simulated feed health and ask the agent to verify the provider balance through an approved channel.', ackStatus: 'Assigned', escalationLevel: 1,
    resolutionStatus: 'Data-quality review', timestamp: '4:30 PM', confidence: 0.20,
    notes: 'Fallback posture is active; precise depletion guidance is withheld.',
    evidence: ['No scenario signal for 30 minutes.', 'Feed confidence: 20%.'],
    history: [{ timestamp: '4:30 PM', actor: 'System', action: 'Data-quality case assigned to Rocket Operations.' }],
  },
];

export const mockAuditTrail = mockCases.flatMap((item) =>
  item.history.map((history, index) => ({
    id: `${item.id}-AUD-${index + 1}`,
    caseId: item.id,
    provider: item.provider,
    ...history,
  })),
);

export const chartLiquidityData = [
  { time: '4:05 PM', cash: 120000, bkash: 150000, nagad: 80000, rocket: 90000 },
  { time: '4:15 PM', cash: 105000, bkash: 148000, nagad: 60000, rocket: 95000 },
  { time: '4:25 PM', cash: 92000, bkash: 146000, nagad: 38000, rocket: 98000 },
  { time: '4:35 PM', cash: 84500, bkash: 145000, nagad: 35000, rocket: 98000 },
  { time: '4:45 PM', cash: 62000, bkash: 140000, nagad: 30000, rocket: 102000 },
  { time: '5:00 PM', cash: 31000, bkash: 135000, nagad: 25000, rocket: 105000 },
  { time: '5:20 PM', cash: 0, bkash: 128000, nagad: 20000, rocket: 110000 },
];

export const chartVelocityData = [
  { time: '4:05 PM', cashIn: 15, cashOut: 20 },
  { time: '4:15 PM', cashIn: 12, cashOut: 28 },
  { time: '4:25 PM', cashIn: 18, cashOut: 35 },
  { time: '4:35 PM', cashIn: 10, cashOut: 48 },
  { time: '4:45 PM', cashIn: 14, cashOut: 42 },
  { time: '5:00 PM', cashIn: 16, cashOut: 38 },
  { time: '5:20 PM', cashIn: 15, cashOut: 30 },
];
