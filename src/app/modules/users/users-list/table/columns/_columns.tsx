import { Column } from 'react-table'
import { UserInfoCell } from './UserInfoCell'
import { UserLastLoginCell } from './UserLastLoginCell'
import { UserTwoStepsCell } from './UserTwoStepsCell'
import { UserActionsCell } from './UserActionsCell'
import { UserSelectionCell } from './UserSelectionCell'
import { User } from '../../core/_models'

const usersColumns: ReadonlyArray<Column<User>> = [
  {
    Header: '',
    id: 'selection',
    Cell: ({ ...props }) => <UserSelectionCell id={props.data[props.row.index].user_id} />,
  },
  {
    Header: 'Name',
    accessor: 'name',
    Cell: ({ ...props }) => <UserInfoCell user={props.data[props.row.index]} />,
  },
  {
    Header: 'Role',
    accessor: 'role',
  },
  {
    Header: 'Last login',
    id: 'last_login',
    Cell: ({ ...props }) => <UserLastLoginCell last_login={props.data[props.row.index].last_login} />,
  },
  {
    Header: 'Two steps',
    id: 'two_steps',
    Cell: ({ ...props }) => <UserTwoStepsCell two_steps={props.data[props.row.index].two_steps} />,
  },
  {
    Header: 'Joined day',
    accessor: 'joined_day',
  },
  {
    Header: 'Actions',
    id: 'actions',
    Cell: ({ ...props }) => <UserActionsCell id={props.data[props.row.index].user_id} />,
  },
]

export { usersColumns }
