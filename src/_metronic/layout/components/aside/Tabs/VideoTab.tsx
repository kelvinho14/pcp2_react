import {useEffect} from 'react'
import {useIntl} from 'react-intl'
import {
  DrawerComponent,
  MenuComponent,
  ScrollComponent,
  ToggleComponent,
} from '../../../../assets/ts/components'
import { AsideMenuItem } from '../AsideMenuItem'

const VideoTab = () => {
const intl = useIntl()
  useEffect(() => {
    setTimeout(() => {
      MenuComponent.reinitialization()
      DrawerComponent.reinitialization()
      ToggleComponent.reinitialization()
      ScrollComponent.reinitialization()
    }, 50)
     
  }, [])
  return (
    <div
      className='video-menu menu-column menu-fit menu-rounded menu-title-gray-600 menu-icon-gray-500 menu-state-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500 fw-bold fs-5 px-2 my-5 my-lg-0'
      id='kt_aside_video'
      data-kt-menu='true'
    >
      <div id='kt_aside_video_wrapper' className='hover-scroll-y'>
        <div className='menu-item menu-accordion' data-kt-menu-trigger='click'>
          <AsideMenuItem
              to='#'
              icon='color-swatch'
              title=""
              fontIcon='fa-solid fa-xmark'
              textAlign='end'
          />
          <AsideMenuItem to='/crafted/account/overview' title='Search Video' fontIcon='fas fa-magnifying-glass me-2'/>
          <AsideMenuItem to='/crafted/account/overview' title='Video assigned' fontIcon='fas fa-video me-2'/>
        </div>
      </div>
    </div>
  )
}

export {VideoTab}
