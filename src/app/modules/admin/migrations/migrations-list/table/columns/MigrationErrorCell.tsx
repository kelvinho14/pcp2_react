import { FC, useState } from 'react'

type Props = {
  success: boolean
  errorMessage: string | null
}

const MigrationErrorCell: FC<Props> = ({ success, errorMessage }) => {
  const [showFullError, setShowFullError] = useState(false)

  if (success || !errorMessage) {
    return (
      <div className='text-center'>
        <span className='text-muted'>-</span>
      </div>
    )
  }

  const truncatedError = errorMessage.length > 100 
    ? `${errorMessage.substring(0, 100)}...` 
    : errorMessage

  return (
    <div className='d-flex flex-column'>
      <div className='text-danger fs-7'>
        {showFullError ? errorMessage : truncatedError}
      </div>
      {errorMessage.length > 100 && (
        <button
          className='btn btn-sm btn-light-primary mt-1'
          onClick={() => setShowFullError(!showFullError)}
        >
          {showFullError ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  )
}

export { MigrationErrorCell }

