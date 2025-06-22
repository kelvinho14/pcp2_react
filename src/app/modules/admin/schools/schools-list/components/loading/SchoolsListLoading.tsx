import {FC} from 'react'

const SchoolsListLoading: FC = () => {
  return (
    <div className='overlay-layer bg-transparent'>
      <div className='spinner-border text-primary' role='status'>
        <span className='visually-hidden'>Loading...</span>
      </div>
    </div>
  )
}

export {SchoolsListLoading} 