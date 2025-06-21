import {FC} from 'react'
import {PageTitle} from '../../../../_metronic/layout/core'
import {useIntl} from 'react-intl'

const VideoListPage: FC = () => {
  const intl = useIntl()

  return (
    <>
      <PageTitle breadcrumbs={[]}>
        {intl.formatMessage({id: 'MENU.VIDEOS.LIST'})}
      </PageTitle>
      
      <div className='card'>
        <div className='card-header'>
          <h3 className='card-title'>Video List</h3>
        </div>
        <div className='card-body'>
          <p>This is the page for viewing all videos.</p>
          {/* Add your video list table here */}
        </div>
      </div>
    </>
  )
}

export default VideoListPage 