import {FC} from 'react'

type Props = {
  count: number
  onClick?: () => void
}

const GenerationCountCell: FC<Props> = ({count, onClick}) => {
  return (
    <div className='d-flex align-items-center justify-content-center'>
      {count > 0 ? (
        <span 
          className='fw-bold fs-6 text-success'
          onClick={onClick}
          style={{cursor: onClick ? 'pointer' : 'default'}}
        >
          {count}
        </span>
      ) : (
        <span className='fw-bold fs-6 text-muted'>
          0
        </span>
      )}
    </div>
  )
}

export {GenerationCountCell}

