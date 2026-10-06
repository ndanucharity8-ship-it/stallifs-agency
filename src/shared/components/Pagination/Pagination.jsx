import './Pagination.css';

function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) {
  if (totalPages <= 1) {
    return null;
  }

  const classes = [
    'pagination',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage ||
      !onPageChange
    ) {
      return;
    }

    onPageChange(page);
  };

  const getPages = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let page = 1; page <= totalPages; page += 1) {
        pages.push(page);
      }

      return pages;
    }

    pages.push(1);

    if (currentPage > 4) {
      pages.push('ellipsis-start');
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(page);
    }

    if (currentPage < totalPages - 3) {
      pages.push('ellipsis-end');
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <nav
      className={classes}
      aria-label="Pagination"
    >
      <button
        type="button"
        className="pagination__button pagination__button--previous"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        Previous
      </button>

      <div className="pagination__pages">
        {getPages().map((page) => {
          if (typeof page !== 'number') {
            return (
              <span
                key={page}
                className="pagination__ellipsis"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={page}
              type="button"
              className={[
                'pagination__page',
                isActive ? 'pagination__page--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handlePageChange(page)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="pagination__button pagination__button--next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        Next
      </button>
    </nav>
  );
}

export default Pagination;