import { StudentProgress, Question, StudentAnswer, ExerciseSummary } from './types'
import { ASSIGNMENT_STATUS } from '../../../constants/assignmentStatus'

export const calculateExerciseSummary = (students: StudentProgress[]): ExerciseSummary => {
  return {
    totalStudents: students.length,
    completed: students.filter(s => s.status === ASSIGNMENT_STATUS.SUBMITTED || s.status === ASSIGNMENT_STATUS.GRADED || s.status === ASSIGNMENT_STATUS.SUBMITTEDBYTEACHER).length,
    inProgress: students.filter(s => s.status === ASSIGNMENT_STATUS.IN_PROGRESS).length,
    notStarted: students.filter(s => s.status === ASSIGNMENT_STATUS.ASSIGNED).length
  }
}

export const filterStudentsBySearch = (students: StudentProgress[], searchTerm: string): StudentProgress[] => {
  if (!searchTerm) return students
  
  return students.filter(student =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase())
  )
}

export const getStudentAnswersForQuestion = (
  students: StudentProgress[], 
  questionId: string
): StudentAnswer[] => {
  return students.map(student => {
    const questionProgress = student.question_progress.find((q: any) => q.question_id === questionId)
    return {
      student_id: student.student_id,
      student_name: student.student_name,
      assignment_id: student.assignment_id,
      status: questionProgress?.status || ASSIGNMENT_STATUS.ASSIGNED,
      score: questionProgress?.score,
      student_answer: questionProgress?.student_answer,
      student_option: questionProgress?.student_option,
      answered_at: questionProgress?.answered_at,
      overall_status: student.status,
      tag_scores: questionProgress?.tag_scores || [],
      tag_total: questionProgress?.tag_total || { score: 0, maxScore: 0 }
    }
  })
}

export const getProgressPercentage = (student: StudentProgress): number => {
  return student.completion_percentage || 0
}

export const getOverallStatus = (student: StudentProgress): number => {
  return student.status
}

export const calculateTotalPages = (totalItems: number, itemsPerPage: number): number => {
  return Math.ceil(totalItems / itemsPerPage)
}

export const getPaginationInfo = (currentPage: number, itemsPerPage: number, totalItems: number) => {
  const startItem = ((currentPage - 1) * itemsPerPage) + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)
  
  return {
    startItem,
    endItem,
    totalItems,
    hasNextPage: currentPage < calculateTotalPages(totalItems, itemsPerPage),
    hasPrevPage: currentPage > 1
  }
}

export const getCompletedQuestionsCount = (questionProgress: any[]): number => {
  return questionProgress.filter(q => q.status === ASSIGNMENT_STATUS.SUBMITTED || q.status === ASSIGNMENT_STATUS.GRADED).length
}

export const getTotalQuestionsCount = (questionProgress: any[]): number => {
  return questionProgress.length
}

export const calculateOverallStatus = (questionProgress: any[]): number => {
  const totalQuestions = questionProgress.length
  const completedQuestions = getCompletedQuestionsCount(questionProgress)
  
  if (completedQuestions === 0) {
    return ASSIGNMENT_STATUS.ASSIGNED
  } else if (completedQuestions === totalQuestions) {
    return ASSIGNMENT_STATUS.SUBMITTED // (all questions completed)
  } else {
    return ASSIGNMENT_STATUS.IN_PROGRESS // (some questions completed)
  }
} 

export const getStudentScoreString = (questionProgress: any[]): string => {
  let totalScore = 0;
  let totalMax = 0;
  questionProgress.forEach(q => {
    if (q.tag_total) {
      totalScore += q.tag_total.score || 0;
      totalMax += q.tag_total.maxScore || 0;
    }
  });
  return `${totalScore}/${totalMax}`;
}; 