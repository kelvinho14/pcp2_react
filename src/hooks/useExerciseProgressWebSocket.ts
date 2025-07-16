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

  // Handle 'exercise_progress_update' message type from backend
  const handleProgressUpdateMessage = useCallback((data: any) => {
    if (data.exercise_id === exerciseId) {
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
      // Subscribe to exercise-specific progress channel
      const progressChannel = `exercise_progress_${exerciseId}`
      webSocketService.subscribeToChannel(progressChannel, handleProgressUpdate)
      // Subscribe to message type from backend
      webSocketService.subscribe('exercise_progress_update', handleProgressUpdateMessage)
    }

    return () => {
      // Cleanup subscriptions
      if (exerciseId) {
        const progressChannel = `exercise_progress_${exerciseId}`
        webSocketService.unsubscribeFromChannel(progressChannel, handleProgressUpdate)
        webSocketService.unsubscribe('exercise_progress_update', handleProgressUpdateMessage)
      }
    }
  }, [exerciseId, currentUser, handleProgressUpdate, handleProgressUpdateMessage])

  return {
    isConnected: isConnectedRef.current
  }
} 