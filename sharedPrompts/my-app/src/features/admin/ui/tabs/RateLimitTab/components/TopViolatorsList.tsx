interface Violator {
  identifier: string;
  violation_count: number;
}

interface TopViolatorsListProps {
  title: string;
  violators: Violator[];
  identifierLabel?: string;
}

export function TopViolatorsList({
  title,
  violators,
  identifierLabel,
}: TopViolatorsListProps) {
  if (!violators || violators.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">{title}</h3>
      <div className="space-y-2">
        {violators.slice(0, 10).map((violator, index) => (
          <div
            key={`${violator.identifier}-${index}`}
            className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-neutral-500 w-6">{index + 1}</span>
              <span className="text-sm font-medium text-neutral-900">
                {identifierLabel ? `${identifierLabel}: ${violator.identifier}` : violator.identifier}
              </span>
            </div>
            <span className="text-sm font-semibold text-violet-600">
              {violator.violation_count.toLocaleString()}회
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

