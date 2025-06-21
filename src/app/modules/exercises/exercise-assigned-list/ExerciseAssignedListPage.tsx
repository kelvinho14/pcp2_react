import {FC} from 'react'
import {PageTitle} from '../../../../_metronic/layout/core'
import {useIntl} from 'react-intl'

const ExerciseAssignedListPage: FC = () => {
  const intl = useIntl()

  return (
    <>
      <PageTitle breadcrumbs={[]}>
        {intl.formatMessage({id: 'MENU.EXERCISES.ASSIGNED_LIST'})}
      </PageTitle>
      
      <div className='card'>
        <div className='card-header'>
          <h3 className='card-title'>Assigned Exercises</h3>
        </div>
        <div className='card-body'>
          <p>This is the page for viewing assigned exercises.</p>
          {/* Add your assigned exercise list table here */}
        </div>
      </div>
    </>
  )
}

export default ExerciseAssignedListPage 