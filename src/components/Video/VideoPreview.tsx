import {FC} from 'react'
import {Video} from '../../store/videos/videosSlice'

interface VideoPreviewProps {
  video: Video
  width?: string
  height?: string
  className?: string
}

const VideoPreview: FC<VideoPreviewProps> = ({video, width = '100%', height = '300px', className = ''}) => {
  const getEmbedUrl = (video: Video) => {
    // Use play_url if available
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
    
    // Fallback to constructing embed URL using video_id_external
    if (video.source === 1) {
      return `https://www.youtube.com/embed/${video.video_id_external}`
    } else if (video.source === 2) {
      return `https://player.vimeo.com/video/${video.video_id_external}`
    }
    return ''
  }

  const embedUrl = getEmbedUrl(video)

  if (!embedUrl) {
    return (
      <div 
        className={`d-flex align-items-center justify-content-center bg-light ${className}`}
        style={{width, height}}
      >
        <div className='text-center'>
          <i className='fas fa-exclamation-triangle text-warning fs-2x mb-3'></i>
          <p className='text-muted'>Invalid video URL</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <iframe
        title={video.title}
        src={embedUrl}
        width={width}
        height={height}
        frameBorder='0'
        allowFullScreen
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        className='rounded'
      />
    </div>
  )
}

export default VideoPreview 