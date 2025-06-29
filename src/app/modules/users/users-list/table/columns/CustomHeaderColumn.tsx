import { ColumnInstance, UseSortByColumnProps, HeaderProps } from 'react-table'
import { User } from '../../core/_models'
import { UserSelectionHeader } from './UserSelectionHeader'
import { UserCustomHeader } from './UserCustomHeader'
import { FC, useMemo } from 'react'
import clsx from 'clsx'

type Props = {
  column: ColumnInstance<User> & UseSortByColumnProps<User>
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

  // 🟥 CASE 1: Selection Column
  if (column.id === 'selection') {
    return <UserSelectionHeader tableProps={{ column }} />
  }

  // 🟥 CASE 2: Custom Header Column
  if (column.id === 'custom') {
    return <UserCustomHeader tableProps={{ column }} />
  }

  // ✅ Default Column
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
