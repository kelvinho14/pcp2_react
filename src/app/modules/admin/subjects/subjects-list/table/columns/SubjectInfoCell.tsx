import {FC} from 'react'
import {useNavigate} from 'react-router-dom'
import {Subject} from '../../../../../../../store/admin/adminSlice'

type Props = {
  subject: Subject
}

const SubjectInfoCell: FC<Props> = ({subject}) => {
  const navigate = useNavigate()

  const handleSubjectClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (subject.subject_id) {
      navigate(`/admin/subjects/edit/${subject.subject_id}`)
    }
  }

  return (
    <div className='d-flex align-items-center'>
      <div className='d-flex flex-column'>
        <a 
          href='#' 
          className='text-gray-800 text-hover-primary mb-1 fw-bold cursor-pointer'
          onClick={handleSubjectClick}
          style={{ cursor: 'pointer' }}
        >
          {subject.name}
        </a>
      </div>
    </div>
  )
}

export {SubjectInfoCell} 