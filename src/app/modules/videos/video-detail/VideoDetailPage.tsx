import {FC, useEffect, useState} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../../store'
import {fetchVideoById, Video} from '../../../../store/videos/videosSlice'
import {PageTitle} from '../../../../_metronic/layout/core'
import {KTIcon} from '../../../../_metronic/helpers'
import VideoPreview from '../../../../components/Video/VideoPreview'
import {useAuth} from '../../../../app/modules/auth'
import {isTeachingStaff} from '../../../../app/constants/roles'
import axios from 'axios'
import {getHeadersWithSchoolSubject} from '../../../../_metronic/helpers/axios'
import './VideoDetailPage.css'

const VideoDetailPage: FC = () => {
  const {videoId} = useParams<{videoId: string}>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const {currentUser} = useAuth()
  
  const {currentVideo, loading, error} = useSelector((state: RootState) => state.videos)
  const [video, setVideo] = useState<Video | null>(null)

  const API_URL = import.meta.env.VITE_APP_API_URL

  const recordVideoClick = async (videoId: string) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos/click`)
      await axios.post(`${API_URL}/videos/click`, { video_id: videoId }, {
        headers,
        withCredentials: true
      })
    } catch (error) {
      // Silently handle error - don't show to user
      console.error('Failed to record video click:', error)
    }
  }

  useEffect(() => {
    if (videoId) {
      dispatch(fetchVideoById(videoId))
      // Record the video click
      recordVideoClick(videoId)
    }
  }, [dispatch, videoId])

  useEffect(() => {
    if (currentVideo) {
      setVideo(currentVideo)
    }
  }, [currentVideo])

  const getEmbedUrl = (video: Video) => {
    // Use play_url if available, otherwise construct embed URL
    if (video.play_url) {
      if (video.source === 1) {
        // For YouTube, convert watch URL to embed URL
        const videoId = video.play_url.match(/[?&]v=([^&]+)/)?.[1] || video.video_id_external
        return `https://www.youtube.com/embed/${videoId}`
      } else if (video.source === 2) {
        // For Vimeo, convert to embed URL
        const videoId = video.play_url.match(/vimeo\.com\/(\d+)/)?.[1] || video.video_id_external
        return `https://player.vimeo.com/video/${videoId}`
      }
    }
    
    // Fallback to constructing embed URL
    if (video.source === 1) {
      return `https://www.youtube.com/embed/${video.video_id_external}`
    } else if (video.source === 2) {
      return `https://player.vimeo.com/video/${video.video_id_external}`
    }
    return ''
  }

  const getPlatformIcon = (source: number) => {
    if (source === 1) {
      return 'fab fa-youtube text-danger'
    } else if (source === 2) {
      return 'fab fa-vimeo-v text-primary'
    }
    return 'fas fa-video'
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className='d-flex justify-content-center align-items-center' style={{height: '50vh'}}>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className='text-center py-5'>
        <i className='fas fa-exclamation-triangle text-warning fs-1 mb-3'></i>
        <h4>Video Not Found</h4>
        <p className='text-muted'>The video you're looking for doesn't exist or has been removed.</p>
        <button
          type='button'
          className='btn btn-primary'
          onClick={() => navigate('/videos/list')}
        >
          <i className='fas fa-arrow-left me-2'></i>
          Back to Videos
        </button>
      </div>
    )
  }

  return (
    <>
      <PageTitle breadcrumbs={[
        {
          title: 'Home',
          path: '/',
          isActive: false,
        },
        {
          title: 'Video Management',
          path: '/videos/list',
          isActive: false,
        },
        {
          title: video.title,
          path: `/videos/${video.video_id}`,
          isActive: true,
        },
      ]}>
        Video Details
      </PageTitle>

      <div className='row'>
        <div className='col-12'>
          <div className='card'>
            <div className='card-body p-0'>
              <VideoPreview
                video={video}
                width='100%'
                height='600px'
                className='w-100'
              />
            </div>
          </div>
        </div>
      </div>

      <div className='row mt-4'>
        <div className='col-12'>
          <div className='card'>
            <div className='card-header'>
              <h5 className='card-title mb-0'>{video.title}</h5>
            </div>
            <div className='card-body'>
              <div className='mb-3'>
                {video.description && (
                  <p className='text-muted small'>{video.description}</p>
                )}
              </div>

              <div className='row g-3'>
                <div className='col-md-3 col-sm-6'>
                  <div className='d-flex align-items-center'>
                    <i className={`${getPlatformIcon(video.source)} me-2`}></i>
                    <span className='small'>
                      {video.source === 1 ? 'YouTube' : 'Vimeo'}
                    </span>
                  </div>
                </div>

                <div className='col-md-3 col-sm-6'>
                  <div className='d-flex align-items-center'>
                    <i className='fas fa-clock me-2'></i>
                    <span className='small'>
                      {video.duration ? formatDuration(video.duration) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className='col-md-3 col-sm-6'>
                  <div className='d-flex align-items-center'>
                    <i className='fas fa-eye me-2'></i>
                    <span className='small'>
                      {video.click_count || 0} views
                    </span>
                  </div>
                </div>

                <div className='col-md-3 col-sm-6'>
                  <div className='d-flex align-items-center'>
                    <i className='fas fa-calendar me-2'></i>
                    <span className='small'>
                      {new Date(video.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {video.status === 1 && (
                  <div className='col-12'>
                    <span className='badge badge-light-warning'>
                      <i className='fas fa-lock me-1'></i>
                      Private
                    </span>
                  </div>
                )}
              </div>

              {video.tags && video.tags.length > 0 && (
                <div className='mt-3'>
                  <h6 className='fw-bold mb-2'>Tags</h6>
                  <div className='d-flex flex-wrap gap-1'>
                    {video.tags.map((tag, index) => (
                      <span key={index} className='badge badge-light-info'>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className='mt-4'>
                <button
                  type='button'
                  className='btn btn-primary me-2'
                  onClick={() => navigate('/videos/list')}
                >
                  <i className='fas fa-arrow-left me-2'></i>
                  Back to Videos
                </button>
                {isTeachingStaff(currentUser?.role?.role_type) && (
                  <button
                    type='button'
                    className='btn btn-outline-secondary'
                    onClick={() => navigate(`/videos/edit/${video.video_id}`)}
                  >
                    <i className='fas fa-edit me-2'></i>
                    Edit Video
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default VideoDetailPage 