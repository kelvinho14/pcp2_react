import React, { FC, useState } from 'react';
import { Question, StudentProgress } from './types';
import { getProgressPercentage, getCompletedQuestionsCount, getTotalQuestionsCount, getStudentScoreString } from './utils';

interface GridViewProps {
  allQuestions: Question[];
  exerciseProgress: StudentProgress[];
  ASSIGNMENT_STATUS: any;
  hasStudentChange?: (studentId: string) => boolean;
  hasQuestionChange?: (questionId: string) => boolean;
  totalQuestions?: number;
}

const GridView: FC<GridViewProps> = ({ 
  allQuestions, 
  exerciseProgress, 
  ASSIGNMENT_STATUS,
  hasStudentChange,
  hasQuestionChange,
  totalQuestions
}) => {
  const [mcFilter, setMcFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  // Check if there are any MC questions in the exercise
  const hasMCQuestions = allQuestions.some(question => question.question_type === 'mc');

  // Helper to check if student has started (has any answer)
  const hasStudentStarted = (student: StudentProgress): boolean => {
    return student.question_progress.some(q => q.status && q.status !== ASSIGNMENT_STATUS.ASSIGNED);
  };

  // Helper to count completed questions
  const getCompletedQuestionsCount = (questionProgress: any[]) =>
    questionProgress.filter(q => q.status && q.status !== ASSIGNMENT_STATUS.ASSIGNED).length;

  // Helper to get score and color
  const getStudentScoreInfo = (questionProgress: any[]) => {
    let totalScore = 0;
    let totalMax = 0;
    questionProgress.forEach(q => {
      if (q.tag_total) {
        totalScore += q.tag_total.score || 0;
        totalMax += q.tag_total.maxScore || 0;
      }
    });
    let color = 'text-muted';
    if (totalMax > 0 && totalScore === totalMax) color = 'text-success';
    else if (totalScore > 0) color = 'text-warning';
    return { scoreString: `${totalScore}/${totalMax}`, color };
  };

  // Helper to count correct answers
  const getCorrectAnswersCount = (questionProgress: any[]) =>
    questionProgress.filter(q => q.is_correct).length;

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
                <div className='d-flex align-items-center gap-4' style={{width: '100%'}}>
                  {/* Avatar + Name */}
                  <div className='d-flex align-items-center gap-2' style={{minWidth: 120}}>
                    <span className='fw-bold fs-6'>{student.student_name}</span>
                  </div>
                  {/* Progress Center */}
                  <div className='d-flex flex-column flex-grow-1 align-items-start'>
                    <div className='d-flex align-items-center w-100'>
                      <div className='progress h-6px w-100 me-2' style={{maxWidth: 160}}>
                        <div
                          className='progress-bar bg-success'
                          style={{width: `${getProgressPercentage(student)}%`}}
                        ></div>
                      </div>
                      <span className='fw-bold fs-7 ms-2'>{Math.round(getProgressPercentage(student))}%</span>
                    </div>
                    <div className='text-muted fs-7'>
                      {getCompletedQuestionsCount(student.question_progress)} of {totalQuestions || getTotalQuestionsCount(student.question_progress)} questions
                    </div>
                  </div>
                  {/* Score Right */}
                  <span className={`fw-bold fs-5 ms-4 text-end ${(() => {
                    const [score, max] = getStudentScoreString(student.question_progress).split('/').map(Number);
                    if (max > 0 && score === max) return 'text-success';
                    if (score > 0) return 'text-warning';
                    return 'text-muted';
                  })()}`}>{getStudentScoreString(student.question_progress)}</span>
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