'use client';

import type { MenuItem } from '@/lib/types';
import CategoryBadge from '@/components/ui/CategoryBadge';

interface MenuTableProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

export default function MenuTable({ items, onEdit, onDelete }: MenuTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-text-muted">
        <p className="text-sm">No menu items found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-text-muted">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-text-muted">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-text-muted">
              Price
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-widest text-text-muted">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item._id}
              className="border-b border-border hover:bg-elevated transition-colors"
              style={{ height: '52px' }}
            >
              <td className="px-4 py-3">
                <span className="text-sm font-medium text-text-primary">{item.name}</span>
              </td>
              <td className="px-4 py-3">
                <CategoryBadge category={item.category} />
              </td>
              <td className="px-4 py-3 text-sm text-text-primary">
                ฿{item.price.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:border-gold hover:text-gold transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:border-red-500 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
