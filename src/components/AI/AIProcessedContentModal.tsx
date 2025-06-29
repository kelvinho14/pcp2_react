import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../store'
import { acceptProcessedContent, rejectProcessedContent } from '../../store/ai/aiSlice'
import TinyMCEEditor from '../Editor/TinyMCEEditor'

interface AIProcessedContentModalProps {
  onAccept: (content: string, field: 'question' | 'answer') => void
}

const AIProcessedContentModal: React.FC<AIProcessedContentModalProps> = ({ onAccept }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { showModal, processedContent, targetField } = useSelector((state: RootState) => state.ai)
  const [editableContent, setEditableContent] = useState('')

  // Update editable content when modal opens
  useEffect(() => {
    if (processedContent) {
      setEditableContent(processedContent)
    }
  }, [processedContent])

  const handleAccept = () => {
    if (editableContent && targetField) {
      onAccept(editableContent, targetField)
      dispatch(acceptProcessedContent())
    }
  }

  const handleReject = () => {
    dispatch(rejectProcessedContent())
  }

  if (!showModal || !processedContent) {
    return null
  }

  return (
    <div className='modal fade show d-block' style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className='modal-dialog modal-lg modal-dialog-centered'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>
              <i className='fas fa-robot me-2'></i>
              AI Processed Content
            </h5>
            <button
              type='button'
              className='btn-close'
              onClick={handleReject}
              aria-label='Close'
            ></button>
          </div>
          
          <div className='modal-body'>
            <div className='mb-3'>
              <label className='form-label fw-bold'>
                Processed content for {targetField === 'question' ? 'Question' : 'Answer'}:
              </label>
            </div>
            
            <div className='mb-3'>
              <TinyMCEEditor
                value={editableContent}
                onChange={setEditableContent}
                height={300}
                placeholder='Edit the processed content here...'
              />
            </div>
            
            <div className='mt-3'>
              <small className='text-muted'>
                <i className='fas fa-info-circle me-1'></i>
                You can edit the processed content above. Click "Accept" to use this content in your {targetField}, or "Reject" to dismiss.
              </small>
            </div>
          </div>
          
          <div className='modal-footer'>
            <button
              type='button'
              className='btn btn-secondary'
              onClick={handleReject}
            >
              <i className='fas fa-times me-1'></i>
              Reject
            </button>
            <button
              type='button'
              className='btn btn-primary'
              onClick={handleAccept}
            >
              <i className='fas fa-check me-1'></i>
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIProcessedContentModal 