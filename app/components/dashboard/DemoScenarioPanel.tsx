'use client';

import { useState } from 'react';
import { AlertCircle, Info, Shield, Users } from 'lucide-react';

export default function DemoScenarioPanel() {
  const [activeTab, setActiveTab] = useState<'all' | 's1' | 's2' | 's3' | 's4'>('all');

  return (
    <section className="card p-5 border-l-4 border-bkash mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="section-kicker">Simulation Demonstration</span>
          <h2 className="text-xl font-bold text-text-primary mt-1">Prototype Scenarios & Safety Review</h2>
        </div>
        <div className="flex gap-1 text-xs">
          {(['all', 's1', 's2', 's3', 's4'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-1 rounded-md border border-bg-border uppercase font-bold tracking-wider transition ${
                activeTab === tab ? 'bg-bkash text-white border-bkash' : 'bg-bg-hover text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab === 'all' ? 'All' : tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Scenario 1 */}
        {(activeTab === 'all' || activeTab === 's1') && (
          <div className="rounded-xl border border-bg-border bg-bg-surface p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-bkash uppercase tracking-wider flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Section 1
                </span>
                <span className="badge-low text-[10px]">Safe / Critical</span>
              </div>
              <h3 className="font-semibold text-text-primary text-sm">Hidden Provider Shortage</h3>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between border-b border-bg-border pb-1">
                  <span className="text-text-muted">Shared Physical Cash:</span>
                  <span className="text-low font-bold">SAFE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">bKash E-Money:</span>
                  <span className="text-critical font-bold">CRITICAL</span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs italic bg-bg-card p-2 rounded-lg text-text-secondary border border-bg-border leading-relaxed">
              “The agent appears healthy at an aggregate level, but the provider-specific balance reveals service pressure that the aggregate view hides.”
            </p>
          </div>
        )}

        {/* Scenario 2 */}
        {(activeTab === 'all' || activeTab === 's2') && (
          <div className="rounded-xl border border-bg-border bg-bg-surface p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-nagad uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Section 2
                </span>
                <span className="badge-medium text-[10px]">Unusual Activity</span>
              </div>
              <h3 className="font-semibold text-text-primary text-sm">Unusual Activity Patterns</h3>
              <ul className="mt-3 space-y-1 text-xs text-text-secondary">
                <li>• Repeated / near-identical amounts</li>
                <li>• Account concentration</li>
                <li>• Higher transaction velocity</li>
                <li>• Legitimate Eid-demand alternative</li>
              </ul>
            </div>
            <div className="mt-4 bg-high-bg border border-high/20 rounded-lg p-2.5 space-y-1 text-[11px]">
              <div className="font-bold text-high uppercase tracking-wider flex items-center gap-1">
                ⚠️ Required Safety Wording
              </div>
              <div className="grid grid-cols-2 gap-1 text-text-primary font-mono font-medium">
                <div>• Unusual activity</div>
                <div>• Requires review</div>
                <div>• Possible explanation</div>
                <div>• Human review required</div>
              </div>
            </div>
          </div>
        )}

        {/* Scenario 3 */}
        {(activeTab === 'all' || activeTab === 's3') && (
          <div className="rounded-xl border border-bg-border bg-bg-surface p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rocket uppercase tracking-wider flex items-center gap-1">
                  <Info className="h-3 w-3" /> Section 3
                </span>
                <span className="badge-medium text-[10px]">Data Quality</span>
              </div>
              <h3 className="font-semibold text-text-primary text-sm">Bad Data & Stale Feeds</h3>
              <ul className="mt-3 space-y-1.5 text-xs text-text-secondary">
                <li className="flex justify-between">
                  <span>Feed Status:</span>
                  <span className="font-bold text-critical">STALE / MISSING</span>
                </li>
                <li className="flex justify-between">
                  <span>Confidence:</span>
                  <span className="font-bold text-high">FALLS DRASTICALLY</span>
                </li>
                <li className="flex justify-between">
                  <span>Recommendation:</span>
                  <span className="font-bold text-text-primary">CAUTIOUS FALLBACK</span>
                </li>
              </ul>
            </div>
            <p className="mt-4 text-xs bg-bg-card p-2 rounded-lg text-text-secondary border border-bg-border leading-relaxed">
              When feeds recover later, confidence automatically recovers and normal advisory rules are restored.
            </p>
          </div>
        )}

        {/* Scenario 4 */}
        {(activeTab === 'all' || activeTab === 's4') && (
          <div className="rounded-xl border border-bg-border bg-bg-surface p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-teal uppercase tracking-wider flex items-center gap-1">
                  <Users className="h-3 w-3" /> Section 4
                </span>
                <span className="badge-low text-[10px]">Coordination</span>
              </div>
              <h3 className="font-semibold text-text-primary text-sm">Case Coordination Workflow</h3>
              <div className="mt-3 flex items-center justify-between gap-1 text-[10px] text-text-secondary bg-bg-card p-1.5 rounded-lg border border-bg-border font-mono">
                <span>Alert</span>
                <span>→</span>
                <span>Ack</span>
                <span>→</span>
                <span>Assign</span>
                <span>→</span>
                <span>Review</span>
                <span>→</span>
                <span>Resolve</span>
              </div>
            </div>
            <div className="mt-4 text-[10px] text-text-secondary space-y-1 font-medium bg-bg-card p-2 rounded-lg border border-bg-border">
              <div><span className="text-text-muted">Receiver:</span> Routing role (e.g. Field Officer)</div>
              <div><span className="text-text-muted">Owner:</span> Assigned Owner / Lead</div>
              <div><span className="text-text-muted">Acknowledgement:</span> Status & timestamps</div>
              <div><span className="text-text-muted">Resolution:</span> Escalated or Resolved</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
