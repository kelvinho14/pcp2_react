import { FC } from 'react'

type Props = {
  executionType: string
  executionTrigger: string
  executedBy: string
  environment: string
  applicationVersion: string
}

const MigrationDetailsCell: FC<Props> = ({ 
  executionType, 
  executionTrigger, 
  executedBy, 
  environment, 
  applicationVersion 
}) => {
  return (
    <div className='d-flex flex-column'>
      <div className='d-flex align-items-center mb-1'>
        <span className='badge badge-light-info me-2'>{executionType}</span>
        <span className='text-muted fs-7'>{executionTrigger}</span>
      </div>
      <div className='text-gray-600 fs-7 mb-1'>
        <span className='fw-bold'>By:</span> {executedBy}
      </div>
      <div className='text-gray-600 fs-7'>
        <span className='fw-bold'>Env:</span> {environment} 
        {applicationVersion && (
          <span className='ms-2'>
            <span className='fw-bold'>v</span>{applicationVersion}
          </span>
        )}
      </div>
    </div>
  )
}

export { MigrationDetailsCell }

