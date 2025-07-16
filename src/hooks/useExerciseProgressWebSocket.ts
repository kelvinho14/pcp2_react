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
    if (onProgressUpdate) {
      onProgressUpdate(data)
    } else if (onRefreshRequested) {
      onRefreshRequested()
    }
  }, 2000) // 2 second debounce

  // Define subscriptions - only Redis channels, no message types
  const subscriptions = [
    {
      type: 'channel' as const,
      name: `exercise_progress_${exerciseId}`,
      handler: handleProgressUpdate
    }
  ]

  // Use the generic WebSocket hook
  const { isConnected } = useWebSocket({ subscriptions })

  return {
    isConnected
  }
} 