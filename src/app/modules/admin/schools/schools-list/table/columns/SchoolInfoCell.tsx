import {FC} from 'react'
import {useNavigate} from 'react-router-dom'
import {School} from '../../../../../../../store/schools/schoolsSlice'

type Props = {
  school: School
}

const SchoolInfoCell: FC<Props> = ({school}) => {
  const navigate = useNavigate()

  const handleSchoolClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (school.school_id) {
      navigate(`/admin/schools/edit/${school.school_id}`)
    }
  }

  return (
    <div className='d-flex align-items-center'>
      <div className='d-flex flex-column'>
        <a 
          href='#' 
          className='text-gray-800 text-hover-primary mb-1 fw-bold cursor-pointer'
          onClick={handleSchoolClick}
          style={{ cursor: 'pointer' }}
        >
          {school.name}
        </a>
        <span className='text-muted'>{school.code}</span>
      </div>
    </div>
  )
}

export {SchoolInfoCell} 