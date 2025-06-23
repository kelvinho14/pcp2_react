import { ColumnInstance, UseSortByColumnProps, HeaderProps } from 'react-table'
import { School } from '../../../../../../../store/admin/adminSlice'
import { SchoolSelectionHeader } from './SchoolSelectionHeader'

type Props = {
  column: ColumnInstance<School> & UseSortByColumnProps<School>
  onSort: () => void
}

const CustomHeaderColumn: React.FC<Props> = ({ column, onSort }) => {
  const { key, ...restHeaderProps } = column.getHeaderProps(column.getSortByToggleProps())

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
    <th key={key} {...restHeaderProps} onClick={onSort} style={{ cursor: 'pointer' }}>
      {column.render('Header')}
      {column.isSorted ? (
        column.isSortedDesc ? (
          <span className='ms-2'>↓</span>
        ) : (
          <span className='ms-2'>↑</span>
        )
      ) : null}
    </th>
  )
}

export { CustomHeaderColumn } 