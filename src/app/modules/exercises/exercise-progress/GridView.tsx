import React, { FC, useState } from 'react';
import { Question, StudentProgress } from './types';

interface GridViewProps {
  allQuestions: Question[];
  exerciseProgress: StudentProgress[];
  ASSIGNMENT_STATUS: any;
  hasStudentChange?: (studentId: string) => boolean;
  hasQuestionChange?: (questionId: string) => boolean;
}

const GridView: FC<GridViewProps> = ({ 
  allQuestions, 
  exerciseProgress, 
  ASSIGNMENT_STATUS,
  hasStudentChange,
  hasQuestionChange
}) => {
  const [mcFilter, setMcFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  // Check if there are any MC questions in the exercise
  const hasMCQuestions = allQuestions.some(question => question.question_type === 'mc');

  // Helper to check if student has started (has any answer)
  const hasStudentStarted = (student: StudentProgress): boolean => {
    return student.question_progress.some(q => q.status && q.status !== ASSIGNMENT_STATUS.ASSIGNED);
  };

  // Helper to filter students based on MC answers
  const filterStudents = (students: StudentProgress[]) => {
    if (!hasMCQuestions || mcFilter === 'all') return students;
    
    return students.filter(student => {
      const mcQuestions = allQuestions.filter(q => q.question_type === 'mc');
      
      for (const question of mcQuestions) {
        const progress = student.question_progress.find(q => q.question_id === question.question_id);
        if (!progress?.student_option) continue; // Skip if no answer
        
        const isCorrect = progress.student_option === question.correct_option;
        
        if (mcFilter === 'correct' && isCorrect) return true;
        if (mcFilter === 'incorrect' && !isCorrect) return true;
      }
      
      return false;
    });
  };

  const filteredStudents = filterStudents(exerciseProgress);

  return (
    <div className='grid-view'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        {/* Global MC Filter - only show if there are MC questions */}
        {hasMCQuestions && (
          <div className='d-flex align-items-center gap-2'>
            <span className='text-muted fs-7'>MC Filter:</span>
            <select 
              className='form-select form-select-sm w-auto'
              value={mcFilter}
              onChange={(e) => setMcFilter(e.target.value as 'all' | 'correct' | 'incorrect')}
            >
              <option value='all'>All Students</option>
              <option value='correct'>Correct Only</option>
              <option value='incorrect'>Incorrect Only</option>
            </select>
          </div>
        )}

        <div>
          <h6 className='mb-2'>Grid Legend:</h6>
          <div className='d-flex gap-3 fs-7'>
            <span className='badge bg-success text-white'>✓ Correct</span>
            <span className='badge bg-danger text-white'>✗ Wrong</span>
            <span className='badge bg-warning text-white'>⏳ Submitted</span>
            <span className='badge bg-secondary text-white'>- Not Started</span>
          </div>
        </div>
      </div>
      <div className='row g-3'>
        {filteredStudents.map(student => {
          const studentHasChanges = hasStudentChange ? hasStudentChange(student.student_id) : false;
          return (
            <div 
              key={student.student_id} 
              className={`col-12 student-row ${studentHasChanges ? 'has-changes' : ''}`}
            >
            <div className='card'>
              <div className='card-header py-2'>
                <div className='d-flex justify-content-between align-items-center'>
                  <div className='d-flex align-items-center'>
                    <div className='symbol symbol-40px me-3'>
                      <div className='symbol-label bg-light-primary'>
                        <span className='fs-7 fw-bold text-primary'>
                          {student.student_name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className='fw-bold fs-6'>{student.student_name}</div>
                    </div>
                  </div>
                  <div className='text-end'>
                    <div className='fw-bold fs-6 text-success p-2'>{student.score || 0}%</div>
                  </div>
                </div>
              </div>
              <div className='card-body py-2'>
                <div className='d-flex flex-wrap gap-1'>
                  {allQuestions.map((question, qIdx) => {
                    const progress = student.question_progress.find(q => q.question_id === question.question_id)
                    const isMC = question.question_type === 'mc'
                    const isCorrect = isMC && progress?.student_option === question.correct_option
                    const isWrong = isMC && progress?.student_option && progress.student_option !== question.correct_option
                    const hasAnswer = progress?.status && progress.status !== ASSIGNMENT_STATUS.ASSIGNED
                    const questionHasChanges = hasQuestionChange ? hasQuestionChange(question.question_id) : false;
                    return (
                      <div 
                        key={question.question_id} 
                        className={`grid-cell d-flex flex-column align-items-center justify-content-center ${questionHasChanges ? 'has-changes' : ''}`}
                      >
                        <div className='grid-qnum text-muted'>{`Q${qIdx + 1}`}</div>
                        {isMC ? (
                          progress?.student_option ? (
                            <span className={`badge ${isCorrect ? 'bg-success' : isWrong ? 'bg-danger' : 'bg-light'} text-white grid-badge`}>{progress.student_option}</span>
                          ) : (
                            <span className='badge bg-secondary grid-badge'>-</span>
                          )
                        ) : hasAnswer ? (
                          <span className={`badge ${progress?.status === ASSIGNMENT_STATUS.GRADED ? 'bg-success' : 'bg-warning'} text-white grid-badge`}>
                            {progress?.status === ASSIGNMENT_STATUS.GRADED ? '✓' : '⏳'}
                          </span>
                        ) : (
                          <span className='badge bg-secondary grid-badge'>-</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};

export default GridView; 