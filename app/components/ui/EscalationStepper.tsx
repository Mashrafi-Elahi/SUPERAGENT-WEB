type EscalationStepperProps = {
  path: string[];
  currentLevel: number;
  status: string;
};

const steps = [
  { key: 'agent', label: 'Agent' },
  { key: 'field_officer', label: 'Field Officer' },
  { key: 'provider_operations', label: 'Provider Operations' },
  { key: 'risk_reviewer', label: 'Risk Reviewer' },
];

export default function EscalationStepper({ path, currentLevel, status }: EscalationStepperProps) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-4 overflow-x-auto">
        {steps.map((step, index) => {
          const activeIndex = Math.max(0, Math.min(steps.length - 1, currentLevel));
          const isDone = index < activeIndex;
          const isCurrent = index === activeIndex;
          const circleClass = isDone
            ? 'bg-low text-bg-base'
            : isCurrent
              ? 'bg-bkash text-white'
              : 'border border-bg-border bg-bg-surface text-text-muted';

          return (
            <div key={step.key} className="flex min-w-[92px] flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                 {index > 0 ? <div className={`h-px flex-1 ${index <= activeIndex ? 'bg-teal/60' : 'border-t border-dashed border-bg-border'}`} /> : null}
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${circleClass}`}>
                  {isDone ? '✓' : index + 1}
                </div>
                 {index < steps.length - 1 ? <div className={`h-px flex-1 ${index < activeIndex ? 'bg-teal/60' : 'border-t border-dashed border-bg-border'}`} /> : null}
              </div>
              <div className={`mt-2 text-center text-xs ${isCurrent ? 'text-bkash' : 'text-text-secondary'}`}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-text-secondary">{status}{path.length > 0 ? ` · ${path.join(' → ')}` : ''}</div>
    </div>
  );
}
