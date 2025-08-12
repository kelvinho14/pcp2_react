import {FC, useEffect, useState} from 'react'
import {Video, fetchVideoById} from '../../store/videos/videosSlice'
import VideoPreview from './VideoPreview'
import VideoInfoDisplay from './VideoInfoDisplay'
import {KTIcon} from '../../_metronic/helpers'
import {useAuth} from '../../app/modules/auth'
import {isTeachingStaff} from '../../app/constants/roles'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../store'

interface VideoDetailModalProps {
  videoId: string | null
  isOpen: boolean
  onClose: () => void
  isTeachingStaff?: boolean
}

const VideoDetailModal: FC<VideoDetailModalProps> = ({videoId, isOpen, onClose, isTeachingStaff = true}) => {
  const dispatch = useDispatch<AppDispatch>()
  const {currentUser} = useAuth()
  const {currentVideo, loading} = useSelector((state: RootState) => state.videos)
  const [video, setVideo] = useState<Video | null>(null)

  // Fetch video details when modal opens
  useEffect(() => {
    if (isOpen && videoId) {
      dispatch(fetchVideoById(videoId))
    }
  }, [isOpen, videoId, dispatch])

  // Update local video state when currentVideo changes
  useEffect(() => {
    if (currentVideo) {
      setVideo(currentVideo)
    }
  }, [currentVideo])

  if (!isOpen || !videoId) return null

  return (
    <div className='modal fade show d-block' style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
      <div className='modal-dialog modal-fullscreen-lg-down modal-xl' style={{maxWidth: '1200px'}}>
        <div className='modal-content'>
          <div className='modal-header' style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderBottom: '2px solid #e9ecef'}}>
            <div className='d-flex align-items-center gap-3 flex-grow-1'>
              <h5 className='modal-title mb-0 d-flex align-items-center'>
                {loading ? (
                  <span>Loading video details...</span>
                ) : video ? (
                  <>
                    {isTeachingStaff && (
                      <i className={`${video.source === 1 ? 'fab fa-youtube text-danger' : 'fab fa-vimeo-v text-primary'} me-2`}></i>
                    )}
                    {video.title}
                  </>
                ) : (
                  <span>Video not found</span>
                )}
              </h5>
              {video && video.status === 1 && (
                <span className='badge badge-light-warning'>
                  <i className='fas fa-lock me-1'></i>
                  Private
                </span>
              )}
            </div>
            <button
              type='button'
              className='btn-close'
              onClick={onClose}
            ></button>
          </div>
          
          <div className='modal-body p-4' style={{maxHeight: '80vh', overflowY: 'auto'}}>
            {loading ? (
              <div className='text-center py-5'>
                <div className='spinner-border text-primary' role='status'>
                  <span className='visually-hidden'>Loading...</span>
                </div>
                <p className='mt-3 text-muted'>Loading video details...</p>
              </div>
            ) : video ? (
              <>
                <div className='row'>
                  <div className='col-12'>
                    <VideoPreview
                      video={video}
                      width='100%'
                      height='500px'
                      className='mb-4'
                    />
                  </div>
                </div>

                <VideoInfoDisplay
                  video={video}
                  isTeachingStaff={isTeachingStaff}
                  showEditButton={false}
                  showBackButton={false}
                />
              </>
            ) : (
              <div className='text-center py-5'>
                <i className='fas fa-exclamation-triangle text-warning' style={{fontSize: '3rem'}}></i>
                <h5 className='mt-3 text-muted'>Video not found</h5>
                <p className='text-muted'>The requested video could not be loaded.</p>
              </div>
            )}
          </div>
          
          <div className='modal-footer' style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderTop: '2px solid #e9ecef'}}>
            <button
              type='button'
              className='btn btn-secondary'
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoDetailModal 