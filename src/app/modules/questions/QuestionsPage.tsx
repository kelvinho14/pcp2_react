import {FC, lazy, Suspense} from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import TopBarProgress from 'react-topbar-progress-indicator'
import {getCSSVariableValue} from '../../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../../_metronic/helpers'

const LQFormPage = lazy(() => import('./lq/LQFormPage'))
const QuestionsListWrapper = lazy(() => import('./lq/questions-list/QuestionsList'))
const MCFormPage = lazy(() => import('./mc/MCFormPage'))
const MCListWrapper = lazy(() => import('./mc/questions-list/QuestionsList'))

const QuestionsPage: FC = () => {
  return (
    <Routes>
      <Route path='lq/create' element={
        <SuspensedView>
          <LQFormPage />
        </SuspensedView>
      } />
      <Route path='lq/edit/:qId' element={
        <SuspensedView>
          <LQFormPage />
        </SuspensedView>
      } />
      <Route path='lq/list' element={
        <SuspensedView>
          <QuestionsListWrapper />
        </SuspensedView>
      } />
      <Route path='mc/create' element={
        <SuspensedView>
          <MCFormPage />
        </SuspensedView>
      } />
      <Route path='mc/edit/:qId' element={
        <SuspensedView>
          <MCFormPage />
        </SuspensedView>
      } />
      <Route path='mc/list' element={
        <SuspensedView>
          <MCListWrapper />
        </SuspensedView>
      } />
      <Route path='*' element={<Navigate to='lq/create' />} />
    </Routes>
  )
}

const SuspensedView: FC<WithChildren> = ({children}) => {
  const baseColor = getCSSVariableValue('--kt-primary') || '#009ef7'
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  })
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

export default QuestionsPage 