type Severity = 'critical' | 'high' | 'medium' | 'low';

type SeverityBadgeProps = {
  severity: Severity;
};

const severityMap: Record<Severity, { className: string; label: string }> = {
  critical: { className: 'badge-critical', label: 'Critical' },
  high: { className: 'badge-high', label: 'High' },
  medium: { className: 'badge-medium', label: 'Medium' },
  low: { className: 'badge-low', label: 'Low' },
};

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = severityMap[severity];

  return (
    <span className={config.className}>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {config.label}
      </span>
    </span>
  );
}
