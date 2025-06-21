import {FC} from 'react'
import {PageTitle} from '../../../../_metronic/layout/core'
import {useIntl} from 'react-intl'

const VideoAssignedListPage: FC = () => {
  const intl = useIntl()

  return (
    <>
      <PageTitle breadcrumbs={[]}>
        {intl.formatMessage({id: 'MENU.VIDEOS.ASSIGNED_LIST'})}
      </PageTitle>
      
      <div className='card'>
        <div className='card-header'>
          <h3 className='card-title'>Assigned Videos</h3>
        </div>
        <div className='card-body'>
          <p>This is the page for viewing assigned videos.</p>
          {/* Add your assigned video list table here */}
        </div>
      </div>
    </>
  )
}

export default VideoAssignedListPage 