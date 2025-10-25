import {FC, useState, useEffect, useRef} from 'react'
import {Modal, Button} from 'react-bootstrap'
import {KTIcon} from '../../../../../_metronic/helpers'
import {TEACHER_VERIFICATION_STATUS} from '../../../../constants/teacherVerificationStatus'

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
  onAccept: (questions: GeneratedQuestion[], questionVerificationMap: Map<number, number>, shouldCloseModal?: boolean, questionIndex?: number) => void
  onRegenerate?: (index: number) => void
  questions: GeneratedQuestion[]
  isLoading?: boolean
}

const DojoGeneratedQuestionsModal: FC<DojoGeneratedQuestionsModalProps> = ({
  show,
  onHide,
  onAccept,
  onRegenerate,
  questions,
  isLoading = false,
}) => {
  const [dismissedQuestions, setDismissedQuestions] = useState<Set<number>>(new Set())
  const [removingQuestions, setRemovingQuestions] = useState<Set<number>>(new Set())
  const [regeneratingQuestions, setRegeneratingQuestions] = useState<Set<number>>(new Set())
  const [questionVerificationMap, setQuestionVerificationMap] = useState<Map<number, boolean>>(new Map())

  // Track initial show to reset state only when modal first opens
  const prevShowRef = useRef(show)
  
  useEffect(() => {
    // Only reset state when modal transitions from hidden to shown
    if (show && !prevShowRef.current) {
      setDismissedQuestions(new Set())
      setRemovingQuestions(new Set())
      setRegeneratingQuestions(new Set())
      setQuestionVerificationMap(new Map())
    }
    prevShowRef.current = show
  }, [show])

  const handleVerificationChange = (index: number, checked: boolean) => {
    setQuestionVerificationMap(prev => {
      const newMap = new Map(prev)
      newMap.set(index, checked)
      return newMap
    })
  }

  const handleMasterVerificationToggle = () => {
    const visibleQuestions = questions
      .map((_, idx) => idx)
      .filter(idx => !dismissedQuestions.has(idx) && !removingQuestions.has(idx) && !regeneratingQuestions.has(idx))
    
    const allChecked = visibleQuestions.every(idx => questionVerificationMap.get(idx))
    
    setQuestionVerificationMap(prev => {
      const newMap = new Map(prev)
      visibleQuestions.forEach(idx => {
        newMap.set(idx, !allChecked)
      })
      return newMap
    })
  }

  // Calculate master checkbox state
  const visibleQuestionsIndices = questions
    .map((_, idx) => idx)
    .filter(idx => !dismissedQuestions.has(idx) && !removingQuestions.has(idx) && !regeneratingQuestions.has(idx))
  
  const checkedCount = visibleQuestionsIndices.filter(idx => questionVerificationMap.get(idx)).length
  const allChecked = visibleQuestionsIndices.length > 0 && checkedCount === visibleQuestionsIndices.length
  const someChecked = checkedCount > 0 && checkedCount < visibleQuestionsIndices.length

  const handleAcceptQuestion = (index: number) => {
    // Mark as accepting/removing with animation
    setRemovingQuestions(prev => new Set(prev).add(index))
    
    // Calculate remaining questions after this one is removed
    const remainingAfterRemoval = questions.filter((_, idx) => 
      idx !== index && 
      !dismissedQuestions.has(idx) && 
      !regeneratingQuestions.has(idx)
    ).length
    
    const shouldCloseModal = remainingAfterRemoval === 0
    
    // Create the question
    const question = questions[index]
    const verificationMap = new Map<number, number>()
    const status = questionVerificationMap.get(index)
      ? TEACHER_VERIFICATION_STATUS.PENDING_VERIFICATION 
      : TEACHER_VERIFICATION_STATUS.NO_VERIFICATION_NEEDED
    verificationMap.set(index, status)
    
    // Call API to create the question, passing the index so parent can remove it from Redux
    onAccept([question], verificationMap, shouldCloseModal, index)
    
    // After animation completes, actually dismiss it
    setTimeout(() => {
      setDismissedQuestions(prev => new Set(prev).add(index))
      setRemovingQuestions(prev => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
    }, 400)
  }

  const handleRemoveQuestion = (index: number) => {
    // Mark as removing with animation
    setRemovingQuestions(prev => new Set(prev).add(index))
    
    // Calculate remaining questions after this one is removed
    const remainingAfterRemoval = questions.filter((_, idx) => 
      idx !== index && 
      !dismissedQuestions.has(idx) && 
      !regeneratingQuestions.has(idx)
    ).length
    
    // After animation completes, actually dismiss it
    setTimeout(() => {
      setDismissedQuestions(prev => new Set(prev).add(index))
      setRemovingQuestions(prev => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
      
      // Close modal if no questions left
      if (remainingAfterRemoval === 0) {
        onHide()
      }
    }, 400) // Match this with CSS transition duration
  }

  const handleRegenerateQuestion = (index: number) => {
    if (onRegenerate) {
      // Mark as regenerating
      setRegeneratingQuestions(prev => new Set(prev).add(index))
      // Call the regenerate handler
      onRegenerate(index)
    }
  }

  // Clear regenerating state when questions array changes (after regeneration completes)
  useEffect(() => {
    if (regeneratingQuestions.size > 0) {
      // Small delay to ensure the new question has been rendered
      const timer = setTimeout(() => {
        setRegeneratingQuestions(new Set())
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [questions, regeneratingQuestions.size])

  const handleCreateAll = () => {
    // Create all questions that haven't been removed, are not removing, or are regenerating
    const allQuestionsArray = questions
      .map((q, idx) => ({ question: q, index: idx }))
      .filter(({ index }) => !dismissedQuestions.has(index) && !removingQuestions.has(index) && !regeneratingQuestions.has(index))
      .map(({ question }) => question)
    
    // Create verification status map for all non-removed, non-removing, non-regenerating questions
    const verificationMap = new Map<number, number>()
    questions.forEach((_, idx) => {
      if (!dismissedQuestions.has(idx) && !removingQuestions.has(idx) && !regeneratingQuestions.has(idx)) {
        const status = questionVerificationMap.get(idx)
          ? TEACHER_VERIFICATION_STATUS.PENDING_VERIFICATION 
          : TEACHER_VERIFICATION_STATUS.NO_VERIFICATION_NEEDED
        verificationMap.set(idx, status)
      }
    })
    
    // Close modal after creating all questions (don't pass questionIndex for "create all")
    onAccept(allQuestionsArray, verificationMap, true, undefined)
  }

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

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
        <div className='w-100'>
          <Modal.Title>
            <i className='fas fa-robot me-2 text-primary'></i>
            AI Generated Questions
          </Modal.Title>
          <div className='alert alert-warning mb-0 mt-3 py-2 px-3 d-flex align-items-center'>
            <i className='fas fa-exclamation-triangle me-2 text-warning'></i>
            <small className='text-black'>
              AI-generated content may not be 100% accurate. You may want to have teacher to verify the contents before using them.
            </small>
          </div>
        </div>
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
            {regeneratingQuestions.size > 0 && (
              <div className='alert alert-info d-flex align-items-center'>
                <div className='spinner-border spinner-border-sm me-3' role='status'>
                  <span className='visually-hidden'>Regenerating...</span>
                </div>
                <span>Regenerating question...</span>
              </div>
            )}
            {questions.map((question, index) => {
              const isDismissed = dismissedQuestions.has(index)
              const isRemoving = removingQuestions.has(index)
              const isRegenerating = regeneratingQuestions.has(index)

              // Don't render dismissed or regenerating questions (but DO render removing questions with animation)
              if (isDismissed || isRegenerating) {
                return null
              }

              return (
                <div
                  key={index}
                  className='card'
                  style={{
                    transition: 'all 0.4s ease-out',
                    opacity: isRemoving ? 0 : 1,
                    transform: isRemoving ? 'translateX(100%) scale(0.8)' : 'translateX(0) scale(1)',
                    maxHeight: isRemoving ? '0' : '2000px',
                    overflow: isRemoving ? 'hidden' : 'visible',
                    marginBottom: isRemoving ? '0' : '1rem'
                  }}
                >
                  <div className='card-header'>
                    <h5 className='card-title mb-0'>
                      #{index + 1}
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
                    {!isDismissed && (
                      <div className='mt-4'>
                        <div className='d-flex gap-2 align-items-center flex-wrap'>
                          <button
                            className='btn btn-success btn-sm'
                            onClick={() => handleAcceptQuestion(index)}
                            disabled={isLoading || isRemoving}
                          >
                            <i className='fas fa-plus me-1'></i>
                            Create
                          </button>
                          {questions.length > 1 && (
                            <button
                              className='btn btn-danger btn-sm'
                              onClick={() => handleRemoveQuestion(index)}
                              disabled={isLoading || isRemoving}
                            >
                              <i className='fas fa-times me-1'></i>
                              Remove
                            </button>
                          )}
                          <button
                            className='btn btn-primary btn-sm'
                            onClick={() => handleRegenerateQuestion(index)}
                            disabled={isLoading || isRemoving}
                          >
                            <i className='fas fa-sync-alt me-1'></i>
                            Re-generate
                          </button>
                        </div>
                        {/* Teacher Verification Checkbox */}
                        <div className='form-check mt-3'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            id={`teacherVerificationCheck-${index}`}
                            checked={questionVerificationMap.get(index) || false}
                            onChange={(e) => handleVerificationChange(index, e.target.checked)}
                          />
                          <label className='form-check-label' htmlFor={`teacherVerificationCheck-${index}`}>
                            I want teacher to verify this question
                          </label>
                        </div>
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
        <div className={`d-flex ${visibleQuestionsIndices.length > 0 ? 'justify-content-between' : 'justify-content-end'} align-items-center w-100`}>
          {/* Master Verification Checkbox */}
          {visibleQuestionsIndices.length > 0 && (
            <div className='form-check'>
              <input
                className='form-check-input'
                type='checkbox'
                id='masterVerificationCheck'
                checked={allChecked}
                ref={(el) => {
                  if (el) {
                    el.indeterminate = someChecked
                  }
                }}
                onChange={handleMasterVerificationToggle}
              />
              <label className='form-check-label' htmlFor='masterVerificationCheck'>
                I want teacher to verify {visibleQuestionsIndices.length === 1 ? 'this' : (allChecked || someChecked ? 'these' : 'all')} {visibleQuestionsIndices.length === 1 ? 'question' : 'questions'}
              </label>
            </div>
          )}
          
          <div className='d-flex gap-2'>
            <Button variant='secondary' onClick={onHide} disabled={isLoading}>
              Close
            </Button>
            {questions.length > 1 && (
              <Button
                variant='success'
                onClick={handleCreateAll}
                disabled={isLoading || regeneratingQuestions.size > 0 || removingQuestions.size > 0 || (questions.length - dismissedQuestions.size - removingQuestions.size - regeneratingQuestions.size) === 0}
              >
                <i className='fas fa-plus me-1'></i>
                Create all
              </Button>
            )}
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default DojoGeneratedQuestionsModal


