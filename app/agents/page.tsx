'use client';

import { useEffect, useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import AgentTable from '../components/dashboard/AgentTable';
import ScenarioBadge from '../components/ui/ScenarioBadge';
import { getAgents, type DashboardAgent } from '../../lib/api/dashboard';
import { mockAgents, type DataQuality, type ProviderKey } from '../../lib/api/mockData';
import { useLanguage } from '../../lib/i18n';
import { useViewerProfile, visibleProviderKeys } from '../../lib/viewerProfile';

export default function AgentsPage() {
  const { t } = useLanguage();
  const profile = useViewerProfile();
  const [agents, setAgents] = useState<DashboardAgent[]>(mockAgents);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('all');
  const [provider, setProvider] = useState<'all' | ProviderKey>('all');
  const [quality, setQuality] = useState<'all' | DataQuality>('all');
  const visibleProviders = useMemo(() => visibleProviderKeys(profile.scope), [profile.scope]);

  useEffect(() => { getAgents(profile.scope).then(setAgents); }, [profile.id, profile.scope]);
  const areas = useMemo(() => ['all', ...Array.from(new Set(agents.map((agent) => agent.area)))], [agents]);
  const filtered = agents.filter((agent) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || agent.name.toLowerCase().includes(query) || agent.id.toLowerCase().includes(query);
    const matchesArea = area === 'all' || agent.area === area;
    const scopedProvider = provider === 'all' ? visibleProviders : [provider];
    const matchesProvider = provider === 'all' || visibleProviders.includes(provider) && agent.providers[provider].balance !== null;
    const matchesQuality = quality === 'all' || scopedProvider.some((item) => agent.providers[item].dataQuality === quality);
    return matchesSearch && matchesArea && matchesProvider && matchesQuality;
  });

  return (
    <div className="min-h-screen text-text-primary">
      <Sidebar />
      <main className="app-main">
        <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div><div className="section-kicker">{t('agentOperations')}</div><h1 className="mt-2 text-3xl font-extrabold">{t('superAgentOutlets')}</h1><p className="mt-2 text-sm text-text-secondary">{t('prioritizeOutlets')}</p></div>
          <ScenarioBadge />
        </header>

        <section aria-label="Agent filters" className="card pearl-stripe mb-6 p-4 sm:p-5">
          <div className="grid gap-3 pl-2 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <label className="relative"><span className="sr-only">{t('searchAgents')}</span><Search className="absolute left-3 top-3.5 h-4 w-4 text-text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchAgents')} className="filter-control w-full pl-10" /></label>
            <label><span className="sr-only">{t('area')}</span><select value={area} onChange={(event) => setArea(event.target.value)} className="filter-control w-full"><option value="all">{t('allAreas')}</option>{areas.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span className="sr-only">Provider</span><select value={provider} onChange={(event) => setProvider(event.target.value as typeof provider)} className="filter-control w-full"><option value="all">{t('allProviders')}</option><option value="bkash">bKash</option><option value="nagad">Nagad</option><option value="rocket">Rocket</option></select></label>
            <label><span className="sr-only">Data status</span><select value={quality} onChange={(event) => setQuality(event.target.value as typeof quality)} className="filter-control w-full"><option value="all">{t('allDataStates')}</option><option value="fresh">{t('fresh')}</option><option value="stale">{t('delayed')}</option><option value="missing">{t('missing')}</option><option value="conflicting">{t('conflicting')}</option></select></label>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 pl-2 text-xs text-text-muted"><span className="flex items-center gap-1.5"><Filter className="h-3.5 w-3.5" />{t('showingOutlets', { shown: filtered.length, total: agents.length })}</span><span>{t('currentDemoPeriod')}</span></div>
        </section>

        <AgentTable agents={filtered} visibleProviders={visibleProviders} />
      </main>
    </div>
  );
}
