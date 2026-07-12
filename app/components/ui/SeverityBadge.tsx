import { useLanguage } from '../../../lib/i18n';

type Severity = 'critical' | 'high' | 'medium' | 'low';

type SeverityBadgeProps = {
  severity: Severity;
};

const severityMap: Record<Severity, { className: string; labelKey: 'critical' | 'high' | 'medium' | 'low' }> = {
  critical: { className: 'badge-critical', labelKey: 'critical' },
  high: { className: 'badge-high', labelKey: 'high' },
  medium: { className: 'badge-medium', labelKey: 'medium' },
  low: { className: 'badge-low', labelKey: 'low' },
};

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const { t } = useLanguage();
  const config = severityMap[severity];

  return (
    <span className={config.className}>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {t(config.labelKey)}
      </span>
    </span>
  );
}
