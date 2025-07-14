import React from 'react'

interface RefreshButtonProps {
  onRefresh: () => void
  isLoading: boolean
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh, isLoading }) => {
  return (
    <button
      type='button'
      className='btn btn-success'
      onClick={onRefresh}
      disabled={isLoading}
    >
      <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} me-2`}></i>
      {isLoading ? 'Refreshing...' : 'Refresh'}
    </button>
  )
}

export default RefreshButton 