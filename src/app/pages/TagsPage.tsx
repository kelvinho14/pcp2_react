import React, { FC, useState, useEffect, useCallback, useMemo } from 'react'
import { PageTitle } from '../../_metronic/layout/core'
import { KTCard } from '../../_metronic/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../store'
import { fetchTagsWithLinkages, updateTagName, TagWithLinkages, TagLinkage } from '../../store/tags/tagsSlice'
import { toast } from '../../_metronic/helpers/toast'

// Content Type Badge Colors
const CONTENT_TYPE_COLORS = {
  'MC': 'badge-light-primary',
  'LQ': 'badge-light-info',
  'EXERCISE': 'badge-light-success',
  'VIDEO': 'badge-light-warning',
  'default': 'badge-light-secondary'
} as const

const TagsPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { tagsWithLinkages, tagsWithLinkagesLoading, error } = useSelector((state: RootState) => state.tags)
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  // Fetch tags with linkages using Redux
  const fetchTags = useCallback((search?: string) => {
    dispatch(fetchTagsWithLinkages(search))
  }, [dispatch])


  // Update tag name using Redux
  const handleUpdateTag = useCallback((tagId: string, newName: string) => {
    if (!newName.trim()) {
      toast.error('Tag name cannot be empty', 'Error')
      return
    }

    dispatch(updateTagName({ tagId, newName: newName.trim() }))
    setEditingTag(null)
    setEditName('')
  }, [dispatch])

  // Start editing
  const startEditing = (tagId: string, currentName: string) => {
    setEditingTag(tagId)
    setEditName(currentName)
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingTag(null)
    setEditName('')
  }

  // Memoized total count calculation
  const getTotalCount = useCallback((linkages: TagLinkage[]) => {
    return linkages.reduce((total, linkage) => total + linkage.count, 0)
  }, [])

  // Handle search input with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    // Set new timeout for 1 second
    const timeout = setTimeout(() => {
      fetchTags(value)
    }, 1000)
    
    setSearchTimeout(timeout)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('')
    if (searchTimeout) {
      clearTimeout(searchTimeout)
      setSearchTimeout(null)
    }
    fetchTags()
  }

  // Memoized content type badge color
  const getContentTypeBadgeColor = useCallback((contentType: string) => {
    return CONTENT_TYPE_COLORS[contentType as keyof typeof CONTENT_TYPE_COLORS] || CONTENT_TYPE_COLORS.default
  }, [])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  if (tagsWithLinkagesLoading) {
    return (
      <>
        <PageTitle breadcrumbs={[]}>Tags Management</PageTitle>
        <KTCard>
          <div className='card-body'>
            <div className='d-flex justify-content-center'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          </div>
        </KTCard>
      </>
    )
  }

  return (
    <>
      <PageTitle breadcrumbs={[]}>Tags Management</PageTitle>
      
      <KTCard>
        <div className='card-header'>
          <h3 className='card-title'>Total Tags ({tagsWithLinkages.length})</h3>
          <div className='card-toolbar'>
            <div className='position-relative' style={{ width: '300px' }}>
              <input
                type='text'
                className='form-control'
                placeholder='Search tags...'
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <div className='position-absolute top-50 end-0 translate-middle-y pe-3'>
                {searchTerm ? (
                  <button
                    type='button'
                    className='btn btn-sm btn-icon btn-light'
                    onClick={handleClearSearch}
                  >
                    <i className='fas fa-times'></i>
                  </button>
                ) : (
                  <i className='fas fa-search text-muted'></i>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className='card-body'>
          {tagsWithLinkages.length === 0 ? (
            <div className='text-center py-5'>
              <i className='fas fa-tags fs-3x text-muted mb-3'></i>
              <h4 className='text-muted'>No tags found</h4>
              <p className='text-muted'>Create your first tag by adding it to a question or exercise.</p>
            </div>
          ) : (
            <div className='row g-4'>
              {tagsWithLinkages.map((tag) => (
                <div key={tag.tag_id} className='col-lg-4 col-md-6'>
                  <div className='card border border-gray-300 h-100'>
                    <div className='card-body d-flex flex-column'>
                      {/* Tag Header */}
                      <div className='d-flex justify-content-between align-items-start mb-3'>
                        {editingTag === tag.tag_id ? (
                          <div className='flex-grow-1 me-3'>
                            <input
                              type='text'
                              className='form-control form-control-sm'
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdateTag(tag.tag_id, editName)
                                } else if (e.key === 'Escape') {
                                  cancelEditing()
                                }
                              }}
                              autoFocus
                            />
                          </div>
                        ) : (
                          <h5 className='card-title mb-0 flex-grow-1'>{tag.name}</h5>
                        )}
                        
                        <button
                          className='btn btn-sm btn-light'
                          onClick={() => startEditing(tag.tag_id, tag.name)}
                          title='Edit tag name'
                        >
                          <i className='fas fa-pencil-alt'></i>
                        </button>
                      </div>

                      {/* Edit Actions */}
                      {editingTag === tag.tag_id && (
                        <div className='d-flex gap-2 mb-3'>
                          <button
                            className='btn btn-sm btn-success'
                            onClick={() => handleUpdateTag(tag.tag_id, editName)}
                          >
                            <i className='fas fa-check me-1'></i>
                            Save
                          </button>
                          <button
                            className='btn btn-sm btn-secondary'
                            onClick={cancelEditing}
                          >
                            <i className='fas fa-times me-1'></i>
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* Total Count */}
                      <div className='mb-3'>
                        <div className='d-flex align-items-center'>
                          <i className='fas fa-link text-primary me-2'></i>
                          <span className='fw-bold'>Total Usage: {getTotalCount(tag.linkages)}</span>
                        </div>
                      </div>

                      {/* Linkages Breakdown */}
                      <div className='flex-grow-1'>
                        <h6 className='text-muted mb-2'>Used in:</h6>
                        <div className='d-flex flex-wrap gap-1'>
                          {tag.linkages.map((linkage, index) => (
                            <span
                              key={index}
                              className={`badge ${getContentTypeBadgeColor(linkage.content_type)}`}
                            >
                              {linkage.content_type}: {linkage.count}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </KTCard>

    </>
  )
}

export default TagsPage
