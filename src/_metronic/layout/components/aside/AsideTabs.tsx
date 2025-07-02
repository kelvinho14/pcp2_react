import clsx from 'clsx'
import {Dispatch, FC, SetStateAction} from 'react'
import {useAuth} from '../../../../app/modules/auth/core/Auth'
import {ROLES} from '../../../../app/constants/roles'
import {useLocation, useNavigate} from 'react-router-dom'
import {DrawerComponent} from '../../../assets/ts/components'
import {useIsDesktop} from '../../../hooks/useResponsive'

type Tab = {
  link: string
  icon: string
  tooltip: string
  path?: string // Optional path for navigation
  paths?: string[] // Array of paths that should activate this tab
}

// Tabs for admin
const tabsForAdmin: ReadonlyArray<Tab> = [
  {
    link: 'school',
    icon: 'fa-solid fa-school',
    tooltip: 'School',
    paths: ['/admin/schools'],
  },
  {
    link: 'user',
    icon: 'fa-solid fa-user',
    tooltip: 'User',
    paths: ['/admin/users'],
  },
  {
    link: 'subject',
    icon: 'fa-solid fa-book',
    tooltip: 'Subject',
    paths: ['/admin/subjects'],
  },
  {
    link: 'token',
    icon: 'fa-solid fa-coins',
    tooltip: 'Token',
    paths: ['/admin/token'],
  },
]

// Tabs for teachers
const tabsForTeachers: ReadonlyArray<Tab> = [
  {
    link: 'exercise',
    icon: 'fa-solid fa-pen',
    tooltip: 'Exercise',
    paths: ['/exercises', '/questions'],
  },
  {
    link: 'video',
    icon: 'fa-solid fa-video',
    tooltip: 'Video',
    paths: ['/videos'],
  },
  {
    link: 'draw',
    icon: 'fa-solid fa-pen-to-square',
    tooltip: 'Draw',
    //path: '/draw',
    paths: ['/draw'],
  },
  {
    link: 'projects',
    icon: 'fa-solid fa-magnifying-glass',
    tooltip: 'Projects',
  },
]

// Tabs for students
const tabsForStudents: ReadonlyArray<Tab> = [
  {
    link: 'exercise',
    icon: 'fa-solid fa-pen',
    tooltip: 'Exercise',
  },
  {
    link: 'video',
    icon: 'fa-solid fa-video',
    tooltip: 'Video',
  },
  {
    link: 'projects',
    icon: 'fa-solid fa-magnifying-glass',
    tooltip: 'Projects',
  },
  {
    link: 'tasks',
    icon: 'shield-tick',
    tooltip: 'Tasks',
  },
  {
    link: 'notifications',
    icon: 'abstract-26',
    tooltip: 'Notifications',
  },
]

type Props = {
  link: string
  setLink: Dispatch<SetStateAction<string>>
}

const AsideTabs: FC<Props> = ({link, setLink}) => {
  const {currentUser} = useAuth()
  const roleType = currentUser?.role?.role_type
  const navigate = useNavigate()
  const location = useLocation()
  const isDesktop = useIsDesktop()
  


  // Select tabs based on role type
  let tabsToShow: ReadonlyArray<Tab>

  if (roleType === ROLES.STUDENT) {
    tabsToShow = tabsForStudents
  } else if (roleType === ROLES.ADMIN) {
    tabsToShow = tabsForAdmin
  } else {
    tabsToShow = tabsForTeachers
  }

  const handleMouseOver = (tab: Tab) => {
    
    setLink(tab.link)
    
    const isMinimized = document.body.getAttribute('data-kt-aside-minimize') === 'on'
    if (isMinimized) {
      const toggleButton = document.getElementById('kt_aside_toggle_desktop')
      if (toggleButton) {
        toggleButton.click()
      }
    }
   
    // Navigate if the tab has a path
    if (tab.path) {
      navigate(tab.path)
    }
  }

  const handleMouseOut = () => {
    if (isDesktop) {
      // Desktop: Use the toggle button for aside minimize
      const isMinimized = document.body.getAttribute('data-kt-aside-minimize') === 'on'
      if (!isMinimized) {
        const toggleButton = document.getElementById('kt_aside_toggle_desktop')
        if (toggleButton) {
          toggleButton.click()
        }
      }
    } else {
      // Mobile/Tablet: Don't auto-collapse on mouseout to prevent issues with touch events
      // The drawer will be closed by clicking outside or using the close button
    }
  }

  return (
    <div
      className='hover-scroll-y mb-10'
      data-kt-scroll='true'
      data-kt-scroll-activate='{default: false, lg: true}'
      data-kt-scroll-height='auto'
      data-kt-scroll-wrappers='#kt_aside_nav'
      data-kt-scroll-dependencies='#kt_aside_logo, #kt_aside_footer'
      data-kt-scroll-offset='0px'
    >
      {/* begin::Nav */}
      <ul className='nav flex-column' id='kt_aside_nav_tabs'>
        {/* begin::Nav item */}
        {tabsToShow.map((t) => (
          <li key={t.link} className='mb-3'>
            {/* begin::Nav link */}
            <a
              className={clsx(
                'nav-link btn btn-icon btn-active-color-primary btn-color-gray-500 btn-active-light',
                {
                  active: link === t.link || 
                    (t.path && location.pathname.startsWith(t.path)) ||
                    (t.paths && t.paths.some(path => location.pathname.startsWith(path)))
                }
              )}
              onMouseOver={() => handleMouseOver(t)}
              onClick={(e) => {
                // Prevent event bubbling to avoid closing the menu
                e.preventDefault()
                e.stopPropagation()
                
                setLink(t.link)
                
                // Navigate if the tab has a path
                if (t.path) {
                  navigate(t.path!)
                }
              }}
            >
              <i className={`${t.icon} fs-2x`}></i>
            </a>
            {/* end::Nav link */}
          </li>
        ))}
        {/* end::Nav link */}
      </ul>
      {/* end::Tabs */}
    </div>
  )
}

export {AsideTabs}
