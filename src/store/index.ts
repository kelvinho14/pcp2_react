import { configureStore } from '@reduxjs/toolkit'
import userReducer from './user/userSlice'
import exerciseReducer from './exercise/exerciseSlice'

export const store = configureStore({
  reducer: {
    users: userReducer,
    exercise: exerciseReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
