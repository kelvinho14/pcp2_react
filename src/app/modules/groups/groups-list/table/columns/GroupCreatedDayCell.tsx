import {FC} from 'react'
import {Group} from '../../core/_models'

type Props = {
  group: Group
}

const GroupCreatedDayCell: FC<Props> = ({group}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className='badge badge-light fw-bold'>
      {formatDate(group.created_at)}
    </div>
  )
}

export {GroupCreatedDayCell} 