'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/api';
import type { Order } from '@/lib/types';

interface OrderConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderConfirmModal({ isOpen, onClose }: OrderConfirmModalProps) {
  const { items, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  async function handleConfirm() {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        items: items.map((i) => ({
          menuItemId: i.menuItem._id,
          quantity: i.quantity,
        })),
      };
      const order = await createOrder(payload);
      setSuccessOrder(order);
      clearCart();
    } catch {
      setError('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setSuccessOrder(null);
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isSubmitting ? handleClose : undefined}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-cafe-border bg-surface p-6 mx-4 max-h-[80vh] overflow-y-auto">
        {successOrder ? (
          /* Success State */
          <div className="text-center">
            <div className="mb-4 text-4xl">&#10003;</div>
            <h2 className="text-lg font-semibold text-primary mb-2">
              Order Placed!
            </h2>
            <p className="text-sm text-muted mb-4">
              Your order has been placed successfully.
            </p>

            <div className="rounded-lg border border-cafe-border bg-elevated p-4 mb-4 text-left">
              <p className="text-xs text-muted uppercase tracking-widest mb-2">
                Order Summary
              </p>
              {successOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 text-sm">
                  <span className="text-primary">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="text-gold">
                    {(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="mt-2 border-t border-cafe-border pt-2 flex justify-between">
                <span className="text-sm font-medium text-primary">Total</span>
                <span className="text-sm font-bold text-gold">
                  {successOrder.totalPrice.toFixed(2)} THB
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full rounded-lg bg-gold py-2.5 text-sm font-medium text-main hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        ) : (
          /* Confirmation State */
          <>
            <h2 className="text-lg font-semibold text-primary mb-1">
              Confirm Order
            </h2>
            <p className="text-sm text-muted mb-4">
              Please review your order before confirming.
            </p>

            <div className="space-y-2 mb-4">
              {items.map((cartItem) => (
                <div
                  key={cartItem.menuItem._id}
                  className="flex items-center justify-between rounded-lg border border-cafe-border bg-elevated px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {cartItem.menuItem.name}
                    </p>
                    <p className="text-xs text-muted">
                      {cartItem.menuItem.price.toFixed(2)} x {cartItem.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gold">
                    {(cartItem.menuItem.price * cartItem.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-cafe-border pt-3 mb-4">
              <span className="text-sm font-medium text-primary">Total</span>
              <span className="text-lg font-bold text-gold">
                {totalPrice.toFixed(2)} THB
              </span>
            </div>

            {error && (
              <p className="mb-3 text-sm text-red-400 text-center">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 rounded-lg border border-cafe-border bg-elevated py-2.5 text-sm font-medium text-primary hover:border-gold/40 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-gold py-2.5 text-sm font-semibold text-main hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'Placing...' : 'Place Order'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
