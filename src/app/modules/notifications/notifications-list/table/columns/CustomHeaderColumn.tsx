import {ColumnInstance, UseSortByColumnProps} from 'react-table'
import {KTIcon} from '../../../../../../_metronic/helpers'

type Props = {
  column: ColumnInstance<any> & UseSortByColumnProps<any>
  onSort: () => void
  currentSort: { id: string; desc: boolean } | null
}

const CustomHeaderColumn = ({column, onSort, currentSort}: Props) => {
  const isSorted = currentSort?.id === column.id
  const isAsc = isSorted && !currentSort?.desc
  const isDesc = isSorted && currentSort?.desc

  return (
    <th
      {...column.getHeaderProps(column.getSortByToggleProps())}
      className='min-w-125px text-start'
      onClick={onSort}
      style={{cursor: 'pointer'}}
    >
      <div className='d-flex align-items-center'>
        <span className='text-muted fw-bolder fs-7 text-uppercase'>
          {column.render('Header')}
        </span>
        {isSorted && (
          <span className='svg-icon svg-icon-1 ms-1'>
            {isAsc ? (
              <KTIcon iconName='up' className='svg-icon-2' />
            ) : (
              <KTIcon iconName='down' className='svg-icon-2' />
            )}
          </span>
        )}
        {!isSorted && (
          <span className='svg-icon svg-icon-1 ms-1'>
            <KTIcon iconName='up-down' className='svg-icon-2' />
          </span>
        )}
      </div>
    </th>
  )
}

export {CustomHeaderColumn}
