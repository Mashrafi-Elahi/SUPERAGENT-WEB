import SeverityBadge from './SeverityBadge';
import { useLanguage } from '../../../lib/i18n';

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
  const { language, t } = useLanguage();

  return (
    <div className={`card border-l-4 ${severityBorder[severity]} p-4`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className={language === 'bn' ? 'font-bangla text-sm text-stale' : 'text-sm font-semibold text-stale'}>{language === 'bn' ? 'সতর্কতা' : t('alerts')}</div>
        <SeverityBadge severity={severity} />
      </div>
      <div className={`${language === 'bn' ? 'font-bangla' : ''} text-sm leading-relaxed text-text-primary`}>
        {language === 'bn' ? textBn : textEn}
      </div>
    </div>
  );
}
