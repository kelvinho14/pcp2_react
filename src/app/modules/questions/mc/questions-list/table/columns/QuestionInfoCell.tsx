import {FC} from 'react'
import {useNavigate} from 'react-router-dom'
import {Question} from '../../../../../../../store/questions/questionsSlice'

type Props = {
  question: Question
}

const QuestionInfoCell: FC<Props> = ({question}) => {
  const navigate = useNavigate()

  const handleQuestionNameClick = () => {
    navigate(`/questions/mc/edit/${question.q_id}`)
  }

  return (
    <div className='d-flex align-items-center'>
      <div className='d-flex flex-column'>
        <span 
          className='text-gray-800 text-hover-primary fw-bold mb-1 fs-6 cursor-pointer'
          onClick={handleQuestionNameClick}
          style={{ cursor: 'pointer' }}
        >
          {question.name}
        </span>
      </div>
    </div>
  )
}

export {QuestionInfoCell} 