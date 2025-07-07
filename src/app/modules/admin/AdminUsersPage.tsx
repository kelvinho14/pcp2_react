import {PageLink, PageTitle} from '../../../_metronic/layout/core'
import {UsersListWrapper} from '../users/users-list/UsersList'

const adminUsersBreadcrumbs: Array<PageLink> = [
  {
    title: 'Admin',
    path: '/admin',
    isSeparator: false,
    isActive: false,
  },
  {
    title: '',
    path: '',
    isSeparator: true,
    isActive: false,
  },
  {
    title: 'Users',
    path: '/admin/users/list',
    isSeparator: false,
    isActive: true,
  },
]

const AdminUsersPage = () => {
  return (
    <>
      <PageTitle breadcrumbs={adminUsersBreadcrumbs}>Users list</PageTitle>
      <UsersListWrapper />
    </>
  )
}

export default AdminUsersPage 