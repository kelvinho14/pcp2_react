import React, { FC } from 'react';

interface StudentProgress {
  user_id: string;
  name: string;
  email: string;
  assignment_id: string;
  status: number;
  started_at?: string;
  submitted_at?: string;
  graded_at?: string;
  score?: number;
  total_questions: number;
  completed_questions: number;
  question_progress: Array<any>;
}

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
}) => {
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
            <th className='w-150px'>Started</th>
            <th className='w-150px'>Submitted</th>
            <th className='w-100px'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exerciseProgress.map((student: StudentProgress) => (
            <tr key={student.user_id}>
              <td>
                <div className='d-flex align-items-center'>
                  <div className='d-flex justify-content-start flex-column'>
                    <span className='text-dark fw-bold text-hover-primary fs-6'>
                      {student.name}
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
                      className={`progress-bar bg-${getStatusColor(getOverallStatus(student) as any)}`}
                      style={{width: `${getProgressPercentage(student)}%`}}
                    ></div>
                  </div>
                  <span className='fw-bold fs-7'>{getProgressPercentage(student)}%</span>
                </div>
                <div className='text-muted fs-7'>
                  {student.completed_questions} of {student.total_questions} questions
                </div>
              </td>
              <td>
                {student.score !== undefined ? (
                  <span className='fw-bold fs-6 text-success'>{student.score}%</span>
                ) : (
                  <span className='text-muted fs-7'>N/A</span>
                )}
              </td>
              <td>
                <span className='text-muted fs-7'>{formatDate(student.started_at)}</span>
              </td>
              <td>
                <span className='text-muted fs-7'>{formatDate(student.submitted_at)}</span>
              </td>
              <td>
                <button
                  className='btn btn-sm btn-light-primary'
                  onClick={() => setSelectedStudent(selectedStudent === student.user_id ? null : student.user_id)}
                >
                  <i className='fas fa-eye me-1'></i>
                  {selectedStudent === student.user_id ? 'Hide' : 'View'} Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsView; 