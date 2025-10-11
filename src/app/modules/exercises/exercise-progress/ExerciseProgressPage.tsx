import {FC, useState} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {PageTitle} from '../../../../_metronic/layout/core'
import {ASSIGNMENT_STATUS, getStatusLabel, getStatusColor, getStatusIcon} from '../../../constants/assignmentStatus'
import {KTCard, KTCardBody} from '../../../../_metronic/helpers'
import {formatApiTimestamp} from '../../../../_metronic/helpers/dateUtils'
import {useDataChanges} from '../../../../hooks/useDataChanges'
import {useExerciseProgress} from './hooks/useExerciseProgress'
import {getStudentAnswersForQuestion, calculateOverallStatus} from './utils'
import './ExerciseProgressPage.scss'
import QuestionsView from './QuestionsView'
import StudentsView from './StudentsView'
import GridView from './GridView'
import { ExerciseSummary, ViewModeToggle } from './components'

const ExerciseProgressPage: FC = () => {
  const {exerciseId} = useParams<{exerciseId: string}>()
  const navigate = useNavigate()

  // Use custom hook for data management
  const {
    exerciseProgress,
    questions,
    exercise,
    summary,
    isLoading,
    currentPage,
    itemsPerPage,
    totalPages,
    paginationInfo,
    searchTerm,
    filteredStudents,
    sortBy,
    sortOrder,
    viewMode,
    isWebSocketConnected,
    setCurrentPage,
    setItemsPerPage,
    setSearchTerm,
    setSortBy,
    setSortOrder,
    setViewMode,
    refreshData,
    handleSearch,
    handleSort
  } = useExerciseProgress({ exerciseId: exerciseId || '' })

  // Use change detection hook
  const {
    studentChanges,
    questionChanges,
    hasStudentChange,
    hasQuestionChange,
    clearChanges,
    isAnimating
  } = useDataChanges({
    students: exerciseProgress,
    questions: questions
  })

  const getStudentAnswersForQuestionHandler = (questionId: string) => {
    return getStudentAnswersForQuestion(filteredStudents, questionId)
  }

  const getProgressPercentage = (student: any) => {
    return student.completion_percentage || 0
  }

  const getOverallStatus = (student: any) => {
    // Use calculated status based on question progress instead of backend status
    return calculateOverallStatus(student.question_progress)
  }

  const getQuestionStatusBadge = (status: number) => {
    const label = getStatusLabel(status as any)
    const color = getStatusColor(status as any)
    const icon = getStatusIcon(status as any)
    return (
      <span className={`badge badge-light-${color} fs-7`}>
        <i className={`${icon} me-1`}></i>
        {label}
      </span>
    )
  }

  const getQuestionTypeBadge = (type: string) => {
    return type === 'mc' ? 
      <span className='badge badge-light-primary fs-7'>MC</span> : 
      <span className='badge badge-light-info fs-7'>LQ</span>
  }

  const formatDate = (dateString?: string) => {
    return formatApiTimestamp(dateString, { format: 'custom' })
  }

  // Clear changes when refreshing
  const handleRefresh = () => {
    clearChanges()
    refreshData()
  }

  return (
    <div className={`exercise-progress-page ${isLoading ? 'loading' : ''}`}>
      <PageTitle breadcrumbs={[
        {title: 'Home', path: '/dashboard', isSeparator: false, isActive: false},
        {title: 'Assigned Exercises', path: '/exercises/assignedlist', isSeparator: false, isActive: false},
        {title: exercise?.title || 'Exercise Progress', path: '', isSeparator: false, isActive: true}
      ]}>
        Exercise Progress Overview
      </PageTitle>

      {/* Welcome Section */}
      <div className='welcome-section mb-6'>
        <div className='welcome-content'>
          <div className='welcome-text'>
            <h2 className='welcome-title'>{exercise?.title || 'Exercise Progress Overview'}</h2>
            <p className='welcome-subtitle'>
              This page shows real-time progress for this exercise. 
            </p>
          </div>
        </div>
      </div>

      <KTCard>
        <KTCardBody>
          {/* Exercise Summary */}
          <div className='row mb-6'>
            <div className='col-lg-12'>
              {exercise && <ExerciseSummary summary={summary} />}
            </div>
          </div>

          {/* Student Search - always visible */}
          <div className='row mb-4'>
            <div className='col-lg-6'>
              <div className='input-group' style={{width: '300px'}}>
                <span className='input-group-text'>
                  <i className='fas fa-search'></i>
                </span>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Search students...'
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className='row mb-6'>
            <div className='col-lg-12'>
              <div className='d-flex justify-content-between align-items-center'>
                <ViewModeToggle 
                  currentView={viewMode}
                  onViewChange={setViewMode}
                />
                
                <div className='d-flex align-items-center gap-3'>
                  {/* WebSocket Status Indicator */}
                  <div className='d-flex align-items-center'>
                    <div className={`ws-status-indicator ${isWebSocketConnected ? 'connected' : 'disconnected'}`}>
                      <i className={`fas ${isWebSocketConnected ? 'fa-wifi' : 'fa-exclamation-triangle'}`}></i>
                      <span className='ms-1 d-none d-sm-inline'>
                        {isWebSocketConnected ? 'Live' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>

          {/* Content based on view mode */}
          {viewMode === 'questions' ? (
            <QuestionsView
              allQuestions={questions}
              getStudentAnswersForQuestion={getStudentAnswersForQuestionHandler}
              getQuestionTypeBadge={getQuestionTypeBadge}
              getQuestionStatusBadge={getQuestionStatusBadge}
              formatDate={formatDate}
              hasQuestionChange={hasQuestionChange}
              hasStudentChange={hasStudentChange}
            />
          ) : viewMode === 'grid' ? (
            <GridView
              allQuestions={questions}
              exerciseProgress={filteredStudents}
              ASSIGNMENT_STATUS={ASSIGNMENT_STATUS}
              hasStudentChange={hasStudentChange}
              hasQuestionChange={hasQuestionChange}
              totalQuestions={exercise?.question_count}
            />
          ) : (
            <StudentsView
              exerciseProgress={filteredStudents}
              sortBy={sortBy}
              sortOrder={sortOrder}
              handleSort={handleSort}
              getQuestionStatusBadge={getQuestionStatusBadge}
              getOverallStatus={getOverallStatus}
              getProgressPercentage={getProgressPercentage}
              getStatusColor={(status: number) => getStatusColor(status as any)}
              formatDate={formatDate}
              hasStudentChange={hasStudentChange}
              totalQuestions={exercise?.question_count}
            />
          )}
        </KTCardBody>
      </KTCard>
    </div>
  )
}

export default ExerciseProgressPage 