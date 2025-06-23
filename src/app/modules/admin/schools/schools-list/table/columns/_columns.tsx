import { Column } from 'react-table'
import { SchoolSelectionCell } from './SchoolSelectionCell'
import { SchoolInfoCell } from './SchoolInfoCell'
import { SchoolActionsCell } from './SchoolActionsCell'
import { School } from '../../../../../../../store/schools/schoolsSlice'
import { ID } from '../../../../../../../_metronic/helpers'

const schoolsColumns: ReadonlyArray<Column<School>> = [
  {
    Header: '',
    id: 'selection',
    Cell: ({ ...props }) => <SchoolSelectionCell id={props.data[props.row.index].school_id as unknown as ID} />,
  },
  {
    Header: 'Name',
    accessor: 'name',
    Cell: ({ ...props }) => <SchoolInfoCell school={props.data[props.row.index]} />,
  },
  {
    Header: 'Code',
    accessor: 'code',
  },
  {
    Header: 'Address',
    accessor: 'address',
  },
  {
    Header: 'Phone',
    accessor: 'phone',
  },
  {
    Header: 'Email',
    accessor: 'email',
  },
  {
    Header: 'Subjects',
    id: 'subjects',
    Cell: ({ row }) => {
      const active = row.original.active_subjects || 0
      const inactive = row.original.inactive_subjects || 0
      if (active === 0 && inactive === 0) return null
      return (
        <div>
          {active > 0 && <span className='badge badge-success me-1'>{active} Active</span>}
          {inactive > 0 && <span className='badge badge-warning'>{inactive} Inactive</span>}
        </div>
      )
    },
  },
  {
    Header: 'Actions',
    id: 'actions',
    Cell: ({ ...props }) => <SchoolActionsCell id={props.data[props.row.index].school_id as unknown as ID} />,
  },
]

export { schoolsColumns } 