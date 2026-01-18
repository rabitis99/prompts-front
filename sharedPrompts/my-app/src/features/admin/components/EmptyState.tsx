interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = '데이터가 없습니다.' }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center text-neutral-500">
      {message}
    </div>
  );
}

