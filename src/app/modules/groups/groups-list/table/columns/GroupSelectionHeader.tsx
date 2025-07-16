import { FC } from 'react'
import { ColumnInstance } from 'react-table'
import { useListView } from '../../core/ListViewProvider'
import { Group } from '../../core/_models'

type Props = {
  tableProps: {
    column: ColumnInstance<Group>
  }
}

const GroupSelectionHeader: FC<Props> = ({ tableProps }) => {
  const { isAllSelected, onSelectAll } = useListView()
  const { key, ...restHeaderProps } = tableProps.column.getHeaderProps()

  return (
    <th key={key} {...restHeaderProps} className='w-10px pe-2'>
      <div className='form-check form-check-sm form-check-custom form-check-solid me-3'>
        <input
          className='form-check-input'
          type='checkbox'
          data-kt-check={isAllSelected}
          data-kt-check-target='#kt_table_groups .form-check-input'
          checked={isAllSelected}
          onChange={onSelectAll}
        />
      </div>
    </th>
  )
}

export { GroupSelectionHeader } 