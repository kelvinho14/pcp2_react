import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../_metronic/layout/core'
import {UsersListWrapper} from './users-list/UsersList'
import UserEditPage from './UserEditPage'
import UserAddPage from './UserAddPage'
import UserSettingsPage from './UserSettingsPage'

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'Users',
    path: '/users',
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

const userEditBreadcrumbs: Array<PageLink> = [
  {
    title: 'Users',
    path: '/users',
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
    title: 'User List',
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

const userSettingsBreadcrumbs: Array<PageLink> = [
  {
    title: 'Users',
    path: '/users',
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
    title: 'Settings',
    path: '/users/settings',
    isSeparator: false,
    isActive: false,
  },
]

const UsersPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        {/* Users Routes */}
        <Route
          path='list'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>Users list</PageTitle>
              <UsersListWrapper />
            </>
          }
        />
        <Route
          path='add'
          element={
            <>
              <PageTitle breadcrumbs={userEditBreadcrumbs}>Add User</PageTitle>
              <UserAddPage />
            </>
          }
        />
        <Route
          path='edit/:user_id'
          element={
            <>
              <PageTitle breadcrumbs={userEditBreadcrumbs}>Edit User</PageTitle>
              <UserEditPage />
            </>
          }
        />
        <Route
          path='settings'
          element={
            <>
              <PageTitle breadcrumbs={userSettingsBreadcrumbs}>User Settings</PageTitle>
              <UserSettingsPage />
            </>
          }
        />
        
        {/* Default redirect */}
        <Route index element={<Navigate to='/users/list' />} />
      </Route>
    </Routes>
  )
}

export default UsersPage
