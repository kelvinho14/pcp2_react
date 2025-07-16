import {useEffect} from 'react'
import {useIntl} from 'react-intl'
import {
  DrawerComponent,
  MenuComponent,
  ScrollComponent,
  ToggleComponent,
} from '../../../../assets/ts/components'
import { AsideMenuItem } from '../AsideMenuItem'
import { useAuth } from '../../../../../app/modules/auth/core/Auth'
import { isTeachingStaff } from '../../../../../app/constants/roles'


const TeacherUserManagementTab = () => {
    const intl = useIntl()
    const { currentUser } = useAuth()
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
      className='menu menu-column menu-fit menu-rounded menu-title-gray-600 menu-icon-gray-400 menu-state-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500 fw-bold fs-5 px-2 my-5 my-lg-0'
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
        
          {/* User management section for teachers */}
          {isTeachingStaff(currentUser?.role?.role_type) && (
            <div className='menu-item'>
              <div className='menu-content pt-2 pb-2'>
                <span className='menu-section text-muted text-uppercase fs-8 ls-1'>
                  <i className='fa-solid fa-user fs-3 me-2'></i>Users
                </span>
              </div>
            </div>
          )}
          {/* User management submenu for teachers */}
          {isTeachingStaff(currentUser?.role?.role_type) && (
            <>
              <AsideMenuItem to='/users/add' title='Add User' hasBullet={true} />
              <AsideMenuItem to='/users/list' title='View List' hasBullet={true} />
            </>
          )}

          {/* Group management section for teachers */}
          {isTeachingStaff(currentUser?.role?.role_type) && (
            <div className='menu-item'>
              <div className='menu-content pt-2 pb-2'>
                <span className='menu-section text-muted text-uppercase fs-8 ls-1'>
                  <i className='fa-solid fa-users fs-3 me-2'></i>Groups
                </span>
              </div>
            </div>
          )}
          {/* Group management submenu for teachers */}
          {isTeachingStaff(currentUser?.role?.role_type) && (
            <>
              <AsideMenuItem to='/groups/add' title='Add Group' hasBullet={true} />
              <AsideMenuItem to='/groups/list' title='View List' hasBullet={true} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export {TeacherUserManagementTab} 