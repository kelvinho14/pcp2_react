import {FC} from 'react'
import {PracticeQuestionItem} from '../../../../../../store/dojo/practiceQuestionsSlice'

type Props = {
  question: PracticeQuestionItem
  onClick?: (questionId: string) => void
}

const PracticeQuestionCell: FC<Props> = ({question, onClick}) => {
  return (
    <div className='d-flex flex-column'>
      <div 
        className='text-dark fw-bold text-hover-primary mb-1 fs-6 question-content'
        dangerouslySetInnerHTML={{__html: question.question_content}}
        onClick={() => onClick?.(question.q_id)}
        style={{
          maxWidth: '600px',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'normal',
          cursor: 'pointer',
        }}
      />
      {question.teacher_remark && (
        <span className='text-muted fw-semibold text-muted d-block fs-7'>
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
      `}</style>
    </div>
  )
}

export {PracticeQuestionCell}

