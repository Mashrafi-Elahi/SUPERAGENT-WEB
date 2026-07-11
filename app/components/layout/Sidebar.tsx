'use client';

import Link from 'next/link';
import { Shield, LayoutDashboard, Store, Bell, GitBranch, Terminal } from 'lucide-react';
import { usePathname } from 'next/navigation';

const navigation: Array<{
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  hasAlertDot?: boolean;
}> = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Agents', href: '/agents', icon: Store },
  { label: 'Alerts', href: '/alerts', icon: Bell, hasAlertDot: true },
  { label: 'Cases', href: '/cases', icon: GitBranch },
  { label: 'Dev Test', href: '/dev', icon: Terminal },
] as const;

const providerStatuses = [
  { name: 'bKash', tone: 'active' },
  { name: 'Nagad', tone: 'delayed' },
  { name: 'Rocket', tone: 'down' },
] as const;

function statusClasses(tone: string) {
  if (tone === 'active') {
    return 'bg-low';
  }

  if (tone === 'delayed') {
    return 'bg-medium';
  }

  return 'bg-critical';
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-60 flex-col border-r border-bg-border bg-bg-surface px-4 py-5">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bkash/10 text-bkash shadow-glow">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <div className="text-lg font-bold text-bkash">SuperAgent</div>
          <div className="text-xs text-text-muted">Liquidity intelligence</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href} className={isActive ? 'nav-item-active' : 'nav-item'}>
              <span className="relative flex h-5 w-5 items-center justify-center">
                <Icon className="h-4 w-4" />
                {item.hasAlertDot ? <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-critical" /> : null}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-xl border border-bg-border bg-bg-card px-3 py-3">
        <div className="mb-2 text-xs uppercase tracking-wider text-text-muted">Provider status</div>
        <div className="flex flex-col gap-2 text-sm text-text-secondary">
          {providerStatuses.map((provider) => (
            <div key={provider.name} className="flex items-center justify-between">
              <span>{provider.name}</span>
              <span className={`h-2.5 w-2.5 rounded-full ${statusClasses(provider.tone)}`} />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
