import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../_metronic/layout/core'
import AdminRouteGuard from './AdminRouteGuard'
import SubjectCreatePage from './subjects/SubjectCreatePage'
import SubjectEditPage from './subjects/SubjectEditPage'
import SubjectsPage from './subjects/SubjectsPage'
import SchoolSubjectCreatePage from './subjects/SchoolSubjectCreatePage'

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

const AdminPage = () => {
  return (
    <AdminRouteGuard>
      <Routes>
        <Route element={<Outlet />}>
          {/* Subjects Routes */}
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
          
          {/* Default redirect */}
          <Route index element={<Navigate to='/dashboard' />} />
        </Route>
      </Routes>
    </AdminRouteGuard>
  )
}

export default AdminPage 