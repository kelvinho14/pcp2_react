import {FC} from 'react'
import {ColumnInstance, UseSortByColumnProps} from 'react-table'
import {KTSVG} from '../../../../../../_metronic/helpers'
import {Exercise} from '../../../../../../store/exercises/exercisesSlice'
import {useListView} from '../../core/ListViewProvider'

type Props = {
  column: ColumnInstance<Exercise> & UseSortByColumnProps<Exercise>
  onSort: () => void
}

const CustomHeaderColumn: FC<Props> = ({column, onSort}) => {
  const {isAllSelected, onSelectAll, disabled} = useListView()

  // If this is the selection column, render the select all checkbox
  if (column.id === 'selection') {
    return (
      <th className='w-25px'>
        <div className='form-check form-check-custom form-check-solid'>
          <input
            className='form-check-input'
            type='checkbox'
            data-kt-check={isAllSelected}
            data-kt-check-target='#kt_table_exercises .form-check-input'
            checked={isAllSelected}
            disabled={disabled}
            onChange={onSelectAll}
          />
        </div>
      </th>
    )
  }

  // If this is the actions column, render without sorting functionality
  if (column.id === 'actions') {
    return (
      <th className='text-end min-w-100px'>
        {column.render('Header')}
      </th>
    )
  }

  return (
    <th
      key={column.getHeaderProps(column.getSortByToggleProps()).key}
      {...(() => {
        const props = column.getHeaderProps(column.getSortByToggleProps())
        const {key, ...restProps} = props
        return restProps
      })()}
      className='min-w-125px cursor-pointer'
      onClick={onSort}
    >
      <div className='d-flex align-items-center'>
        {column.render('Header')}
        {column.isSorted && (
          <KTSVG
            path={
              column.isSortedDesc
                ? '/media/icons/duotune/arrows/arr073.svg'
                : '/media/icons/duotune/arrows/arr072.svg'
            }
            className='svg-icon-2 ms-1'
          />
        )}
      </div>
    </th>
  )
}

export {CustomHeaderColumn} 