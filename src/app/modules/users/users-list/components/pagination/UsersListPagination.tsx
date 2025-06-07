// src/app/modules/users/users-list/components/pagination/UsersListPagination.tsx
type UsersListPaginationProps = {
  page: number
  total: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export const UsersListPagination = ({
  page,
  total,
  itemsPerPage,
  onPageChange,
}: UsersListPaginationProps) => {
  const totalPages = Math.ceil(total / itemsPerPage)

  const handlePrev = () => {
    if (page > 1) {
      onPageChange(page - 1)
    }
  }

  const handleNext = () => {
    if (page < totalPages) {
      onPageChange(page + 1)
    }
  }

  const handlePageClick = (pageNumber: number) => {
    if (page !== pageNumber) {
      onPageChange(pageNumber)
    }
  }

  const renderPageNumbers = () => {
    const pageNumbers = []
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
          <a
            onClick={() => handlePageClick(i)}
            className='page-link'
            style={{ cursor: 'pointer' }}
          >
            {i}
          </a>
        </li>
      )
    }
    return pageNumbers
  }

  return (
    <div className='d-flex justify-content-between align-items-center mt-5'>
      <button
        className='btn btn-sm btn-primary'
        onClick={handlePrev}
        disabled={page === 1}
      >
        Prev
      </button>

      <ul className='pagination'>
        {renderPageNumbers()}
      </ul>

      <button
        className='btn btn-sm btn-primary'
        onClick={handleNext}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  )
}
