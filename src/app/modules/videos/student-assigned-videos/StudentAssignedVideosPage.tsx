import React, { FC, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PageTitle } from '../../../../_metronic/layout/core'
import { useIntl } from 'react-intl'
import { AppDispatch, RootState } from '../../../../store'
import { 
  fetchStudentAssignedVideos, 
  clearError, 
  StudentVideoPackage,
  StudentAssignedVideo 
} from '../../../../store/videos/studentAssignedVideosSlice'
import { KTIcon } from '../../../../_metronic/helpers'
import { useAuth } from '../../../../app/modules/auth'
import VideoModal from '../../../../components/Video/VideoModal'
import { formatDateSmart } from '../../../../_metronic/helpers/dateUtils'

import './StudentAssignedVideosPage.scss'

const StudentAssignedVideosPage: FC = () => {
  const intl = useIntl()
  const dispatch = useDispatch<AppDispatch>()
  const { currentUser } = useAuth()
  
  const { packages, loading, error, total } = useSelector(
    (state: RootState) => state.studentAssignedVideos
  )

  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)

  useEffect(() => {
    dispatch(fetchStudentAssignedVideos())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError())
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, dispatch])

  const handleVideoClick = (video: StudentAssignedVideo) => {
    // Transform the video data to match VideoModal interface
    let playUrl = video.play_url
    
    if (!playUrl) {
      if (video.source === 1) {
        // YouTube
        playUrl = `https://www.youtube.com/embed/${video.video_id_external}`
      } else if (video.source === 2) {
        // Vimeo
        playUrl = `https://player.vimeo.com/video/${video.video_id_external}`
      }
    }
    
    setSelectedVideo({
      video_title: video.video_title,
      play_url: playUrl
    })
    setShowVideoModal(true)
  }



  const getSourceIcon = (source: number) => {
    return source === 1 ? 'fab fa-youtube text-danger' : 'fab fa-vimeo-v text-primary'
  }

  const getSourceLabel = (source: number) => {
    return source === 1 ? 'YouTube' : 'Vimeo'
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '400px' }}>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageTitle breadcrumbs={[]}>
        {intl.formatMessage({ id: 'MENU.VIDEOS.ASSIGNED_LIST' })}
      </PageTitle>

      <div className='card'>
        <div className='card-header border-0 pt-5'>
          <h3 className='card-title align-items-start flex-column'>
            <span className='card-label fw-bold fs-3 mb-1'>
              {intl.formatMessage({ id: 'MENU.VIDEOS.ASSIGNED_LIST' })}
            </span>
            <span className='text-muted mt-1 fw-semibold fs-7'>
              {total} video packages assigned to you
            </span>
          </h3>
        </div>

        <div className='card-body py-3'>
          {error && (
            <div className='alert alert-danger alert-dismissible fade show' role='alert'>
              <span className='alert-text'>{error}</span>
              <button
                type='button'
                className='btn-close'
                onClick={() => dispatch(clearError())}
              ></button>
            </div>
          )}

          {packages.length === 0 ? (
            <div className='text-center py-10'>
              <KTIcon iconName='video' className='fs-3x text-muted mb-5' />
              <h3 className='text-muted mb-2'>No Video Packages Assigned</h3>
              <p className='text-muted fs-6'>
                You haven't been assigned any video packages yet. Check back later or contact your teacher.
              </p>
            </div>
          ) : (
            <div className='row g-6'>
              {packages.map((pkg) => (
                <div key={pkg.package_id} className='col-12'>
                  <div className='card card-custom card-stretch'>
                    <div className='card-header border-0 pt-5'>
                      <h3 className='card-title align-items-start flex-column'>
                        <span className='card-label fw-bold fs-4 mb-1'>
                          {pkg.package_name || `Video Package ${pkg.package_id.slice(0, 8)}`}
                        </span>
                        <span className='text-muted mt-1 fw-semibold fs-7'>
                          {pkg.total_videos} videos • Assigned on {formatDateSmart(pkg.assigned_at)}
                          {pkg.due_date && ` • Due by ${formatDateSmart(pkg.due_date)}`}
                        </span>
                      </h3>
                    </div>

                    {pkg.message_for_student && (
                      <div className='card-body py-3'>
                        <div className='alert alert-info mb-0'>
                          <KTIcon iconName='message-text-2' className='fs-2 me-2' />
                          <strong>Message from your teacher:</strong> {pkg.message_for_student}
                        </div>
                      </div>
                    )}

                    <div className='card-body py-3'>
                      <div className='row g-4'>
                        {pkg.videos.map((video) => (
                          <div key={video.assignment_id} className='col-md-6 col-lg-4'>
                            <div className='card card-custom card-stretch h-100'>
                              <div className='card-body p-4'>
                                <div className='d-flex align-items-center mb-3'>
                                  <i className={`${getSourceIcon(video.source)} fs-2 me-2`}></i>
                                  <span className='badge badge-light-primary fs-7'>
                                    {getSourceLabel(video.source)}
                                  </span>
                                </div>

                                <h5 className='card-title fw-bold fs-6 mb-2 text-truncate'>
                                  {video.video_title}
                                </h5>

                                {video.video_description && (
                                  <p className='text-muted fs-7 mb-3 line-clamp-2'>
                                    {video.video_description}
                                  </p>
                                )}

                                <div className='d-flex justify-content-between align-items-center mb-3'>
                                  {video.video_duration && (
                                    <span className='text-muted fs-8'>
                                      <KTIcon iconName='clock' className='fs-6 me-1' />
                                      {formatDuration(video.video_duration)}
                                    </span>
                                  )}
                                  <span className='text-muted fs-8'>
                                    <KTIcon iconName='user' className='fs-6 me-1' />
                                    {video.assigned_by}
                                  </span>
                                </div>

                                <button
                                  className='btn btn-primary btn-sm w-100'
                                  onClick={() => handleVideoClick(video)}
                                >
                                  <KTIcon iconName='play' className='fs-6 me-2' />
                                  Watch Video
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <VideoModal
        show={showVideoModal}
        onHide={() => setShowVideoModal(false)}
        video={selectedVideo}
        size="xl"
      />
    </>
  )
}

export default StudentAssignedVideosPage 