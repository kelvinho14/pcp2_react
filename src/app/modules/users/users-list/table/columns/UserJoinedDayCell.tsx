import { FC } from 'react'
import { User } from '../../core/_models'
import { formatApiTimestamp } from '../../../../../../_metronic/helpers/dateUtils'

type Props = {
  user: User
}

const UserJoinedDayCell: FC<Props> = ({ user }) => {
  // Get the first user_subject to display the created_at date
  const firstUserSubject = user.user_subjects?.[0]
  
  if (!firstUserSubject) {
    return <span className='text-muted'>No data</span>
  }

  return (
    <div className='text-gray-600 fw-bold'>
      {formatApiTimestamp(firstUserSubject.created_at, { format: 'custom' })}
    </div>
  )
}

export { UserJoinedDayCell } 