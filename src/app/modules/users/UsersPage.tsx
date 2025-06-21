import {PageLink, PageTitle} from '../../../_metronic/layout/core'
import {UsersListWrapper} from './users-list/UsersList'

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'User Management',
    path: '/users/list',
    isSeparator: false,
    isActive: false,
  },
  {
    title: '',
    path: '',
    isSeparator: true,
    isActive: false,
  },
]

const UsersPage = () => {
  return (
    <>
      <PageTitle breadcrumbs={usersBreadcrumbs}>Users list</PageTitle>
      <UsersListWrapper />
    </>
  )
}

export default UsersPage
