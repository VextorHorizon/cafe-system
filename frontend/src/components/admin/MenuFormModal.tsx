'use client';

import { useState, useEffect } from 'react';
import type { MenuItem, Category, CreateMenuPayload, UpdateMenuPayload } from '@/lib/types';

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateMenuPayload | UpdateMenuPayload) => void;
  initialData?: MenuItem;
  isSubmitting?: boolean;
}

const CATEGORIES: Category[] = ['coffee', 'tea', 'other'];

export default function MenuFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}: MenuFormModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Category>('coffee');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!initialData;

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name ?? '');
      setPrice(initialData?.price?.toString() ?? '');
      setCategory(initialData?.category ?? 'coffee');
      setErrors({});
    }
  }, [isOpen, initialData]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) errs.price = 'Price must be 0 or more';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ name: name.trim(), price: parseFloat(price), category });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-elevated border border-cafe-border p-6 shadow-xl">
        <h2 className="text-base font-semibold text-primary mb-5 uppercase tracking-widest">
          {isEdit ? 'Edit Menu Item' : 'Add Menu Item'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-muted mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Latte"
              className="w-full rounded-lg border border-cafe-border bg-surface px-3 py-2 text-sm text-primary placeholder-text-muted focus:border-gold focus:outline-none"
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-muted mb-1.5">
              Price (฿)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-lg border border-cafe-border bg-surface px-3 py-2 text-sm text-primary placeholder-text-muted focus:border-gold focus:outline-none"
            />
            {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-muted mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-lg border border-cafe-border bg-surface px-3 py-2 text-sm text-primary focus:border-gold focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-cafe-border px-4 py-2 text-sm font-medium text-muted hover:border-muted hover:text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-main hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
