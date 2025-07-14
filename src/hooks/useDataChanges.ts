import { useState, useEffect, useRef } from 'react'
import { 
  compareStudentProgress, 
  compareQuestions, 
  hasStudentChanges, 
  hasQuestionChanges,
  StudentChange,
  QuestionChange
} from '../_metronic/helpers/dataDiffUtils'

interface UseDataChangesProps {
  students: any[]
  questions: any[]
}

interface UseDataChangesReturn {
  studentChanges: StudentChange[]
  questionChanges: QuestionChange[]
  hasStudentChange: (studentId: string) => boolean
  hasQuestionChange: (questionId: string) => boolean
  clearChanges: () => void
  isAnimating: boolean
}

export const useDataChanges = ({ students, questions }: UseDataChangesProps): UseDataChangesReturn => {
  const [studentChanges, setStudentChanges] = useState<StudentChange[]>([])
  const [questionChanges, setQuestionChanges] = useState<QuestionChange[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  
  const prevStudentsRef = useRef<any[]>([])
  const prevQuestionsRef = useRef<any[]>([])
  
  // Compare data when it changes
  useEffect(() => {
    const prevStudents = prevStudentsRef.current
    const prevQuestions = prevQuestionsRef.current
    
    // Only compare if we have previous data
    if (prevStudents.length > 0 || prevQuestions.length > 0) {
      const newStudentChanges = compareStudentProgress(prevStudents, students)
      const newQuestionChanges = compareQuestions(prevQuestions, questions)
      
      if (newStudentChanges.length > 0 || newQuestionChanges.length > 0) {
        setStudentChanges(newStudentChanges)
        setQuestionChanges(newQuestionChanges)
        
        // Set animation state
        setIsAnimating(true)
        
        // Clear animation state after animation completes
        setTimeout(() => {
          setIsAnimating(false)
        }, 1200) // Match animation duration
      }
    }
    
    // Update refs with current data
    prevStudentsRef.current = students
    prevQuestionsRef.current = questions
  }, [students, questions])
  
  const hasStudentChange = (studentId: string): boolean => {
    return hasStudentChanges(studentId, studentChanges)
  }
  
  const hasQuestionChange = (questionId: string): boolean => {
    return hasQuestionChanges(questionId, questionChanges)
  }
  
  const clearChanges = () => {
    setStudentChanges([])
    setQuestionChanges([])
    setIsAnimating(false)
  }
  
  return {
    studentChanges,
    questionChanges,
    hasStudentChange,
    hasQuestionChange,
    clearChanges,
    isAnimating
  }
} 