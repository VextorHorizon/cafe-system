'use client';

import { useState, useEffect, useCallback } from 'react';
import type { OrderSummary } from '@/lib/types';
import { fetchOrderSummary } from '@/lib/api';
import StatCard from '@/components/ui/StatCard';
import OrderTable from '@/components/admin/OrderTable';

export default function DashboardPage() {
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchOrderSummary();
      setSummary(data);
    } catch {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const avgOrderValue =
    summary && summary.totalOrders > 0
      ? summary.totalRevenue / summary.totalOrders
      : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary uppercase tracking-widest">
          Dashboard
        </h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-text-muted text-sm">
          Loading...
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={loadSummary}
            className="text-sm text-gold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      ) : summary ? (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
            <StatCard
              title="Total Orders"
              value={summary.totalOrders.toLocaleString()}
              subtitle="All time"
            />
            <StatCard
              title="Total Revenue"
              value={`฿${summary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              subtitle="All time"
            />
            <StatCard
              title="Avg. Order Value"
              value={`฿${avgOrderValue.toFixed(2)}`}
              subtitle="Per order"
            />
          </div>

          {/* Recent Orders */}
          <div className="rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">
                Recent Orders
              </h2>
              <span className="text-xs text-text-muted">Last 10</span>
            </div>
            <div className="p-4">
              <OrderTable orders={summary.orders.slice(0, 10)} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
