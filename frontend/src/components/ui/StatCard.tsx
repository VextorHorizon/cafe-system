interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <div className="bg-surface rounded-xl border border-cafe-border p-6">
      <p className="text-xs font-medium uppercase tracking-widest text-muted">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-gold">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
    </div>
  );
}
