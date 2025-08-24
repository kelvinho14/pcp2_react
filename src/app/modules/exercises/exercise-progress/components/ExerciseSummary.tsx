import React from 'react'
import { ExerciseSummary as ExerciseSummaryType } from '../types'
import { ASSIGNMENT_STATUS, getStatusLabel } from '../../../../constants/assignmentStatus'

interface ExerciseSummaryProps {
  summary: ExerciseSummaryType
}

const ExerciseSummary: React.FC<ExerciseSummaryProps> = ({ summary }) => {
  return (
    <div className='progress-overview'>
      <div className='status-cards-grid'>
        <div>
          <div className='progress-card total'>
            <div className='d-flex align-items-center'>
              <div className='card-icon me-3'>
                <i className='fas fa-users text-white fs-2'></i>
              </div>
              <div className='card-content'>
                <div className='card-number'>{summary.totalStudents}</div>
                <div className='card-label'>Total Students</div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className='progress-card completed'>
            <div className='d-flex align-items-center'>
              <div className='card-icon me-3'>
                <i className='fas fa-check-circle text-white fs-2'></i>
              </div>
              <div className='card-content'>
                <div className='card-number'>{summary.completed}</div>
                <div className='card-label'>Completed</div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className='progress-card not-started'>
            <div className='d-flex align-items-center'>
              <div className='card-icon me-3'>
                <i className='fas fa-hourglass-start text-white fs-2'></i>
              </div>
              <div className='card-content'>
                <div className='card-number'>{summary.notStarted}</div>
                <div className='card-label'>{getStatusLabel(ASSIGNMENT_STATUS.ASSIGNED)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExerciseSummary 