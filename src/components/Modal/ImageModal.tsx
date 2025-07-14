import React, { useState, useEffect } from 'react';

interface ImageModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  title?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ 
  isOpen, 
  imageSrc, 
  onClose, 
  title = 'Image Preview' 
}) => {
  const [isClosing, setIsClosing] = useState(false);

  // Handle modal close with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !imageSrc) return null;

  return (
    <>
      <div 
        className='modal fade show d-block' 
        style={{ 
          backgroundColor: 'rgba(0,0,0,0.7)',
          animation: isClosing ? 'fadeOut 0.3s ease-in' : 'fadeIn 0.3s ease-out',
          zIndex: 1050
        }}
        onClick={handleClose}
      >
        <div 
          className='modal-dialog modal-xl modal-dialog-centered'
          style={{ 
            maxWidth: '90vw',
            maxHeight: '90vh',
            animation: isClosing ? 'slideOut 0.3s ease-in' : 'slideIn 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className='modal-content' style={{ maxHeight: '90vh' }}>
            <div className='modal-header'>
              <h5 className='modal-title'>{title}</h5>
              <button 
                type='button' 
                className='btn-close' 
                onClick={handleClose}
                style={{ transition: 'opacity 0.2s' }}
              ></button>
            </div>
            <div className='modal-body text-center p-0'>
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
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          
          @keyframes slideIn {
            from { 
              opacity: 0; 
              transform: scale(0.9) translateY(-20px);
            }
            to { 
              opacity: 1; 
              transform: scale(1) translateY(0);
            }
          }
          
          @keyframes slideOut {
            from { 
              opacity: 1; 
              transform: scale(1) translateY(0);
            }
            to { 
              opacity: 0; 
              transform: scale(0.9) translateY(-20px);
            }
          }
        `
      }} />
    </>
  );
};

export default ImageModal; 