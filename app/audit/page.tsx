'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, Database, ShieldCheck } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import ScenarioBadge from '../components/ui/ScenarioBadge';
import { getAuditTrail, type DataSource } from '../../lib/api/operations';
import { mockAuditTrail } from '../../lib/api/mockData';

export default function AuditPage() {
  const [events, setEvents] = useState<Array<{ id: string; caseId: string; provider: string; timestamp: string; actor: string; action: string }>>(mockAuditTrail);
  const [source, setSource] = useState<DataSource>('mock-fallback');
  useEffect(() => { getAuditTrail().then((result) => { setEvents(result.data); setSource(result.source); }); }, []);

  return <div className="min-h-screen text-text-primary"><Sidebar /><main className="app-main">
    <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between"><div><div className="section-kicker">Accountability</div><h1 className="mt-2 text-3xl font-extrabold">Audit Trail</h1><p className="mt-2 text-sm text-text-secondary">Trace ownership, acknowledgement, review, escalation and resolution events.</p></div><ScenarioBadge /></header>
    <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-teal/25 bg-teal-soft p-4 text-sm text-text-secondary"><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal" />Synthetic case history only; no credentials or customer identities are stored.</span><span className="data-source-pill"><Database className="h-3.5 w-3.5" />{source === 'backend-api' ? 'Backend API' : 'Mock fallback'}</span></div>
    <section className="card overflow-hidden"><div className="border-b border-bg-border p-5"><div className="flex items-center gap-2 font-bold"><ClipboardList className="h-5 w-5 text-bkash" />Important workflow events</div><p className="mt-1 text-xs text-text-muted">{events.length} traceable demo events</p></div><div className="divide-y divide-bg-border">{events.map((event) => <div key={event.id} className="grid gap-2 p-5 sm:grid-cols-[100px_120px_120px_1fr]"><span className="font-mono text-xs text-text-muted">{event.timestamp}</span><span className="font-mono text-xs font-bold text-bkash">{event.caseId}</span><span className="text-xs text-text-secondary">{event.provider}</span><span className="text-sm"><strong>{event.actor}</strong><span className="mt-1 block text-xs text-text-secondary">{event.action}</span></span></div>)}</div></section>
  </main></div>;
}
