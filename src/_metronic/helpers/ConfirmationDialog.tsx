import React, { useEffect } from 'react'
import {Modal, Button} from 'react-bootstrap'

export interface ConfirmationDialogProps {
  show: boolean
  onHide: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info' | 'success'
  size?: 'sm' | 'lg' | 'xl'
  centered?: boolean
  backdrop?: boolean | 'static'
  keyboard?: boolean
  confirmButtonVariant?: string
  cancelButtonVariant?: string
  showCancelButton?: boolean
  showConfirmButton?: boolean
  loading?: boolean
  loadingText?: string
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  show,
  onHide,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  size = 'lg',
  centered = true,
  backdrop = true,
  keyboard = true,
  confirmButtonVariant,
  cancelButtonVariant = 'secondary',
  showCancelButton = true,
  showConfirmButton = true,
  loading = false,
  loadingText = 'Processing...'
}) => {
  const handleConfirm = () => {
    if (!loading) {
      onConfirm()
      onHide()
    }
  }

  const handleHide = () => {
    if (!loading) {
      onHide()
    }
  }

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!show || loading) return
      
      if (event.key === 'Enter') {
        event.preventDefault()
        handleConfirm()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        handleHide()
      }
    }

    if (show) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [show, loading])

  // Determine confirm button variant based on dialog variant
  const getConfirmButtonVariant = () => {
    if (confirmButtonVariant) return confirmButtonVariant
    switch (variant) {
      case 'danger':
        return 'danger'
      case 'warning':
        return 'warning'
      case 'success':
        return 'success'
      case 'info':
        return 'info'
      default:
        return 'danger'
    }
  }

  // Get FontAwesome icon class based on variant
  const getIconClass = () => {
    switch (variant) {
      case 'danger':
        return 'fas fa-exclamation-triangle text-danger'
      case 'warning':
        return 'fas fa-exclamation-circle text-warning'
      case 'success':
        return 'fas fa-check-circle text-success'
      case 'info':
        return 'fas fa-info-circle text-info'
      default:
        return 'fas fa-exclamation-triangle text-danger'
    }
  }

  return (
    <Modal 
      show={show} 
      onHide={handleHide} 
      centered={centered}
      size={size}
      backdrop={backdrop}
      keyboard={keyboard}
      dialogClassName="confirmation-dialog"
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title className="d-flex align-items-center">
          <i className={`${getIconClass()} me-3 fs-2`}></i>
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-0">{message}</p>
      </Modal.Body>
      <Modal.Footer>
        {showCancelButton && (
          <Button 
            variant={cancelButtonVariant} 
            onClick={handleHide}
            disabled={loading}
          >
            {cancelText}
          </Button>
        )}
        {showConfirmButton && (
          <Button 
            variant={getConfirmButtonVariant()} 
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                {loadingText}
              </>
            ) : (
              confirmText
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export {ConfirmationDialog} 