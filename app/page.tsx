'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  DatabaseZap,
  ShieldCheck,
  Store,
  TriangleAlert,
} from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import AgentTable from './components/dashboard/AgentTable';
import BackendOperationsPanel from './components/dashboard/BackendOperationsPanel';
import {
  advanceReplay,
  getBackendStatus,
  getDashboardData,
  resetReplay,
  stepReplay,
  type BackendStatus,
  type DashboardAgent,
  type DashboardSummary,
} from '../lib/api/dashboard';
import { getAlerts, getCases } from '../lib/api/operations';
import { mockAgents, type MockAlert, type MockCase, type ProviderKey } from '../lib/api/mockData';
import { useLanguage } from '../lib/i18n';
import { useViewerProfile, visibleProviderKeys } from '../lib/viewerProfile';

const fallbackSummary: DashboardSummary = {
  totalAgents: 0,
  activeAlerts: 0,
  criticalCases: 0,
  avgConfidence: 0,
  staleFeeds: 0,
  missingFeeds: 0,
  conflictingFeeds: 0,
  fallbackRequired: false,
};

const providerMeta: Record<ProviderKey, { name: string; className: string }> = {
  bkash: { name: 'bKash', className: 'text-bkash' },
  nagad: { name: 'Nagad', className: 'text-nagad' },
  rocket: { name: 'Rocket', className: 'text-rocket' },
};

function money(value: number) {
  return new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(value);
}

function timeToPressure(minutes: number | null) {
  if (minutes === null) return 'No reliable estimate';
  if (minutes <= 0) return 'Threshold reached';
  return `${Math.round(minutes)} min to threshold`;
}

