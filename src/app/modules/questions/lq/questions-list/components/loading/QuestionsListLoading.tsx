import {FC} from 'react'

const QuestionsListLoading: FC = () => {
  return (
    <div className='d-flex justify-content-center py-10'>
      <div className='spinner-border text-primary' role='status'>
        <span className='visually-hidden'>Loading...</span>
      </div>
    </div>
  )
}

export {QuestionsListLoading} 