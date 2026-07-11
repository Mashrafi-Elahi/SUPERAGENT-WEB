import type { ProviderView } from '../../../lib/api/mockData';

const labels = { bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket' } as const;

export default function LiquidityGauge({ data }: { data: ProviderView }) {
  const capacity = data.capacityMinutes === null ? 0 : Math.min(100, Math.round((data.capacityMinutes / 180) * 100));
  const capacityColor = capacity < 20 ? 'bg-critical' : capacity < 45 ? 'bg-high' : 'bg-teal';
  return <article className="card p-5">
    <div className="flex items-start justify-between gap-3"><div><div className="section-kicker">Provider capacity</div><h3 className="mt-1 font-bold">{labels[data.provider]} liquidity</h3></div><span className={data.confidence < 0.5 ? 'badge-medium' : 'badge-low'}>{Math.round(data.confidence * 100)}% confidence</span></div>
    <div className="mt-5 h-3 overflow-hidden rounded-full bg-bg-hover" role="meter" aria-label={`${labels[data.provider]} service capacity`} aria-valuenow={capacity} aria-valuemin={0} aria-valuemax={100}><div className={`h-full rounded-full ${capacityColor}`} style={{ width: `${capacity}%` }} /></div>
    <div className="mt-3 flex justify-between gap-3 text-xs text-text-secondary"><span>{data.capacityMinutes === null ? 'Capacity unavailable' : `Estimated capacity ~${data.capacityMinutes} min`}</span><span>{data.projectedShortageTime ? `Shortage ${data.projectedShortageTime}` : 'Outside 45-min horizon'}</span></div>
    <p className="mt-4 rounded-xl bg-bg-surface p-3 text-xs leading-relaxed text-text-secondary">{data.safeFallback}</p>
  </article>;
}
