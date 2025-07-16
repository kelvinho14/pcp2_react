import { useCallback } from 'react'
import { useWebSocket } from './useWebSocket'
import { useDebouncedCallback } from './useDebouncedCallback'

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
  // Handle exercise progress updates from Redis channel with debouncing
  const handleProgressUpdate = useDebouncedCallback((data: any) => {
    onProgressUpdate?.(data)
  }, 2000) // 2 second debounce

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

  // Define subscriptions
  const subscriptions = [
    {
      type: 'channel' as const,
      name: `exercise_progress_${exerciseId}`,
      handler: handleProgressUpdate
    },
    {
      type: 'message' as const,
      name: 'exercise_progress_update',
      handler: handleProgressUpdateMessage
    }
  ]

  // Use the generic WebSocket hook
  const { isConnected } = useWebSocket({ subscriptions })

  return {
    isConnected
  }
} 