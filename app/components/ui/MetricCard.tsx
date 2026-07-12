import { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

type MetricCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  trendUp?: boolean;
  icon: ReactNode;
  accentColor?: string;
};

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendUp = true,
  icon,
  accentColor = 'bg-bkash text-bkash',
}: MetricCardProps) {
  const [bgClass, textClass] = accentColor.split(' ');

  return (
    <div className="card flex min-h-[132px] flex-col justify-between p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{title}</div>
          <div className="mt-3 text-2xl font-semibold tabular text-text-primary">{value}</div>
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bgClass}/10 ${textClass}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 pt-4">
        {subtitle ? <div className="text-xs leading-relaxed text-text-secondary">{subtitle}</div> : <span />}
        {typeof trend === 'number' ? (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-low' : 'text-critical'}`}>
            {trendUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            <span>{trend}%</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
