/* eslint-disable react-refresh/only-export-components */
import {FC, useState, useEffect, createContext, useContext, Dispatch, SetStateAction} from 'react'
import {LayoutSplashScreen} from '../../../../_metronic/layout/core'
import {AuthModel, UserModel} from './_models'
import {getCurrentUser} from './_requests'
import {WithChildren} from '../../../../_metronic/helpers'

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

  const logout = () => {
    setCurrentUser(undefined)
  }

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
  const {setCurrentUser} = useAuth()
  const [showSplashScreen, setShowSplashScreen] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {data} = await getCurrentUser()
        if (data.status === 'success' && data.data) {
          const user = data.data
          setCurrentUser(user)
        } else {
          setCurrentUser(undefined)
        }
      } catch (error) {
        console.error('Failed to get current user:', error)
        setCurrentUser(undefined)
      } finally {
        setShowSplashScreen(false)
      }
    }

    checkAuth()
  }, [])

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>
}

export {AuthProvider, AuthInit, useAuth}
