import clsx from 'clsx'
import {FC} from 'react'
import {useNavigate} from 'react-router-dom'
import {toAbsoluteUrl} from '../../../../../../_metronic/helpers'
import {User} from '../../core/_models'
import {useAuth} from '../../../../auth/core/Auth'
import {ROLES} from '../../../../../constants/roles'

type Props = {
  user: User
}

const UserInfoCell: FC<Props> = ({user}) => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const handleNameClick = () => {
    // Determine the correct edit path based on user role
    const isAdmin = currentUser?.role?.role_type === ROLES.ADMIN
    const editPath = isAdmin ? `/admin/users/edit/${user.user_id}` : `/users/edit/${user.user_id}`
    navigate(editPath)
  }

  return (
    <div className='d-flex align-items-center'>
      {/* begin:: Avatar */}
      <div className='symbol symbol-circle symbol-50px overflow-hidden me-3'>
        <a href='#'>
          {user.avatar ? (
            <div className='symbol-label'>
              <img src={toAbsoluteUrl(`media/${user.avatar}`)} alt={user.name} className='w-100' />
            </div>
          ) : (
            <div
              className={clsx(
                'symbol-label fs-3',
                `bg-light-${user.initials?.state}`,
                `text-${user.initials?.state}`
              )}
            >
              {user.initials?.label}
            </div>
          )}
        </a>
      </div>
      <div className='d-flex flex-column'>
        <a 
          href='#' 
          className='text-gray-800 text-hover-primary mb-1 cursor-pointer'
          onClick={(e) => {
            e.preventDefault()
            handleNameClick()
          }}
        >
          {user.name}
        </a>
        <span>{user.email}</span>
      </div>
    </div>
  )
}

export {UserInfoCell}
