'use client';

import Link from 'next/link';
import { LayoutDashboard, Store, Bell, GitBranch, ClipboardList, Network } from 'lucide-react';
import { usePathname } from 'next/navigation';
import ThemeToggle from '../ui/ThemeToggle';

const navigation = [
  { label: 'Overview', mobileLabel: 'Home', href: '/', icon: LayoutDashboard },
  { label: 'Agents', mobileLabel: 'Agents', href: '/agents', icon: Store },
  { label: 'Alerts', mobileLabel: 'Alerts', href: '/alerts', icon: Bell },
  { label: 'Cases', mobileLabel: 'Cases', href: '/cases', icon: GitBranch },
  { label: 'Audit Trail', mobileLabel: 'Audit', href: '/audit', icon: ClipboardList },
] as const;

const providerStatuses = [
  { name: 'bKash', label: 'Fresh', tone: 'bg-low' },
  { name: 'Nagad', label: 'Delayed', tone: 'bg-medium' },
  { name: 'Rocket', label: 'Missing', tone: 'bg-critical' },
] as const;

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-x-3 bottom-3 z-50 rounded-xl bg-charcoal px-2 py-2 shadow-2xl lg:inset-y-0 lg:left-0 lg:right-auto lg:flex lg:w-56 lg:flex-col lg:justify-between lg:rounded-none lg:px-3 lg:py-5">
      <div>
        <div className="hidden items-center gap-3 px-2 lg:flex">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
            <Network className="h-5 w-5" />
            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-charcoal bg-teal" />
          </div>
          <div>
            <div className="text-display text-lg font-semibold tracking-tight text-white">MFSA</div>
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">Liquidity intelligence</div>
          </div>
        </div>

        <div className="mx-2 my-5 hidden h-px bg-white/10 lg:block" />

        <nav aria-label="Primary navigation" className="grid grid-cols-6 gap-1 lg:flex lg:flex-col lg:gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`${active ? 'nav-item-active' : 'nav-item'} min-w-0 flex-col justify-center gap-1 px-1 py-1.5 lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-0`} aria-current={active ? 'page' : undefined}>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate text-[10px] font-medium lg:text-sm">{item.mobileLabel}<span className="hidden lg:inline">{item.label === item.mobileLabel ? '' : ` Trail`}</span></span>
              </Link>
            );
          })}
          <div className="flex items-center justify-center lg:hidden"><ThemeToggle compact /></div>
        </nav>
      </div>

      <div className="hidden flex-col gap-4 lg:flex">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Provider feeds</div>
          <div className="space-y-2.5">
            {providerStatuses.map((provider) => (
              <div key={provider.name} className="flex items-center justify-between text-xs">
                <span className="text-white/75">{provider.name}</span>
                <span className="flex items-center gap-2 text-white/45"><span>{provider.label}</span><span className={`h-2 w-2 rounded-full ${provider.tone}`} /></span>
              </div>
            ))}
          </div>
          <p className="mt-3 border-t border-white/10 pt-3 text-[10px] leading-relaxed text-white/35">Balances remain provider-separated and are never converted by this prototype.</p>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
