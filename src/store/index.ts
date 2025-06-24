import { configureStore } from '@reduxjs/toolkit'
import userReducer from './user/userSlice'
import exerciseReducer from './exercise/exerciseSlice'
import adminReducer from './admin/adminSlice'
import tagsReducer from './tags/tagsSlice'
import tagsReducer from './tags/tagsSlice'

export const store = configureStore({
  reducer: {
    users: userReducer,
    exercise: exerciseReducer,
    admin: adminReducer,
    tags: tagsReducer,
    tags: tagsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
