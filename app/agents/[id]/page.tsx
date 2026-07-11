'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, MapPin, ShieldCheck, Store } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import ProviderBalanceCard from '../../components/ui/ProviderBalanceCard';
import LiquidityGauge from '../../components/ui/LiquidityGauge';
import EscalationStepper from '../../components/ui/EscalationStepper';
import BanglaAlertCard from '../../components/ui/BanglaAlertCard';
import ScenarioBadge from '../../components/ui/ScenarioBadge';
import { getAgents, type DashboardAgent } from '../../../lib/api/dashboard';
import { getAlerts, getCases } from '../../../lib/api/operations';
import { mockAgents, mockAlerts, mockCases, type MockAlert, type MockCase } from '../../../lib/api/mockData';

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const initialAgent = mockAgents.find((item) => item.id === id) ?? mockAgents[0];
  const [agent, setAgent] = useState<DashboardAgent>(initialAgent);
  const [alerts, setAlerts] = useState<MockAlert[]>(mockAlerts.filter((item) => item.agentId === initialAgent.id));
  const [cases, setCases] = useState<MockCase[]>(mockCases.filter((item) => item.outlet.includes(initialAgent.id)));

  useEffect(() => {
    Promise.all([getAgents(), getAlerts(), getCases()]).then(([agents, alertResult, caseResult]) => {
      const selected = agents.find((item) => item.id === id) ?? agents[0] ?? initialAgent;
      setAgent(selected);
      setAlerts(alertResult.data.filter((item) => item.agentId === selected.id));
      setCases(caseResult.data.filter((item) => item.outlet.includes(selected.id)));
    });
  }, [id, initialAgent]);

  return <div className="min-h-screen text-text-primary"><Sidebar /><main className="app-main">
    <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div className="flex items-start gap-3"><Link href="/agents" aria-label="Back to agents" className="secondary-button h-11 w-11 px-0"><ArrowLeft className="h-4 w-4" /></Link><div><div className="font-mono text-xs font-bold text-bkash">{agent.id}</div><h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{agent.name}</h1><p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary"><MapPin className="h-4 w-4" />{agent.area} · Synthetic multi-provider outlet</p></div></div>
      <ScenarioBadge />
    </header>

    <section className="mb-6 grid gap-4 sm:grid-cols-3">
      <div className="card pearl-stripe p-5"><div className="pl-2"><div className="section-kicker flex items-center gap-1.5"><Store className="h-3.5 w-3.5" />Shared physical cash</div><div className="mt-3 text-3xl font-extrabold">৳{agent.physicalCash.toLocaleString()}</div><p className="mt-2 text-xs text-text-muted">Shared operational cash; provider e-money remains separate.</p></div></div>
      <div className="card p-5"><div className="section-kicker">Response posture</div><div className="mt-3 text-lg font-bold">{agent.status}</div><p className="mt-2 text-xs text-text-muted">Tiered, fail-open coordination with human review.</p></div>
      <div className="card p-5"><div className="section-kicker">Open alerts</div><div className="mt-3 text-3xl font-extrabold">{agent.alerts}</div><p className="mt-2 text-xs text-text-muted">{alerts.length} explainable alerts in the current demo view.</p></div>
    </section>

    <section className="mb-6"><div className="mb-3"><div className="section-kicker">Provider separation</div><h2 className="mt-1 text-xl font-bold">E-money positions & feed confidence</h2></div><div className="grid gap-4 xl:grid-cols-3">{(['bkash', 'nagad', 'rocket'] as const).map((key) => <ProviderBalanceCard key={key} data={agent.providers[key]} />)}</div></section>

    <section className="mb-6 grid gap-5 xl:grid-cols-3" aria-label="Provider liquidity capacity">{(['bkash', 'nagad', 'rocket'] as const).map((key) => <LiquidityGauge key={key} data={agent.providers[key]} />)}</section>

    <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <div><div className="mb-3"><div className="section-kicker">Evidence & uncertainty</div><h2 className="mt-1 text-xl font-bold">Alerts requiring review</h2></div><div className="space-y-4">{alerts.length ? alerts.map((alert) => <article key={alert.id} className="space-y-3"><BanglaAlertCard textBn={alert.messageBn} textEn={alert.messageEn} severity={alert.severity} /><div className="card p-4 text-xs text-text-secondary"><strong className="text-text-primary">Safe next step:</strong> {alert.nextStep}<p className="mt-2 text-text-muted">Uncertainty: {alert.uncertainty}</p></div></article>) : <div className="card flex min-h-48 flex-col items-center justify-center text-center"><CheckCircle2 className="h-8 w-8 text-low" /><h3 className="mt-2 font-bold">No review alert</h3><p className="mt-1 text-xs text-text-muted">Current simulated provider feeds are within the configured range.</p></div>}</div></div>
      <div><div className="mb-3"><div className="section-kicker">Coordination</div><h2 className="mt-1 text-xl font-bold">Owner & escalation path</h2></div><div className="space-y-4">{cases.length ? cases.map((item) => <div key={item.id} className="space-y-3"><EscalationStepper path={[item.receiver, item.assignedTo]} currentLevel={item.escalationLevel} status={`${item.id} · ${item.ackStatus}`} /><div className="card p-4 text-xs text-text-secondary"><div className="flex items-center gap-2 text-text-primary"><ShieldCheck className="h-4 w-4 text-teal" /><strong>Owner: {item.owner}</strong></div><p className="mt-2">{item.nextStep}</p></div></div>) : <div className="card p-6 text-sm text-text-muted">No active coordination case for this outlet.</div>}</div></div>
    </section>
  </main></div>;
}
