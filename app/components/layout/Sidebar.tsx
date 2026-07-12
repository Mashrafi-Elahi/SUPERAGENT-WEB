'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Activity, Bell, Check, ChevronDown, ClipboardList, GitBranch, LayoutDashboard, Menu, Network, Store, UserRound, Wifi, WifiOff } from 'lucide-react';
import { usePathname } from 'next/navigation';
import ThemeToggle from '../ui/ThemeToggle';
import { getBackendStatus, getDashboardData, type BackendStatus, type DashboardAgent } from '../../../lib/api/dashboard';
import { getCases } from '../../../lib/api/operations';
import type { MockCase } from '../../../lib/api/mockData';
import { useLanguage } from '../../../lib/i18n';
import { agentViewerProfiles, setViewerProfile, useViewerProfile, viewerProfiles, visibleProviderKeys, type ViewerProfile } from '../../../lib/viewerProfile';

const navigation = [
  { key: 'overview', mobileKey: 'home', href: '/', icon: LayoutDashboard },
  { key: 'agents', mobileKey: 'agents', href: '/agents', icon: Store },
  { key: 'alerts', mobileKey: 'alerts', href: '/alerts', icon: Bell },
  { key: 'cases', mobileKey: 'cases', href: '/cases', icon: GitBranch },
  { key: 'auditTrail', mobileKey: 'auditTrail', href: '/audit', icon: ClipboardList },
] as const;

const providerMeta = {
  bkash: { name: 'bKash', color: 'var(--primary-pink)' },
  nagad: { name: 'Nagad', color: 'var(--color-nagad)' },
  rocket: { name: 'Rocket', color: 'var(--color-rocket)' },
} as const;

type ProviderKey = keyof typeof providerMeta;
type FeedTone = { label: string; color: string };

function worstQuality(agents: DashboardAgent[], provider: ProviderKey, labels: Record<'missing' | 'conflict' | 'delayed' | 'fresh' | 'noFeed', string>): FeedTone {
  const qualities = agents.map((agent) => agent.providers[provider].dataQuality);
  if (qualities.includes('missing')) return { label: labels.missing, color: 'var(--critical)' };
  if (qualities.includes('conflicting')) return { label: labels.conflict, color: 'var(--warning)' };
  if (qualities.includes('stale')) return { label: labels.delayed, color: 'var(--warning)' };
  if (qualities.length > 0) return { label: labels.fresh, color: 'var(--success)' };
  return { label: labels.noFeed, color: 'var(--text-muted)' };
}

