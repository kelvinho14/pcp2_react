/* eslint-disable react-refresh/only-export-components */
import {FC, useState, useEffect, createContext, useContext, Dispatch, SetStateAction} from 'react'
import {LayoutSplashScreen} from '../../../../_metronic/layout/core'
import {AuthModel, UserModel} from './_models'
import {getCurrentUser} from './_requests'
import {WithChildren} from '../../../../_metronic/helpers'
import webSocketService from '../../../services/WebSocketService'
import AuthInterceptor from '../../../services/AuthInterceptor'
import axios from 'axios'

type AuthContextProps = {
  currentUser: UserModel | undefined
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>
  logout: () => void
}

const initAuthContextPropsState = {
  currentUser: undefined,
  setCurrentUser: () => {},
  logout: () => {},
}

const AuthContext = createContext<AuthContextProps>(initAuthContextPropsState)

const useAuth = () => {
  return useContext(AuthContext)
}

const AuthProvider: FC<WithChildren> = ({children}) => {
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>()

  const logout = async () => {
    try {
      // Call backend to clear the HttpOnly cookie
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/users/logout`, {}, {
        withCredentials: true
      })
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      // Clear JWT data and school_subject_ids
      sessionStorage.removeItem('school_subject_id')
      webSocketService.disconnect()
      setCurrentUser(undefined)
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
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

const AuthInit: FC<WithChildren> = ({children}) => {
  const {setCurrentUser, currentUser, logout} = useAuth()
  const [showSplashScreen, setShowSplashScreen] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        
        const {data} = await getCurrentUser()
        if (data.status === 'success' && data.data) {
          const user = data.data
          // Store school_subject_ids in sessionStorage
          if (user.school_subject_ids && Array.isArray(user.school_subject_ids) && user.school_subject_ids.length > 0 && user.school_subject_ids[0]) {
            sessionStorage.setItem('school_subject_id', user.school_subject_ids[0])
          }
          setCurrentUser(user)
          // Connect WebSocket when user is authenticated
          webSocketService.connect(true)
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
