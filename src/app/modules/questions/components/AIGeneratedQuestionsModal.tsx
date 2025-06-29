import {FC, useState, useEffect} from 'react'
import {KTIcon} from '../../../../_metronic/helpers'

interface GeneratedQuestion {
  type: 'mc' | 'lq'
  name: string
  question_content: string
  teacher_remark: string
  lq_question?: {
    answer_content: string
  }
  mc_question?: {
    options: string[]
    correct_answer: number
  }
}

interface AIGeneratedQuestionsModalProps {
  show: boolean
  onHide: () => void
  onAccept: (questions: GeneratedQuestion[]) => void
  onAcceptSingle: (question: GeneratedQuestion) => void
  questions: GeneratedQuestion[]
  isLoading?: boolean
}

const AIGeneratedQuestionsModal: FC<AIGeneratedQuestionsModalProps> = ({
  show,
  onHide,
  onAccept,
  onAcceptSingle,
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

  const handleQuestionNameChange = (index: number, name: string) => {
    const updated = [...editedQuestions]
    updated[index] = { ...updated[index], name }
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
    <div className='modal fade show d-block' style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className='modal-dialog modal-dialog-centered modal-xl' style={{ maxWidth: '90vw' }}>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>
              <KTIcon iconName='magic' className='fs-2 me-2' />
              Review Generated Questions
              {totalQuestions > 0 && (
                <small className='text-muted ms-2'>
                  ({handledQuestions}/{totalQuestions} handled)
                </small>
              )}
            </h5>
            <button 
              type='button' 
              className='btn-close' 
              onClick={onHide}
              disabled={isLoading}
            ></button>
          </div>
          <div className='modal-body' style={{ maxHeight: '70vh', overflowY: 'auto' }}>
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
                            <label className='form-label fw-bold mb-1'>Question Name:</label>
                            <input
                              type='text'
                              className='form-control'
                              value={question.name}
                              onChange={(e) => handleQuestionNameChange(index, e.target.value)}
                              placeholder='Enter question name...'
                              disabled={isLoading || isCreating}
                            />
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
                          <textarea
                            className='form-control'
                            rows={3}
                            value={question.question_content.replace(/<[^>]*>/g, '')} // Remove HTML tags for editing
                            onChange={(e) => handleQuestionContentChange(index, e.target.value)}
                            placeholder='Enter question content...'
                            disabled={isLoading || isCreating}
                          />
                        </div>

                        {/* Answer Content (for LQ questions) */}
                        {question.type === 'lq' && question.lq_question && (
                          <div className='mb-3'>
                            <label className='form-label fw-bold'>Answer:</label>
                            <textarea
                              className='form-control'
                              rows={4}
                              value={question.lq_question.answer_content.replace(/<[^>]*>/g, '')} // Remove HTML tags for editing
                              onChange={(e) => handleAnswerContentChange(index, e.target.value)}
                              placeholder='Enter answer content...'
                              disabled={isLoading || isCreating}
                            />
                          </div>
                        )}

                        {/* MC Options (for MC questions) */}
                        {question.type === 'mc' && question.mc_question && (
                          <div className='mb-3'>
                            <label className='form-label fw-bold'>Options:</label>
                            {question.mc_question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className='input-group mb-2'>
                                <span className='input-group-text'>
                                  {optionIndex === question.mc_question!.correct_answer ? (
                                    <KTIcon iconName='check' className='text-success' />
                                  ) : (
                                    <span className='text-muted'>{String.fromCharCode(65 + optionIndex)}</span>
                                  )}
                                </span>
                                <input
                                  type='text'
                                  className='form-control'
                                  value={option}
                                  readOnly
                                  placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                />
                              </div>
                            ))}
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
          </div>
          <div className='modal-footer'>
            <div className='d-flex justify-content-end w-100'>
              <div className='d-flex gap-2'>
                <button 
                  type='button' 
                  className='btn btn-secondary' 
                  onClick={handleDismissAll}
                  disabled={isLoading || !hasVisibleQuestions}
                >
                  <KTIcon iconName='cross' className='fs-6 me-1' />
                  Dismiss All
                </button>
                <button 
                  type='button' 
                  className={`btn btn-success ${isLoading ? 'btn-loading' : ''}`}
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
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIGeneratedQuestionsModal 