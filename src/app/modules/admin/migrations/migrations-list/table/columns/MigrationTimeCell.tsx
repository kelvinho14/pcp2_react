import { FC } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { formatApiTimestamp } from '../../../../../../../_metronic/helpers/dateUtils'

type Props = {
  startedAt: string
  completedAt?: string
  executionTimeMs: number
}

const MigrationTimeCell: FC<Props> = ({ startedAt, completedAt, executionTimeMs }) => {
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
    return `${(ms / 60000).toFixed(2)}m`
  }

  return (
    <div className='d-flex flex-column'>
      <div className='text-gray-800 fw-bold'>
        {formatApiTimestamp(startedAt, { format: 'custom' })}
      </div>
      {executionTimeMs > 0 && (
        <div className='text-primary fs-7 fw-bold mt-1'>
          Duration: {formatDuration(executionTimeMs)}
        </div>
      )}
    </div>
  )
}

export { MigrationTimeCell }

