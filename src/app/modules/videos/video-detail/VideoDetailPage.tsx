import {FC, useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../../store'
import {fetchVideoById, updateVideo, Video, VideoFormData} from '../../../../store/videos/videosSlice'
import {fetchTags} from '../../../../store/tags/tagsSlice'
import {PageTitle} from '../../../../_metronic/layout/core'
import {useIntl} from 'react-intl'
import {useAuth} from '../../../../app/modules/auth'
import {isTeachingStaff} from '../../../../app/constants/roles'
import VideoPreview from '../../../../components/Video/VideoPreview'
import VideoInfoDisplay from '../../../../components/Video/VideoInfoDisplay'
import VideoTagInput from '../../../../components/Video/VideoTagInput'
import {toast} from '../../../../_metronic/helpers/toast'
import {Modal, Button} from 'react-bootstrap'
import axios from 'axios'
import {getHeadersWithSchoolSubject} from '../../../../_metronic/helpers/axios'
import {formatApiTimestamp} from '../../../../_metronic/helpers/dateUtils'
import './VideoDetailPage.css'

const VideoDetailPage: FC = () => {
  const {videoId} = useParams<{videoId: string}>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const {currentUser} = useAuth()
  
  const {currentVideo, loading, error, updating} = useSelector((state: RootState) => state.videos)
  const {tags} = useSelector((state: RootState) => state.tags)
  // Remove the assignedVideoPackages selector since we don't need it anymore
  const [video, setVideo] = useState<Video | null>(null)

  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState<VideoFormData>({
    source: 1,
    tags: [],
    youtube_urls: [],
    vimeo_ids: [],
    status: 1,
  })

  const API_URL = import.meta.env.VITE_APP_API_URL

  // Helper function to check if the current video is assigned to the student
  const isVideoAssignedToStudent = (videoId: string): boolean => {
    // Use the assignment information from the video response
    return currentVideo?.is_assigned_to_current_user || false
  }

  // Helper function to get appropriate privacy label for students
  const getPrivacyLabel = (video: Video): { text: string; icon: string } | null => {
    console.log('VideoDetailPage getPrivacyLabel called with video:', {
      video_id: video.video_id,
      status: video.status,
      user_role: currentUser?.role?.role_type,
      isTeachingStaff: isTeachingStaff(currentUser?.role?.role_type)
    })
    
    // For public videos, show no label regardless of user role
    if (video.status === 2) {
      console.log('Video is public, returning null')
      return null
    }
    
    const isStudent = !isTeachingStaff(currentUser?.role?.role_type)
    
    if (isStudent) {
      console.log('User is a student, private video - returning "Assigned to You"')
      // For students, show "Assigned to You" for private videos
      return {
        text: 'Assigned to You',
        icon: 'fas fa-user-check'
      }
    }
    
    console.log('User is teaching staff, returning "Private"')
    // For teachers, show private for private videos
    return {
      text: 'Private',
      icon: 'fas fa-lock'
    }
  }

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

  // Fetch tags on component mount
  useEffect(() => {
    dispatch(fetchTags())
  }, [dispatch])

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



  // Handle edit click
  const handleEditClick = (video: Video) => {
    setFormData({
      source: video.source,
      tags: video.tags?.map(tag => ({ tag_id: tag.tag_id })) || [],
      youtube_urls: video.source === 1 ? [`https://www.youtube.com/watch?v=${video.video_id_external}`] : [],
      vimeo_ids: video.source === 2 ? [video.video_id_external] : [],
      status: video.status,
    })
    setShowEditModal(true)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!video) return

    try {
      await dispatch(updateVideo({
        videoId: video.video_id,
        videoData: formData,
      })).unwrap()
      
      setShowEditModal(false)
      setFormData({
        source: 1,
        tags: [],
        youtube_urls: [],
        vimeo_ids: [],
        status: 1,
      })
      
      // Refresh the video data
      dispatch(fetchVideoById(video.video_id))
    } catch (error) {
      // Error is handled by the thunk
    }
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
          title: isTeachingStaff(currentUser?.role?.role_type) ? 'Video Management' : 'Videos',
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
              <div className='d-flex align-items-center gap-3'>
                <h5 className='card-title mb-0'>{video.title}</h5>
                {(() => {
                  const privacyLabel = getPrivacyLabel(video)
                  return privacyLabel ? (
                    <span className={`badge ${privacyLabel.text === 'Assigned to You' ? 'badge-light-success' : 'badge-light-warning'}`}>
                      <i className={`${privacyLabel.icon} me-1`}></i>
                      {privacyLabel.text}
                    </span>
                  ) : null
                })()}
              </div>
            </div>
            <div className='card-body'>
              <VideoInfoDisplay
                video={video}
                isTeachingStaff={isTeachingStaff(currentUser?.role?.role_type)}
                showEditButton={true}
                onEditClick={handleEditClick}
                showBackButton={true}
                onBackClick={() => navigate('/videos/list')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Video Modal */}
      {showEditModal && video && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
          <form onSubmit={handleSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Video</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {/* Video Preview */}
              <div className='mb-4 p-3 bg-light rounded'>
                <div className='row align-items-center'>
                  <div className='col-md-3'>
                    <div className='position-relative'>
                      <img
                        src={video.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNjAgOTBDMTYwIDkwIDE2MCA5MCAxNjAgOTBDMTYwIDkwIDE2MCA5MCAxNjAgOTBaIiBmaWxsPSIjQ0NDQ0NDIi8+Cjx0ZXh0IHg9IjE2MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K'}
                        alt={video.title}
                        className='img-fluid rounded'
                        style={{width: '100%', maxWidth: '150px'}}
                      />
                    </div>
                  </div>
                  <div className='col-md-9'>
                    <h6 className='fw-bold mb-1 text-truncate' title={video.title}>{video.title}</h6>
                    <div className='d-flex align-items-center gap-2 flex-wrap'>
                      {isTeachingStaff(currentUser?.role?.role_type) && (
                        <span className={`badge badge-light-${video.source === 1 ? 'danger' : 'primary'} badge-sm`}>
                          <i className={`${video.source === 1 ? 'fab fa-youtube text-danger' : 'fab fa-vimeo-v text-primary'} me-1`}></i>
                          {video.source === 1 ? 'YouTube' : 'Vimeo'}
                        </span>
                      )}
                      {video.duration && (
                        <span className='text-muted small'>
                          <i className='fas fa-clock me-1'></i>
                          {`${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`}
                        </span>
                      )}
                      <span className='text-muted small'>
                        <i className='fas fa-eye me-1'></i>
                        {video.click_count || 0} views
                      </span>
                      {(() => {
                        const privacyLabel = getPrivacyLabel(video)
                        return privacyLabel ? (
                          <span className={`badge badge-sm ${privacyLabel.text === 'Assigned to You' ? 'badge-light-success' : 'badge-light-warning'}`}>
                            <i className={`${privacyLabel.icon} me-1`}></i>
                            {privacyLabel.text}
                          </span>
                        ) : null
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Video URL (only for YouTube) */}
              {video.source === 1 && (
                <div className='mb-4'>
                  <label className='form-label'>Video URL *</label>
                  <input
                    type='url'
                    className='form-control'
                    placeholder='https://www.youtube.com/watch?v=...'
                    value={formData.youtube_urls?.[0] || ''}
                    onChange={(e) => {
                      const url = e.target.value
                      setFormData({...formData, youtube_urls: [url], vimeo_ids: []})
                    }}
                    required
                  />
                  <div className='form-text'>
                    YouTube video URL
                  </div>
                </div>
              )}

              {/* Tags Section */}
              <div className='mb-4 p-3 bg-light rounded'>
                <h6 className='fw-bold mb-3 text-primary'>
                  <i className='fas fa-tags me-2'></i>
                  Tags
                </h6>
                <VideoTagInput
                  options={tags}
                  selectedTags={formData.tags?.map(tag => ({id: tag.tag_id || '', name: tag.name || tags.find(t => t.id === tag.tag_id)?.name || ''})) || []}
                  onChange={(selectedTags) => setFormData({
                    ...formData, 
                    tags: selectedTags.map(tag => {
                      if (tag.isNew || tag.id.startsWith('new-')) { return { name: tag.name } }
                      else { return { tag_id: tag.id } }
                    })
                  })}
                  placeholder='Search and select tags or create new ones'
                />
              </div>

              {/* Video Access Section */}
              <div className='mb-4 p-3 bg-light rounded'>
                <h6 className='fw-bold mb-3 text-primary'>
                  <i className='fas fa-users me-2'></i>
                  Video Access
                </h6>
                <div className='form-check mb-3'>
                  <input
                    className='form-check-input'
                    type='radio'
                    name='videoStatus'
                    id='assignOnly'
                    value='1'
                    checked={formData.status === 1}
                    onChange={(e) => setFormData({...formData, status: parseInt(e.target.value) as 1 | 2})}
                  />
                  <label className='form-check-label' htmlFor='assignOnly'>
                    <i className='fas fa-lock me-1'></i>
                    Assign Only (Private)
                  </label>
                </div>
                <div className='form-check'>
                  <input
                    className='form-check-input'
                    type='radio'
                    name='videoStatus'
                    id='openToStudents'
                    value='2'
                    checked={formData.status === 2}
                    onChange={(e) => setFormData({...formData, status: parseInt(e.target.value) as 1 | 2})}
                  />
                  <label className='form-check-label' htmlFor='openToStudents'>
                    <i className='fas fa-globe me-1'></i>
                    Open to Students
                  </label>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant='secondary' onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type='submit' variant='primary' disabled={updating}>
                {updating ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2' role='status'></span>
                    Updating...
                  </>
                ) : (
                  'Update Video'
                )}
              </Button>
            </Modal.Footer>
          </form>
        </Modal>
      )}
    </>
  )
}

export default VideoDetailPage 