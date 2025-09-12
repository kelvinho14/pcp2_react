
import clsx from 'clsx'
import {FC} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {
  KTIcon,
  toAbsoluteUrl,
} from '../../../helpers'
import {RootState} from '../../../../store'

type Props = {
  backgrounUrl: string
}

const HeaderNotificationsMenu: FC<Props> = ({backgrounUrl}) => {
  const {notifications, loading} = useSelector((state: RootState) => state.notifications)
  const navigate = useNavigate()

  // Ensure notifications is always an array
  const safeNotifications = Array.isArray(notifications) ? notifications : []

  const handleNotificationClick = (notification: any, event: React.MouseEvent) => {
    console.log('a');
    event.preventDefault();
    event.stopPropagation();
    
    if (notification.url_path) {
      navigate(notification.url_path)
    }
  }

  return (
    <div
      className='menu menu-sub menu-sub-dropdown menu-column w-350px w-lg-375px'
      data-kt-menu='true'
    >
      <div
        className='d-flex flex-column bgi-no-repeat rounded-top'
        style={{backgroundImage: `url('${toAbsoluteUrl(backgrounUrl)}')`}}
      >
        <h3 className='text-white fw-bold px-9 mt-4 mb-4'>
          Notifications
        </h3>
      </div>

      <div className='scroll-y mh-325px '>
        {loading ? (
          <div className='d-flex justify-content-center align-items-center py-10'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        ) : safeNotifications.length > 0 ? (
          safeNotifications.map((notification) => (
            <a 
              key={notification.notification_id} 
              href={notification.url_path || '#'}
              className={clsx(
                'd-flex flex-stack py-4 px-2 text-decoration-none',
                !notification.isRead && 'bg-light-primary',
                notification.url_path && 'cursor-pointer'
              )}
              onClick={(event) => {
                console.log('ANCHOR CLICKED!');
                handleNotificationClick(notification, event);
              }}
              onMouseDown={(event) => {
                console.log('ANCHOR MOUSE DOWN!');
                handleNotificationClick(notification, event);
              }}
              style={{ 
                cursor: notification.url_path ? 'pointer' : 'default',
                display: 'block'
              }}
            >
              <div className='d-flex align-items-center'>
                <div className='symbol symbol-35px me-4'>
                  <span className={clsx('symbol-label', `bg-light-${notification.state}`)}>
                    <i className={`fa-solid fa-${notification.icon} fs-2 text-${notification.state}`}></i>
                  </span>
                </div>

                <div className='mb-0 me-2'>
                  <div className={clsx('fs-6 text-gray-800 text-hover-primary fw-bolder', !notification.isRead && 'fw-bold')}>
                    {notification.title}
                  </div>
                  <div className='text-gray-500 fs-7'>{notification.message}</div>
                </div>
              </div>

              <div className='d-flex flex-column align-items-end'>
                <span className='badge badge-light fs-8'>{notification.time}</span>
              </div>
            </a>
          ))
        ) : (
          <div className='d-flex text-center w-100 align-content-center justify-content-center py-10'>
            <div className='text-gray-500 fs-7'>No notifications found</div>
          </div>
        )}
      </div>

      <div className='py-3 text-center border-top'>
        <Link
          to='/notifications/list'
          className='btn btn-color-gray-600 btn-active-color-primary'
        >
          View All <KTIcon iconName='arrow-right' className='fs-5' />
        </Link>
      </div>
    </div>
  )
}

export {HeaderNotificationsMenu}
