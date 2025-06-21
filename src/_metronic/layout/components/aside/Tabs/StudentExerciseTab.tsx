import {useEffect} from 'react'
import {useIntl} from 'react-intl'
import {
  DrawerComponent,
  MenuComponent,
  ScrollComponent,
  ToggleComponent,
} from '../../../../assets/ts/components'
import { AsideMenuItem } from '../AsideMenuItem'


const StudentExerciseTab = () => {
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
      className='menu menu-column menu-fit menu-rounded menu-title-gray-600 menu-icon-gray-400 menu-state-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500 fw-bold fs-5 px-6 my-5 my-lg-0'
      id='kt_aside_exercise'
      data-kt-menu='true'
    >
      <div id='kt_aside_exercise_wrapper' className='hover-scroll-y'>
        <div className='menu-item menu-accordion' data-kt-menu-trigger='click'>
            <AsideMenuItem
              to='#'
              icon='color-swatch'
              title=""
              fontIcon='fa-solid fa-xmark'
              textAlign='end'
            />
          <div className='menu-item'>
              <div className='menu-content pt-8 pb-2'>
              <span className='menu-section text-muted text-uppercase fs-8 ls-1'>MC</span>
              </div>
          </div>
          <AsideMenuItem to='/exercise/mclist' title='Outstanding exercise' hasBullet={true} />
          <AsideMenuItem to='/exercise/mclist' title='All exercise' hasBullet={true} />

          <div className='menu-item'>
              <div className='menu-content pt-8 pb-2'>
              <span className='menu-section text-muted text-uppercase fs-8 ls-1'>LQ</span>
              </div>
          </div>
          <AsideMenuItem to='/exercise/lqlist' title='Outstanding exercise' hasBullet={true} />
          <AsideMenuItem to='/exercise/lqlist' title='All exercise' hasBullet={true} />
        </div>
      </div>
    </div>
  )
}

export {StudentExerciseTab}
