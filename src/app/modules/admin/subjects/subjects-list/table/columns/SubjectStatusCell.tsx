import {FC} from 'react'

type Props = {
  status?: number
}

const SubjectStatusCell: FC<Props> = ({status}) => {
  const isActive = status === 1

  return (
    <div className='d-flex align-items-center'>
      <span className={`badge badge-${isActive ? 'success' : 'danger'} fs-7 fw-bold`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  )
}

export {SubjectStatusCell} 