export default function Home() {
  const { language } = useLanguage();
  const profile = useViewerProfile();
  const [agents, setAgents] = useState<DashboardAgent[]>(mockAgents);
  const [summary, setSummary] = useState<DashboardSummary>(fallbackSummary);
  const [alerts, setAlerts] = useState<MockAlert[]>([]);
  const [cases, setCases] = useState<MockCase[]>([]);
  const [source, setSource] = useState<'checking' | 'backend-api' | 'mock-fallback'>('checking');
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const visibleProviders = useMemo(() => visibleProviderKeys(profile.scope), [profile.scope]);

  async function refresh() {
    const [dashboard, nextBackendStatus, alertResult, caseResult] = await Promise.all([
      getDashboardData(profile.scope),
      getBackendStatus(),
      getAlerts(language, profile.scope),
      getCases(language, false, profile.scope),
    ]);
    setAgents(dashboard.agents);
    setSummary(dashboard.summary);
    setAlerts(alertResult.data);
    setCases(caseResult.data);
    setSource(dashboard.source);
    setBackendStatus(nextBackendStatus);
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      getDashboardData(profile.scope),
      getBackendStatus(),
      getAlerts(language, profile.scope),
      getCases(language, false, profile.scope),
    ]).then(([dashboard, nextBackendStatus, alertResult, caseResult]) => {
      if (!active) return;
      setAgents(dashboard.agents);
      setSummary(dashboard.summary);
      setAlerts(alertResult.data);
      setCases(caseResult.data);
      setSource(dashboard.source);
      setBackendStatus(nextBackendStatus);
    });
    return () => { active = false; };
  }, [language, profile.id, profile.scope]);

  const totals = useMemo(() => ({
    cash: agents.reduce((total, agent) => total + agent.physicalCash, 0),
    emoney: agents.reduce(
      (total, agent) => total + visibleProviders.reduce((sum, provider) => sum + (agent.providers[provider].balance ?? 0), 0),
      0,
    ),
  }), [agents, visibleProviders]);

  const urgentAgents = useMemo(() => [...agents].sort((a, b) => {
    const aMinutes = Math.min(...visibleProviders.map((provider) => a.providers[provider].capacityMinutes ?? Number.POSITIVE_INFINITY));
    const bMinutes = Math.min(...visibleProviders.map((provider) => b.providers[provider].capacityMinutes ?? Number.POSITIVE_INFINITY));
    return aMinutes - bMinutes;
  }).slice(0, 4), [agents, visibleProviders]);

  const providerPressure = useMemo(() => visibleProviders.map((provider) => {
    const positions = agents.map((agent) => agent.providers[provider]);
    const reliableMinutes = positions.flatMap((position) => position.capacityMinutes === null ? [] : [position.capacityMinutes]);
    const worstQuality = positions.find((position) => position.dataQuality !== 'fresh')?.dataQuality ?? 'fresh';
    const minimumMinutes = reliableMinutes.length ? Math.min(...reliableMinutes) : null;
    const status = worstQuality !== 'fresh'
      ? worstQuality.toUpperCase()
      : minimumMinutes !== null && minimumMinutes <= 30
        ? 'CRITICAL'
        : minimumMinutes !== null && minimumMinutes <= 60 ? 'WATCH' : 'SAFE';
    return { provider, minimumMinutes, status, worstQuality };
  }), [agents, visibleProviders]);

  async function runReplayAction(action: 'step' | 'advance' | 'reset') {
    setBusyAction(action);
    setError(null);
    const result = action === 'step'
      ? await stepReplay(10)
      : action === 'advance' ? await advanceReplay(30) : await resetReplay();
    if (!result) setError('Replay command failed. Confirm that the backend is running, then try again.');
    await refresh();
    setBusyAction(null);
  }

  return (
    <div className="min-h-screen text-text-primary">
      <Sidebar />
      <main className="app-main">
        <section className="command-hero mb-6 overflow-hidden rounded-xl p-6 sm:p-8">
          <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                <span>Operations intelligence</span>
                <span className="h-1 w-1 rounded-full bg-teal" />
                <span>{profile.description}</span>
              </div>
              <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.05] text-white sm:text-5xl">
                See pressure early. Coordinate the right response.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65">
                Shared physical cash and provider e-money stay visibly separate. Every recommendation is advisory, scoped, and traceable to evidence.
              </p>
            </div>
            <div className="grid min-w-[280px] grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10">
              <div className="bg-charcoal/80 p-4"><div className="text-[10px] uppercase tracking-wider text-white/45">Shared cash</div><div className="mt-1 text-xl font-semibold text-white">BDT {money(totals.cash)}</div></div>
              <div className="bg-charcoal/80 p-4"><div className="text-[10px] uppercase tracking-wider text-white/45">Visible e-money</div><div className="mt-1 text-xl font-semibold text-white">BDT {money(totals.emoney)}</div></div>
              <div className="col-span-2 flex items-center justify-between bg-charcoal/80 px-4 py-3 text-xs text-white/60">
                <span>{profile.label}</span>
                <span className="flex items-center gap-1.5 text-teal"><ShieldCheck className="h-3.5 w-3.5" />Provider boundaries active</span>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-6 flex flex-col gap-3 border-l-2 border-teal bg-teal-soft px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-text-secondary"><strong className="text-text-primary">Data posture:</strong> {summary.fallbackRequired ? 'Safe fallback is active. Strong recommendations are suppressed where feeds are unreliable.' : 'Provider feeds support normal advisory guidance.'}</span>
          <span className="data-source-pill shrink-0"><Activity className="h-3.5 w-3.5" />{source === 'backend-api' ? 'Live backend API' : source === 'checking' ? 'Connecting' : 'Synthetic fallback'}</span>
        </div>

        {error && <div role="alert" className="mb-6 rounded-lg border border-critical/25 bg-critical-bg px-4 py-3 text-sm text-critical">{error}</div>}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Operational pulse">
          <div className="signal-card"><Store className="signal-icon text-teal" /><div><div className="signal-label">Outlets in scope</div><div className="signal-value">{agents.length}</div><div className="signal-detail">of {summary.totalAgents || agents.length} visible positions</div></div></div>
          <div className="signal-card"><TriangleAlert className="signal-icon text-high" /><div><div className="signal-label">Requires attention</div><div className="signal-value">{alerts.length}</div><div className="signal-detail">explainable active incidents</div></div></div>
          <div className="signal-card"><BriefcaseBusiness className="signal-icon text-bkash" /><div><div className="signal-label">Open coordination</div><div className="signal-value">{cases.filter((item) => !['Resolved', 'Closed'].includes(item.ackStatus)).length}</div><div className="signal-detail">human-owned cases</div></div></div>
          <div className="signal-card"><DatabaseZap className="signal-icon text-info" /><div><div className="signal-label">Data confidence</div><div className="signal-value">{summary.avgConfidence}%</div><div className="signal-detail">{summary.staleFeeds + summary.missingFeeds + summary.conflictingFeeds} degraded feeds</div></div></div>
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="card overflow-hidden">
            <div className="flex items-end justify-between border-b border-bg-border p-5">
              <div><div className="section-kicker">Priority board</div><h2 className="mt-1 text-2xl font-semibold">Closest to pressure</h2></div>
              <Link href="/agents" className="flex items-center gap-1 text-sm font-semibold text-teal">All outlets <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="divide-y divide-bg-border">
              {urgentAgents.map((agent) => {
                const urgentProvider = visibleProviders.reduce((current, provider) => {
                  const currentMinutes = agent.providers[current].capacityMinutes ?? Number.POSITIVE_INFINITY;
                  const nextMinutes = agent.providers[provider].capacityMinutes ?? Number.POSITIVE_INFINITY;
                  return nextMinutes < currentMinutes ? provider : current;
                }, visibleProviders[0]);
                const position = agent.providers[urgentProvider];
                return <Link key={agent.id} href={`/agents/${agent.id}`} className="priority-row">
                  <div className="min-w-0"><div className="flex items-center gap-2"><span className="font-mono text-xs font-bold text-teal">{agent.id}</span><span className="truncate font-semibold">{agent.name}</span></div><div className="mt-1 text-xs text-text-muted">{agent.area} · shared cash BDT {money(agent.physicalCash)}</div></div>
                  <div className="text-right"><div className={`text-sm font-bold ${providerMeta[urgentProvider].className}`}>{providerMeta[urgentProvider].name}</div><div className="mt-1 text-xs text-text-muted">{timeToPressure(position.capacityMinutes)}</div></div>
                  <div className="hidden text-right sm:block"><div className="text-sm font-semibold">{Math.round(position.confidence * 100)}%</div><div className={`mt-1 text-xs quality-${position.dataQuality}`}>{position.dataQuality} data</div></div>
                  <ArrowRight className="h-4 w-4 text-text-muted" />
                </Link>;
              })}
            </div>
          </div>

          <div className="card p-5">
            <div className="section-kicker">Provider separation</div>
            <h2 className="mt-1 text-2xl font-semibold">Pressure by rail</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">Positions are monitored together for context, never merged or transferred.</p>
            <div className="mt-5 space-y-3">
              {providerPressure.map(({ provider, minimumMinutes, status, worstQuality }) => (
                <div key={provider} className="rounded-lg border border-bg-border bg-bg-surface p-4">
                  <div className="flex items-center justify-between"><span className={`font-bold ${providerMeta[provider].className}`}>{providerMeta[provider].name}</span><span className={status === 'SAFE' ? 'badge-low' : status === 'CRITICAL' || status === 'MISSING' ? 'badge-critical' : 'badge-medium'}>{status}</span></div>
                  <div className="mt-3 flex items-end justify-between"><span className="text-lg font-semibold">{timeToPressure(minimumMinutes)}</span><span className={`text-xs quality-${worstQuality}`}>{worstQuality}</span></div>
                </div>
              ))}
            </div>
            <Link href="/alerts" className="secondary-button mt-4 w-full">Review evidence <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>

        <BackendOperationsPanel status={backendStatus} busyAction={busyAction} onStep={() => runReplayAction('step')} onAdvance={() => runReplayAction('advance')} onReset={() => runReplayAction('reset')} />

        <section className="mb-4">
          <div className="mb-3 flex items-end justify-between gap-3"><div><div className="section-kicker">Provider-separated positions</div><h2 className="mt-1 text-2xl font-semibold">Outlet readiness</h2></div><span className="text-xs text-text-muted">{agents.length} synthetic outlets</span></div>
          <AgentTable agents={agents} visibleProviders={visibleProviders} />
        </section>
      </main>
    </div>
  );
}
