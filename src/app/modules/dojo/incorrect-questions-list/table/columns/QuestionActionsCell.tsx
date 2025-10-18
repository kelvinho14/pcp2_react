import {FC} from 'react'

type Props = {
  questionId: string
  onGenerateClick: (questionId: string) => void
}

const QuestionActionsCell: FC<Props> = ({questionId, onGenerateClick}) => {
  return (
    <div className='d-flex justify-content-center'>
      <button
        className='btn btn-primary btn-sm'
        onClick={() => onGenerateClick(questionId)}
        title='Generate similar questions'
      >
        <i className='fas fa-robot me-1'></i>
        Create
      </button>
    </div>
  )
}

export {QuestionActionsCell}

