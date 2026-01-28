interface StatCardProps {
  label: string;
  value: number | string | null | undefined;
}

export function StatCard({ label, value }: StatCardProps) {
  const displayValue =
    value != null ? (typeof value === 'number' ? value.toLocaleString() : value) : '0';

  return (
    <div className="bg-neutral-50 rounded-xl p-4">
      <div className="text-sm text-neutral-600 mb-1">{label}</div>
      <div className="text-2xl font-bold text-neutral-900">{displayValue}</div>
    </div>
  );
}

