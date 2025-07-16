import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../_metronic/layout/core'
import GroupAddPage from './GroupAddPage'
import {GroupsList} from './groups-list/GroupsList'

const groupsBreadcrumbs: Array<PageLink> = [
  {
    title: 'Home',
    path: '/dashboard',
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
    title: 'Groups',
    path: '/groups',
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

const groupEditBreadcrumbs: Array<PageLink> = [
  {
    title: 'Home',
    path: '/dashboard',
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
    title: 'Groups',
    path: '/groups',
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
    title: 'Group List',
    path: '/groups/list',
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

const GroupsPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        {/* Groups Routes */}
        <Route
          path='list'
          element={
            <>
              <PageTitle breadcrumbs={groupsBreadcrumbs}>Groups list</PageTitle>
              <GroupsList />
            </>
          }
        />
        <Route
          path='add'
          element={
            <>
              <PageTitle breadcrumbs={groupEditBreadcrumbs}>Add Group</PageTitle>
              <GroupAddPage />
            </>
          }
        />
        <Route
          path='edit/:group_id'
          element={
            <>
              <PageTitle breadcrumbs={groupEditBreadcrumbs}>Edit Group</PageTitle>
              <GroupAddPage />
            </>
          }
        />
        
        {/* Default redirect */}
        <Route index element={<Navigate to='/groups/list' />} />
      </Route>
    </Routes>
  )
}

export default GroupsPage 