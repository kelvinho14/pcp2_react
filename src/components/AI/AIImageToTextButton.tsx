import React from 'react'

interface AIImageToTextButtonProps {
  field: 'question' | 'answer'
  content: string
  isProcessing: boolean
  processingField: 'question' | 'answer' | null
  onClick: (content: string, field: 'question' | 'answer') => void
}

const AIImageToTextButton: React.FC<AIImageToTextButtonProps> = ({
  field,
  content,
  isProcessing,
  processingField,
  onClick
}) => {
  const isThisFieldProcessing = processingField === field
  const isDisabledByOtherField = isProcessing && !isThisFieldProcessing

  return (
    <div className='mt-2'>
      <button
        type='button'
        className='btn btn-sm btn-primary'
        style={{ backgroundColor: '#009ef7', borderColor: '#009ef7' }}
        disabled={isProcessing}
        onClick={() => onClick(content, field)}
      >
        {isThisFieldProcessing ? (
          <>
            <span className='spinner-border spinner-border-sm me-1'></span>
            Processing...
          </>
        ) : isDisabledByOtherField ? (
          <>
            <i className='fas fa-clock me-1'></i>
            Wait for processing...
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