import {FC} from 'react'

const SubjectsListLoading: FC = () => {
  return (
    <div className='d-flex justify-content-center align-items-center py-8'>
      <div className='spinner-border text-primary' role='status'>
        <span className='visually-hidden'>Loading...</span>
      </div>
    </div>
  )
}

export {SubjectsListLoading} 