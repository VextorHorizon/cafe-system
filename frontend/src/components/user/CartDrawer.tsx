'use client';

import { useCart } from '@/context/CartContext';

interface CartDrawerProps {
  onConfirm: () => void;
}

export default function CartDrawer({ onConfirm }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-3 text-3xl text-muted">
          <span role="img" aria-label="empty cart">&#128722;</span>
        </div>
        <p className="text-sm text-muted">Your cart is empty</p>
        <p className="mt-1 text-xs text-muted">Add items from the menu</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cafe-border pb-3 mb-3">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-widest">
          Cart
        </h2>
        <button
          onClick={clearCart}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {items.map((cartItem) => (
          <div
            key={cartItem.menuItem._id}
            className="rounded-lg border border-cafe-border bg-elevated p-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">
                  {cartItem.menuItem.name}
                </p>
                <p className="text-xs text-muted">
                  {cartItem.menuItem.price.toFixed(2)} THB each
                </p>
              </div>
              <button
                onClick={() => removeItem(cartItem.menuItem._id)}
                className="ml-2 text-xs text-muted hover:text-red-400 transition-colors"
                aria-label={`Remove ${cartItem.menuItem.name}`}
              >
                &#10005;
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between">
              {/* Quantity controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    cartItem.quantity <= 1
                      ? removeItem(cartItem.menuItem._id)
                      : updateQuantity(cartItem.menuItem._id, cartItem.quantity - 1)
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-cafe-border bg-surface text-sm text-primary hover:border-gold/40 transition-colors"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-medium text-primary">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(cartItem.menuItem._id, cartItem.quantity + 1)
                  }
                  disabled={cartItem.quantity >= 20}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-cafe-border bg-surface text-sm text-primary hover:border-gold/40 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
              </div>

              {/* Subtotal */}
              <p className="text-sm font-semibold text-gold">
                {(cartItem.menuItem.price * cartItem.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 border-t border-cafe-border pt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-muted uppercase tracking-widest">
            Total
          </span>
          <span className="text-lg font-bold text-gold">
            {totalPrice.toFixed(2)} THB
          </span>
        </div>
        <button
          onClick={onConfirm}
          className="w-full rounded-lg bg-gold py-3 text-sm font-semibold text-main hover:opacity-90 transition-opacity"
        >
          Confirm Order
        </button>
      </div>
    </div>
  );
}
