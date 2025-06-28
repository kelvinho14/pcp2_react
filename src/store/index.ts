import { configureStore } from '@reduxjs/toolkit'
import userReducer from './user/userSlice'
import exerciseReducer from './exercise/exerciseSlice'
import adminReducer from './admin/adminSlice'
import tagsReducer from './tags/tagsSlice'
import questionsReducer from './questions/questionsSlice'
import exercisesReducer from './exercises/exercisesSlice'
import aiReducer from './ai/aiSlice'

export const store = configureStore({
  reducer: {
    users: userReducer,
    exercise: exerciseReducer,
    admin: adminReducer,
    tags: tagsReducer,
    questions: questionsReducer,
    exercises: exercisesReducer,
    ai: aiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
