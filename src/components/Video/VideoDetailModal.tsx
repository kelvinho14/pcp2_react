import {FC} from 'react'
import {Video} from '../../store/videos/videosSlice'
import VideoPreview from './VideoPreview'
import {KTIcon} from '../../_metronic/helpers'
import {formatApiTimestamp} from '../../_metronic/helpers/dateUtils'

interface VideoDetailModalProps {
  video: Video | null
  isOpen: boolean
  onClose: () => void
}

const VideoDetailModal: FC<VideoDetailModalProps> = ({video, isOpen, onClose}) => {
  if (!video || !isOpen) return null

  const getPlatformIcon = (platform: string) => {
    if (platform === 'youtube') {
      return 'fab fa-youtube text-danger'
    } else if (platform === 'vimeo') {
      return 'fab fa-vimeo-v text-primary'
    }
    return 'fas fa-video'
  }

  return (
    <div className='modal fade show d-block' style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className='modal-dialog modal-xl'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title d-flex align-items-center'>
              <i className={`${getPlatformIcon(video.platform)} me-2`}></i>
              {video.title}
            </h5>
            <button
              type='button'
              className='btn-close'
              onClick={onClose}
            ></button>
          </div>
          
          <div className='modal-body'>
            <div className='row'>
              <div className='col-12'>
                <VideoPreview 
                  video={video} 
                  width='100%' 
                  height='400px' 
                  className='mb-4'
                />
              </div>
              
              <div className='col-12'>
                <div className='card'>
                  <div className='card-body'>
                    <h6 className='card-title'>Video Details</h6>
                    
                    <div className='row'>
                      <div className='col-md-6'>
                        <p><strong>Title:</strong> {video.title}</p>
                        {video.description && (
                          <p><strong>Description:</strong> {video.description}</p>
                        )}
                        <p><strong>Platform:</strong> 
                          <span className={`badge badge-light-${video.platform === 'youtube' ? 'danger' : 'primary'} ms-2`}>
                            <i className={`${getPlatformIcon(video.platform)} me-1`}></i>
                            {video.platform}
                          </span>
                        </p>
                      </div>
                      
                      <div className='col-md-6'>
                        <p><strong>Teacher:</strong> {video.teacher_name}</p>
                        <p><strong>Created:</strong> {formatApiTimestamp(video.created_at, { format: 'date' })}</p>
                        {video.duration && (
                          <p><strong>Duration:</strong> {video.duration}</p>
                        )}
                        {video.tags && video.tags.length > 0 && (
                          <div>
                            <strong>Tags:</strong>
                            <div className='mt-1'>
                              {video.tags.map((tag, index) => (
                                <span key={index} className='badge badge-light-info me-1'>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className='modal-footer'>
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