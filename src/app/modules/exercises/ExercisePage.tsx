import {FC, lazy, Suspense} from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import TopBarProgress from 'react-topbar-progress-indicator'
import {getCSSVariableValue} from '../../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../../_metronic/helpers'

const ExerciseFormPage = lazy(() => import('./ExerciseFormPage'))
const ExerciseListPage = lazy(() => import('./exercise-list/ExerciseListPage'))
const ExerciseAssignedListPage = lazy(() => import('./exercise-assigned-list/ExerciseAssignedListPage'))
const ExerciseDashboardPage = lazy(() => import('./student-dashboard/ExerciseDashboardPage'))
const ExerciseAttemptPage = lazy(() => import('./exercise-attempt/ExerciseAttemptPage'))
const ExerciseProgressPage = lazy(() => import('./exercise-progress/ExerciseProgressPage'))

const ExercisePage: FC = () => {
  return (
    <Routes>
      <Route path='create' element={
        <SuspensedView>
          <ExerciseFormPage />
        </SuspensedView>
      } />
      <Route path='edit/:exerciseId' element={
        <SuspensedView>
          <ExerciseFormPage />
        </SuspensedView>
      } />
      <Route path='list' element={
        <SuspensedView>
          <ExerciseListPage />
        </SuspensedView>
      } />
      <Route path='assignedlist' element={
        <SuspensedView>
          <ExerciseAssignedListPage />
        </SuspensedView>
      } />
      <Route path='dashboard' element={
        <SuspensedView>
          <ExerciseDashboardPage />
        </SuspensedView>
      } />
      <Route path='attempt/:assignmentId' element={
        <SuspensedView>
          <ExerciseAttemptPage />
        </SuspensedView>
      } />
      <Route path='progress/:exerciseId' element={
        <SuspensedView>
          <ExerciseProgressPage />
        </SuspensedView>
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