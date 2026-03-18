'use client';

import type { MenuItem } from '@/lib/types';
import CategoryBadge from '@/components/ui/CategoryBadge';
import { useCart } from '@/context/CartContext';

interface MenuGridProps {
  items: MenuItem[];
}

export default function MenuGrid({ items }: MenuGridProps) {
  const { items: cartItems, addItem } = useCart();

  function getCartQuantity(menuItemId: string): number {
    const found = cartItems.find((i) => i.menuItem._id === menuItemId);
    return found ? found.quantity : 0;
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted text-sm">
        No menu items found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const qty = getCartQuantity(item._id);
        const isMaxed = qty >= 20;

        return (
          <div
            key={item._id}
            className="group flex flex-col justify-between rounded-xl border border-cafe-border bg-surface p-4 transition-colors hover:border-gold/30"
          >
            <div>
              <div className="mb-2 flex items-center justify-between">
                <CategoryBadge category={item.category} />
                {qty > 0 && (
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-medium text-gold">
                    x{qty}
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-primary">{item.name}</h3>
              <p className="mt-1 text-lg font-bold text-gold">
                {item.price.toFixed(2)} THB
              </p>
            </div>

            <button
              onClick={() => addItem(item)}
              disabled={isMaxed}
              className={`mt-4 w-full rounded-lg py-2.5 text-sm font-medium transition-opacity ${
                isMaxed
                  ? 'cursor-not-allowed bg-elevated text-muted'
                  : 'bg-gold text-main hover:opacity-90'
              }`}
            >
              {isMaxed ? 'Max quantity' : '+ Add to cart'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
