import React from 'react'
import { TablePagination } from '../../../../../../../_metronic/helpers/TablePagination'

type SubjectsListPaginationProps = {
  page: number
  total: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export const SubjectsListPagination: React.FC<SubjectsListPaginationProps> = ({
  page,
  total,
  itemsPerPage,
  onPageChange,
}) => {
  return (
    <TablePagination
      page={page}
      total={total}
      itemsPerPage={itemsPerPage}
      onPageChange={onPageChange}
      showPageNumbers={true}
      showInfo={true}
      className='mt-5'
    />
  )
} 