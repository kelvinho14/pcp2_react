import React, { FC } from 'react';
import { roundNumber } from '../../../../_metronic/helpers/mathUtils';
import { getCompletedQuestionsCount, getTotalQuestionsCount } from './utils';
import { StudentProgress } from './types';

interface StudentsViewProps {
  exerciseProgress: StudentProgress[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  handleSort: (field: string) => void;
  getQuestionStatusBadge: (status: number) => React.ReactNode;
  getOverallStatus: (student: StudentProgress) => number;
  getProgressPercentage: (student: StudentProgress) => number;
  getStatusColor: (status: number) => string;
  formatDate: (dateString?: string) => string;
  selectedStudent: string | null;
  setSelectedStudent: (id: string | null) => void;
  hasStudentChange?: (studentId: string) => boolean;
}

const StudentsView: FC<StudentsViewProps> = ({
  exerciseProgress,
  sortBy,
  sortOrder,
  handleSort,
  getQuestionStatusBadge,
  getOverallStatus,
  getProgressPercentage,
  getStatusColor,
  formatDate,
  selectedStudent,
  setSelectedStudent,
  hasStudentChange,
}) => {
  // Get progress bar color based on percentage (not status)
  const getProgressBarColor = (progress: number) => {
    if (progress === 0) return 'secondary'
    if (progress >= 50) return 'success'
    if (progress >= 30) return 'warning'
    return 'secondary'
  }
  return (
    <div className='table-responsive'>
      <table className='table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3'>
        <thead>
          <tr className='fw-bold text-muted'>
            <th 
              className='w-25px cursor-pointer'
              onClick={() => handleSort('name')}
            >
              <div className='d-flex align-items-center'>
                Student Name
                {sortBy === 'name' && (
                  <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ms-2`}></i>
                )}
              </div>
            </th>
            <th className='w-100px'>Overall Status</th>
            <th className='w-100px'>Progress</th>
            <th className='w-100px'>Score</th>
            <th className='w-150px'>Assigned</th>
            <th className='w-150px'>Due Date</th>
            <th className='w-100px'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exerciseProgress.map((student: StudentProgress) => {
            const studentHasChanges = hasStudentChange ? hasStudentChange(student.student_id) : false;
            return (
              <tr 
                key={student.student_id}
                className={`student-row ${studentHasChanges ? 'has-changes' : ''}`}
              >
              <td>
                <div className='d-flex align-items-center'>
                  <div className='d-flex justify-content-start flex-column'>
                    <span className='text-dark fw-bold text-hover-primary fs-6'>
                      {student.student_name}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                {getQuestionStatusBadge(getOverallStatus(student))}
              </td>
              <td>
                <div className='d-flex align-items-center'>
                  <div className='progress h-6px w-100 me-3'>
                    <div 
                      className={`progress-bar bg-${getProgressBarColor(getProgressPercentage(student))}`}
                      style={{width: `${getProgressPercentage(student)}%`}}
                    ></div>
                  </div>
                  <span className='fw-bold fs-7'>{roundNumber(getProgressPercentage(student))}%</span>
                </div>
                <div className='text-muted fs-7'>
                  {getCompletedQuestionsCount(student.question_progress)} of {getTotalQuestionsCount(student.question_progress)} questions
                </div>
              </td>
              <td>
                {student.total_score !== undefined ? (
                  <span className='fw-bold fs-6 text-success'>{student.total_score}/{student.max_total_score}</span>
                ) : (
                  <span className='text-muted fs-7'>N/A</span>
                )}
              </td>
              <td>
                <span className='text-muted fs-7'>{formatDate(student.assigned_date)}</span>
              </td>
              <td>
                <span className='text-muted fs-7'>{student.due_date ? formatDate(student.due_date) : 'No due date'}</span>
              </td>
              <td>
                <button
                  className='btn btn-sm btn-light-primary'
                  onClick={() => setSelectedStudent(selectedStudent === student.student_id ? null : student.student_id)}
                >
                  <i className='fas fa-eye me-1'></i>
                  {selectedStudent === student.student_id ? 'Hide' : 'View'} Details
                </button>
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsView; 