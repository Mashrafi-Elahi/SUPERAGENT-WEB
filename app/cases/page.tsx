'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Database,
  History,
  LockKeyhole,
  MessageSquarePlus,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import SeverityBadge from '../components/ui/SeverityBadge';
import { addCaseNote, getCases, updateCaseStatus, type DataSource } from '../../lib/api/operations';
import { type CaseStatus, type MockCase } from '../../lib/api/mockData';
import { useLanguage } from '../../lib/i18n';
import { useViewerProfile, type CaseActor } from '../../lib/viewerProfile';

const lifecycle: CaseStatus[] = ['New', 'Acknowledged', 'Assigned', 'Under Review', 'Escalated', 'Resolved', 'Closed'];

function ownerForCase(item: MockCase): CaseActor {
  if (item.provider !== 'SHARED') {
    return {
      actor_id: `ui-${item.provider.toLowerCase()}-operations`,
      display_name: `${item.provider} Provider Operations`,
      role: 'PROVIDER_OPERATIONS',
      provider_id: item.provider,
    };
  }
  return {
    actor_id: 'ui-field-coordinator',
    display_name: `${item.area} Field Coordinator`,
    role: 'FIELD_OFFICER',
  };
}

export default function CasesPage() {
  const { language } = useLanguage();
  const profile = useViewerProfile();
  const [cases, setCases] = useState<MockCase[]>([]);
  const [source, setSource] = useState<DataSource>('mock-fallback');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('active');
  const [providerFilter, setProviderFilter] = useState('all');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('Additional specialist review is required.');
  const [resolution, setResolution] = useState('Operational context reviewed and the coordinated response is documented.');
  const [resolutionCode, setResolutionCode] = useState('NO_ACTION_REQUIRED');

  useEffect(() => {
    let active = true;
    getCases(language, true, profile.scope).then((result) => {
      if (!active) return;
      setCases(result.data);
      setSource(result.source);
      setSelectedId((current) => current && result.data.some((item) => item.id === current) ? current : result.data[0]?.id ?? null);
    });
    return () => { active = false; };
  }, [language, profile.id, profile.scope]);

  const filtered = useMemo(() => cases.filter((item) => {
    const providerMatch = providerFilter === 'all' || item.provider === providerFilter;
    const statusMatch = statusFilter === 'all'
      || statusFilter === 'active' && !['Resolved', 'Closed'].includes(item.ackStatus)
      || item.ackStatus === statusFilter;
    return providerMatch && statusMatch;
  }), [cases, providerFilter, statusFilter]);

  const selected = cases.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  async function transition(nextStatus: CaseStatus, extra?: Parameters<typeof updateCaseStatus>[4]) {
    if (!selected || !profile.actor) return;
    setBusy(true);
    setError(null);
    const result = await updateCaseStatus(selected, nextStatus, profile.actor, profile.scope, extra);
    if (result.error) {
      setError(result.error);
    } else {
      setCases((current) => current.map((item) => item.id === selected.id ? result.data : item));
      setSource(result.source);
    }
    setBusy(false);
  }

  async function submitNote() {
    if (!selected || !profile.actor || !note.trim()) return;
    setBusy(true);
    setError(null);
    const result = await addCaseNote(selected.id, profile.actor, note, profile.scope);
    if (result.error) {
      setError(result.error);
    } else {
      setCases((current) => current.map((item) => item.id === selected.id ? result.data : item));
      setNote('');
      setSource(result.source);
    }
    setBusy(false);
  }

  const currentStage = selected ? lifecycle.indexOf(selected.ackStatus) : 0;

  return (
    <div className="min-h-screen text-text-primary">
      <Sidebar />
      <main className="app-main">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="section-kicker">Human-owned coordination</div>
            <h1 className="mt-2 text-4xl font-semibold">Case command desk</h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">Route evidence to the accountable team, document the decision, and preserve provider boundaries from first acknowledgement through closure.</p>
          </div>
          <span className="data-source-pill"><Database className="h-3.5 w-3.5" />{source === 'backend-api' ? 'Live case API' : 'Read-only fallback data'}</span>
        </header>

        <div className="mb-5 flex items-start gap-3 border-l-2 border-teal bg-teal-soft px-4 py-3 text-sm text-text-secondary">
          <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
          <span><strong className="text-text-primary">Advisory workflow:</strong> this desk can assign, escalate, recommend, and track. It cannot move money, freeze accounts, or make a final fraud determination.</span>
        </div>

        {error && <div role="alert" className="mb-5 rounded-lg border border-critical/25 bg-critical-bg px-4 py-3 text-sm text-critical">{error}</div>}

        <section className="mb-5 grid gap-3 sm:grid-cols-2">
          <select value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)} className="filter-control" aria-label="Provider filter">
            <option value="all">All provider scopes</option><option value="SHARED">Shared cash</option><option value="BKASH">bKash</option><option value="NAGAD">Nagad</option><option value="ROCKET">Rocket</option>
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="filter-control" aria-label="Status filter">
            <option value="active">Active cases</option><option value="all">All statuses</option>{lifecycle.map((status) => <option key={status}>{status}</option>)}
          </select>
        </section>

        <section className="grid min-h-[640px] gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="card overflow-hidden self-start">
            <div className="border-b border-bg-border px-4 py-3 text-xs font-semibold text-text-muted">{filtered.length} cases in this view</div>
            <div className="max-h-[720px] divide-y divide-bg-border overflow-y-auto">
              {filtered.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`w-full p-4 text-left transition ${selected?.id === item.id ? 'bg-teal-soft' : 'hover:bg-bg-hover'}`}>
                <div className="flex items-center justify-between gap-2"><span className="font-mono text-xs font-bold text-teal">{item.id}</span><SeverityBadge severity={item.severity} /></div>
                <div className="mt-2 truncate font-semibold">{item.outlet}</div>
                <div className="mt-2 flex items-center justify-between text-xs text-text-muted"><span>{item.provider} · {item.area}</span><span>{item.ackStatus}</span></div>
              </button>)}
              {filtered.length === 0 && <div className="p-8 text-center text-sm text-text-muted">No cases match these filters.</div>}
            </div>
          </div>

          {selected ? <article className="card overflow-hidden self-start">
            <header className="border-b border-bg-border p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div><div className="font-mono text-xs font-bold text-teal">{selected.id} · {selected.alertId}</div><h2 className="mt-2 text-2xl font-semibold">{selected.outlet}</h2><p className="mt-1 text-sm text-text-muted">{selected.area} · {selected.provider} scope · updated {selected.timestamp}</p></div>
                <div className="flex items-center gap-2"><SeverityBadge severity={selected.severity} /><span className={selected.ackStatus === 'Resolved' || selected.ackStatus === 'Closed' ? 'badge-low' : 'badge-medium'}>{selected.ackStatus}</span></div>
              </div>
              <div className="mt-6 overflow-x-auto pb-1">
                <div className="flex min-w-[620px] items-center">
                  {lifecycle.map((stage, index) => <div key={stage} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center gap-2"><span className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${index < currentStage ? 'border-teal bg-teal text-white' : index === currentStage ? 'border-bkash bg-bkash text-white' : 'border-bg-border bg-bg-surface text-text-muted'}`}>{index < currentStage ? <Check className="h-3.5 w-3.5" /> : index + 1}</span><span className={`whitespace-nowrap text-[10px] ${index === currentStage ? 'font-bold text-bkash' : 'text-text-muted'}`}>{stage}</span></div>
                    {index < lifecycle.length - 1 && <div className={`mb-5 h-px flex-1 ${index < currentStage ? 'bg-teal' : 'bg-bg-border'}`} />}
                  </div>)}
                </div>
              </div>
            </header>

            <div className="space-y-6 p-5 sm:p-6">
              <section className="grid gap-px overflow-hidden rounded-lg border border-bg-border bg-bg-border sm:grid-cols-2 xl:grid-cols-4">
                {[['Alert receiver', selected.receiver], ['Responsible team', selected.responsibleStakeholder ?? selected.owner], ['Case owner', selected.assignedTo], ['Escalation target', selected.escalationTarget ?? 'Not escalated']].map(([label, value]) => <div key={label} className="bg-bg-card p-4"><div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</div><div className="mt-2 text-sm font-semibold">{value}</div></div>)}
              </section>

              <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-lg border border-bg-border p-5"><div className="section-kicker">Recommended next step</div><p className="mt-3 text-sm leading-6 text-text-secondary">{selected.nextStep}</p><div className="mt-4 flex items-center gap-2 text-xs font-semibold text-teal"><ShieldAlert className="h-4 w-4" />Human review required</div></div>
                <div className={`rounded-lg border p-5 ${selected.safeFallbackActive ? 'border-high/30 bg-high-bg' : 'border-teal/20 bg-teal-soft'}`}><div className="section-kicker">Decision posture</div><p className="mt-3 text-sm leading-6 text-text-secondary">{selected.safeFallbackActive ? selected.safeFallbackReason : 'Evidence quality permits normal advisory guidance. Final action remains human-owned.'}</p><p className="mt-3 text-xs text-text-muted">Confidence {Math.round(selected.confidence * 100)}%</p></div>
              </section>

              <section className="grid gap-5 lg:grid-cols-2">
                <div><div className="mb-3 flex items-center gap-2 font-semibold"><History className="h-4 w-4 text-teal" />Traceable history</div><ol className="max-h-72 space-y-4 overflow-y-auto border-l border-bg-border pl-4">{selected.history.map((entry, index) => <li key={`${entry.timestamp}-${index}`} className="relative text-sm before:absolute before:-left-[19px] before:top-1.5 before:h-2 before:w-2 before:rounded-full before:bg-teal"><div className="flex items-center justify-between gap-3"><strong>{entry.actor}</strong><span className="font-mono text-[10px] text-text-muted">{entry.timestamp}</span></div><p className="mt-1 text-xs leading-5 text-text-secondary">{entry.action}</p></li>)}</ol></div>
                <div><div className="mb-3 flex items-center gap-2 font-semibold"><MessageSquarePlus className="h-4 w-4 text-teal" />Case notes</div><div className="max-h-48 space-y-2 overflow-y-auto">{selected.notesList?.length ? selected.notesList.map((entry, index) => <div key={`${entry.timestamp}-${index}`} className="rounded-lg bg-bg-surface p-3 text-xs"><div className="flex justify-between gap-2 font-semibold"><span>{entry.author}</span><span className="text-text-muted">{entry.timestamp}</span></div><p className="mt-1 leading-5 text-text-secondary">{entry.body}</p></div>) : <p className="rounded-lg bg-bg-surface p-3 text-xs leading-5 text-text-secondary">{selected.notes}</p>}</div>{!profile.readOnly && selected.ackStatus !== 'Closed' && <div className="mt-3 flex gap-2"><input value={note} onChange={(event) => setNote(event.target.value)} className="filter-control min-w-0 flex-1" placeholder="Add an internal note" /><button type="button" disabled={busy || !note.trim()} onClick={submitNote} className="secondary-button">Add</button></div>}</div>
              </section>

              <section className="border-t border-bg-border pt-5">
                <div className="mb-4 flex items-center justify-between"><div><div className="section-kicker">Valid next action</div><h3 className="mt-1 text-lg font-semibold">Advance this case safely</h3></div>{profile.readOnly && <span className="badge-medium"><LockKeyhole className="mr-1 h-3.5 w-3.5" />Read only</span>}</div>
                {!profile.readOnly && <div className="flex flex-wrap items-center gap-3">
                  {selected.ackStatus === 'New' && <button type="button" disabled={busy} onClick={() => transition('Acknowledged')} className="primary-button"><UserCheck className="h-4 w-4" />Acknowledge case</button>}
                  {selected.ackStatus === 'Acknowledged' && <button type="button" disabled={busy} onClick={() => transition('Assigned', { owner: ownerForCase(selected), note: 'Assigned to the responsible operational team.' })} className="primary-button"><UserCheck className="h-4 w-4" />Assign to responsible team</button>}
                  {['Assigned', 'Escalated'].includes(selected.ackStatus) && <button type="button" disabled={busy} onClick={() => transition('Under Review')} className="primary-button"><ClipboardCheck className="h-4 w-4" />Start human review</button>}
                  {['Acknowledged', 'Assigned', 'Under Review'].includes(selected.ackStatus) && <div className="flex min-w-[280px] flex-1 gap-2"><input value={reason} onChange={(event) => setReason(event.target.value)} className="filter-control min-w-0 flex-1" aria-label="Escalation reason" /><button type="button" disabled={busy || !reason.trim()} onClick={() => transition('Escalated', { reason })} className="secondary-button"><ArrowUpRight className="h-4 w-4" />Escalate</button></div>}
                  {['Assigned', 'Under Review', 'Escalated'].includes(selected.ackStatus) && <div className="grid w-full gap-2 sm:grid-cols-[190px_minmax(220px,1fr)_auto]"><select value={resolutionCode} onChange={(event) => setResolutionCode(event.target.value)} className="filter-control"><option value="LIQUIDITY_COORDINATED">Liquidity coordinated</option><option value="DEMAND_SPIKE_CONFIRMED">Demand spike confirmed</option><option value="DATA_FEED_RESTORED">Data feed restored</option><option value="BALANCE_VERIFIED">Balance verified</option><option value="NO_ACTION_REQUIRED">No action required</option><option value="OTHER">Other</option></select><input value={resolution} onChange={(event) => setResolution(event.target.value)} className="filter-control" aria-label="Resolution summary" /><button type="button" disabled={busy || !resolution.trim()} onClick={() => transition('Resolved', { resolution_code: resolutionCode, summary: resolution })} className="primary-button"><CheckCircle2 className="h-4 w-4" />Resolve</button></div>}
                  {selected.ackStatus === 'Resolved' && <button type="button" disabled={busy} onClick={() => transition('Closed', { note: 'Resolution verified and case closed.' })} className="primary-button"><CheckCircle2 className="h-4 w-4" />Close case</button>}
                  {selected.ackStatus === 'Closed' && <span className="badge-low"><CheckCircle2 className="mr-1 h-4 w-4" />Workflow complete</span>}
                </div>}
              </section>

              <div className="flex items-start gap-2 border-t border-bg-border pt-4 text-xs leading-5 text-text-muted"><LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />{selected.providerBoundaryNotice ?? 'Provider balances, evidence, and operational authority remain logically separate.'}</div>
            </div>
          </article> : <div className="card flex min-h-96 items-center justify-center text-sm text-text-muted">Select a case to inspect its workflow.</div>}
        </section>
      </main>
    </div>
  );
}
