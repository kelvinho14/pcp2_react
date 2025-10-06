/* eslint-disable react-refresh/only-export-components */
import {FC, useState, useEffect, createContext, useContext, Dispatch, SetStateAction} from 'react'
import {LayoutSplashScreen} from '../../../../_metronic/layout/core'
import {AuthModel, UserModel} from './_models'
import {getCurrentUser} from './_requests'
import {WithChildren} from '../../../../_metronic/helpers'
import webSocketService from '../../../services/WebSocketService'
import AuthInterceptor from '../../../services/AuthInterceptor'
import SchoolSelectionService from '../services/SchoolSelectionService'
import axios from 'axios'
import {useSchoolSubjectUrlParams} from '../../../../hooks/useSchoolSubjectUrlParams'

type AuthContextProps = {
  currentUser: UserModel | undefined
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>
  logout: () => void
  skipSchoolRedirect?: boolean
  setSkipSchoolRedirect: (skip: boolean) => void
}

const initAuthContextPropsState = {
  currentUser: undefined,
  setCurrentUser: () => {},
  logout: () => {},
  skipSchoolRedirect: false,
  setSkipSchoolRedirect: () => {},
}

const AuthContext = createContext<AuthContextProps>(initAuthContextPropsState)

const useAuth = () => {
  return useContext(AuthContext)
}

const AuthProvider: FC<WithChildren> = ({children}) => {
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>()
  const [skipSchoolRedirect, setSkipSchoolRedirect] = useState(false)

  const logout = async () => {
    try {
      // Call backend to clear the HttpOnly cookie
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/users/logout`, {}, {
        withCredentials: true
      })
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      // Clear all session data using service
      SchoolSelectionService.clearStoredSelection()
      webSocketService.disconnect()
      setCurrentUser(undefined)
      setSkipSchoolRedirect(false)
    }
  }

  // Set up auth interceptor with logout function
  useEffect(() => {
    AuthInterceptor.setLogoutFunction(logout)
    AuthInterceptor.setupInterceptors()
    
    return () => {
      AuthInterceptor.clearInterceptors()
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      logout,
      skipSchoolRedirect,
      setSkipSchoolRedirect
    }}>
      {children}
    </AuthContext.Provider>
  )
}

const AuthInit: FC<WithChildren> = ({children}) => {
  const {setCurrentUser, currentUser, logout, skipSchoolRedirect} = useAuth()
  const [showSplashScreen, setShowSplashScreen] = useState(true)
  
  // CRITICAL: Process school/subject URL parameters BEFORE any API calls
  // This must happen before the useEffect that calls getCurrentUser()
  useSchoolSubjectUrlParams()

  const processUserAfterAuth = (user: UserModel): string | null => {
    console.log('🔍 Processing authenticated user:', user, 'skipSchoolRedirect:', skipSchoolRedirect)
    
    // If we're in the middle of a login flow with modal, don't redirect
    if (skipSchoolRedirect) {
      console.log('🚫 Skipping school redirect due to login flow')
      setCurrentUser(user)
      return null
    }
    
    // Check if we have valid stored selection
    const validStoredSelection = SchoolSelectionService.getValidStoredSelection(user)
    if (validStoredSelection) {
      console.log('📦 Found valid stored selection:', validStoredSelection)
      setCurrentUser(user)
      return null // No redirect needed
    }

    // Use service to determine next action
    const result = SchoolSelectionService.processUserSchoolSelection(user)
    
    setCurrentUser(user)
    
    if (!result.needsSelection) {
      // Admin, no schools, or auto-selected
      return null // No redirect needed
    }

    // User needs to make a selection - redirect to selection page
    console.log('🔀 User needs to select school/subject, redirecting to selection page')
    return '/auth/select-subject'
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {data} = await getCurrentUser()
        if (data.status === 'success' && data.data) {
          const user = data.data
          
          // Process user based on role and schools data
          const redirectPath = processUserAfterAuth(user)
          
          // Connect WebSocket when user is authenticated
          webSocketService.connect(true)
          
          // Handle redirect if needed
          if (redirectPath) {
            window.location.href = redirectPath
            return
          }
        } else {
          setCurrentUser(undefined)
          webSocketService.disconnect()
        }
      } catch (error) {
        console.error('❌ Failed to get current user:', error)
        setCurrentUser(undefined)
        webSocketService.disconnect()
      } finally {
        setShowSplashScreen(false)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    if (!currentUser) {
      webSocketService.disconnect()
    } else {
      // Connect WebSocket when user is set
      webSocketService.connect(true)
    }
  }, [currentUser])

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>
}

export {useAuth, AuthProvider, AuthInit}
