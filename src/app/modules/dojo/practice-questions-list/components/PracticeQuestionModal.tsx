import {FC, useEffect, useState} from 'react'
import {Modal, Button} from 'react-bootstrap'
import axios from 'axios'
import {toast} from '../../../../../_metronic/helpers/toast'
import {getHeadersWithSchoolSubject} from '../../../../../_metronic/helpers/axios'

const API_URL = import.meta.env.VITE_APP_API_URL

interface MCOption {
  option_letter: string
  option_text: string
}

interface MCQuestion {
  options: MCOption[]
  correct_option: string
  answer_content?: string
}

interface QuestionDetail {
  q_id: string
  question_content: string
  type: 'mc'
  mc_question: MCQuestion
  teacher_remark?: string
}

interface PracticeQuestionModalProps {
  show: boolean
  onHide: () => void
  questionId: string
}

const PracticeQuestionModal: FC<PracticeQuestionModalProps> = ({
  show,
  onHide,
  questionId,
}) => {
  const [question, setQuestion] = useState<QuestionDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  useEffect(() => {
    if (show && questionId) {
      loadQuestion()
    } else {
      // Reset state when modal closes
      setQuestion(null)
      setSelectedOption(null)
      setShowAnswer(false)
    }
  }, [show, questionId])

  const loadQuestion = async () => {
    setLoading(true)
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/student-exercises/questions/${questionId}`)
      const response = await axios.get(
        `${API_URL}/student-exercises/questions/${questionId}`,
        {
          headers,
          withCredentials: true,
        }
      )
      setQuestion(response.data.data)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load question'
      toast.error(errorMessage, 'Error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    if (!selectedOption) {
      toast.error('Please select an option', 'Error')
      return
    }
    setShowAnswer(true)
  }

  const handleReset = () => {
    setSelectedOption(null)
    setShowAnswer(false)
  }

  const isCorrect = selectedOption === question?.mc_question?.correct_option

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title className='d-flex align-items-center'>
          <i className='fas fa-dumbbell me-2 text-primary'></i>
          Practice Question
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className='overlay-layer-extended'>
        {loading && (
          <div className='overlay-layer bg-dark bg-opacity-50 rounded'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        )}

        {!loading && question && (
          <div>
            {/* Question Content */}
            <div className='mb-6'>
              <label className='form-label fw-bold fs-5'>Question:</label>
              <div 
                className='p-4 bg-light rounded'
                dangerouslySetInnerHTML={{__html: question.question_content}}
              />
            </div>

            {/* Options */}
            <div className='mb-6'>
              <label className='form-label fw-bold fs-5'>Options:</label>
              <div className='d-flex flex-column gap-3'>
                {question.mc_question.options.map((option) => {
                  const isSelected = selectedOption === option.option_letter
                  const isCorrectOption = option.option_letter === question.mc_question.correct_option
                  
                  let optionClass = 'p-3 rounded border cursor-pointer'
                  
                  if (showAnswer) {
                    if (isCorrectOption) {
                      optionClass += ' bg-success bg-opacity-10 border-success'
                    } else if (isSelected && !isCorrectOption) {
                      optionClass += ' bg-danger bg-opacity-10 border-danger'
                    } else {
                      optionClass += ' border-secondary'
                    }
                  } else {
                    if (isSelected) {
                      optionClass += ' bg-primary bg-opacity-10 border-primary'
                    } else {
                      optionClass += ' border-secondary'
                    }
                  }
                  
                  return (
                    <div 
                      key={option.option_letter}
                      className={optionClass}
                      onClick={() => !showAnswer && setSelectedOption(option.option_letter)}
                      style={{ cursor: showAnswer ? 'default' : 'pointer' }}
                    >
                      <div className='d-flex align-items-start'>
                        <span className='fw-bold me-3 fs-5'>{option.option_letter}.</span>
                        <div 
                          className='flex-grow-1'
                          dangerouslySetInnerHTML={{__html: option.option_text}}
                        />
                        {showAnswer && isCorrectOption && (
                          <i className='fas fa-check-circle text-success fs-3 ms-2'></i>
                        )}
                        {showAnswer && isSelected && !isCorrectOption && (
                          <i className='fas fa-times-circle text-danger fs-3 ms-2'></i>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Answer Explanation */}
            {showAnswer && question.mc_question.answer_content && (
              <div className='mb-4'>
                <label className='form-label fw-bold fs-5'>Explanation:</label>
                <div 
                  className={`p-4 rounded ${isCorrect ? 'bg-success-subtle' : 'bg-info-subtle'}`}
                  dangerouslySetInnerHTML={{__html: question.mc_question.answer_content}}
                />
              </div>
            )}

            {/* Result Message */}
            {showAnswer && (
              <div className={`alert ${isCorrect ? 'alert-success' : 'alert-warning'} d-flex align-items-center`}>
                <i className={`fas ${isCorrect ? 'fa-check-circle' : 'fa-info-circle'} fs-2 me-3`}></i>
                <div>
                  <h5 className='mb-1'>{isCorrect ? 'Correct!' : 'Not quite right'}</h5>
                  <p className='mb-0'>
                    {isCorrect 
                      ? 'Great job! You got it right.' 
                      : `The correct answer is option ${question.mc_question.correct_option}.`
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Teacher Remark */}
            {question.teacher_remark && (
              <div className='alert alert-info'>
                <i className='fas fa-comment-dots me-2'></i>
                <strong>Teacher's Note:</strong> {question.teacher_remark}
              </div>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {!showAnswer ? (
          <>
            <Button variant='secondary' onClick={onHide} disabled={loading}>
              Close
            </Button>
            <Button 
              variant='primary' 
              onClick={handleSubmit} 
              disabled={!selectedOption || loading}
            >
              Submit Answer
            </Button>
          </>
        ) : (
          <>
            <Button variant='secondary' onClick={handleReset} disabled={loading}>
              Try Again
            </Button>
            <Button variant='primary' onClick={onHide} disabled={loading}>
              Close
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default PracticeQuestionModal

