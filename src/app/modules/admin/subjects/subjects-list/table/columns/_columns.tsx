import { Column } from 'react-table'
import { SubjectSelectionCell } from './SubjectSelectionCell'
import { SubjectInfoCell } from './SubjectInfoCell'
import { SubjectActionsCell } from './SubjectActionsCell'
import { SubjectStatusCell } from './SubjectStatusCell'
import { Subject } from '../../../../../../../store/subjects/subjectsSlice'
import { ID } from '../../../../../../../_metronic/helpers'

const subjectsColumns: ReadonlyArray<Column<Subject>> = [
  {
    Header: '',
    id: 'selection',
    Cell: ({ ...props }) => <SubjectSelectionCell id={props.data[props.row.index].subject_id as unknown as ID} />,
  },
  {
    Header: 'Name',
    accessor: 'name',
    Cell: ({ ...props }) => <SubjectInfoCell subject={props.data[props.row.index]} />,
  },
  {
    Header: 'Code',
    accessor: 'code',
  },
  {
    Header: 'Status',
    accessor: 'status',
    Cell: ({ ...props }) => <SubjectStatusCell status={props.data[props.row.index].status} />,
  },
  {
    Header: 'Actions',
    id: 'actions',
    Cell: ({ ...props }) => <SubjectActionsCell id={props.data[props.row.index].subject_id as unknown as ID} />,
  },
]

export { subjectsColumns } 