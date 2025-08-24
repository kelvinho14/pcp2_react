export interface StudentProgress {
  student_id: string
  student_name: string
  assignment_id: string
  assigned_date: string
  due_date?: string
  status: number
  question_progress: Array<{
    question_id: string
    status: number
    score?: number
    max_score?: number
    answered_at?: string
    is_correct?: boolean
    feedback?: string
    tag_scores: Array<{
      tag_id: string
      tag_name: string
      score: number
      max_score: number
      is_correct: boolean
    }>
    student_answer?: string
    student_option?: string
    tag_total: {
      score: number
      maxScore: number
    }
  }>
  total_score: number
  max_total_score: number
  completion_percentage: number
  total_questions?: number
  completed_questions?: number
  started_at?: string
  submitted_at?: string
  graded_at?: string
  score?: number
}

export interface Question {
  question_id: string
  question_content: string
  question_type: 'mc' | 'lq'
  correct_answer?: string
  correct_option?: string
  options?: { letter: string; text: string }[]
  tags?: { name: string; maxScore: number }[]
}

export interface StudentAnswer {
  student_id: string
  student_name: string
  assignment_id: string
  status: number
  score?: number
  student_answer?: string
  student_option?: string
  answered_at?: string
  overall_status: number
  tag_scores?: Array<{
    tag_id: string
    tag_name: string
    score: number
    max_score: number
    is_correct: boolean
  }>
  tag_total?: {
    score: number
    maxScore: number
  }
}

export type ViewMode = 'students' | 'questions' | 'grid'
export type SortOrder = 'asc' | 'desc'

export interface ExerciseSummary {
  totalStudents: number
  completed: number
  inProgress: number
  notStarted: number
} 