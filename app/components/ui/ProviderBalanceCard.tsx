type Provider = 'bkash' | 'nagad' | 'rocket';

type DataQuality = 'fresh' | 'stale' | 'missing' | 'conflicting';

type ProviderBalanceCardProps = {
  provider: Provider;
  balance: number | null;
  dataQuality: DataQuality;
  lastUpdated: string;
};

const providerConfig = {
  bkash: { chip: 'chip-bkash', border: 'border-bkash', label: 'bKash' },
  nagad: { chip: 'chip-nagad', border: 'border-nagad', label: 'Nagad' },
  rocket: { chip: 'chip-rocket', border: 'border-rocket', label: 'Rocket' },
} as const;

const qualityLabel = {
  fresh: 'Fresh',
  stale: 'Stale',
  missing: 'Missing',
  conflicting: 'Conflicting',
} as const;

function formatRelativeTime(lastUpdated: string) {
  const diffMs = Date.now() - new Date(lastUpdated).getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const hours = Math.round(diffMinutes / 60);
  return `${hours}h ago`;
}

function formatBDT(balance: number) {
  if (balance >= 100000) {
    return `${(balance / 100000).toFixed(1)} লাখ`;
  }

  return balance.toLocaleString('en-US');
}

export default function ProviderBalanceCard({ provider, balance, dataQuality, lastUpdated }: ProviderBalanceCardProps) {
  const config = providerConfig[provider];
  const qualityClass = `quality-${dataQuality}`;
  const qualityDotClass = {
    fresh: 'bg-fresh',
    stale: 'bg-stale',
    missing: 'bg-missing',
    conflicting: 'bg-conflicting',
  }[dataQuality];

  return (
    <div className={`card border-l-2 ${config.border} p-4`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className={config.chip}>{config.label}</span>
        <span className={`text-xs ${qualityClass}`}>{formatRelativeTime(lastUpdated)}</span>
      </div>

      <div className="text-xl font-bold tabular text-text-primary">
        {balance === null ? '—' : `৳${formatBDT(balance)}`}
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
        <span className={`h-2.5 w-2.5 rounded-full ${qualityDotClass}`} />
        <span>{qualityLabel[dataQuality]}</span>
      </div>

      {(dataQuality === 'stale' || dataQuality === 'missing') ? (
        <div className="mt-4 rounded-lg border border-medium/30 bg-medium-bg px-3 py-2 text-xs text-medium">
          Data may be outdated
        </div>
      ) : null}
    </div>
  );
}
