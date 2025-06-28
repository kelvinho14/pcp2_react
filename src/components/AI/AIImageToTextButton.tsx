import React from 'react'

interface AIImageToTextButtonProps {
  field: 'question' | 'answer'
  content: string
  isProcessing: boolean
  onClick: (content: string, field: 'question' | 'answer') => void
}

const AIImageToTextButton: React.FC<AIImageToTextButtonProps> = ({
  field,
  content,
  isProcessing,
  onClick
}) => {
  return (
    <div className='mt-2'>
      <button
        type='button'
        className='btn btn-sm btn-primary'
        style={{ backgroundColor: '#009ef7', borderColor: '#009ef7' }}
        disabled={isProcessing}
        onClick={() => onClick(content, field)}
      >
        {isProcessing ? (
          <>
            <span className='spinner-border spinner-border-sm me-1'></span>
            Processing...
          </>
        ) : (
          <>
            <i className='fas fa-robot me-1'></i>
            AI Image to Text
          </>
        )}
      </button>
    </div>
  )
}

export default AIImageToTextButton 