import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../../../../store'
import { fetchExerciseProgress } from '../../../../../store/exercises/exercisesSlice'
import { ViewMode, SortOrder, StudentProgress } from '../types'
import { filterStudentsBySearch, calculateExerciseSummary, getPaginationInfo } from '../utils'

interface UseExerciseProgressProps {
  exerciseId: string
}

interface UseExerciseProgressReturn {
  // Data
  exerciseProgress: StudentProgress[]
  questions: any[]
  exercise: any
  summary: any
  
  // Loading state
  isLoading: boolean
  
  // Pagination
  currentPage: number
  itemsPerPage: number
  totalPages: number
  paginationInfo: any
  
  // Search and filtering
  searchTerm: string
  filteredStudents: StudentProgress[]
  
  // Sorting
  sortBy: string
  sortOrder: SortOrder
  
  // View mode
  viewMode: ViewMode
  
  // Actions
  setCurrentPage: (page: number) => void
  setItemsPerPage: (items: number) => void
  setSearchTerm: (term: string) => void
  setSortBy: (field: string) => void
  setSortOrder: (order: SortOrder) => void
  setViewMode: (mode: ViewMode) => void
  refreshData: () => void
  handleSearch: (value: string) => void
  handleSort: (field: string) => void
}

export const useExerciseProgress = ({ exerciseId }: UseExerciseProgressProps): UseExerciseProgressReturn => {
  const dispatch = useDispatch<AppDispatch>()
  const isInitialLoad = useRef(true)
  
  // State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [viewMode, setViewMode] = useState<ViewMode>('questions')
  
  // Redux state
  const {
    exerciseProgressData,
    exerciseProgressQuestions,
    exerciseProgressStudents,
    fetchingExerciseProgress,
    exerciseProgressTotal: apiExerciseProgressTotal,
  } = useSelector((state: RootState) => state.exercises)
  
  // Derived data
  const exerciseProgress = exerciseProgressStudents || []
  const exerciseProgressTotal = apiExerciseProgressTotal || 0
  const questions = exerciseProgressQuestions || []
  const exercise = exerciseProgressData?.exercise
  
  // Filtered and processed data
  const filteredStudents = filterStudentsBySearch(exerciseProgress, searchTerm)
  const summary = calculateExerciseSummary(exerciseProgress)
  const totalPages = Math.ceil(exerciseProgressTotal / itemsPerPage)
  const paginationInfo = getPaginationInfo(currentPage, itemsPerPage, exerciseProgressTotal)
  
  // Actions
  const refreshData = () => {
    if (!exerciseId) return
    
    dispatch(fetchExerciseProgress({
      exerciseId,
      params: {
        page: currentPage,
        items_per_page: itemsPerPage,
        sort: sortBy,
        order: sortOrder,
        search: searchTerm || undefined
      }
    }))
  }
  
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }
  
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }
  
  // Effects
  useEffect(() => {
    if (exerciseId) {
      refreshData()
    }
  }, [exerciseId])
  
  useEffect(() => {
    if (exerciseId && !isInitialLoad.current) {
      refreshData()
    }
    isInitialLoad.current = false
  }, [currentPage, itemsPerPage, searchTerm, sortBy, sortOrder])
  
  return {
    // Data
    exerciseProgress,
    questions,
    exercise,
    summary,
    
    // Loading state
    isLoading: fetchingExerciseProgress,
    
    // Pagination
    currentPage,
    itemsPerPage,
    totalPages,
    paginationInfo,
    
    // Search and filtering
    searchTerm,
    filteredStudents,
    
    // Sorting
    sortBy,
    sortOrder,
    
    // View mode
    viewMode,
    
    // Actions
    setCurrentPage,
    setItemsPerPage,
    setSearchTerm,
    setSortBy,
    setSortOrder,
    setViewMode,
    refreshData,
    handleSearch,
    handleSort
  }
} 