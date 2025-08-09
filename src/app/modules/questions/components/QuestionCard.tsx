import {FC} from 'react'
import {KTIcon} from '../../../../_metronic/helpers'
import TinyMCEEditor from '../../../../components/Editor/TinyMCEEditor'

interface MCOption {
  option_letter: string
  option_text: string
}

interface GeneratedQuestion {
  type: 'mc' | 'lq'
  name: string
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

interface QuestionCardProps {
  question: GeneratedQuestion
  index: number
  isCreating: boolean
  isLoading: boolean
  onNameChange: (index: number, name: string) => void
  onContentChange: (index: number, content: string) => void
  onAnswerChange: (index: number, content: string) => void
  onMCOptionChange: (index: number, optionIndex: number, text: string) => void
  onCorrectOptionChange: (index: number, optionLetter: string) => void
  onMCAnswerChange: (index: number, content: string) => void
  onAccept: (index: number) => void
  onDismiss: (index: number) => void
}

const QuestionCard: FC<QuestionCardProps> = ({
  question,
  index,
  isCreating,
  isLoading,
  onNameChange,
  onContentChange,
  onAnswerChange,
  onMCOptionChange,
  onCorrectOptionChange,
  onMCAnswerChange,
  onAccept,
  onDismiss,
}) => {
  const isDisabled = isLoading || isCreating

  return (
    <div className='card border border-gray-300 shadow-sm'>
      <div className='card-header bg-light py-4'>
        <div className='d-flex align-items-center justify-content-between w-100'>
          <div style={{ maxWidth: 350, width: '100%' }}>
            <label className='form-label fw-bold mb-2'>Question Name:</label>
            <input
              type='text'
              className='form-control'
              value={question.name}
              onChange={(e) => onNameChange(index, e.target.value)}
              placeholder='Enter question name...'
              disabled={isDisabled}
            />
          </div>
          <div className='d-flex gap-2 ms-auto'>
            <button
              type='button'
              className={`btn btn-sm btn-success ${isCreating ? 'btn-loading' : ''}`}
              onClick={() => onAccept(index)}
              disabled={isDisabled}
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
              onClick={() => onDismiss(index)}
              disabled={isDisabled}
            >
              <KTIcon iconName='cross' className='fs-6 me-1' />
              Dismiss
            </button>
          </div>
        </div>
      </div>
      
      <div className='card-body'>
        {/* Question Content */}
        <div className='mb-4'>
          <label className='form-label fw-bold'>Question:</label>
          <TinyMCEEditor
            value={question.question_content}
            onChange={(content: string) => onContentChange(index, content)}
            height={200}
          />
        </div>

        {/* Answer Content (for LQ questions) */}
        {question.lq_question?.answer_content && (
          <div className='mb-4'>
            <label className='form-label fw-bold'>Answer:</label>
            <TinyMCEEditor
              value={question.lq_question.answer_content}
              onChange={(content: string) => onAnswerChange(index, content)}
              height={300}
            />
          </div>
        )}

        {/* MC Options and Answer Explanation */}
        {question.type === 'mc' && question.mc_question && (
          <div className='mb-4'>
            <label className='form-label fw-bold'>Options:</label>
            {question.mc_question.options.map((option, optionIndex) => (
              <div key={optionIndex} className='input-group mb-3 align-items-center'>
                <span className='input-group-text'>
                  <input
                    type='radio'
                    name={`correct-option-${index}`}
                    checked={question.mc_question!.correct_option === option.option_letter}
                    onChange={() => onCorrectOptionChange(index, option.option_letter)}
                    className='form-check-input me-2'
                    disabled={isDisabled}
                  />
                  <span className='fw-bold'>{option.option_letter}</span>
                </span>
                <input
                  type='text'
                  className='form-control'
                  value={option.option_text}
                  onChange={(e) => onMCOptionChange(index, optionIndex, e.target.value)}
                  placeholder={`Option ${option.option_letter}`}
                  disabled={isDisabled}
                />
              </div>
            ))}
            
            {/* MC Answer Explanation */}
            {question.mc_question.answer_content && (
              <div className='mb-3'>
                <label className='form-label fw-bold'>Answer Explanation:</label>
                <TinyMCEEditor
                  value={question.mc_question.answer_content}
                  onChange={(content: string) => onMCAnswerChange(index, content)}
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
}

export default QuestionCard 