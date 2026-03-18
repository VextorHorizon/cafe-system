'use client';

import { CartProvider } from '@/context/CartContext';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-main">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-cafe-border bg-surface/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <h1 className="font-serif text-lg font-semibold text-gold tracking-widest uppercase">
              Cafe Order
            </h1>
            <span className="text-xs text-muted uppercase tracking-widest">
              Menu
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </CartProvider>
  );
}
