import { demoScenario } from '../../../lib/api/mockData';
import { CalendarDays, Clock3, Database } from 'lucide-react';

export default function ScenarioBadge() {
  return (
    <section aria-label="Demo scenario context" className="card stripe-teal w-full p-px lg:max-w-[720px]">
      <div className="rounded-[11px] bg-bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pl-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-bkash px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">{demoScenario.mode}</span>
            <span className="data-source-pill"><Database className="h-3.5 w-3.5" />{demoScenario.dataSource}</span>
          </div>
          <p className="mt-2 text-xs text-text-muted">Fixed scenario context · prototype demonstration only</p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-left sm:gap-6">
          <div>
            <div className="section-kicker flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Date</div>
            <div className="mt-1 text-xs font-bold text-text-primary sm:text-sm">18 Jun 2026</div>
          </div>
          <div>
            <div className="section-kicker flex items-center gap-1"><Clock3 className="h-3 w-3" /> Time</div>
            <div className="mt-1 text-xs font-bold text-text-primary sm:text-sm">{demoScenario.currentTime}</div>
          </div>
          <div>
            <div className="section-kicker">Shortage</div>
            <div className="mt-1 text-xs font-bold text-high sm:text-sm">{demoScenario.projectedShortageTime}</div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
