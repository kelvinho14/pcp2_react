import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../_metronic/layout/core'
import AdminRouteGuard from './AdminRouteGuard'
import SubjectCreatePage from './subjects/SubjectCreatePage'
import SubjectEditPage from './subjects/SubjectEditPage'
import SubjectsPage from './subjects/SubjectsPage'
import SchoolCreatePage from './schools/SchoolCreatePage'
import SchoolEditPage from './schools/SchoolEditPage'
import SchoolsPage from './schools/SchoolsPage'
import SchoolSubjectCreatePage from './subjects/SchoolSubjectCreatePage'
import AdminUsersPage from './AdminUsersPage'
import UserAddPage from '../users/UserAddPage'
import UserEditPage from '../users/UserEditPage'
import MigrationsPage from './migrations/MigrationsPage'
import TokenUsagePage from './token/TokenUsagePage'
import TokenPlanPage from './token/TokenPlanPage'
import HealthCheckPage from './health-check/HealthCheckPage'

const adminBreadcrumbs: Array<PageLink> = [
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
]

const userEditBreadcrumbs: Array<PageLink> = [
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
    title: 'User List',
    path: '/admin/users/list',
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

const AdminPage = () => {
  return (
    <AdminRouteGuard>
      <Routes>
        <Route element={<Outlet />}>
          {/* Subjects Routes */}
          <Route
            path='subjects'
            element={<Navigate to='/admin/subjects/list' replace />}
          />
          <Route
            path='subjects/'
            element={<Navigate to='/admin/subjects/list' replace />}
          />
          <Route
            path='subjects/list'
            element={<SubjectsPage />}
          />
          <Route
            path='subjects/create'
            element={
              <>
                <PageTitle breadcrumbs={adminBreadcrumbs}>Create Subject</PageTitle>
                <SubjectCreatePage />
              </>
            }
          />
          <Route
            path='subjects/edit/:id'
            element={<SubjectEditPage />}
          />
          
          {/* Schools Routes */}
          <Route
            path='schools'
            element={<Navigate to='/admin/schools/list' replace />}
          />
          <Route
            path='schools/'
            element={<Navigate to='/admin/schools/list' replace />}
          />
          <Route
            path='schools/list'
            element={<SchoolsPage />}
          />
          <Route
            path='schools/create'
            element={<SchoolCreatePage />}
          />
          <Route
            path='schools/edit/:id'
            element={<SchoolEditPage />}
          />
          
          {/* School Subjects Routes */}
          <Route
            path='school-subjects/create'
            element={
              <>
                <PageTitle breadcrumbs={adminBreadcrumbs}>Create School Subject</PageTitle>
                <SchoolSubjectCreatePage />
              </>
            }
          />
          
          {/* Users Routes */}
          <Route
            path='users'
            element={<Navigate to='/admin/users/list' replace />}
          />
          <Route
            path='users/'
            element={<Navigate to='/admin/users/list' replace />}
          />
          <Route
            path='users/list'
            element={<AdminUsersPage />}
          />
          <Route
            path='users/add'
            element={
              <>
                <PageTitle breadcrumbs={adminBreadcrumbs}>Add User</PageTitle>
                <UserAddPage />
              </>
            }
          />
          <Route
            path='users/edit/:user_id'
            element={
              <>
                <PageTitle breadcrumbs={userEditBreadcrumbs}>Edit User</PageTitle>
                <UserEditPage />
              </>
            }
          />
          
          {/* Migrations Routes */}
          <Route
            path='migrations'
            element={<MigrationsPage />}
          />
          
          {/* Token Usage Routes */}
          <Route
            path='token/usage'
            element={
              <>
                <PageTitle breadcrumbs={adminBreadcrumbs}>Token Usage</PageTitle>
                <TokenUsagePage />
              </>
            }
          />
          
          {/* Token Plan Routes */}
          <Route
            path='token/plan'
            element={
              <>
                <PageTitle breadcrumbs={adminBreadcrumbs}>Token Plans</PageTitle>
                <TokenPlanPage />
              </>
            }
          />
          
          {/* Health Check Routes */}
          <Route
            path='health-check'
            element={<HealthCheckPage />}
          />
          
          {/* Default redirect */}
          <Route index element={<Navigate to='/dashboard' />} />
        </Route>
      </Routes>
    </AdminRouteGuard>
  )
}

export default AdminPage 