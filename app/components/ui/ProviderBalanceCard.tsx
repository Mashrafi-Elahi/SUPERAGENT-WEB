import { demoScenario, type ProviderView } from '../../../lib/api/mockData';

const providerConfig = {
  bkash: { chip: 'chip-bkash', border: 'border-bkash', label: 'bKash' },
  nagad: { chip: 'chip-nagad', border: 'border-nagad', label: 'Nagad' },
  rocket: { chip: 'chip-rocket', border: 'border-rocket', label: 'Rocket' },
} as const;

const qualityConfig = {
  fresh: { label: 'Fresh', dot: 'bg-fresh', text: 'quality-fresh' },
  stale: { label: 'Delayed', dot: 'bg-stale', text: 'quality-stale' },
  missing: { label: 'Missing', dot: 'bg-missing', text: 'quality-missing' },
  conflicting: { label: 'Conflicting', dot: 'bg-conflicting', text: 'quality-conflicting' },
} as const;

function scenarioAge(lastUpdated: string) {
  const age = Math.max(0, Math.round((new Date(demoScenario.currentTimestamp).getTime() - new Date(lastUpdated).getTime()) / 60_000));
  return age === 0 ? 'At scenario time' : `${age} scenario min ago`;
}

export default function ProviderBalanceCard({ data }: { data: ProviderView }) {
  const provider = providerConfig[data.provider];
  const quality = qualityConfig[data.dataQuality];
  return (
    <article className={`card pearl-stripe border-l-0 p-5`}>
      <div className="flex items-start justify-between gap-3 pl-2"><span className={provider.chip}>{provider.label}</span><span className={`text-[10px] font-semibold ${quality.text}`}>{scenarioAge(data.lastUpdated)}</span></div>
      <div className="mt-4 pl-2 text-2xl font-extrabold tabular text-text-primary">{data.balance === null ? 'Unavailable' : `৳${data.balance.toLocaleString('en-US')}`}</div>
      <div className="mt-2 flex items-center gap-2 pl-2 text-xs text-text-secondary"><span className={`h-2.5 w-2.5 rounded-full ${quality.dot}`} /><span>{quality.label} provider data</span></div>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-bg-border pt-4 text-xs">
        <div><dt className="text-text-muted">Demand rate</dt><dd className="mt-1 font-bold text-text-primary">৳{data.demandRate.toLocaleString()}/min</dd></div>
        <div><dt className="text-text-muted">Service capacity</dt><dd className="mt-1 font-bold text-text-primary">{data.capacityMinutes === null ? 'Insufficient data' : `~${data.capacityMinutes} min`}</dd></div>
        <div><dt className="text-text-muted">Projected shortage</dt><dd className="mt-1 font-bold text-text-primary">{data.projectedShortageTime ?? 'Not within horizon'}</dd></div>
        <div><dt className="text-text-muted">Confidence</dt><dd className="mt-1 font-bold text-text-primary">{Math.round(data.confidence * 100)}%</dd></div>
      </dl>
      {data.dataQuality !== 'fresh' && <div className="mt-4 rounded-xl border border-high/20 bg-high-bg p-3 text-xs leading-relaxed text-text-secondary"><strong className="text-high">Safe fallback:</strong> {data.safeFallback}</div>}
    </article>
  );
}
