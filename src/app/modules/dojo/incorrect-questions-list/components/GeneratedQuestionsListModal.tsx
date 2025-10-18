import {FC, useEffect, useState} from 'react'
import {Modal, Button} from 'react-bootstrap'
import axios from 'axios'
import {toast} from '../../../../../_metronic/helpers/toast'
import {getHeadersWithSchoolSubject} from '../../../../../_metronic/helpers/axios'
import {IncorrectQuestionItem} from '../../../../../store/dojo/incorrectQuestionsSlice'

const API_URL = import.meta.env.VITE_APP_API_URL

interface GeneratedQuestionsListModalProps {
  show: boolean
  onHide: () => void
  sourceQuestionId: string
}

const GeneratedQuestionsListModal: FC<GeneratedQuestionsListModalProps> = ({
  show,
  onHide,
  sourceQuestionId,
}) => {
  const [questions, setQuestions] = useState<IncorrectQuestionItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (show && sourceQuestionId) {
      loadGeneratedQuestions()
    } else {
      // Reset state when modal closes
      setQuestions([])
    }
  }, [show, sourceQuestionId])

  const loadGeneratedQuestions = async () => {
    setLoading(true)
    try {
      const headers = getHeadersWithSchoolSubject(
        `${API_URL}/exercises/student-exercises/incorrect-questions?all=1&visibility=0&source_question_id=${sourceQuestionId}`
      )
      const response = await axios.get(
        `${API_URL}/exercises/student-exercises/incorrect-questions`,
        {
          params: {
            all: 1,
            visibility: 0,
            source_question_id: sourceQuestionId,
          },
          headers,
          withCredentials: true,
        }
      )
      setQuestions(response.data.items || [])
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load generated questions'
      toast.error(errorMessage, 'Error')
    } finally {
      setLoading(false)
    }
  }

  const getQuestionTypeLabel = (type: 'mc' | 'lq' | 'tf') => {
    switch (type) {
      case 'mc':
        return { label: 'MC', badgeClass: 'badge-light-primary' }
      case 'lq':
        return { label: 'LQ', badgeClass: 'badge-light-info' }
      case 'tf':
        return { label: 'TF', badgeClass: 'badge-light-success' }
    }
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title className='d-flex align-items-center'>
          <i className='fas fa-robot me-2 text-primary'></i>
          Generated Practice Questions
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className='overlay-layer-extended' style={{maxHeight: '70vh', overflowY: 'auto'}}>
        {loading && (
          <div className='overlay-layer bg-dark bg-opacity-50 rounded'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        )}

        {!loading && questions.length === 0 && (
          <div className='text-center py-10'>
            <i className='fas fa-question-circle fs-2x text-muted mb-5'></i>
            <p className='fs-5 text-muted'>No generated questions found.</p>
          </div>
        )}

        {!loading && questions.length > 0 && (
          <div className='d-flex flex-column gap-4'>
            {questions.map((question, index) => {
              const {label, badgeClass} = getQuestionTypeLabel(question.question_type)
              
              return (
                <div key={question.question_id} className='card border'>
                  <div className='card-header bg-light'>
                    <div className='d-flex align-items-center justify-content-between'>
                      <h5 className='mb-0'>
                        Question {index + 1}
                        <span className={`badge ${badgeClass} ms-2`}>{label}</span>
                      </h5>
                    </div>
                  </div>
                  <div className='card-body'>
                    <div 
                      className='question-content'
                      dangerouslySetInnerHTML={{__html: question.question_content}}
                    />
                    {question.teacher_remark && (
                      <div className='alert alert-info mt-3 mb-0'>
                        <i className='fas fa-comment-dots me-2'></i>
                        <strong>Teacher's Note:</strong> {question.teacher_remark}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <style>{`
          .question-content img {
            max-width: 100%;
            height: auto;
            max-height: 300px;
            object-fit: contain;
          }
        `}</style>
      </Modal.Body>
      <Modal.Footer>
        <div className='d-flex justify-content-between w-100 align-items-center'>
          <div className='text-muted'>
            <i className='fas fa-info-circle me-1'></i>
            {questions.length} {questions.length === 1 ? 'question' : 'questions'} generated
          </div>
          <Button variant='primary' onClick={onHide} disabled={loading}>
            Close
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default GeneratedQuestionsListModal

