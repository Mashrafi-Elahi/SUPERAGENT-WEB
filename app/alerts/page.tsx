'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, CircleAlert, Database, Search, ShieldCheck } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import BanglaAlertCard from '../components/ui/BanglaAlertCard';
import ScenarioBadge from '../components/ui/ScenarioBadge';
import SeverityBadge from '../components/ui/SeverityBadge';
import { acknowledgeCase, getAlerts, type DataSource } from '../../lib/api/operations';
import { mockAlerts, type MockAlert, type ProviderKey, type Severity } from '../../lib/api/mockData';
import { useLanguage } from '../../lib/i18n';
import { useViewerProfile } from '../../lib/viewerProfile';

export default function AlertsPage() {
  const { language, t } = useLanguage();
  const profile = useViewerProfile();
  const [alerts, setAlerts] = useState<MockAlert[]>(mockAlerts);
  const [source, setSource] = useState<DataSource>('mock-fallback');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<'all' | ProviderKey | 'shared'>('all');
  const [severity, setSeverity] = useState<'all' | Severity>('all');
  const [confidence, setConfidence] = useState('all');
  const [query, setQuery] = useState('');
  const providerChips = { shared: 'chip-bkash', bkash: 'chip-bkash', nagad: 'chip-nagad', rocket: 'chip-rocket' } as const;

  async function acknowledge(alert: MockAlert) {
    if (!alert.caseId || !profile.actor) return;
    setBusy(alert.id);
    setError(null);
    const result = await acknowledgeCase(alert.caseId, profile.actor);
    if (result.ok) {
      setAlerts((current) => current.map((item) => item.id === alert.id ? { ...item, caseStatus: 'Acknowledged' } : item));
    } else {
      setError(result.error ?? 'Acknowledgement failed.');
    }
    setBusy(null);
  }

  useEffect(() => { getAlerts(language, profile.scope).then((result) => { setAlerts(result.data); setSource(result.source); }); }, [language, profile.id, profile.scope]);
  const filtered = alerts.filter((alert) => {
    const matchesQuery = !query || `${alert.id} ${alert.title} ${alert.agentName}`.toLowerCase().includes(query.toLowerCase());
    const matchesProvider = provider === 'all' || alert.provider === provider;
    const matchesSeverity = severity === 'all' || alert.severity === severity;
    const matchesConfidence = confidence === 'all' || (confidence === 'low' ? alert.confidence < 0.5 : confidence === 'moderate' ? alert.confidence >= 0.5 && alert.confidence < 0.8 : alert.confidence >= 0.8);
    return matchesQuery && matchesProvider && matchesSeverity && matchesConfidence;
  });

  return (
    <div className="min-h-screen text-text-primary">
      <Sidebar />
      <main className="app-main">
        <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div><div className="section-kicker">{t('explainableReviewQueue')}</div><h1 className="mt-2 text-3xl font-extrabold">{t('liquidityUnusualAlerts')}</h1><p className="mt-2 text-sm text-text-secondary">{t('alertsDescription')}</p></div>
          <ScenarioBadge />
        </header>

        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-info/25 bg-info-bg p-4 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-info" /><span><strong className="text-text-primary">{t('advisoryBoundary')}</strong> {t('advisoryBoundaryText')}</span></span>
          <span className="data-source-pill shrink-0"><Database className="h-3.5 w-3.5" />{source === 'backend-api' ? t('backendApi') : t('mockFallback')}</span>
        </div>
        {error && <div role="alert" className="mb-5 rounded-lg border border-critical/25 bg-critical-bg px-4 py-3 text-sm text-critical">{error}</div>}

        <section className="card mb-5 grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Alert filters">
          <label className="relative"><span className="sr-only">{t('searchAlert')}</span><Search className="absolute left-3 top-3.5 h-4 w-4 text-text-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('searchAlert')} className="filter-control w-full pl-10" /></label>
          <select aria-label="Provider filter" value={provider} onChange={(event) => setProvider(event.target.value as typeof provider)} className="filter-control"><option value="all">{t('allProviders')}</option><option value="shared">{t('sharedCash')}</option><option value="bkash">bKash</option><option value="nagad">Nagad</option><option value="rocket">Rocket</option></select>
          <select aria-label="Severity filter" value={severity} onChange={(event) => setSeverity(event.target.value as typeof severity)} className="filter-control"><option value="all">{t('allSeverities')}</option><option value="critical">{t('critical')}</option><option value="high">{t('high')}</option><option value="medium">{t('medium')}</option><option value="low">{t('low')}</option></select>
          <select aria-label="Confidence filter" value={confidence} onChange={(event) => setConfidence(event.target.value)} className="filter-control"><option value="all">{t('allConfidenceLevels')}</option><option value="high">{t('confidenceHigh')}</option><option value="moderate">{t('confidenceModerate')}</option><option value="low">{t('confidenceLow')}</option></select>
        </section>

        <div className="mb-3 text-xs text-text-muted">{t('alertsSummary', { count: filtered.length })}</div>
        <section className="grid gap-5 xl:grid-cols-2">
          {filtered.map((alert) => {
            const incidentType = alert.incidentType ?? 'LIQUIDITY_PRESSURE';
            const priorityLabel = alert.priorityLabel ?? (alert.severity === 'critical' ? 'P1' : alert.severity === 'high' ? 'P2' : 'P3');
            const receiverRole = alert.receiverRole ?? 'FIELD_OFFICER';
            const alternativeExplanations = alert.alternativeExplanations ?? 'Possible operational explanation, such as a holiday market demand surge.';

            return (
              <article key={alert.id} className="card pearl-stripe flex flex-col p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 pl-2">
                  <div>
                    <div className="font-mono text-[10px] font-bold text-bkash">{alert.id} · {alert.timestamp}</div>
                    <h2 className="mt-1 text-lg font-bold">{alert.title}</h2>
                    <div className="mt-1 text-xs text-text-muted">{alert.agentName} · {alert.agentId}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={providerChips[alert.provider]}>{alert.provider === 'shared' ? t('sharedCash') : alert.provider}</span>
                    <SeverityBadge severity={alert.severity} />
                    <span className="badge-medium">{priorityLabel}</span>
                  </div>
                </div>

                {/* Incident Details Grid */}
                <div className="mt-4 grid gap-3 grid-cols-2 md:grid-cols-4 pl-2 text-xs border-b border-bg-border pb-3">
                  <div>
                    <span className="text-text-muted">Incident Type</span>
                    <p className="font-semibold text-text-primary mt-0.5">{incidentType.replaceAll('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-text-muted">Receiver Role</span>
                    <p className="font-semibold text-text-primary mt-0.5">{receiverRole}</p>
                  </div>
                  <div>
                    <span className="text-text-muted">Responsible Stakeholder</span>
                    <p className="font-semibold text-text-primary mt-0.5">{alert.owner}</p>
                  </div>
                  <div>
                    <span className="text-text-muted">Provider Scope</span>
                    <p className="font-semibold text-text-primary mt-0.5">{alert.provider.toUpperCase()}</p>
                  </div>
                </div>

                <div className="mt-4"><BanglaAlertCard textBn={alert.messageBn} textEn={alert.messageEn} severity={alert.severity} /></div>

                {/* Safety Posture Alert Box */}
                <div className="mt-4 bg-high-bg/30 border border-high/20 rounded-xl p-3 text-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-high uppercase tracking-wider block">Operational review required</span>
                    <p className="text-text-secondary">Unusual activity detected. Requires review by responsible stakeholder.</p>
                  </div>
                  <span className="badge-medium font-mono font-bold shrink-0">Human review required</span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-bg-surface p-4">
                     <div className="section-kicker">{t('whyReview')}</div>
                     <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-text-secondary">
                       {alert.evidence.map((item) => <li key={item} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />{item}</li>)}
                     </ul>
                  </div>
                  <div className="rounded-2xl bg-high-bg p-4">
                     <div className="section-kicker text-high">{t('uncertainty')}</div>
                     <p className="mt-2 text-xs leading-relaxed text-text-secondary">{alert.uncertainty}</p>
                     <div className="mt-3 flex items-center justify-between text-xs">
                       <span>{t('confidence')}</span>
                       <strong>{Math.round(alert.confidence * 100)}%</strong>
                     </div>
                     <div className="mt-1 h-1.5 rounded-full bg-bg-card">
                       <div className="h-1.5 rounded-full bg-info" style={{ width: `${alert.confidence * 100}%` }} />
                     </div>
                  </div>
                </div>

                {/* Alternative Explanations */}
                <div className="mt-4 rounded-2xl bg-bg-surface p-4 text-xs">
                  <span className="section-kicker">Possible Operational Explanation</span>
                  <p className="mt-2 text-text-secondary leading-relaxed">{alternativeExplanations}</p>
                </div>

                <div className="mt-4 rounded-2xl border border-teal/20 bg-teal-soft p-4 text-xs leading-relaxed text-text-secondary">
                  <strong className="text-text-primary">{t('safeNextStep')}</strong> {alert.nextStep}
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-bg-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs text-text-muted">{t('owner')} <strong className="text-text-primary">{alert.owner}</strong> · {t('data')} {alert.dataStatus}</span>
                   {alert.caseId && alert.caseStatus === 'New' && !profile.readOnly ? <button type="button" onClick={() => acknowledge(alert)} disabled={busy === alert.id} className="primary-button"><CircleAlert className="h-4 w-4" />{busy === alert.id ? 'Acknowledging' : t('acknowledgeReview')}</button> : alert.caseId ? <Link href="/cases" className="secondary-button"><CheckCircle2 className="h-4 w-4" />{alert.caseStatus ?? 'Open case'}</Link> : <span className="text-xs text-text-muted">No coordination case</span>}
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
