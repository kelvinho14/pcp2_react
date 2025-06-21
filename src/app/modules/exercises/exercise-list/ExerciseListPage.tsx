import {FC} from 'react'
import {PageTitle} from '../../../../_metronic/layout/core'
import {useIntl} from 'react-intl'

const ExerciseListPage: FC = () => {
  const intl = useIntl()

  return (
    <>
      <PageTitle breadcrumbs={[]}>
        {intl.formatMessage({id: 'MENU.EXERCISES.LIST'})}
      </PageTitle>
      
      <div className='card'>
        <div className='card-header'>
          <h3 className='card-title'>Exercise List</h3>
        </div>
        <div className='card-body'>
          <p>This is the page for viewing all exercises.</p>
          {/* Add your exercise list table here */}
        </div>
      </div>
    </>
  )
}

export default ExerciseListPage 