import {FC} from 'react'
import {Video} from '../../store/videos/videosSlice'
import {formatApiTimestamp} from '../../_metronic/helpers/dateUtils'
import {isTeachingStaff} from '../../app/constants/roles'
import '../../app/modules/videos/video-detail/VideoDetailPage.css'

interface VideoInfoDisplayProps {
  video: Video
  isTeachingStaff?: boolean
  showEditButton?: boolean
  onEditClick?: (video: Video) => void
  showBackButton?: boolean
  onBackClick?: () => void
}

const VideoInfoDisplay: FC<VideoInfoDisplayProps> = ({
  video,
  isTeachingStaff = false,
  showEditButton = false,
  onEditClick,
  showBackButton = false,
  onBackClick
}) => {
  // Helper functions (same as VideoDetailPage)
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

  // Helper function to get appropriate privacy label
  const getPrivacyLabel = (video: Video): { text: string; icon: string } => {
    return {
      text: video.status === 1 ? 'Private (Assign Only)' : 'Public (Open to Students)',
      icon: video.status === 1 ? 'fas fa-lock' : 'fas fa-globe'
    }
  }

  return (
    <>
      {/* Video Description */}
      {video.description && (
        <div className='mb-4 description-section p-3'>
          <h6 className='fw-bold mb-2 text-primary section-header'>
            <i className='fas fa-align-left me-2'></i>
            Description
          </h6>
          <p className='text-muted mb-0'>{video.description}</p>
        </div>
      )}

      {/* Video Details Section */}
      <div className='mb-4 video-details-section p-4 rounded'>
        <h6 className='fw-bold mb-3 text-primary section-header'>
          <i className='fas fa-info-circle me-2'></i>
          Video Details
        </h6>
        <div className='row g-3'>
          {isTeachingStaff && (
            <div className='col-md-3 col-sm-6'>
              <div className='info-card d-flex align-items-center'>
                <i className={`${getPlatformIcon(video.source)} me-2 text-primary`}></i>
                <span className='small fw-medium'>
                  {video.source === 1 ? 'YouTube' : 'Vimeo'}
                </span>
              </div>
            </div>
          )}

          <div className='col-md-3 col-sm-6'>
            <div className='info-card d-flex align-items-center'>
              <i className='fas fa-clock me-2 text-warning'></i>
              <span className='small fw-medium'>
                {video.duration ? formatDuration(video.duration) : 'N/A'}
              </span>
            </div>
          </div>

          <div className='col-md-3 col-sm-6'>
            <div className='info-card d-flex align-items-center'>
              <i className='fas fa-calendar me-2 text-info'></i>
              <span className='small fw-medium'>
                {formatApiTimestamp(video.created_at, { format: 'date' })}
              </span>
            </div>
          </div>

          <div className='col-md-3 col-sm-6'>
            <div className='info-card d-flex align-items-center'>
              <i className='fas fa-eye me-2 text-success'></i>
              <span className='small fw-medium'>
                {video.click_count || 0} views
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tags Section */}
      {video.tags && video.tags.length > 0 && (
        <div className='mb-4 video-details-section p-4 rounded'>
          <h6 className='fw-bold mb-3 text-primary section-header'>
            <i className='fas fa-tags me-2'></i>
            Tags ({video.tags.length})
          </h6>
          <div className='d-flex flex-wrap gap-2'>
            {video.tags.map((tag, index) => (
              <span key={index} className='badge badge-light-info badge-lg px-3 py-2'>
                <i className='fas fa-tag me-1'></i>
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className='mt-4'>
        {showBackButton && onBackClick && (
          <button
            type='button'
            className='btn btn-secondary me-2'
            onClick={onBackClick}
          >
            <i className='fas fa-arrow-left me-2'></i>
            Back
          </button>
        )}
        
        {showEditButton && onEditClick && isTeachingStaff && (
          <button
            type='button'
            className='btn btn-outline-secondary'
            onClick={() => onEditClick(video)}
          >
            <i className='fas fa-edit me-2'></i>
            Edit Video
          </button>
        )}
      </div>
    </>
  )
}

export default VideoInfoDisplay 