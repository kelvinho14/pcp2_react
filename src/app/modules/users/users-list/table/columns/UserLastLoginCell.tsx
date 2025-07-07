import {FC} from 'react'

type Props = {
  lastseen_at?: string
}

const UserLastLoginCell: FC<Props> = ({lastseen_at}) => {
  if (!lastseen_at) {
    return <span className='text-muted'>Never</span>
  }

  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className='badge badge-light fw-bolder'>
      {formatDate(lastseen_at)}
    </div>
  )
}

export {UserLastLoginCell}
