'use client';

import { chartLiquidityData, chartVelocityData } from '../../../lib/api/mockData';

export function LiquidityProjectionChart() {
  const width = 500;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 30, left: 55 };

  const maxVal = 260000;

  // Helper to map values to coordinates
  const getX = (index: number) => {
    const steps = chartLiquidityData.length - 1;
    return padding.left + (index / steps) * (width - padding.left - padding.right);
  };

  const getY = (val: number) => {
    const chartHeight = height - padding.top - padding.bottom;
    return height - padding.bottom - (val / maxVal) * chartHeight;
  };

  // Build SVG Paths
  const buildLinePath = (key: 'cash' | 'bkash' | 'nagad' | 'rocket') => {
    return chartLiquidityData
      .map((d, i) => {
        const x = getX(i);
        const y = getY(d[key]);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const buildAreaPath = (key: 'cash' | 'bkash' | 'nagad' | 'rocket') => {
    const linePath = buildLinePath(key);
    const startX = getX(0);
    const endX = getX(chartLiquidityData.length - 1);
    const baseY = getY(0);
    return `${linePath} L ${endX.toFixed(1)} ${baseY.toFixed(1)} L ${startX.toFixed(1)} ${baseY.toFixed(1)} Z`;
  };

  return (
    <div className="card pearl-stripe p-5">
      <div className="mb-4 flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Shared Cash & E-Money Projections</h3>
          <p className="text-xs text-text-secondary">Projected balances for the current scenario window</p>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs sm:mt-0">
          <span className="flex items-center gap-1.5 text-text-primary">
            <span className="h-2 w-2 rounded-full bg-critical" /> Cash Drawer
          </span>
          <span className="flex items-center gap-1.5 text-text-primary">
            <span className="h-2 w-2 rounded-full bg-bkash" /> bKash
          </span>
          <span className="flex items-center gap-1.5 text-text-primary">
            <span className="h-2 w-2 rounded-full bg-nagad" /> Nagad
          </span>
          <span className="flex items-center gap-1.5 text-text-primary">
            <span className="h-2 w-2 rounded-full bg-rocket" /> Rocket
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full pl-1" role="img" aria-label="Projected shared cash and separate provider e-money balances from 4:05 PM to 5:20 PM">
          <title>Simulated liquidity projection. Shared cash declines to zero at 5:20 PM while provider balances remain separate.</title>
          {/* Y Axis Gridlines */}
          {[0, 50000, 100000, 150000, 200000, 250000].map((gridVal) => {
            const y = getY(gridVal);
            return (
              <g key={gridVal} className="opacity-30">
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-bg-border"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="9"
                  className="fill-text-secondary font-mono"
                >
                  ৳{(gridVal / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}

          {/* Area Gradients */}
          <defs>
            <linearGradient id="grad-cash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--critical)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--critical)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="grad-bkash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-pink)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="var(--primary-pink)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Render Areas */}
          <path d={buildAreaPath('bkash')} fill="url(#grad-bkash)" />
          <path d={buildAreaPath('cash')} fill="url(#grad-cash)" />

          {/* Render Lines */}
          <path d={buildLinePath('bkash')} fill="none" stroke="var(--primary-pink)" strokeWidth="2" />
          <path d={buildLinePath('nagad')} fill="none" stroke="var(--color-nagad)" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d={buildLinePath('rocket')} fill="none" stroke="var(--color-rocket)" strokeWidth="1.5" />
          <path d={buildLinePath('cash')} fill="none" stroke="var(--critical)" strokeWidth="2.5" />

          {/* Shortage Marker line at 5:20 PM */}
          <line
            x1={getX(6)}
            y1={padding.top}
            x2={getX(6)}
            y2={height - padding.bottom}
            stroke="var(--critical)"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          <text
            x={getX(6) - 6}
            y={padding.top + 15}
            textAnchor="end"
            fontSize="9"
            fontWeight="bold"
            className="fill-critical font-bangla"
          >
            ৫:২০ PM cash reserve
          </text>

          {/* Scenario Time Marker (4:35 PM) */}
          <circle cx={getX(3)} cy={getY(chartLiquidityData[3].cash)} r="5" fill="var(--critical)" />
          <line
            x1={getX(3)}
            y1={padding.top}
            x2={getX(3)}
            y2={height - padding.bottom}
            stroke="var(--text-muted)"
            strokeWidth="1"
            strokeDasharray="1 3"
          />

          {/* X Axis Labels */}
          {chartLiquidityData.map((d, i) => {
            const x = getX(i);
            const isCurrent = i === 3;
            return (
              <text
                key={d.time}
                x={x}
                y={height - padding.bottom + 16}
                textAnchor="middle"
                fontSize="9"
                className={`font-mono ${isCurrent ? 'fill-bkash font-bold' : 'fill-text-secondary'}`}
              >
                {d.time}
              </text>
            );
          })}
        </svg>
      </div>
      <div className="mt-2 text-center text-[10px] text-text-muted italic">
        Simulated projection based on the 4:35 PM scenario window.
      </div>
    </div>
  );
}

export function TransactionVelocityChart() {
  const width = 500;
  const height = 180;
  const padding = { top: 15, right: 20, bottom: 35, left: 40 };
  const maxVal = 60;

  const getX = (index: number) => {
    const steps = chartVelocityData.length;
    return padding.left + (index + 0.3) * ((width - padding.left - padding.right) / steps);
  };

  const getBarWidth = () => {
    return ((width - padding.left - padding.right) / chartVelocityData.length) * 0.3;
  };

  const getY = (val: number) => {
    const chartHeight = height - padding.top - padding.bottom;
    return height - padding.bottom - (val / maxVal) * chartHeight;
  };

  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Simulated Transaction Velocity</h3>
          <p className="text-xs text-text-secondary">Number of requests in 12-minute analysis windows</p>
        </div>
        <div className="mt-2 flex gap-3 text-xs sm:mt-0">
          <span className="flex items-center gap-1.5 text-text-primary">
            <span className="h-2 w-2 rounded-full bg-low" /> Cash-In
          </span>
          <span className="flex items-center gap-1.5 text-text-primary">
            <span className="h-2 w-2 rounded-full bg-bkash" /> Cash-Out
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Simulated cash-in and cash-out request counts in fixed scenario windows">
          <title>Cash-out request velocity peaks at 4:35 PM in the simulated analysis window.</title>
          {/* Y Axis Gridlines */}
          {[0, 20, 40, 60].map((gridVal) => {
            const y = getY(gridVal);
            return (
              <g key={gridVal} className="opacity-30">
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-bg-border"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  className="fill-text-secondary font-mono"
                >
                  {gridVal}
                </text>
              </g>
            );
          })}

          {/* Bar rendering */}
          {chartVelocityData.map((d, i) => {
            const x = getX(i);
            const w = getBarWidth();
            const yIn = getY(d.cashIn);
            const yOut = getY(d.cashOut);
            const hIn = height - padding.bottom - yIn;
            const hOut = height - padding.bottom - yOut;

            const isSpike = i === 3; // 4:35 PM spike

            return (
              <g key={d.time}>
                {/* Cash-In Bar */}
                <rect
                  x={x}
                  y={yIn}
                  width={w}
                  height={Math.max(2, hIn)}
                  fill="var(--low)"
                  rx="1.5"
                  className="opacity-80"
                ><title>{`${d.time}: ${d.cashIn} cash-in requests`}</title></rect>
                {/* Cash-Out Bar */}
                <rect
                  x={x + w + 2}
                  y={yOut}
                  width={w}
                  height={Math.max(2, hOut)}
                  fill={isSpike ? 'var(--primary-pink)' : 'var(--pink-stripe)'}
                  rx="1.5"
                ><title>{`${d.time}: ${d.cashOut} cash-out requests`}</title></rect>
                
                {/* Spike highlight text */}
                {isSpike && (
                  <text
                    x={x + w + 1}
                    y={yOut - 5}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="bold"
                    className="fill-bkash"
                  >
                    Velocity Spike!
                  </text>
                )}

                {/* X Axis label */}
                <text
                  x={x + w}
                  y={height - padding.bottom + 14}
                  textAnchor="middle"
                  fontSize="9"
                  className={`font-mono ${isSpike ? 'fill-bkash font-bold' : 'fill-text-secondary'}`}
                >
                  {d.time}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-2 text-[10px] text-text-muted">Text summary: cash-out requests rise from 20 to 48 by 4:35 PM, exceeding cash-in demand and increasing shared-cash pressure.</p>
    </div>
  );
}
