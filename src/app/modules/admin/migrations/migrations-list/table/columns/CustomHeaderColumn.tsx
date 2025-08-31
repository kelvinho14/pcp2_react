import { ColumnInstance, UseSortByColumnProps } from 'react-table'
import { Migration } from '../../../../../../../store/admin/migrationsSlice'
import { FC, useMemo } from 'react'
import clsx from 'clsx'

type Props = {
  column: ColumnInstance<Migration> & UseSortByColumnProps<Migration>
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

  // Default Column - all columns are sortable for migrations
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

