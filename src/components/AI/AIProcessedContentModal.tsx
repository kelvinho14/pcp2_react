import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../store'
import { acceptProcessedContent, rejectProcessedContent } from '../../store/ai/aiSlice'
import {Modal, Button} from 'react-bootstrap'
import TinyMCEEditor from '../Editor/TinyMCEEditor'

interface AIProcessedContentModalProps {
  onAccept: (content: string | { include: string; exclude: string }, field: 'question' | 'answer' | 'rubric') => void
}

const AIProcessedContentModal: React.FC<AIProcessedContentModalProps> = ({ onAccept }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { showModal, processedContent, targetField } = useSelector((state: RootState) => state.ai)
  const [editableContent, setEditableContent] = useState('')
  const [rubricInclude, setRubricInclude] = useState('')
  const [rubricExclude, setRubricExclude] = useState('')

  // Update editable content when modal opens
  useEffect(() => {
    if (processedContent) {
      if (typeof processedContent === 'object' && processedContent !== null && 'include' in processedContent && 'exclude' in processedContent) {
        // New object format for rubric
        setRubricInclude(processedContent.include)
        setRubricExclude(processedContent.exclude)
        setEditableContent('') // Clear string content
      } else {
        // String format for question/answer or legacy rubric
        setEditableContent(processedContent as string)
        setRubricInclude('')
        setRubricExclude('')
      }
    }
  }, [processedContent])

  const handleAccept = () => {
    if (targetField) {
      if (targetField === 'rubric' && (rubricInclude || rubricExclude)) {
        // Send rubric object format
        onAccept({ include: rubricInclude, exclude: rubricExclude }, targetField)
      } else if (editableContent) {
        // Send string format
        onAccept(editableContent, targetField)
      }
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
        {targetField === 'rubric' && (rubricInclude || rubricExclude) ? (
          // Rubric object format
          <>
            <div className='mb-3'>
              <label className='form-label fw-bold'>
                AI Generated Rubric:
              </label>
            </div>
            
            <div className='mb-4'>
              <label className='form-label fw-semibold fs-6 mb-2'>
                Should contain:
              </label>
              <TinyMCEEditor
                value={rubricInclude}
                onChange={setRubricInclude}
                height={200}
                placeholder='Edit what the answer should contain...'
              />
            </div>
            
            <div className='mb-4'>
              <label className='form-label fw-semibold fs-6 mb-2'>
                Should not have:
              </label>
              <TinyMCEEditor
                value={rubricExclude}
                onChange={setRubricExclude}
                height={200}
                placeholder='Edit what the answer should not have...'
              />
            </div>
            
            <div className='mt-3'>
              <small className='text-muted'>
                <i className='fas fa-info-circle me-1'></i>
                You can edit the rubric criteria above. Click "Accept" to use this rubric, or "Reject" to dismiss.
              </small>
            </div>
          </>
        ) : (
          // String format for question/answer or legacy rubric
          <>
            <div className='mb-3'>
              <label className='form-label fw-bold'>
                Processed content for {targetField === 'question' ? 'Question' : targetField === 'answer' ? 'Answer' : 'Rubric'}:
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
          </>
        )}
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