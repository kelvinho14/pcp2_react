import React from 'react'
import {Modal, Button} from 'react-bootstrap'

interface FormModalProps {
  show: boolean
  onHide: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'lg' | 'xl'
  centered?: boolean
  closeButton?: boolean
  footer?: React.ReactNode
  onSave?: () => void
  saveText?: string
  saveVariant?: string
  loading?: boolean
  className?: string
}

const FormModal: React.FC<FormModalProps> = ({
  show,
  onHide,
  title,
  children,
  size = 'lg',
  centered = true,
  closeButton = true,
  footer,
  onSave,
  saveText = 'Save',
  saveVariant = 'primary',
  loading = false,
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
      className={`form-modal ${className}`}
    >
      <Modal.Header closeButton={closeButton}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {children}
      </Modal.Body>
      
      <Modal.Footer>
        {footer || (
          <>
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            {onSave && (
              <Button 
                variant={saveVariant} 
                onClick={onSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Saving...
                  </>
                ) : (
                  saveText
                )}
              </Button>
            )}
          </>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default FormModal 