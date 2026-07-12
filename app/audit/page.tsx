'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, Database, ShieldCheck, BarChart2 } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import ScenarioBadge from '../components/ui/ScenarioBadge';
import { getAuditTrail, fetchMetrics, type DataSource, type ValidationMetrics } from '../../lib/api/operations';
import { mockAuditTrail } from '../../lib/api/mockData';
import { useLanguage } from '../../lib/i18n';
import { useViewerProfile } from '../../lib/viewerProfile';

export default function AuditPage() {
  const { t } = useLanguage();
  const profile = useViewerProfile();
  
  const [events, setEvents] = useState<Array<{ id: string; caseId: string; provider: string; timestamp: string; actor: string; action: string }>>(mockAuditTrail);
  const [metrics, setMetrics] = useState<ValidationMetrics>({
    precision: 1.0,
    recall: 1.0,
    false_positive_rate: 0.0,
    processing_latency_ms: 3.27,
    feed_failure_coverage: 1.0
  });
  const [source, setSource] = useState<DataSource>('mock-fallback');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAuditTrail(profile.scope),
      fetchMetrics()
    ]).then(([auditResult, metricsData]) => {
      setEvents(auditResult.data);
      setSource(auditResult.source);
      if (metricsData) {
        setMetrics(metricsData);
      }
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [profile.id, profile.scope]);

  return (
    <div className="min-h-screen text-text-primary">
      <Sidebar />
      <main className="app-main">
        <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="section-kicker">Screen E. Validation Dashboard</div>
            <h1 className="mt-2 text-3xl font-extrabold">Evaluation Metrics & Audit Trail</h1>
            <p className="mt-2 text-sm text-text-secondary">Precision, recall, processing latency and feed coverage from simulator reports</p>
          </div>
          <ScenarioBadge />
        </header>

        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-teal/25 bg-teal-soft p-4 text-sm text-text-secondary">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-teal" />
            <span>Audit trail displays verified stakeholder actions, routing, and outcomes.</span>
          </span>
          <span className="data-source-pill">
            <Database className="h-3.5 w-3.5" />
            {source === 'backend-api' ? t('backendApi') : t('mockFallback')}
          </span>
        </div>

        {/* Validation Dashboard Metrics Section */}
        <section aria-label="Validation Metrics" className="mb-6 space-y-4" aria-busy={loading}>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-bkash animate-pulse" />
            <h2 className="text-xl font-bold text-text-primary">Accuracy & Performance Invariants</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Precision */}
            <div className="card p-4 flex flex-col justify-between min-h-[120px]">
              <span className="section-kicker text-text-muted">Precision</span>
              <div className="mt-2">
                <span className="text-3xl font-extrabold font-mono text-teal">
                  {metrics.precision != null ? `${(metrics.precision * 100).toFixed(0)}%` : '—'}
                </span>
                <span className="text-[10px] text-text-muted block mt-1">Target: &gt;= 80%</span>
              </div>
            </div>

            {/* Recall */}
            <div className="card p-4 flex flex-col justify-between min-h-[120px]">
              <span className="section-kicker text-text-muted">Recall</span>
              <div className="mt-2">
                <span className="text-3xl font-extrabold font-mono text-teal">
                  {metrics.recall != null ? `${(metrics.recall * 100).toFixed(0)}%` : '—'}
                </span>
                <span className="text-[10px] text-text-muted block mt-1">Target: &gt;= 80%</span>
              </div>
            </div>

            {/* False Positive Rate */}
            <div className="card p-4 flex flex-col justify-between min-h-[120px]">
              <span className="section-kicker text-text-muted">False-Positive Rate</span>
              <div className="mt-2">
                <span className="text-3xl font-extrabold font-mono text-low font-semibold">
                  {metrics.false_positive_rate != null ? `${(metrics.false_positive_rate * 100).toFixed(0)}%` : '—'}
                </span>
                <span className="text-[10px] text-text-muted block mt-1">Target: &lt;= 20%</span>
              </div>
            </div>

            {/* Latency */}
            <div className="card p-4 flex flex-col justify-between min-h-[120px]">
              <span className="section-kicker text-text-muted">Processing Latency</span>
              <div className="mt-2">
                <span className="text-3xl font-extrabold font-mono text-text-primary">
                  {metrics.processing_latency_ms != null ? `${metrics.processing_latency_ms.toFixed(1)}ms` : '—'}
                </span>
                <span className="text-[10px] text-text-muted block mt-1">Target: &lt;= 250ms</span>
              </div>
            </div>

            {/* Feed Failure Coverage */}
            <div className="card p-4 flex flex-col justify-between min-h-[120px]">
              <span className="section-kicker text-text-muted">Reliability Coverage</span>
              <div className="mt-2">
                <span className="text-3xl font-extrabold font-mono text-teal font-semibold">
                  {metrics.feed_failure_coverage != null ? `${(metrics.feed_failure_coverage * 100).toFixed(0)}%` : '—'}
                </span>
                <span className="text-[10px] text-text-muted block mt-1">Target: 100%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Audit Trail Section */}
        <section className="card overflow-hidden">
          <div className="border-b border-bg-border p-5">
            <div className="flex items-center gap-2 font-bold">
              <ClipboardList className="h-5 w-5 text-bkash" />
              {t('importantWorkflowEvents')}
            </div>
            <p className="mt-1 text-xs text-text-muted">
              {t('traceableEvents', { count: events.length })}
            </p>
          </div>
          
          <div className="divide-y divide-bg-border">
            {events.map((event) => (
              <div key={event.id} className="grid gap-2 p-5 sm:grid-cols-[100px_120px_120px_1fr]">
                <span className="font-mono text-xs text-text-muted">{event.timestamp}</span>
                <span className="font-mono text-xs font-bold text-bkash">{event.caseId}</span>
                <span className="text-xs text-text-secondary">{event.provider}</span>
                <span className="text-sm">
                  <strong>{event.actor}</strong>
                  <span className="mt-1 block text-xs text-text-secondary">{event.action}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
