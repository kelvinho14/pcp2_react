import { Column } from 'react-table'
import { useMemo } from 'react'
import { GroupInfoCell } from './GroupInfoCell'
import { GroupActionsCell } from './GroupActionsCell'
import { GroupSelectionCell } from './GroupSelectionCell'
import { GroupCreatedDayCell } from './GroupCreatedDayCell'
import { GroupStudentsCell } from './GroupStudentsCell'
import { Group } from '../../core/_models'

const useGroupsColumns = (): ReadonlyArray<Column<Group>> => {
  return useMemo(() => {
    const baseColumns: ReadonlyArray<Column<Group>> = [
      {
        Header: '',
        id: 'selection',
        Cell: ({ ...props }) => <GroupSelectionCell id={props.data[props.row.index].group_id} />,
      },
      {
        Header: 'Name',
        accessor: 'name',
        Cell: ({ ...props }) => <GroupInfoCell group={props.data[props.row.index]} />,
      },
      {
        Header: 'Description',
        accessor: 'description',
        Cell: ({ ...props }) => (
          <div className='text-gray-800 fw-bold'>
            {props.data[props.row.index].description || '—'}
          </div>
        ),
      },
      {
        Header: 'Students',
        id: 'students',
        Cell: ({ ...props }) => <GroupStudentsCell students={props.data[props.row.index].students} member_count={props.data[props.row.index].member_count} />,
      },
      {
        Header: 'Created',
        id: 'created_at',
        Cell: ({ ...props }) => <GroupCreatedDayCell group={props.data[props.row.index]} />,
      },
      {
        Header: 'Actions',
        id: 'actions',
        Cell: ({ ...props }) => <GroupActionsCell id={props.data[props.row.index].group_id} />,
      },
    ]

    return baseColumns
  }, [])
}

export { useGroupsColumns } 