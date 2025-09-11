import {FC} from 'react'
import { formatApiTimestamp } from '../../../../../../_metronic/helpers/dateUtils'

type Props = {
  lastseen_at?: string
}

const UserLastLoginCell: FC<Props> = ({lastseen_at}) => {
  if (!lastseen_at) {
    return <span className='text-muted'>Never</span>
  }

  
  return (
    <div className='text-gray-600 fw-bold'>
      {formatApiTimestamp(lastseen_at, { format: 'custom' })}
    </div>
  )
}

export {UserLastLoginCell}
