import React, { FC, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
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
import { formatApiTimestamp } from '../../../../_metronic/helpers/dateUtils'

import './StudentAssignedVideosPage.scss'
import '../teacher-video-list/TeacherVideoListPage.css'

const StudentAssignedVideosPage: FC = () => {
  const intl = useIntl()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  
  const { packages = [], loading = false, error = null, total = 0 } = useSelector(
    (state: RootState) => state.studentAssignedVideos
  ) || { packages: [], loading: false, error: null, total: 0 }

  // State to track which packages are expanded (collapsed by default)
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set())

  // Toggle package expansion
  const togglePackage = (packageId: string) => {
    setExpandedPackages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(packageId)) {
        newSet.delete(packageId)
      } else {
        newSet.add(packageId)
      }
      return newSet
    })
  }



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
    // Navigate to the video detail page
    navigate(`/videos/${video.video_id}`)
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
    <div className='student-assigned-videos-page'>
      <PageTitle breadcrumbs={[
        {
          title: 'Home',
          path: '/',
          isSeparator: false,
          isActive: false,
        },
        {
          title: 'Videos',
          path: '/videos/list',
          isSeparator: false,
          isActive: false,
        },
      ]}>
        {intl.formatMessage({ id: 'MENU.VIDEOS.ASSIGNED_LIST' })}
      </PageTitle>

      {/* Welcome Banner */}
      <div className='welcome-section'>
        <div className='welcome-content'>
          <div className='welcome-text'>
            <h2 className='welcome-title'>Your Assigned Videos! 🎬</h2>
            <p className='welcome-subtitle'>Complete your video assignments</p>
          </div>
        </div>
      </div>

      {error && (
        <div className='alert alert-danger alert-dismissible fade show mb-5' role='alert'>
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
        packages.map((pkg) => (
          <div key={pkg.package_id} className='card card-custom card-stretch mb-6'>
            <div 
              className='card-header border-0 pt-5 cursor-pointer'
              onClick={() => togglePackage(pkg.package_id)}
              style={{ cursor: 'pointer' }}
            >
              <div className='d-flex justify-content-between align-items-center w-100'>
                <h3 className='card-title align-items-start flex-column mb-0'>
                  <span className='card-label fw-bold fs-4 mb-1'>
                    {pkg.package_name || (() => {
                      const assignedDate = new Date(pkg.assigned_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })
                      const firstVideoTitle = pkg.videos?.[0]?.video_title
                  
                      if (firstVideoTitle && pkg.total_videos === 1) {
                        return firstVideoTitle
                      } else if (firstVideoTitle && pkg.total_videos > 1) {
                        return `${firstVideoTitle} + ${pkg.total_videos - 1} more`
                      } else {
                        return `Video Assignment - ${assignedDate}`
                      }
                    })()}
                  </span>
                  <span className='text-muted mt-1 fw-semibold fs-7'>
                    {pkg.total_videos} videos • Assigned on {formatApiTimestamp(pkg.assigned_at, { format: 'date' })}
                    {pkg.due_date && ` • Due by ${formatApiTimestamp(pkg.due_date, { format: 'date' })}`}
                  </span>
                </h3>
                <div className='d-flex align-items-center'>
                  <button
                    type='button'
                    className='btn btn-sm btn-light-primary'
                    onClick={(e) => {
                      e.stopPropagation()
                      togglePackage(pkg.package_id)
                    }}
                    title={expandedPackages.has(pkg.package_id) ? 'Hide Videos' : 'Show Videos'}
                  >
                    <i className={`fas fa-chevron-${expandedPackages.has(pkg.package_id) ? 'up' : 'down'}`}></i>
                  </button>
                </div>
              </div>
            </div>

            {pkg.message_for_student && (
              <div className='card-body py-3'>
                <div className='alert alert-info mb-0'>
                  <KTIcon iconName='message-text-2' className='fs-2 me-2' />
                  <strong>Message from your teacher:</strong> 
                  <span dangerouslySetInnerHTML={{ __html: pkg.message_for_student }} />
                </div>
              </div>
            )}

            {/* Collapsible video list */}
            {expandedPackages.has(pkg.package_id) && (
              <div className='card-body py-3'>
                <div className='row g-4'>
                  {pkg.videos.map((video) => (
                    <div key={video.assignment_id} className='col-md-6 col-lg-4'>
                      <div className='card card-custom card-stretch h-100'>
                        {video.video_thumbnail && (
                          <div 
                            className='card-img-top position-relative cursor-pointer'
                            onClick={() => handleVideoClick(video)}
                            style={{ cursor: 'pointer' }}
                          >
                            <img 
                              src={video.video_thumbnail} 
                              alt={video.video_title}
                              className='w-100'
                              style={{ height: '180px', objectFit: 'cover' }}
                            />
                            {video.video_duration && (
                              <div className='video-duration'>
                                {Math.floor(video.video_duration / 60)}:{(video.video_duration % 60).toString().padStart(2, '0')}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className='card-body p-4'>
                          <h5 className='card-title fw-bold fs-6 mb-2 text-truncate'>
                            {video.video_title}
                          </h5>

                          {video.video_description && (
                            <p className='text-muted fs-7 mb-3 line-clamp-2'>
                              {video.video_description}
                            </p>
                          )}

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
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default StudentAssignedVideosPage 