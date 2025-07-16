import {FC} from 'react'

type Props = {
  students?: Array<{
    user_id: string
    name: string
    email: string
  }>
  member_count?: number
}

const GroupStudentsCell: FC<Props> = ({students, member_count}) => {
  const studentCount = member_count || students?.length || 0

  return (
    <div className='d-flex align-items-center'>
      <div className='badge badge-light-primary fw-bold'>
        {studentCount} {studentCount === 1 ? 'student' : 'students'}
      </div>
    </div>
  )
}

export {GroupStudentsCell} 