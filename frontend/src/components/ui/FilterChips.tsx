'use client';

export interface ActiveFilter {
  key: string;
  label: string;
}

interface FilterChipsProps {
  activeFilters: ActiveFilter[];
  onRemove: (key: string) => void;
}

export default function FilterChips({ activeFilters, onRemove }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map((filter) => (
        <span
          key={filter.key}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-[#f3f4f6] px-3 py-1 text-sm font-medium text-[#0f0f0f]"
        >
          {filter.label}
          <button
            onClick={() => onRemove(filter.key)}
            className="text-[#6b7280] hover:text-[#0f0f0f] transition-colors"
          >
            ×
          </button>
        </span>
      ))}
      <button className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#e5e7eb] px-3 py-1 text-sm text-[#6b7280] hover:border-[#0f0f0f] hover:text-[#0f0f0f] transition-colors">
        + Add Filter
      </button>
    </div>
  );
}