function formatSyncTime(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  return new Date(value).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' });
}

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center rounded-lg border border-bg-border bg-bg-card p-0.5 text-xs font-medium" role="group" aria-label="Language">
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        className={`rounded-md px-2 py-1 transition-colors ${language === 'en' ? 'bg-teal/15 text-teal' : 'text-text-muted hover:text-text-primary'}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('bn')}
        aria-pressed={language === 'bn'}
        className={`rounded-md px-2 py-1 font-bangla transition-colors ${language === 'bn' ? 'bg-teal/15 text-teal' : 'text-text-muted hover:text-text-primary'}`}
      >
        বাংলা
      </button>
    </div>
  );
}

function RoleSwitcher({ cases }: { cases: MockCase[] }) {
  const { t } = useLanguage();
  const menuRef = useRef<HTMLDivElement>(null);
  const profile = useViewerProfile();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.roleView = profile.scope.viewerRole;
  }, [profile.scope.viewerRole]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener('mousedown', closeOnOutsideClick);
    return () => window.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  function selectProfile(next: ViewerProfile) {
    setViewerProfile(next.id);
    setOpen(false);
  }

  return (
    <div ref={menuRef} className="relative block">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 min-w-0 items-center justify-between gap-2 rounded-lg border border-bg-border bg-bg-card px-2 text-xs font-medium text-text-secondary shadow-card transition hover:border-teal/45 hover:text-text-primary md:min-w-[244px] md:px-3"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Role view"
      >
        <span className="flex min-w-0 items-center gap-2">
          <UserRound className="h-3.5 w-3.5 shrink-0 text-teal" />
          <span className="max-w-24 truncate font-semibold text-text-primary md:max-w-none">{profile.label}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-text-muted">
          <span className="hidden md:inline">{profile.readOnly ? 'read-only' : `${cases.length} ${t('casesCount')}`}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Role view"
          className="absolute right-0 top-11 z-[80] w-[244px] overflow-hidden rounded-lg border border-bg-border bg-bg-card p-1 text-sm text-text-primary shadow-card"
        >
          {viewerProfiles.filter((item) => item.scope.viewerRole !== 'AGENT').map((item) => {
            const active = item.id === profile.id;
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => selectProfile(item)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition ${active ? 'bg-teal/15 text-teal' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{item.label}</span>
                  <span className="block truncate text-[10px] opacity-70">{item.description}</span>
                </span>
                <span className="flex items-center gap-2 text-xs">
                  {item.readOnly ? 'view' : ''}
                  {active && <Check className="h-3.5 w-3.5" />}
                </span>
              </button>
            );
          })}
          <div className="mx-2 my-1 border-t border-bg-border pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">Agent outlet</div>
          <div className="grid grid-cols-3 gap-1 px-1 pb-1">
            {agentViewerProfiles.map((item) => {
              const active = item.id === profile.id;
              return <button key={item.id} type="button" role="option" aria-selected={active} onClick={() => selectProfile(item)} className={`rounded-md px-2 py-2 text-xs font-semibold transition ${active ? 'bg-teal text-white' : 'bg-bg-surface text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}>{item.scope.viewerAgentId}</button>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { t, language } = useLanguage();
  const profile = useViewerProfile();
  const pathname = usePathname();
  const [agents, setAgents] = useState<DashboardAgent[]>([]);
  const [backend, setBackend] = useState<BackendStatus | null>(null);
  const [source, setSource] = useState<'checking' | 'backend-api' | 'mock-fallback'>('checking');
  const [cases, setCases] = useState<MockCase[]>([]);
  const visibleProviders = useMemo(() => visibleProviderKeys(profile.scope), [profile.scope]);

  useEffect(() => {
    let active = true;
    Promise.all([getDashboardData(profile.scope), getBackendStatus(), getCases(language, false, profile.scope)]).then(([dashboard, nextBackend, caseResult]) => {
      if (!active) return;
      setAgents(dashboard.agents);
      setSource(dashboard.source);
      setBackend(nextBackend);
      setCases(caseResult.data);
    });
    return () => { active = false; };
  }, [language, profile.id, profile.scope]);

  const providerStatuses = useMemo(
    () => visibleProviders.map((key) => ({
      key,
      ...providerMeta[key],
      ...worstQuality(agents, key, {
        missing: t('missing'),
        conflict: t('conflict'),
        delayed: t('delayed'),
        fresh: t('fresh'),
        noFeed: t('noFeed'),
      }),
    })),
    [agents, t, visibleProviders],
  );

  const replayTime = formatSyncTime(backend?.replay?.simulation_time, t('waitingForSync'));
  const apiConnected = source === 'backend-api' && backend?.health?.status === 'healthy';

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-bg-border bg-bg-base/88 px-4 py-3 backdrop-blur lg:left-60 lg:px-8">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-3">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-charcoal text-white">
              <Menu className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-text-primary">MFSA</div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-text-muted">Operations</div>
            </div>
          </div>

          <div className="hidden min-w-0 lg:block" />

          <div className="flex items-center gap-2">
            <span className="topbar-status">
              {apiConnected ? <Wifi className="h-3.5 w-3.5 text-teal" /> : <WifiOff className="h-3.5 w-3.5 text-high" />}
              {source === 'checking' ? t('apiChecking') : source === 'backend-api' ? t('backendApi') : t('mockFallback')}
            </span>
            <span className="topbar-status hidden xl:inline-flex">
              <Activity className="h-3.5 w-3.5 text-teal" />
              {replayTime}
            </span>
            <div className="hidden sm:block"><LanguageSwitcher /></div>
            <ThemeToggle compact />
            <RoleSwitcher cases={cases} />
          </div>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 flex-col justify-between bg-charcoal px-3 py-5 lg:flex">
        <div>
          <div className="flex items-center gap-3 px-2">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
            <Network className="h-5 w-5" />
            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-charcoal bg-teal" />
          </div>
          <div>
            <div className="text-display text-lg font-semibold text-white">MFSA</div>
          </div>
          </div>

          <div className="mx-2 my-5 h-px bg-white/10" />

          <nav aria-label="Primary navigation" className="flex flex-col gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`${active ? 'nav-item-active' : 'nav-item'} min-w-0 flex-col justify-center gap-1 px-1 py-1.5 lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-0`} aria-current={active ? 'page' : undefined}>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate text-[10px] font-medium lg:text-sm">{t(item.key)}</span>
              </Link>
            );
          })}
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{t('providerFeeds')}</div>
          <div className="space-y-2.5">
            {providerStatuses.map((provider) => (
              <div key={provider.key} className="flex items-center justify-between text-xs">
                <span className="text-white/75">{provider.name}</span>
                <span className="flex items-center gap-2 text-white/45">
                  <span>{provider.label}</span>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: provider.color }} />
                </span>
              </div>
            ))}
          </div>
          </div>
        </div>
      </aside>

      <nav aria-label="Primary navigation" className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 gap-1 rounded-xl bg-charcoal p-2 shadow-2xl lg:hidden">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`${active ? 'nav-item-active' : 'nav-item'} min-w-0 flex-col justify-center gap-1 px-1 py-1.5`} aria-current={active ? 'page' : undefined}>
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate text-[10px] font-medium">{t(item.mobileKey)}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
