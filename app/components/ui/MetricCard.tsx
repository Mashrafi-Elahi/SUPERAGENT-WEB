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
    <div className="card flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-text-secondary">{title}</div>
          <div className="mt-2 text-2xl font-bold tabular text-text-primary">{value}</div>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${bgClass}/10 ${textClass}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        {subtitle ? <div className="text-sm text-text-secondary">{subtitle}</div> : <span />}
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
