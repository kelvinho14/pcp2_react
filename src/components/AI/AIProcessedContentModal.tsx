import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../store'
import { acceptProcessedContent, rejectProcessedContent } from '../../store/ai/aiSlice'
import {Modal, Button} from 'react-bootstrap'
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
    <Modal
      show={showModal}
      onHide={handleReject}
      size="lg"
      centered
      backdrop={true}
      keyboard={true}
      dialogClassName="ai-processed-content-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className='fas fa-robot me-2'></i>
          AI Processed Content
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
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
      </Modal.Body>
      
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleReject}
        >
          <i className='fas fa-times me-1'></i>
          Reject
        </Button>
        <Button
          variant="primary"
          onClick={handleAccept}
        >
          <i className='fas fa-check me-1'></i>
          Accept
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default AIProcessedContentModal 