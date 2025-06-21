import clsx from 'clsx'
import {Dispatch, FC, SetStateAction} from 'react'
import {useAuth} from '../../../../app/modules/auth/core/Auth'
import {ROLES} from '../../../../app/constants/roles'
import {useLocation, useNavigate} from 'react-router-dom'
import {DrawerComponent} from '../../../assets/ts/components'

type Tab = {
  link: string
  icon: string
  tooltip: string
  path?: string // Optional path for navigation
}

// Tabs for teachers
const tabsForTeachers: ReadonlyArray<Tab> = [
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
    link: 'draw',
    icon: 'fa-solid fa-pen-to-square',
    tooltip: 'Draw',
    path: '/draw',
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

  // Select tabs based on role type
  let tabsToShow: ReadonlyArray<Tab>

  if (roleType === ROLES.STUDENT) {
    tabsToShow = tabsForStudents
  } else {
    // Default to teacher tabs for other roles
    tabsToShow = tabsForTeachers
  }

  const handleClick = (tab: Tab) => {
    setLink(tab.link)
    if (tab.path) {
      navigate(tab.path)
      // Hide the aside drawer after navigation
      const drawerElement = document.getElementById('kt_aside')
      if (drawerElement) {
        const drawer = DrawerComponent.getInstance(drawerElement as any)
        if (drawer && drawer.isShown()) {
          drawer.hide()
        }
      }
      const aside = document.getElementById('kt_aside')
      if (aside) {
        const asideWidth = aside.offsetWidth
        const isMinimized = asideWidth <= 100 // Metronic's minimized width is 100px
        if (!isMinimized) {
          const toggleButton = document.getElementById('kt_aside_toggle')
          if (toggleButton) {
            toggleButton.click()
          }
        }
      }
    } else {
      // Only expand the aside for tabs without a 'path'
      const aside = document.getElementById('kt_aside')
      if (aside) {
        const asideWidth = aside.offsetWidth
        const isMinimized = asideWidth <= 100 // Metronic's minimized width is 100px
        if (isMinimized) {
          const toggleButton = document.getElementById('kt_aside_toggle')
          if (toggleButton) {
            toggleButton.click()
          }
        }
      }
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
                {active: link === t.link || (t.path && location.pathname.startsWith(t.path))}
              )}
              onClick={() => handleClick(t)}
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
