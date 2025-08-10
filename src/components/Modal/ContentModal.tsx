import React from 'react'
import {Modal, Button} from 'react-bootstrap'

interface ContentModalProps {
  show: boolean
  onHide: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'lg' | 'xl'
  centered?: boolean
  closeButton?: boolean
  footer?: React.ReactNode
  closeText?: string
  className?: string
}

const ContentModal: React.FC<ContentModalProps> = ({
  show,
  onHide,
  title,
  children,
  size = 'lg',
  centered = true,
  closeButton = true,
  footer,
  closeText = 'Close',
  className = ''
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size={size}
      centered={centered}
      backdrop={true}
      keyboard={true}
      className={`content-modal ${className}`}
    >
      <Modal.Header closeButton={closeButton}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {children}
      </Modal.Body>
      
      <Modal.Footer>
        {footer || (
          <Button variant="secondary" onClick={onHide}>
            {closeText}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default ContentModal 