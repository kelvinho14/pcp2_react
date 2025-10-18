import {FC, useState, useEffect} from 'react'
import {Modal, Button} from 'react-bootstrap'
import {KTIcon} from '../../../../../_metronic/helpers'

interface MCOption {
  option_letter: string
  option_text: string
}

interface GeneratedQuestion {
  type: 'mc' | 'lq'
  name?: string
  question_content: string
  teacher_remark: string
  lq_question?: {
    answer_content: string
  }
  mc_question?: {
    options: MCOption[]
    correct_option: string
    answer_content?: string
  }
}

interface DojoGeneratedQuestionsModalProps {
  show: boolean
  onHide: () => void
  onAccept: (questions: GeneratedQuestion[]) => void
  questions: GeneratedQuestion[]
  isLoading?: boolean
}

const DojoGeneratedQuestionsModal: FC<DojoGeneratedQuestionsModalProps> = ({
  show,
  onHide,
  onAccept,
  questions,
  isLoading = false,
}) => {
  const [acceptedQuestions, setAcceptedQuestions] = useState<Set<number>>(new Set())
  const [dismissedQuestions, setDismissedQuestions] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (show) {
      setAcceptedQuestions(new Set())
      setDismissedQuestions(new Set())
    }
  }, [show, questions])

  const handleAcceptQuestion = (index: number) => {
    setAcceptedQuestions(prev => new Set(prev).add(index))
  }

  const handleDismissQuestion = (index: number) => {
    setDismissedQuestions(prev => new Set(prev).add(index))
  }

  const handleAcceptAll = () => {
    const acceptedQs = questions.filter((_, index) => !dismissedQuestions.has(index))
    onAccept(acceptedQs)
  }

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const remainingQuestions = questions.filter((_, index) => 
    !acceptedQuestions.has(index) && !dismissedQuestions.has(index)
  )

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      backdrop="static"
      keyboard={!isLoading}
    >
      <Modal.Header closeButton={!isLoading}>
        <Modal.Title>
          <i className='fas fa-robot me-2 text-primary'></i>
          AI Generated Questions
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{maxHeight: '70vh', overflowY: 'auto'}}>
        {isLoading ? (
          <div className='text-center py-10'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Generating questions...</span>
            </div>
            <p className='mt-3 text-muted'>AI is generating similar questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className='text-center py-10'>
            <KTIcon iconName='information-5' className='fs-3x text-muted mb-5' />
            <p className='text-muted'>No questions generated yet.</p>
          </div>
        ) : (
          <div className='d-flex flex-column gap-4'>
            {questions.map((question, index) => {
              const isAccepted = acceptedQuestions.has(index)
              const isDismissed = dismissedQuestions.has(index)

              return (
                <div
                  key={index}
                  className={`card ${isAccepted ? 'border-success' : isDismissed ? 'border-danger opacity-50' : ''}`}
                >
                  <div className='card-header'>
                    <h5 className='card-title mb-0'>
                      Question {index + 1}
                      {isAccepted && <span className='badge badge-success ms-2'>Accepted</span>}
                      {isDismissed && <span className='badge badge-danger ms-2'>Dismissed</span>}
                    </h5>
                  </div>
                  <div className='card-body'>
                    {/* Question Content */}
                    <div className='mb-4'>
                      <label className='form-label fw-bold'>Question:</label>
                      <div 
                        className='p-3 bg-light rounded'
                        dangerouslySetInnerHTML={{__html: question.question_content}}
                      />
                    </div>

                    {/* MC Options */}
                    {question.type === 'mc' && question.mc_question && (
                      <div className='mb-4'>
                        <label className='form-label fw-bold'>Options:</label>
                        <div className='d-flex flex-column gap-2'>
                          {question.mc_question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-3 rounded border ${
                                option.option_letter === question.mc_question?.correct_option
                                  ? 'bg-light-success border-success'
                                  : 'bg-light'
                              }`}
                            >
                              <strong>{option.option_letter}.</strong>{' '}
                              <span dangerouslySetInnerHTML={{__html: option.option_text}} />
                              {option.option_letter === question.mc_question?.correct_option && (
                                <span className='badge badge-success ms-2'>Correct Answer</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* LQ Answer */}
                    {question.type === 'lq' && question.lq_question && (
                      <div className='mb-4'>
                        <label className='form-label fw-bold'>Answer:</label>
                        <div 
                          className='p-3 bg-light-success rounded'
                          dangerouslySetInnerHTML={{__html: question.lq_question.answer_content}}
                        />
                      </div>
                    )}

                    {/* MC Answer Explanation */}
                    {question.type === 'mc' && question.mc_question?.answer_content && (
                      <div className='mb-4'>
                        <label className='form-label fw-bold'>Answer Explanation:</label>
                        <div 
                          className='p-3 bg-light-info rounded'
                          dangerouslySetInnerHTML={{__html: question.mc_question.answer_content}}
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    {!isAccepted && !isDismissed && (
                      <div className='d-flex gap-2 mt-4'>
                        <button
                          className='btn btn-success btn-sm'
                          onClick={() => handleAcceptQuestion(index)}
                        >
                          <i className='fas fa-check me-1'></i>
                          Accept
                        </button>
                        <button
                          className='btn btn-danger btn-sm'
                          onClick={() => handleDismissQuestion(index)}
                        >
                          <i className='fas fa-times me-1'></i>
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div className='d-flex justify-content-between w-100 align-items-center'>
          <div className='text-muted'>
            {acceptedQuestions.size} accepted, {dismissedQuestions.size} dismissed, {remainingQuestions.length} remaining
          </div>
          <div className='d-flex gap-2'>
            <Button variant='secondary' onClick={onHide} disabled={isLoading}>
              Close
            </Button>
            <Button
              variant='primary'
              onClick={handleAcceptAll}
              disabled={isLoading || acceptedQuestions.size === 0}
            >
              <i className='fas fa-check-double me-1'></i>
              Save {acceptedQuestions.size} Accepted Question{acceptedQuestions.size !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default DojoGeneratedQuestionsModal

