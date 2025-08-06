import {FC, lazy, Suspense} from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import TopBarProgress from 'react-topbar-progress-indicator'
import {getCSSVariableValue} from '../../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../../_metronic/helpers'
import TeacherRouteGuard from './TeacherRouteGuard'

const VideoListPage = lazy(() => import('./video-list/VideoListPage'))
const VideoAssignedListPage = lazy(() => import('./video-assigned-list/VideoAssignedListPage'))
const TeacherVideoListPage = lazy(() => import('./teacher-video-list/TeacherVideoListPage'))
const VideoDetailPage = lazy(() => import('./video-detail/VideoDetailPage'))

const VideoPage: FC = () => {
  return (
    <Routes>
      <Route path='all' element={
        <SuspensedView>
          <VideoListPage />
        </SuspensedView>
      } />
      <Route path='assignedlist' element={
        <SuspensedView>
          <VideoAssignedListPage />
        </SuspensedView>
      } />
      <Route path='list' element={
        <SuspensedView>
          <TeacherVideoListPage />
        </SuspensedView>
      } />
      <Route path=':videoId' element={
        <SuspensedView>
          <VideoDetailPage />
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

export default VideoPage 