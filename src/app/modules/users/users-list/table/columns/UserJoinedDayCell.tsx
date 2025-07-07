import { FC } from 'react'
import { User } from '../../core/_models'

type Props = {
  user: User
}

const UserJoinedDayCell: FC<Props> = ({ user }) => {
  // Get the first user_subject to display the created_at date
  const firstUserSubject = user.user_subjects?.[0]
  
  if (!firstUserSubject) {
    return <span className='text-muted'>No data</span>
  }

  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className='text-gray-600 fw-bold'>
      {formatDate(firstUserSubject.created_at)}
    </div>
  )
}

export { UserJoinedDayCell } 