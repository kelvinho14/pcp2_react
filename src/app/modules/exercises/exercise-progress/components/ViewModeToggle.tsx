import React from 'react'
import { ViewMode } from '../types'

interface ViewModeToggleProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ currentView, onViewChange }) => {
  const viewOptions = [
    {
      mode: 'questions' as ViewMode,
      label: 'Questions View',
      icon: 'fas fa-list'
    },
    {
      mode: 'students' as ViewMode,
      label: 'Students View',
      icon: 'fas fa-users'
    },
    {
      mode: 'grid' as ViewMode,
      label: 'Grid View',
      icon: 'fas fa-th-large'
    }
  ]

  return (
    <div className='btn-group' role='group'>
      {viewOptions.map((option) => (
        <button
          key={option.mode}
          type='button'
          className={`btn ${currentView === option.mode ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => onViewChange(option.mode)}
        >
          <i className={`${option.icon} me-2`}></i>
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default ViewModeToggle 