import {useCallback, useEffect} from 'react'
import {KTCardBody} from '../../../../../_metronic/helpers'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../../../store'
import {fetchNotifications, setPage, markAllNotificationsAsRead} from '../../../../../store/notifications/notificationsSlice'
import {formatApiTimestamp} from '../../../../../_metronic/helpers/dateUtils'
import {useNavigate} from 'react-router-dom'
import clsx from 'clsx'

const NotificationsTable = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {notifications, loading, total, page, limit} = useSelector((state: RootState) => state.notifications)
  const navigate = useNavigate()

  // Mark all notifications as read when component first mounts
  useEffect(() => {
    dispatch(markAllNotificationsAsRead())
  }, [dispatch])

  // Fetch notifications when component mounts or page changes
  useEffect(() => {
    dispatch(fetchNotifications({ page, limit }))
  }, [dispatch, page, limit])

  const handlePageChange = useCallback((newPage: number) => {
    dispatch(setPage(newPage))
  }, [dispatch])

  const handleNotificationClick = (notification: any) => {
    if (notification.url_path) {
      navigate(notification.url_path)
    }
  }

  // Calculate pagination
  const totalPages = Math.ceil(total / limit)

  const getTypeLabel = (type: number) => {
    switch (type) {
      case 1: return 'Exercise'
      case 2: return 'Video'
      case 3: return 'Exercise Submission'
      default: return 'Notification'
    }
  }

  return (
    <KTCardBody className='py-4'>
      {loading ? (
        <div className='d-flex justify-content-center align-items-center py-10'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className='table-responsive'>
            <table
              id='kt_table_notifications'
              className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer table-row-hover'
            >
              <thead>
                <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
                  <th className='min-w-125px text-start'>Notification</th>
                  <th className='min-w-125px text-start'>Status</th>
                  <th className='min-w-125px text-start'>Type</th>
                  <th className='min-w-125px text-start'>Time</th>
                </tr>
              </thead>
              <tbody className='text-gray-600 fw-bold'>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <tr 
                      key={notification.notification_id} 
                      className={clsx(
                        !notification.isRead ? 'bg-light-primary' : '',
                        notification.url_path ? 'cursor-pointer' : ''
                      )}
                      onClick={() => handleNotificationClick(notification)}
                      style={{ cursor: notification.url_path ? 'pointer' : 'default' }}
                    >
                      <td>
                        <div className='d-flex align-items-center'>
                          <div className='symbol symbol-35px me-4'>
                            <span className={`symbol-label bg-light-${notification.state}`}>
                              <i className={`fa-solid fa-${notification.icon} fs-2 text-${notification.state}`}></i>
                            </span>
                          </div>
                          <div className='d-flex flex-column'>
                            <div className={`fs-6 text-gray-800 fw-bolder ${!notification.isRead ? 'fw-bold' : ''}`}>
                              {notification.title}
                            </div>
                            <div className='text-gray-500 fs-7'>{notification.message}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className='text-gray-600'>
                          {notification.isRead ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td>
                        <span className='text-gray-600'>
                          {getTypeLabel(notification.type)}
                        </span>
                      </td>
                      <td>
                        <span className='text-gray-600 fs-7'>
                          {formatApiTimestamp(notification.created_at, { format: 'relative' })}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>
                      <div className='d-flex text-center w-100 align-content-center justify-content-center'>
                        No notifications found
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className='d-flex justify-content-between align-items-center mt-4'>
            <div className='text-muted'>
              Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} entries
            </div>
            <div className='d-flex gap-2'>
              <button 
                className='btn btn-sm btn-light' 
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </button>
              <span className='btn btn-sm btn-primary'>{page}</span>
              <button 
                className='btn btn-sm btn-light' 
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </KTCardBody>
  )
}

export {NotificationsTable}
