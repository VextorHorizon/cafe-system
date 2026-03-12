'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Menu', href: '/menu' },
  { label: 'Orders', href: '/orders' },
  { label: 'Dashboard', href: '/dashboard' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-surface border-r border-border z-40">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gold flex items-center justify-center text-main text-xs font-bold">
            C
          </div>
          <span className="font-semibold text-sm text-text-primary">Cafe Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-elevated text-gold'
                      : 'text-text-muted hover:bg-elevated hover:text-text-primary'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <p className="text-xs text-text-muted uppercase tracking-widest">v1.0</p>
      </div>
    </aside>
  );
}
