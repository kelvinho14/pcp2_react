import React, { useState, useEffect } from 'react'
import { Modal, Button } from 'react-bootstrap'

interface ImageModalProps {
  isOpen: boolean
  imageSrc: string | null
  onClose: () => void
  title?: string
}

const ImageModal: React.FC<ImageModalProps> = ({ 
  isOpen, 
  imageSrc, 
  onClose, 
  title = 'Image Preview' 
}) => {
  const [isClosing, setIsClosing] = useState(false)

  // Handle modal close with animation
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 300) // Match animation duration
  }

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !imageSrc) return null

  return (
    <Modal
      show={isOpen}
      onHide={handleClose}
      size="xl"
      centered
      backdrop={true}
      keyboard={true}
      dialogClassName="image-modal"
      onExited={() => setIsClosing(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="text-center p-0">
        <img 
          src={imageSrc} 
          alt='Enlarged view' 
          style={{ 
            maxWidth: '100%', 
            maxHeight: 'calc(90vh - 120px)',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            borderRadius: '8px'
          }} 
        />
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ImageModal 