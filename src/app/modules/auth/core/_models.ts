export interface AuthModel {
  data?: {
    user: UserModel
  }
}

export interface UserAddressModel {
  addressLine: string
  city: string
  state: string
  postCode: string
}

export interface UserCommunicationModel {
  email: boolean
  sms: boolean
  phone: boolean
}

export interface UserEmailSettingsModel {
  emailNotification?: boolean
  sendCopyToPersonalEmail?: boolean
  activityRelatesEmail?: {
    youHaveNewNotifications?: boolean
    youAreSentADirectMessage?: boolean
    someoneAddsYouAsAsAConnection?: boolean
    uponNewOrder?: boolean
    newMembershipApproval?: boolean
    memberRegistration?: boolean
  }
  updatesFromKeenthemes?: {
    newsAboutKeenthemesProductsAndFeatureUpdates?: boolean
    tipsOnGettingMoreOutOfKeen?: boolean
    thingsYouMissedSindeYouLastLoggedIntoKeen?: boolean
    newsAboutStartOnPartnerProductsAndOtherServices?: boolean
    tipsOnStartBusinessProducts?: boolean
  }
}

export interface UserSocialNetworksModel {
  linkedIn: string
  facebook: string
  twitter: string
  instagram: string
}

export interface SchoolSubject {
  subject_id: string
  subject_name: string
}

export interface School {
  school_id: string
  school_name: string
  school_subjects: SchoolSubject[]
}

export interface UserModel {
  user_id: string
  email: string
  name?: string
  school_id?: string
  school_subject_ids?: string[]
  schools?: School[]
  role: {
    role_id: string
    name: string
    role_type: number
  }
}

export interface ApiResponse<T> {
  status: string
  data: T
  token?: string
}
