'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, Bell, BriefcaseBusiness, Landmark, ShieldCheck, Store, TriangleAlert } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import MetricCard from './components/ui/MetricCard';
import AgentTable from './components/dashboard/AgentTable';
import ScenarioBadge from './components/ui/ScenarioBadge';
import { LiquidityProjectionChart, TransactionVelocityChart } from './components/ui/CustomCharts';
import { getDashboardData, type DashboardAgent, type DashboardSummary } from '../lib/api/dashboard';
import { demoScenario, mockAgents } from '../lib/api/mockData';

const fallbackSummary: DashboardSummary = { totalAgents: 6, activeAlerts: 7, criticalCases: 2, avgConfidence: 72 };

export default function Home() {
  const [agents, setAgents] = useState<DashboardAgent[]>(mockAgents);
  const [summary, setSummary] = useState<DashboardSummary>(fallbackSummary);
  const [source, setSource] = useState<'checking' | 'backend-api' | 'mock-fallback'>('checking');

  useEffect(() => {
    let active = true;
    getDashboardData().then(({ agents: nextAgents, summary: nextSummary, source: nextSource }) => {
      if (!active) return;
      setAgents(nextAgents);
      setSummary(nextSummary);
      setSource(nextSource);
    });
    return () => { active = false; };
  }, []);

  const totals = useMemo(() => ({
    cash: agents.reduce((total, agent) => total + agent.physicalCash, 0),
    emoney: agents.reduce((total, agent) => total + Object.values(agent.providers).reduce((sum, provider) => sum + (provider.balance ?? 0), 0), 0),
    pressure: agents.filter((agent) => Object.values(agent.providers).some((provider) => provider.capacityMinutes !== null && provider.capacityMinutes <= 45)).length,
  }), [agents]);

  return (
    <div className="min-h-screen text-text-primary">
      <Sidebar />
      <main className="app-main">
        <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-xl">
            <div className="section-kicker">MFS Super Agent · Decision Support</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">Liquidity & Risk Intelligence</h1>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">One operational view for shared cash, provider-separated e-money, explainable alerts and coordinated human response.</p>
          </div>
          <ScenarioBadge />
        </header>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-teal/25 bg-teal-soft px-4 py-3 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" /><span><strong className="text-text-primary">Responsible prototype:</strong> synthetic identifiers only, provider balances remain separate, and every recommendation requires authorized human review.</span></span>
          <span className="data-source-pill shrink-0"><Activity className="h-3.5 w-3.5" />{source === 'backend-api' ? 'Backend API' : source === 'checking' ? 'Checking API…' : 'Mock fallback active'}</span>
        </div>

        <section aria-label="Scenario summary" className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <MetricCard title="Shared Physical Cash" value={`৳${totals.cash.toLocaleString()}`} subtitle="Across simulated outlets" icon={<Store className="h-5 w-5" />} accentColor="bg-bkash text-bkash" />
          <MetricCard title="Provider E-Money" value={`৳${totals.emoney.toLocaleString()}`} subtitle="View only · not convertible" icon={<Landmark className="h-5 w-5" />} accentColor="bg-teal text-teal" />
          <MetricCard title="Providers Under Pressure" value={totals.pressure.toString()} subtitle={`Within ${demoScenario.forecastMinutes} min`} icon={<TriangleAlert className="h-5 w-5" />} accentColor="bg-high text-high" />
          <MetricCard title="Open Alerts" value={summary.activeAlerts.toString()} subtitle="Explainable evidence" icon={<Bell className="h-5 w-5" />} accentColor="bg-critical text-critical" />
          <MetricCard title="High-Priority Cases" value={summary.criticalCases.toString()} subtitle="Human-owned workflow" icon={<BriefcaseBusiness className="h-5 w-5" />} accentColor="bg-bkash text-bkash" />
          <MetricCard title="Data Confidence" value={`${summary.avgConfidence}%`} subtitle="Fallback-aware" icon={<ShieldCheck className="h-5 w-5" />} accentColor="bg-info text-info" />
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]" aria-label="Scenario analytics">
          <LiquidityProjectionChart />
          <TransactionVelocityChart />
        </section>

        <section className="mb-4">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div><div className="section-kicker">Outlet prioritization</div><h2 className="mt-1 text-xl font-bold">Multi-provider agent positions</h2></div>
            <span className="text-xs text-text-muted">{agents.length} synthetic outlets · scenario time {demoScenario.currentTime}</span>
          </div>
          <AgentTable agents={agents} />
        </section>
      </main>
    </div>
  );
}
