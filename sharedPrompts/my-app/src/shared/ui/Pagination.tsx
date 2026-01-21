interface PaginationProps {
  currentPage: number; // 1-based
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm shadow-sm border border-neutral-200">
      <button
        type="button"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 py-1 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        이전
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => handlePageClick(page)}
            className={`min-w-[2rem] px-2 py-1 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 py-1 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        다음
      </button>
    </nav>
  );
}


