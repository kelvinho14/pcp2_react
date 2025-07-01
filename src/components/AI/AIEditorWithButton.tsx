import React from 'react'
import TinyMCEEditor from '../Editor/TinyMCEEditor'
import AIImageToTextButton from './AIImageToTextButton'

interface AIEditorWithButtonProps {
  field: 'question' | 'answer'
  value: string
  onBlur: (content: string) => void
  isProcessing: boolean
  processingField: 'question' | 'answer' | null
  onAIClick: (content: string, field: 'question' | 'answer') => void
  height?: number
  placeholder?: string
  editorKey?: string
}

const AIEditorWithButton: React.FC<AIEditorWithButtonProps> = ({
  field,
  value,
  onBlur,
  isProcessing,
  processingField,
  onAIClick,
  height = 300,
  placeholder = 'Enter content...',
  editorKey
}) => {
  return (
    <div className='d-flex flex-column'>
      <TinyMCEEditor
        key={editorKey || `editor-${field}`}
        value={value}
        onBlur={onBlur}
        height={height}
        placeholder={placeholder}
      />
      <AIImageToTextButton
        field={field}
        content={value}
        isProcessing={isProcessing}
        processingField={processingField}
        onClick={onAIClick}
      />
    </div>
  )
}

export default AIEditorWithButton 