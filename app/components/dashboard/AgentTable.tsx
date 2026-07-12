'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowUpRight, MapPin } from 'lucide-react';
import type { DashboardAgent } from '../../../lib/api/dashboard';
import { useLanguage } from '../../../lib/i18n';

type AgentTableProps = { agents: DashboardAgent[]; loading?: boolean };

const formatCash = (amount: number) => `৳${amount.toLocaleString('en-US')}`;

function QualityDot({ quality }: { quality: DashboardAgent['providers']['bkash']['dataQuality'] }) {
  const colors = { fresh: 'bg-fresh', stale: 'bg-stale', missing: 'bg-missing', conflicting: 'bg-conflicting' } as const;
  return <span aria-label={`${quality} data`} className={`h-2 w-2 rounded-full ${colors[quality]}`} />;
}

function ProviderValue({ label, data }: { label: string; data: DashboardAgent['providers']['bkash'] }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-text-muted">{label}</span>
      <span className="flex items-center gap-2 font-semibold text-text-primary"><QualityDot quality={data.dataQuality} />{data.balance === null ? 'Unavailable' : formatCash(data.balance)}</span>
    </div>
  );
}

export default function AgentTable({ agents, loading = false }: AgentTableProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const openAgent = (id: string) => router.push(`/agents/${id}`);

  if (loading) return <div className="card flex min-h-64 items-center justify-center text-sm text-text-muted">{t('commonLoading')}</div>;
  if (agents.length === 0) return <div className="card flex min-h-64 flex-col items-center justify-center gap-3 text-text-secondary"><AlertTriangle className="h-9 w-9 text-text-muted" /><div>{t('noMatchingAgents')}</div></div>;

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {agents.map((agent) => (
          <button key={agent.id} type="button" onClick={() => openAgent(agent.id)} className="card pearl-stripe w-full p-4 text-left">
            <div className="flex items-start justify-between gap-3 pl-2">
              <div>
                <div className="font-mono text-xs font-bold text-bkash">{agent.id}</div>
                <div className="mt-1 font-bold text-text-primary">{agent.name}</div>
                <div className="mt-1 flex items-center gap-1 text-xs text-text-muted"><MapPin className="h-3 w-3" />{agent.area}</div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-text-muted" />
            </div>
            <div className="mt-4 space-y-2 border-t border-bg-border pt-3 text-xs">
              <ProviderValue label={t('sharedCash')} data={{ ...agent.providers.bkash, balance: agent.physicalCash }} />
              <ProviderValue label="bKash" data={agent.providers.bkash} />
              <ProviderValue label="Nagad" data={agent.providers.nagad} />
              <ProviderValue label="Rocket" data={agent.providers.rocket} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2"><span className="text-xs text-text-secondary">{agent.status}</span>{agent.alerts > 0 ? <span className="badge-critical">{agent.alerts} {t('alerts')}</span> : <span className="badge-low">{t('ready')}</span>}</div>
          </button>
        ))}
      </div>

      <div className="card hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full">
            <thead className="bg-bg-surface/70">
              <tr>{[t('agent'), t('area'), t('sharedCash'), 'bKash', 'Nagad', 'Rocket', t('alerts'), t('responsePosture')].map((heading) => <th key={heading} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">{heading}</th>)}</tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} tabIndex={0} onClick={() => openAgent(agent.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openAgent(agent.id); }} className="table-row cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-bkash">
                  <td className="px-4 py-4"><div className="font-semibold text-text-primary">{agent.name}</div><div className="mt-0.5 font-mono text-[10px] text-text-muted">{agent.id}</div></td>
                  <td className="px-4 py-4 text-sm text-text-secondary">{agent.area}</td>
                  <td className="px-4 py-4 text-sm font-bold text-text-primary">{formatCash(agent.physicalCash)}</td>
                  {(['bkash', 'nagad', 'rocket'] as const).map((key) => <td key={key} className="px-4 py-4 text-sm text-text-secondary"><span className="flex items-center gap-2"><QualityDot quality={agent.providers[key].dataQuality} />{agent.providers[key].balance === null ? '—' : formatCash(agent.providers[key].balance!)}</span></td>)}
                  <td className="px-4 py-4">{agent.alerts ? <span className="badge-critical">{agent.alerts}</span> : <span className="badge-low">0</span>}</td>
                  <td className="px-4 py-4 text-xs font-medium text-text-secondary">{agent.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
