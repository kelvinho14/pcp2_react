import {FC} from 'react'
import {formatApiTimestamp} from '../../../../../../_metronic/helpers/dateUtils'

type Props = {
  answeredAt: string
}

const AttemptTimeCell: FC<Props> = ({answeredAt}) => {
  return (
    <div className='text-dark fw-bold fs-6'>
      {formatApiTimestamp(answeredAt, { format: 'custom' })}
    </div>
  )
}

export {AttemptTimeCell}

