import {FC, useState} from 'react'
import {PracticeQuestionItem} from '../../../../../../store/dojo/practiceQuestionsSlice'
import {TEACHER_VERIFICATION_STATUS} from '../../../../../constants/teacherVerificationStatus'

type Props = {
  question: PracticeQuestionItem
  showAnswer?: boolean
}

const PracticeQuestionWithOptionsCell: FC<Props> = ({question, showAnswer: showAnswerProp = false}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  
  // Use prop to auto-show answer if enabled
  const shouldShowAnswer = showAnswerProp || showAnswer

  const handleSubmit = () => {
    if (!selectedOption) {
      return
    }
    setShowAnswer(true)
  }

  const handleReset = () => {
    setSelectedOption(null)
    setShowAnswer(false)
  }

  const isCorrect = selectedOption === question.mc_question?.correct_option

  // Verification status badge configuration
  const verificationBadgeConfig: Record<number, { variant: string; text: string; icon: string }> = {
    [TEACHER_VERIFICATION_STATUS.PENDING_VERIFICATION]: {
      variant: 'warning',
      text: 'Waiting to verify',
      icon: 'fa-clock'
    },
    [TEACHER_VERIFICATION_STATUS.TEACHER_VERIFIED]: {
      variant: 'success',
      text: 'Verified',
      icon: 'fa-check'
    },
    [TEACHER_VERIFICATION_STATUS.TEACHER_DISAGREED]: {
      variant: 'danger',
      text: 'Teacher disagreed',
      icon: 'fa-times'
    }
  }

  const renderVerificationBadge = () => {
    const status = question.teacher_verification_status ?? TEACHER_VERIFICATION_STATUS.NO_VERIFICATION_NEEDED
    const config = verificationBadgeConfig[status]
    
    if (!config) return null
    
    return (
      <span className={`mb-2 badge badge-${config.variant}`}>
        <i className={`fas ${config.icon} me-1 text-white`}></i>
        {config.text}
      </span>
    )
  }

  return (
    <>  
      <div className='d-flex justify-content-start'>
        {renderVerificationBadge()}
      </div>
      <div className='d-flex flex-column' style={{ width: '100%'}}>
        {/* Question Content */}
        <div className='mb-4'>
          <div 
            className='question-content fw-bold fs-6 mb-3 text-dark'
            dangerouslySetInnerHTML={{__html: question.question_content}}
            style={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
              color: '#000000',
              lineHeight: '1.5'
            }}
          />
        </div>

      {/* MC Options */}
      {question.mc_question && (
        <div className='mb-3'>
          <div className='d-flex flex-column gap-2'>
            {question.mc_question.options.map((option) => {
              const isSelected = selectedOption === option.option_letter
              const isCorrectOption = option.option_letter === question.mc_question?.correct_option
              
              let optionClass = 'p-2 rounded border'
              
              if (shouldShowAnswer) {
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
                optionClass += ' cursor-pointer'
              }
              
              return (
                <div 
                  key={option.option_letter}
                  className={optionClass}
                  onClick={() => !shouldShowAnswer && setSelectedOption(option.option_letter)}
                  style={{ cursor: shouldShowAnswer ? 'default' : 'pointer' }}
                >
                  <div className='d-flex align-items-start text-dark' style={{color: '#000000'}}>
                    <span className='fw-bold me-2 flex-shrink-0'>{option.option_letter}.</span>
                    <div 
                      className='flex-grow-1'
                      dangerouslySetInnerHTML={{__html: option.option_text}}
                    />
                    {shouldShowAnswer && isCorrectOption && (
                      <i className='fas fa-check-circle text-success ms-2 flex-shrink-0'></i>
                    )}
                    {shouldShowAnswer && isSelected && !isCorrectOption && (
                      <i className='fas fa-times-circle text-danger ms-2 flex-shrink-0'></i>
                    )}
                  </div>
                </div>
              )
            })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!shouldShowAnswer ? (
          <div className='d-flex justify-content-end gap-2'>
            <button 
              className='btn btn-sm btn-primary' 
              onClick={handleSubmit}
              disabled={!selectedOption}
            >
              Submit Answer
            </button>
          </div>
        ) : (
          <>
            {/* Result Message */}
            <div className={`alert ${isCorrect ? 'alert-success' : 'alert-warning'} mb-3`}>
              <div className='d-flex align-items-start'>
                <i className={`fas ${isCorrect ? 'fa-check-circle' : 'fa-info-circle'} me-2 mt-1`}></i>
                <div className='flex-grow-1'>
                  <div className='mb-2'>
                    <strong>{isCorrect ? 'Correct!' : 'Not quite right'}</strong>
                    {!isCorrect && (
                      <span className='ms-2'>
                        The correct answer is option {question.mc_question?.correct_option}.
                      </span>
                    )}
                  </div>
                  {question.mc_question?.answer_content && (
                    <div 
                      className='rounded'
                      style={{marginLeft: '0'}}
                      dangerouslySetInnerHTML={{__html: question.mc_question.answer_content}}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Only show Try Again button if answer was shown via submit, not via toggle */}
            {!showAnswerProp && (
              <div className='d-flex justify-content-end gap-2'>
                <button 
                  className='btn btn-sm btn-secondary' 
                  onClick={handleReset}
                >
                  <i className='fas fa-redo me-1'></i>
                  Try Again
                </button>
              </div>
            )}
          </>
        )}

        {/* Teacher Remark */}
        {question.teacher_remark && (
          <div className='mt-3'>
            <span className='text-muted fw-semibold d-block fs-7'>
              <i className='fas fa-comment-dots me-1'></i>
              {question.teacher_remark}
            </span>
          </div>
        )}

        <style>{`
          .question-content img {
            max-width: 100%;
            height: auto;
            max-height: 300px;
            object-fit: contain;
          }
          .question-content,
          .question-content * {
            color: #000000 !important;
          }
        `}</style>
      </div>
    </>
  )
}

export {PracticeQuestionWithOptionsCell}

