import { Column } from 'react-table'
import { Notification } from '../types'

export const notificationsColumns: ReadonlyArray<Column<Notification>> = [
  {
    Header: 'Notification',
    accessor: 'title',
    id: 'notification',
    Cell: ({ row }) => {
      const notification = row.original
      return (
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
      )
    },
  },
  {
    Header: 'Status',
    accessor: 'isRead',
    id: 'status',
    Cell: ({ value }) => (
      <span className={`badge ${value ? 'badge-light-success' : 'badge-light-primary'}`}>
        {value ? 'Read' : 'Unread'}
      </span>
    ),
  },
  {
    Header: 'Type',
    accessor: 'type',
    id: 'type',
    Cell: ({ value }) => {
      const getTypeLabel = (type: number) => {
        switch (type) {
          case 1: return 'Assignment'
          case 2: return 'Video'
          case 3: return 'Exercise Submission'
          case 4: return 'System'
          case 5: return 'Message'
          default: return 'Notification'
        }
      }
      return (
        <span className='badge badge-light-info text-info'>
          {getTypeLabel(value)}
        </span>
      )
    },
  },
  {
    Header: 'Time',
    accessor: 'time',
    id: 'time',
    Cell: ({ value }) => (
      <span className='text-gray-600 fs-7'>{value}</span>
    ),
  },
]
