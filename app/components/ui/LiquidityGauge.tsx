type LiquidityGaugeProps = {
  currentBalance: number;
  projectedDepletionMinutes: number;
  confidence: number;
  provider: 'bkash' | 'nagad' | 'rocket';
  language?: 'bn' | 'en';
};

export default function LiquidityGauge({
  currentBalance,
  projectedDepletionMinutes,
  confidence,
  provider,
  language = 'en',
}: LiquidityGaugeProps) {
  const percentage = Math.max(0, Math.min(100, currentBalance));
  const fillClass = percentage < 30 ? 'bg-critical' : percentage < 60 ? 'bg-medium' : 'bg-low';
  const providerLabel = provider === 'bkash' ? 'bKash' : provider === 'nagad' ? 'Nagad' : 'Rocket';

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between text-sm text-text-secondary">
        <span>{providerLabel} liquidity</span>
        <span className="tabular">{percentage}%</span>
      </div>

      <div className="h-3 rounded-full bg-bg-hover">
        <div className={`h-3 rounded-full ${fillClass}`} style={{ width: `${percentage}%` }} />
      </div>

      <div className="mt-3 text-sm text-text-secondary">
        Projected depletion: {language === 'bn' ? <span className="font-bangla">~{projectedDepletionMinutes} মিনিটে</span> : <span>~{projectedDepletionMinutes} min</span>}
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs text-text-secondary">
          <span>Confidence: {Math.round(confidence * 100)}%</span>
          <span className="tabular">{providerLabel}</span>
        </div>
        <div className="h-1.5 rounded-full bg-bg-hover">
          <div className={`h-1.5 rounded-full ${fillClass}`} style={{ width: `${Math.round(confidence * 100)}%` }} />
        </div>
      </div>

      {confidence < 0.5 ? (
        <div className="mt-3 text-xs text-stale">⚠ Low confidence — data may be incomplete</div>
      ) : null}
    </div>
  );
}
