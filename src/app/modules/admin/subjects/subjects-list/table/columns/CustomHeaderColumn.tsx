import { ColumnInstance, UseSortByColumnProps, HeaderProps } from 'react-table'
import { Subject } from '../../../../../../../store/subjects/subjectsSlice'
import { SubjectSelectionHeader } from './SubjectSelectionHeader'

type Props = {
  column: ColumnInstance<Subject> & UseSortByColumnProps<Subject>
  onSort: () => void
}

const CustomHeaderColumn: React.FC<Props> = ({ column, onSort }) => {
  const { key, ...restHeaderProps } = column.getHeaderProps(column.getSortByToggleProps())

  // Selection Column
  if (column.id === 'selection') {
    return <SubjectSelectionHeader tableProps={{ column }} />
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