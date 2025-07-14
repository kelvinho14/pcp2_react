/**
 * Utility functions for comparing data and detecting changes
 */

export interface DataChange {
  type: 'added' | 'removed' | 'modified'
  key: string
  oldValue?: any
  newValue?: any
  path?: string[]
}

export interface StudentChange extends DataChange {
  studentId: string
  field?: string
}

export interface QuestionChange extends DataChange {
  questionId: string
  field?: string
}

/**
 * Deep compare two objects and return differences
 */
export function deepCompare(oldData: any, newData: any, path: string[] = []): DataChange[] {
  const changes: DataChange[] = []
  
  if (oldData === newData) return changes
  
  if (typeof oldData !== typeof newData) {
    changes.push({
      type: 'modified',
      key: path.join('.'),
      oldValue: oldData,
      newValue: newData,
      path
    })
    return changes
  }
  
  if (typeof oldData !== 'object' || oldData === null || newData === null) {
    if (oldData !== newData) {
      changes.push({
        type: 'modified',
        key: path.join('.'),
        oldValue: oldData,
        newValue: newData,
        path
      })
    }
    return changes
  }
  
  if (Array.isArray(oldData) !== Array.isArray(newData)) {
    changes.push({
      type: 'modified',
      key: path.join('.'),
      oldValue: oldData,
      newValue: newData,
      path
    })
    return changes
  }
  
  if (Array.isArray(oldData)) {
    // Compare arrays
    const maxLength = Math.max(oldData.length, newData.length)
    for (let i = 0; i < maxLength; i++) {
      const oldItem = oldData[i]
      const newItem = newData[i]
      
      if (i >= oldData.length) {
        changes.push({
          type: 'added',
          key: `${path.join('.')}[${i}]`,
          newValue: newItem,
          path: [...path, i.toString()]
        })
      } else if (i >= newData.length) {
        changes.push({
          type: 'removed',
          key: `${path.join('.')}[${i}]`,
          oldValue: oldItem,
          path: [...path, i.toString()]
        })
      } else {
        changes.push(...deepCompare(oldItem, newItem, [...path, i.toString()]))
      }
    }
  } else {
    // Compare objects
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)])
    
    for (const key of allKeys) {
      const oldValue = oldData[key]
      const newValue = newData[key]
      
      if (!(key in oldData)) {
        changes.push({
          type: 'added',
          key: [...path, key].join('.'),
          newValue,
          path: [...path, key]
        })
      } else if (!(key in newData)) {
        changes.push({
          type: 'removed',
          key: [...path, key].join('.'),
          oldValue,
          path: [...path, key]
        })
      } else {
        changes.push(...deepCompare(oldValue, newValue, [...path, key]))
      }
    }
  }
  
  return changes
}

/**
 * Compare student progress data and return specific changes
 */
export function compareStudentProgress(oldStudents: any[], newStudents: any[]): StudentChange[] {
  const changes: StudentChange[] = []
  
  // Create maps for easy lookup
  const oldStudentMap = new Map(oldStudents.map(s => [s.student_id, s]))
  const newStudentMap = new Map(newStudents.map(s => [s.student_id, s]))
  
  // Check for added students
  for (const [studentId, newStudent] of newStudentMap) {
    if (!oldStudentMap.has(studentId)) {
      changes.push({
        type: 'added',
        key: `student.${studentId}`,
        studentId,
        newValue: newStudent
      })
    }
  }
  
  // Check for removed students
  for (const [studentId, oldStudent] of oldStudentMap) {
    if (!newStudentMap.has(studentId)) {
      changes.push({
        type: 'removed',
        key: `student.${studentId}`,
        studentId,
        oldValue: oldStudent
      })
    }
  }
  
  // Check for modified students
  for (const [studentId, newStudent] of newStudentMap) {
    const oldStudent = oldStudentMap.get(studentId)
    if (oldStudent) {
      const studentChanges = deepCompare(oldStudent, newStudent, ['student', studentId])
      changes.push(...studentChanges.map(change => ({
        ...change,
        studentId,
        field: change.path?.[change.path.length - 1]
      })))
    }
  }
  
  return changes
}

/**
 * Compare question data and return specific changes
 */
export function compareQuestions(oldQuestions: any[], newQuestions: any[]): QuestionChange[] {
  const changes: QuestionChange[] = []
  
  // Create maps for easy lookup
  const oldQuestionMap = new Map(oldQuestions.map(q => [q.question_id, q]))
  const newQuestionMap = new Map(newQuestions.map(q => [q.question_id, q]))
  
  // Check for added questions
  for (const [questionId, newQuestion] of newQuestionMap) {
    if (!oldQuestionMap.has(questionId)) {
      changes.push({
        type: 'added',
        key: `question.${questionId}`,
        questionId,
        newValue: newQuestion
      })
    }
  }
  
  // Check for removed questions
  for (const [questionId, oldQuestion] of oldQuestionMap) {
    if (!newQuestionMap.has(questionId)) {
      changes.push({
        type: 'removed',
        key: `question.${questionId}`,
        questionId,
        oldValue: oldQuestion
      })
    }
  }
  
  // Check for modified questions
  for (const [questionId, newQuestion] of newQuestionMap) {
    const oldQuestion = oldQuestionMap.get(questionId)
    if (oldQuestion) {
      const questionChanges = deepCompare(oldQuestion, newQuestion, ['question', questionId])
      changes.push(...questionChanges.map(change => ({
        ...change,
        questionId,
        field: change.path?.[change.path.length - 1]
      })))
    }
  }
  
  return changes
}

/**
 * Get CSS class for animation based on change type
 */
export function getChangeAnimationClass(change: DataChange): string {
  switch (change.type) {
    case 'added':
      return 'fade-in-added'
    case 'removed':
      return 'fade-out-removed'
    case 'modified':
      return 'fade-in-modified'
    default:
      return ''
  }
}

/**
 * Check if a specific student has changes
 */
export function hasStudentChanges(studentId: string, changes: StudentChange[]): boolean {
  return changes.some(change => change.studentId === studentId)
}

/**
 * Check if a specific question has changes
 */
export function hasQuestionChanges(questionId: string, changes: QuestionChange[]): boolean {
  return changes.some(change => change.questionId === questionId)
} 