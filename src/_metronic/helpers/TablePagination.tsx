import React from 'react'
import {KTIcon} from './components/KTIcon'

interface TablePaginationProps {
  page: number
  total: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  showPageNumbers?: boolean
  showInfo?: boolean
  className?: string
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  page,
  total,
  itemsPerPage,
  onPageChange,
  showPageNumbers = true,
  showInfo = true,
  className = '',
}) => {
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
    const maxVisiblePages = 5
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pageNumbers.push(
        <li key={1} className='page-item'>
          <a
            onClick={() => handlePageClick(1)}
            className='page-link'
            style={{ cursor: 'pointer' }}
          >
            1
          </a>
        </li>
      )
      if (startPage > 2) {
        pageNumbers.push(
          <li key="ellipsis1" className='page-item disabled'>
            <span className='page-link'>...</span>
          </li>
        )
      }
    }

    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
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

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <li key="ellipsis2" className='page-item disabled'>
            <span className='page-link'>...</span>
          </li>
        )
      }
      pageNumbers.push(
        <li key={totalPages} className='page-item'>
          <a
            onClick={() => handlePageClick(totalPages)}
            className='page-link'
            style={{ cursor: 'pointer' }}
          >
            {totalPages}
          </a>
        </li>
      )
    }

    return pageNumbers
  }

  const getInfoText = () => {
    const startItem = (page - 1) * itemsPerPage + 1
    const endItem = Math.min(page * itemsPerPage, total)
    return `Showing ${startItem} to ${endItem} of ${total} entries`
  }

  return (
    <div className={`d-flex justify-content-between align-items-center flex-wrap ${className}`}>
      {showInfo && (
        <div className='d-flex flex-wrap py-2 mr-3'>
          <span className='text-muted'>
            {getInfoText()}
          </span>
        </div>
      )}
      
      {totalPages > 1 && (
        <div className='d-flex flex-wrap py-2'>
          <button
            className='btn btn-icon btn-sm btn-light mr-2 my-1'
            onClick={handlePrev}
            disabled={page <= 1}
            title='Previous page'
          >
            <KTIcon iconName='arrow-left' className='fs-2' />
          </button>
          
          {showPageNumbers && (
            <ul className='pagination pagination-sm my-1'>
              {renderPageNumbers()}
            </ul>
          )}
          
          <button
            className='btn btn-icon btn-sm btn-light ml-2 my-1'
            onClick={handleNext}
            disabled={page >= totalPages}
            title='Next page'
          >
            <KTIcon iconName='arrow-right' className='fs-2' />
          </button>
        </div>
      )}
    </div>
  )
} 