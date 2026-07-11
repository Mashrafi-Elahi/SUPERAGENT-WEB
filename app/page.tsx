'use client';
import LiveClock from './components/ui/LiveClock';
import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Bell, Store } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import MetricCard from './components/ui/MetricCard';
import AgentTable from './components/dashboard/AgentTable';
import { DashboardAgent, DashboardSummary, getAgents, getDashboardSummary } from '../lib/api/dashboard';

export default function Home() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [agents, setAgents] = useState<DashboardAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);

      const [summaryData, agentsData] = await Promise.all([getDashboardSummary(), getAgents()]);

      if (!active) {
        return;
      }

      setSummary(summaryData);
      setAgents(agentsData);
      setLoading(false);
    }

    loadData();

    const dataRefreshInterval = window.setInterval(loadData, 30000);

    return () => {
      active = false;
      window.clearInterval(dataRefreshInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <Sidebar />
      <main className="ml-60 min-h-screen p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-bangla text-3xl font-bold text-text-primary">লিকুইডিটি ও রিস্ক ড্যাশবোর্ড</h1>
            <p className="mt-2 text-sm text-text-secondary">Super Agent Intelligence Platform</p>
          </div>
          <LiveClock />
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Agents"
            value={summary ? summary.totalAgents.toString() : '—'}
            icon={<Store className="h-5 w-5" />}
            accentColor="bg-bkash text-bkash"
          />
          <MetricCard
            title="Active Alerts"
            value={summary ? summary.activeAlerts.toString() : '—'}
            icon={<Bell className="h-5 w-5" />}
            accentColor="bg-critical text-critical"
          />
          <MetricCard
            title="Critical Cases"
            value={summary ? summary.criticalCases.toString() : '—'}
            icon={<AlertTriangle className="h-5 w-5" />}
            accentColor="bg-critical text-critical"
          />
          <MetricCard
            title="Avg Confidence"
            value={summary ? `${summary.avgConfidence}%` : '—'}
            icon={<Activity className="h-5 w-5" />}
            accentColor="bg-low text-low"
          />
        </div>

        <AgentTable agents={agents} loading={loading} />
      </main>
    </div>
  );
}
