import {FC} from 'react'
import {KTIcon} from '../../../../helpers'
import {AuthorsTab} from './AuthorsTab'
import {TeacherExerciseTab} from './TeacherExerciseTab'
import {AdminUserManagementTab} from './AdminUserManagementTab.tsx'
import {AdminSchoolManagementTab} from './AdminSchoolManagementTab.tsx'
import {AdminSubjectManagementTab} from './AdminSubjectManagementTab.tsx'
import {AdminTokenManagementTab} from './AdminTokenManagementTab.tsx'
import {TeacherUserManagementTab} from './TeacherUserManagementTab.tsx'
import {TeacherSettingsTab} from './TeacherSettingsTab.tsx'
import {NotificationsTab} from './NotificationsTab'

import {VideoTab} from './VideoTab'
import {TeacherVideoTab} from './TeacherVideoTab'
import {TasksTab} from './TasksTab'
import { useAuth } from '../../../../../app/modules/auth/core/Auth'
import {StudentExerciseTab} from './StudentExerciseTab'
import { ROLES } from '../../../../../app/constants/roles'

type Props = {
  link: string
}

const SelectedTab: FC<Props> = ({link}) => {
  const { currentUser } = useAuth()
  const roleType = currentUser?.role?.role_type

  if (roleType === ROLES.STUDENT) {
    switch (link) {
      case 'exercise':
        return <StudentExerciseTab />
      case 'video':
        return <VideoTab />
    }
  } else if (roleType === ROLES.ADMIN) {
    switch (link) {
      case 'user':
        return <AdminUserManagementTab />
      case 'school':
        return <AdminSchoolManagementTab />
      case 'subject':
        return <AdminSubjectManagementTab />
      case 'token':
        return <AdminTokenManagementTab />
      
    }
  } else {
    switch (link) {
      case 'user':
        return <TeacherUserManagementTab />
      case 'exercise':
        return <TeacherExerciseTab />
      case 'video':
        return <TeacherVideoTab />
      case 'settings':
        return <TeacherSettingsTab />
    }
  }
}

const TabsBase: FC<Props> = ({link}) => {
  return (
    <div className='d-flex h-100 flex-column'>
      {/* begin::Wrapper */}
      <div
        className='flex-column-fluid hover-scroll-y'
        data-kt-scroll='true'
        data-kt-scroll-activate='true'
        data-kt-scroll-height='auto'
        data-kt-scroll-wrappers='#kt_aside_wordspace'
        data-kt-scroll-dependencies='#kt_aside_secondary_footer'
        data-kt-scroll-offset='0px'
      >
        {/* begin::Tab content */}
        <div className='tab-content'>
          <div
            className='tab-pane fade active show'
            id={`kt_aside_nav_tab_${link}`}
            role='tabpanel'
          >
            <SelectedTab link={link} />
          </div>
        </div>
        {/* end::Tab content */}
      </div>
      {/* end::Wrapper */}
      {/* begin::Footer */}
      <div className='flex-column-auto pt-10 px-5' id='kt_aside_secondary_footer'>
        <a
          href={import.meta.env.VITE_APP_PREVIEW_DOCS_URL + '/changelog'}
          target='_blank'
          className='btn btn-bg-light btn-color-gray-600 btn-flex btn-active-color-primary flex-center w-100'
          data-bs-toggle='tooltip'
          data-bs-custom-class='tooltip-dark'
          data-bs-trigger='hover'
          data-bs-offset='0,5'
          data-bs-dismiss-='click'
        >
          <span className='btn-label'>Update log</span>
          <KTIcon iconName='document' className='btn-icon fs-4 ms-2' />
        </a>
      </div>
      {/* end::Footer */}
    </div>
  )
}

export {TabsBase}
