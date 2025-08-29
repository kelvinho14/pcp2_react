import {FC, useState, useEffect} from 'react'
import {Modal, Button} from 'react-bootstrap'
import {KTIcon} from '../../../../_metronic/helpers'
import TinyMCEEditor from '../../../../components/Editor/TinyMCEEditor'

interface MCOption {
  option_letter: string
  option_text: string
}

interface GeneratedQuestion {
  type: 'mc' | 'lq'
  name?: string // Made optional since it's no longer used
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

interface AIGeneratedQuestionsModalProps {
  show: boolean
  onHide: () => void
  onAccept: (questions: GeneratedQuestion[]) => void
  onAcceptSingle: (question: GeneratedQuestion) => void
  onUseInCurrentForm?: (question: GeneratedQuestion) => void // New callback for using in current form
  questions: GeneratedQuestion[]
  isLoading?: boolean
}

const AIGeneratedQuestionsModal: FC<AIGeneratedQuestionsModalProps> = ({
  show,
  onHide,
  onAccept,
  onAcceptSingle,
  onUseInCurrentForm,
  questions,
  isLoading = false
}) => {
  const [editedQuestions, setEditedQuestions] = useState<GeneratedQuestion[]>(questions)
  const [acceptedQuestions, setAcceptedQuestions] = useState<Set<number>>(new Set())
  const [dismissedQuestions, setDismissedQuestions] = useState<Set<number>>(new Set())
  const [creatingQuestion, setCreatingQuestion] = useState<number | null>(null)

  // Update edited questions when questions prop changes
  useEffect(() => {
    setEditedQuestions(questions)
    setAcceptedQuestions(new Set())
    setDismissedQuestions(new Set())
  }, [questions])

  // Auto-close modal when all questions are handled
  useEffect(() => {
    const totalQuestions = editedQuestions.length
    const handledQuestions = acceptedQuestions.size + dismissedQuestions.size
    
    if (totalQuestions > 0 && handledQuestions === totalQuestions) {
      // Small delay to show the final state before closing
      const timer = setTimeout(() => {
        onHide()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [acceptedQuestions.size, dismissedQuestions.size, editedQuestions.length, onHide])



  const handleQuestionContentChange = (index: number, content: string) => {
    const updated = [...editedQuestions]
    updated[index] = { ...updated[index], question_content: content }
    setEditedQuestions(updated)
  }



  const handleAnswerContentChange = (index: number, content: string) => {
    const updated = [...editedQuestions]
    if (updated[index].lq_question) {
      updated[index] = {
        ...updated[index],
        lq_question: { ...updated[index].lq_question!, answer_content: content }
      }
    }
    setEditedQuestions(updated)
  }

  const handleAcceptQuestion = async (index: number) => {
    setCreatingQuestion(index)
    try {
      await onAcceptSingle(editedQuestions[index])
      setAcceptedQuestions(prev => new Set([...prev, index]))
      setDismissedQuestions(prev => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
    } catch (error) {
      console.error('Error creating question:', error)
    } finally {
      setCreatingQuestion(null)
    }
  }

  const handleDismissQuestion = (index: number) => {
    setDismissedQuestions(prev => new Set([...prev, index]))
    setAcceptedQuestions(prev => {
      const newSet = new Set(prev)
      newSet.delete(index)
      return newSet
    })
  }

  const handleAcceptAll = async () => {
    const visibleQuestions = editedQuestions.filter((_, index) => !dismissedQuestions.has(index))
    await onAccept(visibleQuestions)
    const allIndices = new Set(editedQuestions.map((_, index) => index))
    setAcceptedQuestions(allIndices)
    setDismissedQuestions(new Set())
  }

  const handleDismissAll = () => {
    const allIndices = new Set(editedQuestions.map((_, index) => index))
    setDismissedQuestions(allIndices)
    setAcceptedQuestions(new Set())
  }

  const getVisibleQuestions = () => {
    return editedQuestions.filter((_, index) => 
      !dismissedQuestions.has(index) && !acceptedQuestions.has(index)
    )
  }

  const visibleQuestions = getVisibleQuestions()
  const hasVisibleQuestions = visibleQuestions.length > 0
  const totalQuestions = editedQuestions.length
  const handledQuestions = acceptedQuestions.size + dismissedQuestions.size

  if (!show) return null

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      backdrop={true}
      keyboard={true}
      dialogClassName="ai-generated-questions-modal"
      style={{ maxWidth: '90vw' }}
    >
      <Modal.Header closeButton={!isLoading}>
        <Modal.Title>
          <KTIcon iconName='magic' className='fs-2 me-2' />
          Review Generated Questions
          {totalQuestions > 0 && (
            <small className='text-muted ms-2'>
              ({handledQuestions}/{totalQuestions} handled)
            </small>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {isLoading ? (
              <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '200px' }}>
                <div className='spinner-border text-primary' role='status'>
                  <span className='visually-hidden'>Loading...</span>
                </div>
                <span className='ms-3'>Generating questions...</span>
              </div>
            ) : (
              <div className='space-y-4'>
                {editedQuestions.map((question, index) => {
                  const isAccepted = acceptedQuestions.has(index)
                  const isDismissed = dismissedQuestions.has(index)
                  const isCreating = creatingQuestion === index
                  
                  // Don't render if dismissed or accepted
                  if (isDismissed || isAccepted) return null

                  return (
                    <div key={index} className='card border border-gray-300'>
                      <div className='card-header bg-light py-5'>
                        <div className='d-flex align-items-center justify-content-between w-100'>
                          <div style={{ maxWidth: 350, width: '100%' }}>
                            {/* Question name field removed */}
                          </div>
                          <div className='d-flex gap-2 ms-auto'>
                            <button
                              type='button'
                              className={`btn btn-sm btn-success ${isCreating ? 'btn-loading' : ''}`}
                              onClick={() => handleAcceptQuestion(index)}
                              disabled={isLoading || isCreating}
                            >
                              {isCreating ? (
                                <>
                                  <span className='spinner-border spinner-border-sm me-1' role='status' aria-hidden='true'></span>
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <KTIcon iconName='check' className='fs-6 me-1' />
                                  Accept
                                </>
                              )}
                            </button>
                            {onUseInCurrentForm && (
                              <button
                                type='button'
                                className='btn btn-sm btn-info'
                                onClick={() => onUseInCurrentForm(question)}
                                disabled={isLoading || isCreating}
                                title='Use this content in the current form instead of creating a new question'
                              >
                                <KTIcon iconName='edit' className='fs-6 me-1' />
                                Use in Form
                              </button>
                            )}
                            <button
                              type='button'
                              className='btn btn-sm btn-secondary'
                              onClick={() => handleDismissQuestion(index)}
                              disabled={isLoading || isCreating}
                            >
                              <KTIcon iconName='cross' className='fs-6 me-1' />
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className='card-body'>
                        {/* Question Content */}
                        <div className='mb-3'>
                          <label className='form-label fw-bold'>Question:</label>
                          <TinyMCEEditor
                            value={question.question_content}
                            onChange={(content: string) => handleQuestionContentChange(index, content)}
                            height={200}
                          />
                        </div>

                        {/* Answer Content (for LQ questions) */}
                        {question.lq_question?.answer_content && (
                          <div className='mb-3'>
                            <label className='form-label fw-bold'>Answer:</label>
                            <TinyMCEEditor
                              value={question.lq_question.answer_content}
                              onChange={(content: string) => handleAnswerContentChange(index, content)}
                              height={300}
                            />
                          </div>
                        )}

                        {/* MC Options and Answer Explanation */}
                        {question.type === 'mc' && question.mc_question && (
                          <div className='mb-3'>
                            <label className='form-label fw-bold'>Options:</label>
                            {question.mc_question!.options.map((option, optionIndex) => (
                              <div key={optionIndex} className='input-group mb-2 align-items-center'>
                                <span className='input-group-text'>
                                  <input
                                    type='radio'
                                    name={`correct-option-${index}`}
                                    checked={question.mc_question!.correct_option === option.option_letter}
                                    onChange={() => {
                                      const updated = [...editedQuestions]
                                      if (updated[index].mc_question) {
                                        updated[index] = {
                                          ...updated[index],
                                          mc_question: {
                                            ...updated[index].mc_question!,
                                            correct_option: option.option_letter
                                          }
                                        }
                                        setEditedQuestions(updated)
                                        console.log(`[User Select] Question ${index + 1} set correct_option:`, option.option_letter);
                                      }
                                    }}
                                    className='form-check-input me-2'
                                  />
                                  {option.option_letter}
                                </span>
                                <input
                                  type='text'
                                  className='form-control'
                                  value={option.option_text}
                                  onChange={e => {
                                    const updated = [...editedQuestions]
                                    if (updated[index].mc_question) {
                                      const newOptions = updated[index].mc_question.options.map((opt, i) =>
                                        i === optionIndex ? { ...opt, option_text: e.target.value } : opt
                                      )
                                      updated[index] = {
                                        ...updated[index],
                                        mc_question: {
                                          ...updated[index].mc_question!,
                                          options: newOptions
                                        }
                                      }
                                      setEditedQuestions(updated)
                                    }
                                  }}
                                  placeholder={`Option ${option.option_letter}`}
                                  disabled={isLoading || isCreating}
                                />
                              </div>
                            ))}
                            {/* MC Answer Explanation */}
                            {question.mc_question.answer_content && (
                              <div className='mb-3'>
                                <label className='form-label fw-bold'>Answer Explanation:</label>
                                <TinyMCEEditor
                                  value={question.mc_question.answer_content}
                                  onChange={(content: string) => {
                                    const updated = [...editedQuestions]
                                    if (updated[index].mc_question) {
                                      updated[index] = {
                                        ...updated[index],
                                        mc_question: {
                                          ...updated[index].mc_question!,
                                          answer_content: content
                                        }
                                      }
                                      setEditedQuestions(updated)
                                    }
                                  }}
                                  height={200}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Teacher Remark */}
                        <div className='mb-2'>
                          <small className='text-muted'>
                            <KTIcon iconName='information' className='fs-6 me-1' />
                            {question.teacher_remark}
                          </small>
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {!hasVisibleQuestions && totalQuestions > 0 && (
                  <div className='text-center py-4'>
                    <KTIcon iconName='check-circle' className='fs-1 text-success mb-3' />
                    <p className='text-success fw-bold'>All questions have been handled!</p>
                    <p className='text-muted'>Dialog will close automatically...</p>
                  </div>
                )}
              </div>
            )}
      </Modal.Body>
      <Modal.Footer>
        <div className='d-flex justify-content-end w-100'>
          <div className='d-flex gap-2'>
            <Button 
              variant="secondary"
              onClick={handleDismissAll}
              disabled={isLoading || !hasVisibleQuestions}
            >
              <KTIcon iconName='cross' className='fs-6 me-1' />
              Dismiss All
            </Button>
            <Button 
              variant="success"
              className={isLoading ? 'btn-loading' : ''}
              onClick={handleAcceptAll}
              disabled={isLoading || !hasVisibleQuestions}
            >
              {isLoading ? (
                <>
                  <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
                  Creating...
                </>
              ) : (
                <>
                  <KTIcon iconName='check' className='fs-6 me-1' />
                  Accept All
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default AIGeneratedQuestionsModal 