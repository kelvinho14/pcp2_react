import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import { 
  fetchAssignedExercises, 
  setFilters, 
  clearFilters, 
  setPage, 
  setLoadingFilters,
  type AssignedExercisesFilters 
} from '../store/exercises/assignedExercisesSlice'

export const useAssignedExercises = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    exercises,
    summary,
    pagination,
    loading,
    loadingFilters,
    error,
    filters,
    lastFetchTime
  } = useSelector((state: RootState) => state.assignedExercises)

  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const apiTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const filtersRef = useRef(filters)

  // Keep filters ref updated
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  // Optimized debounced fetch function
  const debouncedFetch = useCallback((filtersToUse: AssignedExercisesFilters) => {
    if (apiTimeoutRef.current) {
      clearTimeout(apiTimeoutRef.current)
    }
    
    // Set loading state for filters
    dispatch(setLoadingFilters(true))
    
    apiTimeoutRef.current = setTimeout(() => {
      dispatch(fetchAssignedExercises(filtersToUse))
    }, 300) // 300ms delay
  }, [dispatch])

  // Watch for filter changes and debounce API calls
  useEffect(() => {
    // Clear any existing timeout
    if (apiTimeoutRef.current) {
      clearTimeout(apiTimeoutRef.current)
    }
    
    // Set new timeout for API call
    apiTimeoutRef.current = setTimeout(() => {
      dispatch(fetchAssignedExercises(filters))
    }, 300)
    
    // Cleanup function
    return () => {
      if (apiTimeoutRef.current) {
        clearTimeout(apiTimeoutRef.current)
      }
    }
  }, [dispatch, filters])

  // Initial load
  useEffect(() => {
    dispatch(fetchAssignedExercises(filters))
    setIsInitialLoad(false)
  }, [dispatch]) // Only run on mount

  const updateFilters = useCallback((newFilters: Partial<AssignedExercisesFilters>) => {
    dispatch(setFilters(newFilters))
  }, [dispatch])

  const clearAllFilters = useCallback(() => {
    dispatch(clearFilters())
  }, [dispatch])

  const changePage = useCallback((page: number) => {
    dispatch(setPage(page))
    dispatch(fetchAssignedExercises(filters))
  }, [dispatch, filters])

  const refreshData = useCallback(() => {
    dispatch(fetchAssignedExercises(filters))
  }, [dispatch, filters])

  return {
    // Data
    exercises,
    summary,
    pagination,
    filters,
    lastFetchTime,
    
    // Loading states
    loading,
    loadingFilters,
    isInitialLoad,
    
    // Error
    error,
    
    // Actions
    updateFilters,
    clearAllFilters,
    changePage,
    refreshData,
    debouncedFetch
  }
} 