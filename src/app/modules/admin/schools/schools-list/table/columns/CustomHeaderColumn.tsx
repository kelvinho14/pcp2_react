import { ColumnInstance, UseSortByColumnProps, HeaderProps } from 'react-table'
import { School } from '../../../../../../../store/admin/adminSlice'
import { SchoolSelectionHeader } from './SchoolSelectionHeader'
import { FC, useMemo } from 'react'
import clsx from 'clsx'

type Props = {
  column: ColumnInstance<School> & UseSortByColumnProps<School>
  onSort: () => void
  currentSort?: { id: string; desc: boolean } | null
}

const CustomHeaderColumn: FC<Props> = ({ column, onSort, currentSort }) => {
  const { key, ...restHeaderProps } = column.getHeaderProps(column.getSortByToggleProps())

  const isSelectedForSorting = useMemo(() => {
    return currentSort && currentSort.id === column.id
  }, [currentSort, column.id])
  
  const order: 'asc' | 'desc' | undefined = useMemo(() => {
    if (!isSelectedForSorting) return undefined
    return currentSort?.desc ? 'desc' : 'asc'
  }, [isSelectedForSorting, currentSort])

  // Selection Column
  if (column.id === 'selection') {
    return <SchoolSelectionHeader tableProps={{ column }} />
  }

  // Actions Column - disable sorting
  if (column.id === 'actions') {
    return (
      <th key={key} {...restHeaderProps}>
        {column.render('Header')}
      </th>
    )
  }

  // Default Column
  return (
    <th key={key} {...restHeaderProps} onClick={onSort} className='min-w-125px cursor-pointer'>
      <div className={clsx(
        'd-flex align-items-center',
        isSelectedForSorting && order !== undefined && `table-sort-${order}`
      )}>
        {column.render('Header')}
      </div>
    </th>
  )
}

export { CustomHeaderColumn } 