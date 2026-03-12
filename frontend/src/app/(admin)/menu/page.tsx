'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MenuItem, CreateMenuPayload, UpdateMenuPayload } from '@/lib/types';
import { fetchMenu, createMenu, updateMenu, deleteMenu } from '@/lib/api';
import MenuTable from '@/components/admin/MenuTable';
import MenuFormModal from '@/components/admin/MenuFormModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import Toast from '@/components/ui/Toast';
import TabBar from '@/components/ui/TabBar';

const TABS = [
  { label: 'All Items', value: 'all' },
  { label: 'Coffee', value: 'coffee' },
  { label: 'Tea', value: 'tea' },
  { label: 'Other', value: 'other' },
];

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState<ToastState | null>(null);

  const loadMenu = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMenu();
      setItems(data);
    } catch {
      setError('Failed to load menu items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const filteredItems =
    activeTab === 'all' ? items : items.filter((i) => i.category === activeTab);

  function openAdd() {
    setEditingItem(undefined);
    setIsFormOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditingItem(item);
    setIsFormOpen(true);
  }

  function openDelete(item: MenuItem) {
    setDeletingItem(item);
    setIsDeleteOpen(true);
  }

  async function handleFormSubmit(payload: CreateMenuPayload | UpdateMenuPayload) {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateMenu(editingItem._id, payload as UpdateMenuPayload);
        setToast({ message: 'Menu item updated.', type: 'success' });
      } else {
        await createMenu(payload as CreateMenuPayload);
        setToast({ message: 'Menu item added.', type: 'success' });
      }
      setIsFormOpen(false);
      await loadMenu();
    } catch {
      setToast({ message: 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await deleteMenu(deletingItem._id);
      setToast({ message: `"${deletingItem.name}" deleted.`, type: 'success' });
      setIsDeleteOpen(false);
      setDeletingItem(null);
      await loadMenu();
    } catch {
      setToast({ message: 'Failed to delete item.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-text-primary uppercase tracking-widest">
          Menu Management
        </h1>
        <button
          onClick={openAdd}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-main hover:opacity-90 transition-opacity"
        >
          + Add Menu Item
        </button>
      </div>

      {/* Card */}
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
                onClick={loadMenu}
                className="text-sm text-gold underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          ) : (
            <MenuTable items={filteredItems} onEdit={openEdit} onDelete={openDelete} />
          )}
        </div>
      </div>

      {/* Modals */}
      <MenuFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
        isSubmitting={isSubmitting}
      />
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        itemName={deletingItem?.name ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setIsDeleteOpen(false); setDeletingItem(null); }}
        isDeleting={isDeleting}
      />

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
