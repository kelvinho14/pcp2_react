import {FC, lazy, Suspense} from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import TopBarProgress from 'react-topbar-progress-indicator'
import {getCSSVariableValue} from '../../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../../_metronic/helpers'
import StudentRouteGuard from './StudentRouteGuard'
import NonStudentRouteGuard from '../token/NonStudentRouteGuard'

const ExerciseFormPage = lazy(() => import('./ExerciseFormPage'))
const ExerciseListPage = lazy(() => import('./exercise-list/ExerciseListPage'))
const ExerciseAssignedListPage = lazy(() => import('./exercise-assigned-list/ExerciseAssignedListPage'))
const ExerciseDashboardPage = lazy(() => import('./student-dashboard/ExerciseDashboardPage'))
const ExerciseAttemptPage = lazy(() => import('./exercise-attempt/ExerciseAttemptPage'))
const ExerciseProgressPage = lazy(() => import('./exercise-progress/ExerciseProgressPage'))
const ExerciseMyResultPage = lazy(() => import('./student-result/ExerciseMyResultPage'))
const ExerciseStatsPage = lazy(() => import('./exercise-stats/ExerciseStatsPage'))

const ExercisePage: FC = () => {
  return (
    <Routes>
      <Route path='create' element={
        <NonStudentRouteGuard>
          <SuspensedView>
            <ExerciseFormPage />
          </SuspensedView>
        </NonStudentRouteGuard>
      } />
      <Route path='edit/:exerciseId' element={
        <NonStudentRouteGuard>
          <SuspensedView>
            <ExerciseFormPage />
          </SuspensedView>
        </NonStudentRouteGuard>
      } />
      <Route path='list' element={
        <NonStudentRouteGuard>
          <SuspensedView>
            <ExerciseListPage />
          </SuspensedView>
        </NonStudentRouteGuard>
      } />
      <Route path='assignedlist' element={
        <NonStudentRouteGuard>
          <SuspensedView>
            <ExerciseAssignedListPage />
          </SuspensedView>
        </NonStudentRouteGuard>
      } />
      <Route path='dashboard' element={
        <StudentRouteGuard>
          <SuspensedView>
            <ExerciseDashboardPage />
          </SuspensedView>
        </StudentRouteGuard>
      } />
      <Route path='attempt/:assignmentId' element={
        <SuspensedView>
          <ExerciseAttemptPage />
        </SuspensedView>
      } />
      <Route path='myresult/:assignmentId' element={
        <SuspensedView>
          <ExerciseMyResultPage />
        </SuspensedView>
      } />
      <Route path='progress/:exerciseId' element={
        <NonStudentRouteGuard>
          <SuspensedView>
            <ExerciseProgressPage />
          </SuspensedView>
        </NonStudentRouteGuard>
      } />
      <Route path=':exerciseId/stats' element={
        <NonStudentRouteGuard>
          <SuspensedView>
            <ExerciseStatsPage />
          </SuspensedView>
        </NonStudentRouteGuard>
      } />
      <Route path='*' element={<Navigate to='list' />} />
    </Routes>
  )
}

const SuspensedView: FC<WithChildren> = ({children}) => {
  const baseColor = getCSSVariableValue('--bs-primary')
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  })
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

export default ExercisePage 