import { ColumnInstance, UseSortByColumnProps, HeaderProps } from 'react-table'
import { Group } from '../../core/_models'
import { GroupSelectionHeader } from './GroupSelectionHeader'
import { FC, useMemo } from 'react'
import clsx from 'clsx'

type Props = {
  column: ColumnInstance<Group> & UseSortByColumnProps<Group>
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
    return <GroupSelectionHeader tableProps={{ column }} />
  }

  // 🟥 CASE 2: Non-sortable columns (students, actions)
  if (column.id === 'students' || column.id === 'actions') {
    return (
      <th key={key} className='min-w-125px'>
        <div className='d-flex align-items-center'>
          {column.render('Header')}
        </div>
      </th>
    )
  }

  // ✅ Default Column (sortable)
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