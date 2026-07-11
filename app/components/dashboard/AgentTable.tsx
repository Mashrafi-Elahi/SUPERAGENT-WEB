'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { DashboardAgent } from '../../../lib/api/dashboard';

type AgentTableProps = {
  agents: DashboardAgent[];
  loading?: boolean;
};

function formatCash(amount: number) {
  return amount.toLocaleString('en-US');
}

function ProviderCell({ balance, dataQuality }: { balance: number | null; dataQuality: DashboardAgent['providers']['bkash']['dataQuality'] }) {
  if (dataQuality === 'missing' || balance === null) {
    return <span className="text-text-muted">—</span>;
  }

  return (
    <span className="flex items-center gap-2 tabular">
      <span className={`h-2 w-2 rounded-full quality-${dataQuality}`} />
      <span>{formatCash(balance)}</span>
    </span>
  );
}

export default function AgentTable({ agents, loading = false }: AgentTableProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="card overflow-hidden">
        <div className="grid grid-cols-10 gap-4 border-b border-bg-border px-4 py-3 text-xs text-text-muted">
          {['Agent ID', 'Name', 'Area', 'Physical Cash', 'bKash', 'Nagad', 'Rocket', 'Alerts', 'Status', ''].map((heading) => (
            <div key={heading}>{heading}</div>
          ))}
        </div>
        <div className="divide-y divide-bg-border">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-10 gap-4 px-4 py-4">
              {Array.from({ length: 10 }).map((__, cellIndex) => (
                <div key={cellIndex} className="h-4 animate-pulse rounded bg-bg-hover" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="card flex min-h-[280px] flex-col items-center justify-center gap-3 text-text-secondary">
        <AlertTriangle className="h-10 w-10 text-text-muted" />
        <div>No agents found</div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-bg-surface/70">
            <tr className="border-b border-bg-border text-left">
              {['Agent ID', 'Name', 'Area', 'Physical Cash', 'bKash', 'Nagad', 'Rocket', 'Alerts', 'Status'].map((heading) => (
                <th key={heading} className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-text-muted">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr
                key={agent.id}
                className="cursor-pointer border-b border-bg-border transition-colors hover:bg-bg-hover"
                onClick={() => router.push(`/agents/${agent.id}`)}
              >
                <td className="px-4 py-3 font-mono text-sm text-text-primary">{agent.id}</td>
                <td className="px-4 py-3 text-sm text-text-primary">{agent.name}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{agent.area}</td>
                <td className={`px-4 py-3 text-sm font-semibold ${agent.physicalCash < 10000 ? 'text-critical' : agent.physicalCash < 25000 ? 'text-medium' : 'text-text-primary'}`}>
                  {formatCash(agent.physicalCash)}
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">
                  <ProviderCell balance={agent.providers.bkash.balance} dataQuality={agent.providers.bkash.dataQuality} />
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">
                  <ProviderCell balance={agent.providers.nagad.balance} dataQuality={agent.providers.nagad.dataQuality} />
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">
                  <ProviderCell balance={agent.providers.rocket.balance} dataQuality={agent.providers.rocket.dataQuality} />
                </td>
                <td className="px-4 py-3 text-sm">
                  {agent.alerts > 0 ? <span className="badge-critical tabular">{agent.alerts}</span> : <span className="text-text-muted">—</span>}
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">{agent.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
