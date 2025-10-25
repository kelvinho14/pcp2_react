import {FC} from 'react'
import {IncorrectQuestionItem} from '../../../../../../store/dojo/incorrectQuestionsSlice'

type Props = {
  question: IncorrectQuestionItem
  showAnswer: boolean
}

const QuestionCell: FC<Props> = ({question, showAnswer}) => {
  return (
    <div className='d-flex flex-column'>
      <div 
        className='text-dark fw-bold mb-3 fs-6 question-content'
        dangerouslySetInnerHTML={{__html: question.question_content}}
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'normal',
          color: '#000000',
        }}
      />
      
      {/* MC Options */}
      {question.question_type === 'mc' && question.mc_options && (
        <div className='mb-3'>
          <div className='d-flex flex-column gap-2'>
            {question.mc_options.map((option) => {
              const isCorrectAnswer = showAnswer && option.option_letter === question.correct_answer
              const isStudentAnswer = showAnswer && option.option_letter === question.student_answer
              const isIncorrectStudentAnswer = isStudentAnswer && option.option_letter !== question.correct_answer
              
              let optionClass = 'p-2 rounded border border-secondary'
              if (isCorrectAnswer) {
                optionClass = 'p-2 rounded border border-success bg-success bg-opacity-10'
              } else if (isIncorrectStudentAnswer) {
                optionClass = 'p-2 rounded border border-danger bg-danger bg-opacity-10'
              }
              
              return (
                <div 
                  key={option.option_letter}
                  className={optionClass}
                >
                  <div className='d-flex align-items-start text-dark' style={{color: '#000000'}}>
                    <span className='fw-bold me-2'>{option.option_letter}.</span>
                    <div 
                      className='flex-grow-1'
                      dangerouslySetInnerHTML={{__html: option.option_text}}
                    />
                    {isCorrectAnswer && (
                      <i className='fas fa-check-circle text-success ms-2'></i>
                    )}
                    {isIncorrectStudentAnswer && (
                      <i className='fas fa-times-circle text-danger ms-2'></i>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {question.teacher_remark && (
        <span className='text-muted fw-semibold d-block fs-7'>
          <i className='fas fa-comment-dots me-1'></i>
          {question.teacher_remark}
        </span>
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
  )
}

export {QuestionCell}

