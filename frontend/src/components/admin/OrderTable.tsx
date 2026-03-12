'use client';

import type { Order } from '@/lib/types';

interface OrderTableProps {
  orders: Order[];
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

export default function OrderTable({ orders }: OrderTableProps) {
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
          {orders.map((order) => (
            <tr
              key={order._id}
              className="border-b border-border hover:bg-elevated transition-colors"
              style={{ height: '52px' }}
            >
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
