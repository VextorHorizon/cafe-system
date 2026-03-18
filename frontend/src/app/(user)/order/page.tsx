'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MenuItem, Category } from '@/lib/types';
import { fetchMenu } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import MenuGrid from '@/components/user/MenuGrid';
import CartDrawer from '@/components/user/CartDrawer';
import OrderConfirmModal from '@/components/user/OrderConfirmModal';

const CATEGORIES: { label: string; value: 'all' | Category }[] = [
  { label: 'All', value: 'all' },
  { label: 'Coffee', value: 'coffee' },
  { label: 'Tea', value: 'tea' },
  { label: 'Other', value: 'other' },
];

export default function OrderPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | Category>('all');
  const [search, setSearch] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const { totalItems } = useCart();

  const loadMenu = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMenu();
      setMenuItems(data);
    } catch {
      setError('Failed to load menu. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const filteredItems = menuItems.filter((item) => {
    const matchCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="flex gap-6">
      {/* Main area - Menu */}
      <div className="flex-1 min-w-0">
        {/* Search & Category filters */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-cafe-border bg-elevated px-4 py-2.5 text-sm text-primary placeholder:text-muted focus:border-gold/50 focus:outline-none transition-colors"
          />

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-widest transition-colors ${
                  activeCategory === cat.value
                    ? 'bg-gold text-main'
                    : 'border border-cafe-border bg-elevated text-muted hover:text-primary'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted text-sm">
            Loading...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={loadMenu}
              className="text-sm text-gold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        ) : (
          <MenuGrid items={filteredItems} />
        )}
      </div>

      {/* Desktop Cart sidebar */}
      <aside className="hidden lg:block w-80 flex-shrink-0">
        <div className="sticky top-24 rounded-xl border border-cafe-border bg-surface p-4">
          <CartDrawer onConfirm={() => setIsConfirmOpen(true)} />
        </div>
      </aside>

      {/* Mobile cart button (floating) */}
      {totalItems > 0 && (
        <button
          onClick={() => setIsMobileCartOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-main shadow-lg lg:hidden hover:opacity-90 transition-opacity"
        >
          <span>Cart</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-main/20 text-xs font-bold">
            {totalItems}
          </span>
        </button>
      )}

      {/* Mobile cart drawer */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileCartOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[75vh] overflow-y-auto rounded-t-2xl border-t border-cafe-border bg-surface p-4">
            <div className="mb-3 flex justify-center">
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="h-1.5 w-10 rounded-full bg-cafe-border"
                aria-label="Close cart"
              />
            </div>
            <CartDrawer
              onConfirm={() => {
                setIsMobileCartOpen(false);
                setIsConfirmOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Confirm modal */}
      <OrderConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
