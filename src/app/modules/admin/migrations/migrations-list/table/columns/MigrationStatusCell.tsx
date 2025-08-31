import { FC } from 'react'

type Props = {
  success: boolean
  status: string
  isCompleted: boolean
}

const MigrationStatusCell: FC<Props> = ({ success, status, isCompleted }) => {
  const getBadgeClass = () => {
    if (!isCompleted) {
      return 'badge-light-warning'
    }
    return success ? 'badge-light-success' : 'badge-light-danger'
  }

  const getStatusText = () => {
    if (!isCompleted) {
      return 'Running'
    }
    return success ? 'Success' : 'Failed'
  }

  return (
    <div className='d-flex flex-column align-items-start'>
      <div className={`badge ${getBadgeClass()} fw-bolder`}>
        {getStatusText()}
      </div>
    </div>
  )
}

export { MigrationStatusCell }

