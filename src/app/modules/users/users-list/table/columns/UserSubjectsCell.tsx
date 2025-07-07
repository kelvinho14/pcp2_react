import { FC } from 'react'

type Props = {
  user_subjects?: Array<{
    subject_name: string
    status: number
    role: {
      name: string
    }
  }>
}

const UserSubjectsCell: FC<Props> = ({ user_subjects }) => {
  if (!user_subjects || user_subjects.length === 0) {
    return <span className='text-muted'>No subjects</span>
  }

  // Get all subjects with their names and roles
  const allSubjects = user_subjects
    .map(subject => ({
      name: subject.subject_name,
      role: subject.role.name,
      status: subject.status
    }))

  if (allSubjects.length === 0) {
    return <span className='text-muted'>No subjects</span>
  }

  return (
    <div className='d-flex flex-wrap gap-1'>
      {allSubjects.map((subject, index) => (
        <span 
          key={index} 
          className={`badge ${subject.status === 1 ? 'badge-light-primary' : 'badge-light-warning'}`}
        >
          {subject.name}: {subject.role}
        </span>
      ))}
    </div>
  )
}

export { UserSubjectsCell } 