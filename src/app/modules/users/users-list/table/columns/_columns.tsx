import { Column } from 'react-table'
import { useMemo } from 'react'
import { UserInfoCell } from './UserInfoCell'
import { UserLastLoginCell } from './UserLastLoginCell'
import { UserActionsCell } from './UserActionsCell'
import { UserSelectionCell } from './UserSelectionCell'
import { UserJoinedDayCell } from './UserJoinedDayCell'
import { UserRoleCell } from './UserRoleCell'
import { UserStatusCell } from './UserStatusCell'
import { UserSubjectsCell } from './UserSubjectsCell'
import { User } from '../../core/_models'
import { useAuth } from '../../../../auth/core/Auth'
import { ROLES } from '../../../../../constants/roles'

const useUsersColumns = (): ReadonlyArray<Column<User>> => {
  const { currentUser } = useAuth()
  const isAdmin = currentUser?.role?.role_type === ROLES.ADMIN

  return useMemo(() => {
    const baseColumns: ReadonlyArray<Column<User>> = [
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
    ]

    // Add status column
    const statusColumn: Column<User> = {
      Header: 'Status',
      id: 'status',
      Cell: ({ ...props }) => <UserStatusCell user={props.data[props.row.index]} />,
    }

    // Add subjects column
    const subjectsColumn: Column<User> = {
      Header: 'Subjects',
      id: 'subjects',
      Cell: ({ ...props }) => <UserSubjectsCell user_subjects={props.data[props.row.index].user_subjects} />,
    }

    const remainingColumns: ReadonlyArray<Column<User>> = [
      {
        Header: 'Last login',
        id: 'last_login',
        Cell: ({ ...props }) => <UserLastLoginCell lastseen_at={props.data[props.row.index].lastseen_at} />,
      },
      {
        Header: 'Joined day',
        id: 'joined_day',
        Cell: ({ ...props }) => <UserJoinedDayCell user={props.data[props.row.index]} />,
      },
      {
        Header: 'Actions',
        id: 'actions',
        Cell: ({ ...props }) => <UserActionsCell id={props.data[props.row.index].user_id} />,
      },
    ]

    // Return columns based on user role
    if (isAdmin) {
      return [...baseColumns, statusColumn, subjectsColumn, ...remainingColumns]
    } else {
      return [...baseColumns, statusColumn, subjectsColumn, ...remainingColumns]
    }
  }, [isAdmin])
}

export { useUsersColumns }
