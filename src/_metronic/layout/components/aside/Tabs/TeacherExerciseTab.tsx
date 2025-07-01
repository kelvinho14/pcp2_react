import {useEffect} from 'react'
import {useIntl} from 'react-intl'
import {
  DrawerComponent,
  MenuComponent,
  ScrollComponent,
  ToggleComponent,
} from '../../../../assets/ts/components'
import { AsideMenuItem } from '../AsideMenuItem'


const TeacherExerciseTab = () => {
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
              <span className='menu-section text-muted text-uppercase fs-8 ls-1'><i className='fa-solid fa-square-minus fs-3 me-2'></i> MC Question</span>
              </div>
          </div>
          <AsideMenuItem to='/questions/mc/create' title='Create'  hasBullet={true}/>
          <AsideMenuItem to='/questions/mc/list' title='Question Bank' hasBullet={true} />

          <div className='menu-item'>
              <div className='menu-content pt-8 pb-2'>
              <span className='menu-section text-muted text-uppercase fs-8 ls-1'><i className='fa-solid fa-pencil fs-3 me-2'></i>LQ Question</span>
              </div>
          </div>
          <AsideMenuItem to='/questions/lq/create' title='Create'  hasBullet={true}/>
          <AsideMenuItem to='/questions/lq/list' title='Question Bank' hasBullet={true} />
          <div className='menu-item'>
              <div className='menu-content pt-8 pb-2'>
              <span className='menu-section text-muted text-uppercase fs-8 ls-1'><i className='fa-solid fa-times '></i><i className='fa-solid fa-check me-2'></i>True or False</span>
              </div>
          </div>
          <AsideMenuItem to='/questions/tf/create' title='Create'  hasBullet={true}/>
          <AsideMenuItem to='/questions/tf/list' title='Question Bank' hasBullet={true} />

          <div className='menu-item'>
            <div className='menu-content py-4'>
              <div className='separator separator-dashed border-gray-300 opacity-75'></div>
            </div>
          </div>

          <div className='menu-item'>
              <div className='menu-content pt-8 pb-2'>
              <span className='menu-section text-muted text-uppercase fs-8 ls-1'><i className='fa-regular fa-file-lines fs-3 me-2'></i>Exercise</span>
              </div>
          </div>
          <AsideMenuItem to='/exercises/create' title='Create' hasBullet={true} />
          <AsideMenuItem to='/exercises/list' title='Exercise Bank' hasBullet={true} />
          <AsideMenuItem to='/exercises/assignedlist' title='Assigned Exercise' hasBullet={true} />
        </div>
      </div>
    </div>
  )
}

export {TeacherExerciseTab}
