import {FC} from 'react'
import {User} from '../../core/_models'

type Props = {
  user: User
}

const UserStatusCell: FC<Props> = ({user}) => {
  const getStatus = () => {
    // Always use the user's main status
    return user.status === 1 ? 'Active' : 'Inactive'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'badge-light-success'
      case 'Inactive':
        return 'badge-light-danger'
      default:
        return 'badge-light-warning'
    }
  }

  const status = getStatus()

  return (
    <div className='d-flex align-items-center'>
      <div className={`badge ${getStatusColor(status)} fw-bold`}>
        {status}
      </div>
    </div>
  )
}

export {UserStatusCell} 