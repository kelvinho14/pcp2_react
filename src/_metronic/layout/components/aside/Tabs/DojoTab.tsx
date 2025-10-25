import {useEffect} from 'react'
import {useIntl} from 'react-intl'
import {
  DrawerComponent,
  MenuComponent,
  ScrollComponent,
  ToggleComponent,
} from '../../../../assets/ts/components'
import { AsideMenuItem } from '../AsideMenuItem'

const DojoTab = () => {
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
      className='dojo-menu menu-column menu-fit menu-rounded menu-title-gray-600 menu-icon-gray-500 menu-state-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500 fw-bold fs-5 px-2 my-5 my-lg-0'
      id='kt_aside_dojo'
      data-kt-menu='true'
    >
      <div id='kt_aside_dojo_wrapper' className='hover-scroll-y'>
        <div className='menu-item menu-accordion' data-kt-menu-trigger='click'>
          <AsideMenuItem
              to='#'
              icon='color-swatch'
              title=""
              fontIcon='fa-solid fa-xmark'
              textAlign='end'
          />
          <AsideMenuItem to='/dojo/weak-spots' title='Weak Spots' fontIcon='fa-solid fa-face-rolling-eyes me-2'/>
          <AsideMenuItem to='/dojo/practice' title='Practice' fontIcon='fa-solid fa-bullseye me-2'/>
        </div>
      </div>
    </div>
  )
}

export {DojoTab}
