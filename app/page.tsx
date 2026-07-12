'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, Bell, BriefcaseBusiness, Landmark, ShieldCheck, Store, TriangleAlert } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import MetricCard from './components/ui/MetricCard';
import AgentTable from './components/dashboard/AgentTable';
import BackendOperationsPanel from './components/dashboard/BackendOperationsPanel';
import ScenarioBadge from './components/ui/ScenarioBadge';
import { LiquidityProjectionChart, TransactionVelocityChart } from './components/ui/CustomCharts';
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
import { demoScenario, mockAgents } from '../lib/api/mockData';
import { useLanguage } from '../lib/i18n';

const fallbackSummary: DashboardSummary = { totalAgents: 6, activeAlerts: 7, criticalCases: 2, avgConfidence: 72 };

export default function Home() {
  const { t } = useLanguage();
  const [agents, setAgents] = useState<DashboardAgent[]>(mockAgents);
  const [summary, setSummary] = useState<DashboardSummary>(fallbackSummary);
  const [source, setSource] = useState<'checking' | 'backend-api' | 'mock-fallback'>('checking');
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getDashboardData(), getBackendStatus()]).then(([dashboard, nextBackendStatus]) => {
      if (!active) return;
      setAgents(dashboard.agents);
      setSummary(dashboard.summary);
      setSource(dashboard.source);
      setBackendStatus(nextBackendStatus);
    });
    return () => { active = false; };
  }, []);

  const totals = useMemo(() => ({
    cash: agents.reduce((total, agent) => total + agent.physicalCash, 0),
    emoney: agents.reduce((total, agent) => total + Object.values(agent.providers).reduce((sum, provider) => sum + (provider.balance ?? 0), 0), 0),
    pressure: agents.filter((agent) => Object.values(agent.providers).some((provider) => provider.capacityMinutes !== null && provider.capacityMinutes <= 45)).length,
  }), [agents]);

  async function runReplayAction(action: 'step' | 'advance' | 'reset') {
    setBusyAction(action);
    try {
      if (action === 'step') await stepReplay(10);
      if (action === 'advance') await advanceReplay(30);
      if (action === 'reset') await resetReplay();
      const [dashboard, nextBackendStatus] = await Promise.all([getDashboardData(), getBackendStatus()]);
      setAgents(dashboard.agents);
      setSummary(dashboard.summary);
      setSource(dashboard.source);
      setBackendStatus(nextBackendStatus);
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="min-h-screen text-text-primary">
      <Sidebar />
      <main className="app-main">
        <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="section-kicker">MFSA</div>
            <h1 className="mt-2 text-3xl font-extrabold text-text-primary sm:text-4xl">{t('liquidityRiskIntelligence')}</h1>
          </div>
          <ScenarioBadge />
        </header>

        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-teal/25 bg-teal-soft px-4 py-3 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" /><span><strong className="text-text-primary">{t('boundary')}</strong> {t('boundaryText')}</span></span>
          <span className="data-source-pill shrink-0"><Activity className="h-3.5 w-3.5" />{source === 'backend-api' ? t('backendApi') : source === 'checking' ? t('apiChecking') : t('mockFallbackActive')}</span>
        </div>

        <section aria-label="Scenario summary" className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <MetricCard title={t('sharedPhysicalCash')} value={`৳${totals.cash.toLocaleString()}`} subtitle={t('acrossSimulatedOutlets')} icon={<Store className="h-5 w-5" />} accentColor="bg-bkash text-bkash" />
          <MetricCard title={t('providerEMoney')} value={`৳${totals.emoney.toLocaleString()}`} subtitle={t('viewOnlyNotConvertible')} icon={<Landmark className="h-5 w-5" />} accentColor="bg-teal text-teal" />
          <MetricCard title={t('providersUnderPressure')} value={totals.pressure.toString()} subtitle={t('withinMinutes', { minutes: demoScenario.forecastMinutes })} icon={<TriangleAlert className="h-5 w-5" />} accentColor="bg-high text-high" />
          <MetricCard title={t('openAlerts')} value={summary.activeAlerts.toString()} subtitle={t('explainableEvidence')} icon={<Bell className="h-5 w-5" />} accentColor="bg-critical text-critical" />
          <MetricCard title={t('highPriorityCases')} value={summary.criticalCases.toString()} subtitle={t('humanOwnedWorkflow')} icon={<BriefcaseBusiness className="h-5 w-5" />} accentColor="bg-bkash text-bkash" />
          <MetricCard title={t('dataConfidence')} value={`${summary.avgConfidence}%`} subtitle={t('fallbackAware')} icon={<ShieldCheck className="h-5 w-5" />} accentColor="bg-info text-info" />
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]" aria-label="Scenario analytics">
          <LiquidityProjectionChart />
          <TransactionVelocityChart />
        </section>

        <BackendOperationsPanel
          status={backendStatus}
          busyAction={busyAction}
          onStep={() => runReplayAction('step')}
          onAdvance={() => runReplayAction('advance')}
          onReset={() => runReplayAction('reset')}
        />

        <section className="mb-4">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div><div className="section-kicker">{t('outletPrioritization')}</div><h2 className="mt-1 text-xl font-bold">{t('multiProviderAgentPositions')}</h2></div>
            <span className="text-xs text-text-muted">{t('syntheticOutlets', { count: agents.length, time: demoScenario.currentTime })}</span>
          </div>
          <AgentTable agents={agents} />
        </section>
      </main>
    </div>
  );
}
