import { FC, useMemo } from 'react'
import clsx from 'clsx'
import { ColumnInstance, UseSortByColumnProps } from 'react-table'
import { Question } from '../../../../../../../store/questions/questionsSlice'
import { QuestionSelectionHeader } from './QuestionSelectionHeader'

type Props = {
  column: ColumnInstance<Question> & UseSortByColumnProps<Question>
  onSort: () => void
  currentSort?: { id: string; desc: boolean } | null
}

const CustomHeaderColumn: FC<Props> = ({ column, onSort, currentSort }) => {
  const { key, ...headerProps } = column.getHeaderProps(column.getSortByToggleProps())
  
  const isSelectedForSorting = useMemo(() => {
    return currentSort && currentSort.id === column.id
  }, [currentSort, column.id])
  
  const order: 'asc' | 'desc' | undefined = useMemo(() => {
    if (!isSelectedForSorting) return undefined
    return currentSort?.desc ? 'desc' : 'asc'
  }, [isSelectedForSorting, currentSort])
  
  // Selection Column
  if (column.id === 'selection') {
    return <QuestionSelectionHeader tableProps={{ column }} />
  }

  // Actions Column - disable sorting
  if (column.id === 'actions' || column.id === 'content_preview') {
    return (
      <th key={key} {...headerProps}>
        {column.render('Header')}
      </th>
    )
  }

  // Default Column
  return (
    <th
      {...headerProps}
      className='min-w-125px cursor-pointer'
      onClick={onSort}
    >
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