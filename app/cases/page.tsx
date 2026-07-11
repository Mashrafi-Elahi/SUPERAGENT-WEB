'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, ClipboardCheck, Database, History, ShieldAlert, UserRound } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import ScenarioBadge from '../components/ui/ScenarioBadge';
import SeverityBadge from '../components/ui/SeverityBadge';
import EscalationStepper from '../components/ui/EscalationStepper';
import { getCases, saveDemoCases, updateCaseStatus, type DataSource } from '../../lib/api/operations';
import { mockCases, type CaseStatus, type MockCase } from '../../lib/api/mockData';

export default function CasesPage() {
  const [cases, setCases] = useState<MockCase[]>(mockCases);
  const [source, setSource] = useState<DataSource>('mock-fallback');
  const [expanded, setExpanded] = useState<string | null>(mockCases[0]?.id ?? null);
  const [provider, setProvider] = useState('all');
  const [status, setStatus] = useState('all');
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { getCases().then((result) => { setCases(result.data); setSource(result.source); }); }, []);
  const filtered = useMemo(() => cases.filter((item) => (provider === 'all' || item.provider === provider) && (status === 'all' || item.ackStatus === status)), [cases, provider, status]);

  async function changeStatus(item: MockCase, next: CaseStatus) {
    setBusy(item.id);
    const result = await updateCaseStatus(item, next);
    const nextCases = cases.map((current) => current.id === item.id ? result.data : current);
    setCases(nextCases);
    setSource(result.source);
    if (result.source === 'mock-fallback') saveDemoCases(nextCases);
    setBusy(null);
  }

  return (
    <div className="min-h-screen text-text-primary">
      <Sidebar />
      <main className="app-main">
        <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div><div className="section-kicker">Human-owned coordination</div><h1 className="mt-2 text-3xl font-extrabold">Case Coordination</h1><p className="mt-2 text-sm text-text-secondary">Trace routing, ownership, acknowledgement, escalation and documented resolution.</p></div>
          <ScenarioBadge />
        </header>

        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-teal/25 bg-teal-soft p-4 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-start gap-2"><ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" />Case actions record review decisions only. Provider balances remain separate and the prototype executes no transfer, refill or account action.</span>
          <span className="data-source-pill"><Database className="h-3.5 w-3.5" />{source === 'backend-api' ? 'Backend API' : 'Local demo fallback'}</span>
        </div>

        <section aria-label="Case filters" className="card mb-5 grid gap-3 p-4 sm:grid-cols-3">
          <select aria-label="Provider filter" value={provider} onChange={(event) => setProvider(event.target.value)} className="filter-control"><option value="all">All provider scopes</option><option value="SHARED">Shared cash</option><option value="BKASH">bKash only</option><option value="NAGAD">Nagad only</option><option value="ROCKET">Rocket only</option></select>
          <select aria-label="Case status filter" value={status} onChange={(event) => setStatus(event.target.value)} className="filter-control"><option value="all">All case statuses</option>{['New', 'Assigned', 'Acknowledged', 'Under Review', 'Escalated', 'Resolved', 'Closed'].map((item) => <option key={item}>{item}</option>)}</select>
          <select aria-label="Time window" className="filter-control"><option>Last 12 scenario minutes</option><option>Last 30 scenario minutes</option><option>Current demo period</option><option>Full simulated day</option></select>
        </section>

        <div className="space-y-4">
          {filtered.map((item) => {
            const open = expanded === item.id;
            return (
              <article key={item.id} className="card pearl-stripe overflow-hidden">
                <button type="button" onClick={() => setExpanded(open ? null : item.id)} aria-expanded={open} className="flex w-full flex-col gap-4 p-5 pl-7 text-left sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3"><div className="rounded-xl bg-soft-pink p-2.5 text-bkash"><ShieldAlert className="h-5 w-5" /></div><div><div className="font-mono text-xs font-bold text-bkash">{item.id} · {item.alertId}</div><h2 className="mt-1 font-bold text-text-primary">{item.outlet}</h2><p className="mt-1 text-xs text-text-muted">{item.area} · {item.provider} · {item.timestamp}</p></div></div>
                  <div className="flex items-center gap-2"><SeverityBadge severity={item.severity} /><span className={item.ackStatus === 'Resolved' ? 'badge-low' : 'badge-medium'}>{item.ackStatus}</span><ChevronDown className={`h-4 w-4 text-text-muted transition ${open ? 'rotate-180' : ''}`} /></div>
                </button>

                {open && <div className="border-t border-bg-border bg-bg-surface/45 p-5 sm:p-6">
                  <EscalationStepper path={[item.receiver, item.assignedTo]} currentLevel={item.escalationLevel} status={`Current owner: ${item.owner}`} />
                  <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    <div className="rounded-2xl bg-bg-card p-4"><div className="section-kicker">Routing & ownership</div><dl className="mt-3 space-y-2 text-xs"><div className="flex justify-between gap-3"><dt className="text-text-muted">Receives</dt><dd className="text-right font-semibold">{item.receiver}</dd></div><div className="flex justify-between gap-3"><dt className="text-text-muted">Owner</dt><dd className="text-right font-semibold">{item.owner}</dd></div><div className="flex justify-between gap-3"><dt className="text-text-muted">Assigned to</dt><dd className="text-right font-semibold">{item.assignedTo}</dd></div></dl></div>
                    <div className="rounded-2xl bg-teal-soft p-4"><div className="section-kicker text-teal">Recommended next step</div><p className="mt-3 text-xs leading-relaxed text-text-secondary">{item.nextStep}</p><p className="mt-3 text-[10px] text-text-muted">Advisory only · authorized human action required</p></div>
                    <div className="rounded-2xl bg-info-bg p-4"><div className="section-kicker text-info">Evidence & confidence</div><ul className="mt-3 space-y-1.5 text-xs text-text-secondary">{item.evidence.map((evidence) => <li key={evidence}>• {evidence}</li>)}</ul><div className="mt-3 flex justify-between text-xs"><span>Confidence</span><strong>{Math.round(item.confidence * 100)}%</strong></div></div>
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
                    <div className="rounded-2xl border border-bg-border bg-bg-card p-4"><div className="section-kicker">Case note</div><p className="mt-3 text-xs leading-relaxed text-text-secondary">{item.notes}</p><p className="mt-3 text-xs font-semibold text-text-primary">Resolution: {item.resolutionStatus}</p></div>
                    <div className="rounded-2xl border border-bg-border bg-bg-card p-4"><div className="section-kicker flex items-center gap-1.5"><History className="h-3.5 w-3.5" />Traceable history</div><ol className="mt-3 space-y-3">{item.history.map((history, index) => <li key={`${history.timestamp}-${index}`} className="flex gap-3 text-xs"><span className="font-mono text-text-muted">{history.timestamp}</span><span><strong className="text-text-primary">{history.actor}</strong><span className="block mt-0.5 text-text-secondary">{history.action}</span></span></li>)}</ol></div>
                  </div>
                  <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-bg-border pt-4">
                    {item.ackStatus !== 'Resolved' && <><button type="button" disabled={busy === item.id} onClick={() => changeStatus(item, 'Under Review')} className="secondary-button"><UserRound className="h-4 w-4" />Mark under review</button><button type="button" disabled={busy === item.id} onClick={() => changeStatus(item, 'Escalated')} className="secondary-button">Escalate review</button><button type="button" disabled={busy === item.id} onClick={() => changeStatus(item, 'Resolved')} className="primary-button"><CheckCircle2 className="h-4 w-4" />Document resolution</button></>}
                    {item.ackStatus === 'Resolved' && <span className="badge-low"><CheckCircle2 className="mr-1 h-4 w-4" />Resolution documented</span>}
                  </div>
                </div>}
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
