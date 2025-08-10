import {FC} from 'react'
import {PageTitle} from '../../../../_metronic/layout/core'
import {useIntl} from 'react-intl'
import './VideoListPage.scss'

const VideoListPage: FC = () => {
  const intl = useIntl()
  


  return (
    <div className='video-list-page'>
      <PageTitle breadcrumbs={[]}>
        {intl.formatMessage({id: 'MENU.VIDEOS.LIST'})}
      </PageTitle>
      
      {/* Welcome Banner */}
      <div className='welcome-section'>
        <div className='welcome-content'>
          <div className='welcome-text'>
            <h2 className='welcome-title'>Explore Video Library! 🎬</h2>
            <p className='welcome-subtitle'>Discover educational content and expand your knowledge</p>
          </div>
          <div className='welcome-actions'>
            <button className='btn btn-light-primary me-3'>
              <i className='fas fa-search me-1'></i>
              Browse Videos
            </button>
            <button className='btn btn-light-info'>
              <i className='fas fa-bookmark me-1'></i>
              My Favorites
            </button>
          </div>
        </div>
      </div>
      
      <div className='card'>
        <div className='card-header'>
          <h3 className='card-title'>Video List</h3>
        </div>
        <div className='card-body'>
          <p>This is the page for viewing all videos.</p>
          {/* Add your video list table here */}
        </div>
      </div>
    </div>
  )
}

export default VideoListPage 