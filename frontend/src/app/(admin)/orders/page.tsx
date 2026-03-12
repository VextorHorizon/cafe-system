'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Order, OrderStatus } from '@/lib/types';
import { fetchOrders } from '@/lib/api';
import OrderTable from '@/components/admin/OrderTable';
import TabBar from '@/components/ui/TabBar';

const TABS = [
  { label: 'All Orders', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
];

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isThisWeek(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return d >= startOfWeek;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch {
      setError('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  function handleStatusChange(id: string, status: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, status } : o))
    );
  }

  const filteredOrders =
    activeTab === 'all'
      ? orders
      : activeTab === 'today'
      ? orders.filter((o) => isToday(o.createdAt))
      : orders.filter((o) => isThisWeek(o.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-text-primary uppercase tracking-widest">
          Order History
        </h1>
        <span className="rounded-full bg-elevated border border-border px-3 py-1 text-xs font-medium text-text-muted uppercase tracking-widest">
          {orders.length} orders
        </span>
      </div>

      <div className="rounded-xl border border-border bg-surface">
        <div className="px-4 pt-4">
          <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-text-muted text-sm">
              Loading...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={loadOrders}
                className="text-sm text-gold underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          ) : (
            <OrderTable orders={filteredOrders} onStatusChange={handleStatusChange} />
          )}
        </div>
      </div>
    </div>
  );
}
