import React from 'react'
import {Modal, ModalProps} from 'react-bootstrap'

interface BaseModalProps extends Omit<ModalProps, 'backdrop'> {
  children: React.ReactNode
  show: boolean
  onHide: () => void
  title?: string
  size?: 'sm' | 'lg' | 'xl'
  centered?: boolean
  closeButton?: boolean
  className?: string
}

const BaseModal: React.FC<BaseModalProps> = ({
  children,
  show,
  onHide,
  title,
  size = 'lg',
  centered = true,
  closeButton = true,
  className = '',
  ...props
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size={size}
      centered={centered}
      backdrop={true}
      keyboard={true}
      className={`base-modal ${className}`}
      {...props}
    >
      {title && (
        <Modal.Header closeButton={closeButton}>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
      )}
      {children}
    </Modal>
  )
}

export default BaseModal 