import type { Category } from '@/lib/types';

const styles: Record<Category, string> = {
  coffee: 'bg-coffee-bg text-coffee-text',
  tea: 'bg-tea-bg text-tea-text',
  other: 'bg-other-bg text-other-text',
};

interface CategoryBadgeProps {
  category: Category;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs uppercase tracking-widest font-medium ${styles[category]}`}
    >
      {category}
    </span>
  );
}
