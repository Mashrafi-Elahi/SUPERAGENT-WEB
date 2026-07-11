import SeverityBadge from './SeverityBadge';

type BanglaAlertCardProps = {
  textBn: string;
  textEn: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
};

const severityBorder = {
  critical: 'border-critical',
  high: 'border-high',
  medium: 'border-medium',
  low: 'border-low',
} as const;

export default function BanglaAlertCard({ textBn, textEn, severity }: BanglaAlertCardProps) {
  return (
    <div className={`card border-l-4 ${severityBorder[severity]} p-4`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-bangla text-sm text-stale">⚠ সতর্কতা</div>
        <SeverityBadge severity={severity} />
      </div>
      <div className="font-bangla text-sm leading-relaxed text-text-primary">{textBn}</div>
      <div className="mt-2 text-sm italic text-text-secondary">{textEn}</div>
    </div>
  );
}
