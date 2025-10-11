import { useEffect, useRef, useCallback } from 'react'
import webSocketService from '../app/services/WebSocketService'
import { useAuth } from '../app/modules/auth/core/Auth'

interface ExerciseProgressUpdate {
  exercise_id: string
  student_id?: string
  question_id?: string
  status?: number
  score?: number
  student_answer?: string
  student_option?: string
  answered_at?: string
  tag_scores?: any[]
  tag_total?: { score: number; maxScore: number }
}

interface UseExerciseProgressWebSocketProps {
  exerciseId: string
  onProgressUpdate?: (update: ExerciseProgressUpdate) => void
  onRefreshRequested?: () => void
}

interface UseExerciseProgressWebSocketReturn {
  isConnected: boolean
}

export const useExerciseProgressWebSocket = ({
  exerciseId,
  onProgressUpdate,
  onRefreshRequested
}: UseExerciseProgressWebSocketProps): UseExerciseProgressWebSocketReturn => {
  const { currentUser } = useAuth()
  const isConnectedRef = useRef(false)
  const lastUpdateTime = useRef<number>(0)

  // Handle WebSocket connection
  useEffect(() => {
    if (currentUser) {
      webSocketService.connect(true)
      isConnectedRef.current = true
    } else {
      webSocketService.disconnect()
      isConnectedRef.current = false
    }
  }, [currentUser])

  // Handle exercise progress updates from Redis channel
  const handleProgressUpdate = useCallback((data: any) => {
    // Debounce updates to prevent too frequent refreshes
    const now = Date.now()
    if (now - lastUpdateTime.current < 2000) { // 2 second debounce
      return
    }
    lastUpdateTime.current = now
    onProgressUpdate?.(data)
  }, [onProgressUpdate])

  // Handle 'assignment_progress_update' message type from backend
  const handleProgressUpdateMessage = useCallback((data: any) => {
    console.log('📨 Received WebSocket message:', data)
    
    // Handle assignment_progress_update message type
    if (data.type === 'assignment_progress_update' && data.assign_key === exerciseId) {
      console.log('🔄 Assignment progress update received for exercise:', exerciseId)
      if (onRefreshRequested) {
        onRefreshRequested()
      }
    }
    // Legacy support for exercise_progress_update
    else if (data.exercise_id === exerciseId) {
      if (onProgressUpdate) {
        onProgressUpdate(data)
      } else if (onRefreshRequested) {
        onRefreshRequested()
      }
    }
  }, [exerciseId, onProgressUpdate, onRefreshRequested])

  // Subscribe to Redis channels and message type
  useEffect(() => {
    if (exerciseId && currentUser) {
      console.log('🔌 Setting up WebSocket subscriptions for exercise:', exerciseId)
      
      // Subscribe to exercise-specific progress channel
      const progressChannel = `assign_progress_${exerciseId}`
      console.log('📡 Subscribing to Redis channel:', progressChannel)
      webSocketService.subscribeToChannel(progressChannel, handleProgressUpdate)
      
      // Subscribe to assignment progress update message type from backend
      console.log('📡 Subscribing to message type: assignment_progress_update')
      webSocketService.subscribe('assignment_progress_update', handleProgressUpdateMessage)
      
      // Legacy support for exercise_progress_update
      console.log('📡 Subscribing to message type: exercise_progress_update')
      webSocketService.subscribe('exercise_progress_update', handleProgressUpdateMessage)
    }

    return () => {
      // Cleanup subscriptions
      if (exerciseId) {
        const progressChannel = `assign_progress_${exerciseId}`
        webSocketService.unsubscribeFromChannel(progressChannel, handleProgressUpdate)
        webSocketService.unsubscribe('assignment_progress_update', handleProgressUpdateMessage)
        webSocketService.unsubscribe('exercise_progress_update', handleProgressUpdateMessage)
      }
    }
  }, [exerciseId, currentUser, handleProgressUpdate, handleProgressUpdateMessage])

  return {
    isConnected: isConnectedRef.current
  }
} 