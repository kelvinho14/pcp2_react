import React from 'react'
import {Modal, Button} from 'react-bootstrap'

interface VideoModalProps {
  show: boolean
  onHide: () => void
  video: {
    video_title: string
    play_url?: string
  } | null
  size?: 'sm' | 'lg' | 'xl'
}

const VideoModal: React.FC<VideoModalProps> = ({
  show,
  onHide,
  video,
  size = 'xl'
}) => {
  if (!video) return null

  return (
    <Modal
      show={show}
      onHide={onHide}
      size={size}
      centered
      backdrop={true}
      keyboard={true}
      dialogClassName="video-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <i className='fas fa-video text-primary me-2'></i>
          {video.video_title}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className='row'>
          <div className='col-12'>
            {video.play_url ? (
              <div className='text-center'>
                <iframe
                  title={video.video_title}
                  src={video.play_url}
                  width='100%'
                  height='500px'
                  frameBorder='0'
                  allowFullScreen
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  className='rounded'
                />
              </div>
            ) : (
              <div className='text-center p-5'>
                <i className='fas fa-exclamation-triangle text-warning fs-2x mb-3'></i>
                <p className='text-muted'>Video URL not available</p>
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onHide}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default VideoModal 