import { ColumnInstance } from 'react-table'
import { User } from '../../core/_models'
import { UserSelectionHeader } from './UserSelectionHeader'
import { UserCustomHeader } from './UserCustomHeader'

type Props = {
  column: ColumnInstance<User>
  onSort: () => void
}

const CustomHeaderColumn: React.FC<Props> = ({ column, onSort }) => {
  const { key, ...restHeaderProps } = column.getHeaderProps(column.getSortByToggleProps())

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
