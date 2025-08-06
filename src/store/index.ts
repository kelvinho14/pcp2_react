import { configureStore } from '@reduxjs/toolkit'
import userReducer from './user/userSlice'
import exerciseReducer from './exercise/exerciseSlice'
import adminReducer from './admin/adminSlice'
import tagsReducer from './tags/tagsSlice'
import questionsReducer from './questions/questionsSlice'
import exercisesReducer from './exercises/exercisesSlice'
import aiReducer from './ai/aiSlice'
import assignedExercisesReducer from './exercises/assignedExercisesSlice'
import studentExercisesReducer from './exercises/studentExercisesSlice'
import groupsReducer from './groups/groupsSlice'
import videosReducer from './videos/videosSlice'

export const store = configureStore({
  reducer: {
    users: userReducer,
    exercise: exerciseReducer,
    admin: adminReducer,
    tags: tagsReducer,
    questions: questionsReducer,
    exercises: exercisesReducer,
    ai: aiReducer,
    assignedExercises: assignedExercisesReducer,
    studentExercises: studentExercisesReducer,
    groups: groupsReducer,
    videos: videosReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
