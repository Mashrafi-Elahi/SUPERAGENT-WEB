'use client';

import { FastForward, Play, RotateCcw, Server } from 'lucide-react';
import { ReactNode } from 'react';
import { BackendStatus } from '../../../lib/api/dashboard';

type BackendOperationsPanelProps = {
  status: BackendStatus | null;
  busyAction: string | null;
  onStep: () => void;
  onAdvance: () => void;
  onReset: () => void;
};

function formatPercent(value: number | undefined) {
  return `${Math.round(value ?? 0)}%`;
}

function formatTime(value: string | null | undefined) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleTimeString('en-BD', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ActionButton({
  label,
  icon,
  busy,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-bg-border bg-bg-hover px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:border-bkash/50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {icon}
      <span>{busy ? 'Working' : label}</span>
    </button>
  );
}

export default function BackendOperationsPanel({
  status,
  busyAction,
  onStep,
  onAdvance,
  onReset,
}: BackendOperationsPanelProps) {
  const health = status?.health;
  const replay = status?.replay;
  const isHealthy = health?.status === 'healthy';

  return (
    <section className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.75fr)]">
      <div className="card p-5">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
              <Server className="h-4 w-4" />
              Backend API
            </div>
            <div className="mt-2 text-2xl font-semibold text-text-primary">
              {health?.service ?? 'Waiting for service'}
            </div>
            <div className="mt-1 text-sm text-text-muted">
              {health ? `${health.environment} · v${health.version} · database ${health.database}` : 'Start the FastAPI server to load the simulated dataset.'}
            </div>
          </div>
          <span className={isHealthy ? 'badge-low' : 'badge-medium'}>
            {health?.status ?? 'offline'}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-text-muted">Replay</div>
            <div className="mt-1 text-lg font-semibold text-text-primary">{replay?.status ?? '—'}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-text-muted">Progress</div>
            <div className="mt-1 text-lg font-semibold tabular text-text-primary">
              {formatPercent(replay?.completion_percentage)}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-text-muted">Processed</div>
            <div className="mt-1 text-lg font-semibold tabular text-text-primary">
              {replay?.processed_events ?? 0}/{replay?.total_events ?? 0}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-text-muted">Simulation time</div>
            <div className="mt-1 text-lg font-semibold tabular text-text-primary">
              {formatTime(replay?.simulation_time)}
            </div>
          </div>
        </div>

        <div className="mt-5 h-2 rounded-full bg-bg-hover">
          <div
            className="h-2 rounded-full bg-bkash transition-all"
            style={{ width: `${Math.max(0, Math.min(100, replay?.completion_percentage ?? 0))}%` }}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <ActionButton
            label="Step 10"
            icon={<Play className="h-4 w-4" />}
            busy={busyAction === 'step'}
            onClick={onStep}
          />
          <ActionButton
            label="Advance 30m"
            icon={<FastForward className="h-4 w-4" />}
            busy={busyAction === 'advance'}
            onClick={onAdvance}
          />
          <ActionButton
            label="Reset"
            icon={<RotateCcw className="h-4 w-4" />}
            busy={busyAction === 'reset'}
            onClick={onReset}
          />
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-text-secondary">Recent replay events</div>
            <div className="mt-1 text-xs text-text-muted">Latest processed backend events</div>
          </div>
          <span className="text-xs tabular text-text-muted">{status?.recentEvents.length ?? 0}</span>
        </div>

        <div className="space-y-3">
          {(status?.recentEvents ?? []).length > 0 ? (
            status?.recentEvents.map((event) => (
              <div key={event.event_id} className="rounded-lg border border-bg-border bg-bg-surface px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-text-primary">{event.event_id}</span>
                  <span className={`chip-${event.provider_id.toLowerCase() as 'bkash' | 'nagad' | 'rocket'}`}>
                    {event.provider_id}
                  </span>
                </div>
                <div className="mt-1 text-sm text-text-secondary">{event.agent_id} · {event.event_type}</div>
                <div className="mt-1 truncate text-xs text-text-muted">{event.action}</div>
              </div>
            ))
          ) : (
            <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-dashed border-bg-border text-sm text-text-muted">
              No replay events yet
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
