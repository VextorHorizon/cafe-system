'use client';

import { useState } from 'react';
import type { Order, OrderStatus } from '@/lib/types';
import { updateOrderStatus } from '@/lib/api';

interface OrderTableProps {
  orders: Order[];
  onStatusChange?: (id: string, status: OrderStatus) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderTable({ orders, onStatusChange }: OrderTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggle(order: Order) {
    const next: OrderStatus = order.status === 'finished' ? 'unfinished' : 'finished';
    setLoadingId(order._id);
    try {
      await updateOrderStatus(order._id, next);
      onStatusChange?.(order._id, next);
    } finally {
      setLoadingId(null);
    }
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-text-muted">
        <p className="text-sm">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-text-muted">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-text-muted">
              Order ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-text-muted">
              Items
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-text-muted">
              Total
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-text-muted">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const isFinished = order.status === 'finished';
            const isLoading = loadingId === order._id;
            return (
              <tr
                key={order._id}
                className={`border-b border-border transition-colors ${
                  isFinished ? 'opacity-50' : 'hover:bg-elevated'
                }`}
                style={{ height: '52px' }}
              >
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggle(order)}
                    disabled={isLoading}
                    className="flex items-center gap-2 disabled:opacity-50"
                    title={isFinished ? 'Mark as unfinished' : 'Mark as finished'}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isFinished
                        ? 'bg-gold border-gold'
                        : 'border-border hover:border-gold'
                    }`}>
                      {isFinished && (
                        <svg className="w-3 h-3 text-main" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs uppercase tracking-widest ${
                      isFinished ? 'text-gold' : 'text-text-muted'
                    }`}>
                      {isLoading ? '...' : isFinished ? 'Finished' : 'Unfinished'}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-text-muted">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-text-primary">
                  {order.items.map((item) => `${item.name} ×${item.quantity}`).join(', ')}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gold">
                  ฿{order.totalPrice.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-text-muted">
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
