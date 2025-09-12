import {FC, lazy, Suspense} from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import TopBarProgress from 'react-topbar-progress-indicator'
import {getCSSVariableValue} from '../../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../../_metronic/helpers'

const NotificationsListPage = lazy(() => import('./notifications-list/NotificationsList'))

const SuspensedView: FC<WithChildren> = ({children}) => {
  const baseColor = getCSSVariableValue('--bs-primary')
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    shadowBlur: 5,
  })
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

const NotificationsPage: FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to='/notifications/list' />} />
      <Route
        path='list'
        element={
          <SuspensedView>
            <NotificationsListPage />
          </SuspensedView>
        }
      />
    </Routes>
  )
}

export {NotificationsPage}
export default NotificationsPage
