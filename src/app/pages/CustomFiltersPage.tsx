import React, { FC, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../store'
import { PageTitle } from '../../_metronic/layout/core'
import { KTCard } from '../../_metronic/helpers/components/KTCard'
import { Button, Card, Modal, Form } from 'react-bootstrap'
import Select from 'react-select'
import { toast } from '../../_metronic/helpers/toast'
import { 
  fetchCustomDropdowns, 
  fetchTagOptions, 
  createCustomDropdown, 
  updateCustomDropdown, 
  deleteCustomDropdown,
  CustomDropdown,
  TagOption,
  CreateDropdownPayload,
  CustomDropdownOption
} from '../../store/customDropdowns/customDropdownsSlice'
import { PAGE_TYPES, getPageTypeName, PageType } from '../constants/pageTypes'
import { formatApiTimestamp } from '../../_metronic/helpers/dateUtils'
import { ConfirmationDialog } from '../../_metronic/helpers/ConfirmationDialog'

const CustomFiltersPage: FC = () => {
  const intl = useIntl()
  const dispatch = useDispatch<AppDispatch>()
  
  // Redux state
  const { 
    dropdowns, 
    tagOptions, 
    loading, 
    tagOptionsLoading, 
    error 
  } = useSelector((state: RootState) => state.customDropdowns)
  
  // Local state
  const [showModal, setShowModal] = useState(false)
  const [editingDropdown, setEditingDropdown] = useState<CustomDropdown | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [dropdownToDelete, setDropdownToDelete] = useState<CustomDropdown | null>(null)
  const [formData, setFormData] = useState<CreateDropdownPayload>({
    name: '',
    description: '',
    display_locations: [],
    options: []
  })

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchCustomDropdowns())
    dispatch(fetchTagOptions())
  }, [dispatch])

  // Handle form data changes
  const handleFormChange = (field: keyof CreateDropdownPayload, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle option change
  const handleOptionChange = (index: number, field: keyof CustomDropdownOption, value: any) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }))
  }

  // Add new option
  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, {
        option_type: 1,
        option_value: '',
        display_text: '',
        sort_order: prev.options.length + 1
      }]
    }))
  }

  // Remove option
  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  // Handle tag option selection
  const handleTagOptionSelect = (index: number, tagOption: TagOption) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { 
          ...option, 
          option_type: tagOption.option_type,
          option_value: tagOption.option_value,
          display_text: tagOption.display_text
        } : option
      )
    }))
  }

  // Handle create dropdown
  const handleCreateDropdown = () => {
    setEditingDropdown(null)
    setFormData({
      name: '',
      description: '',
      display_locations: [], // No default selection
      options: [{
        option_type: 1,
        option_value: '',
        display_text: '',
        sort_order: 1
      }]
    })
    setShowModal(true)
  }

  // Handle edit dropdown
  const handleEditDropdown = (dropdown: CustomDropdown) => {
    setEditingDropdown(dropdown)
    setFormData({
      name: dropdown.name,
      description: dropdown.description || '',
      display_locations: dropdown.display_locations || [],
      options: dropdown.options
    })
    setShowModal(true)
  }

  // Handle save dropdown
  const handleSaveDropdown = async () => {
    if (!formData.name.trim()) {
      toast.error('Dropdown name is required')
      return
    }

    if (formData.display_locations.length === 0) {
      toast.error('At least one page type must be selected for "Appear on"')
      return
    }

    if (formData.options.length === 0) {
      toast.error('At least one option is required')
      return
    }

    // Check that all options have valid tag selections
    const hasValidOptions = formData.options.every(option => 
      option.option_value && option.option_value.trim() !== ''
    )
    
    if (!hasValidOptions) {
      toast.error('Please add at least one option')
      return
    }

    try {
      if (editingDropdown) {
        await dispatch(updateCustomDropdown({ 
          dropdownId: editingDropdown.dropdown_id, 
          payload: formData 
        })).unwrap()
      } else {
        await dispatch(createCustomDropdown(formData)).unwrap()
      }
      setShowModal(false)
      setEditingDropdown(null)
    } catch (error) {
      // Error handling is done in the Redux slice
    }
  }

  // Handle delete dropdown click
  const handleDeleteClick = (dropdown: CustomDropdown) => {
    setDropdownToDelete(dropdown)
    setShowDeleteDialog(true)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!dropdownToDelete) return

    try {
      await dispatch(deleteCustomDropdown(dropdownToDelete.dropdown_id)).unwrap()
      setShowDeleteDialog(false)
      setDropdownToDelete(null)
    } catch (error) {
      // Error handling is done in the Redux slice
    }
  }

  return (
    <>
      <PageTitle breadcrumbs={[
        {
          title: 'Home',
          path: '/',
          isActive: false,
        },
        {
          title: 'Platform Settings',
          path: '/settings',
          isActive: false,
        },
        {
          title: 'Custom Filters',
          path: '/customfilters',
          isActive: true,
        },
      ]}>
        Custom Filters
      </PageTitle>

      {/* Welcome Banner */}
      <div className='welcome-section'>
              <div className='welcome-content'>
                <div className='welcome-text'>
                  <h2 className='welcome-title'>
                    Custom Filters
                  </h2>
                  <p className='welcome-subtitle'>
                    Create and manage custom dropdown filters for your content
                  </p>
                </div>
                <div className='welcome-actions'>
                  <Button
                    variant='light'
                    onClick={handleCreateDropdown}
                    disabled={loading}
                  >
                    <i className='fas fa-plus me-2'></i>
                    Create Filter
                  </Button>
                </div>
              </div>
            </div>

            <KTCard>
              <Card.Header>
                <h3 className='card-title'>Custom Dropdowns ({dropdowns.length})</h3>
              </Card.Header>
              <Card.Body>
                {loading && dropdowns.length === 0 ? (
                  <div className='text-center py-4'>
                    <div className='spinner-border text-primary' role='status'>
                      <span className='visually-hidden'>Loading...</span>
                    </div>
                    <p className='mt-2'>Loading custom dropdowns...</p>
                  </div>
                ) : dropdowns.length === 0 ? (
                  <div className='text-center py-4'>
                    <i className='fas fa-filter text-muted fs-1 mb-3'></i>
                    <h5 className='text-muted'>No Custom Dropdowns</h5>
                    <p className='text-muted'>Create your first custom dropdown to get started.</p>
                    <Button variant='primary' onClick={handleCreateDropdown}>
                      <i className='fas fa-plus me-2'></i>
                      Create Your First Dropdown
                    </Button>
                  </div>
                ) : (
                  <div className='row'>
                    {dropdowns.map((dropdown) => (
                      <div key={dropdown.dropdown_id} className='col-md-6 col-lg-4 mb-4'>
                        <Card>
                          <Card.Body>
                            <div className='d-flex justify-content-between align-items-start mb-3'>
                              <div>
                                <h5 
                                  className='card-title mb-1' 
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleEditDropdown(dropdown)}
                                >
                                  {dropdown.name}
                                </h5>
                                {dropdown.description && (
                                  <p className='text-muted small mb-2'>{dropdown.description}</p>
                                )}
                              </div>
                              <div className='dropdown'>
                                <Button
                                  variant='outline-secondary'
                                  size='sm'
                                  data-bs-toggle='dropdown'
                                >
                                  <i className='fas fa-ellipsis-v'></i>
                                </Button>
                                <ul className='dropdown-menu'>
                                  <li>
                                    <button 
                                      className='dropdown-item'
                                      onClick={() => handleEditDropdown(dropdown)}
                                    >
                                      <i className='fas fa-edit me-2'></i>Edit
                                    </button>
                                  </li>
                                  <li>
                                    <button 
                                      className='dropdown-item text-danger'
                                      onClick={() => handleDeleteClick(dropdown)}
                                    >
                                      <i className='fas fa-trash me-2'></i>Delete
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </div>
                            <div className='d-flex justify-content-between align-items-center'>
                              <span className='badge bg-primary text-white'>
                                {dropdown.options.length} options
                              </span>
                              <small className='text-muted'>
                                {formatApiTimestamp(dropdown.created_at, { format: 'custom' })}
                              </small>
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </KTCard>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingDropdown ? 'Edit Custom Dropdown' : 'Create Custom Dropdown'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className='mb-3'>
              <Form.Label>Dropdown Name *</Form.Label>
              <Form.Control
                type='text'
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder='Enter dropdown name'
              />
            </div>
            
            <div className='mb-3'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder='Enter dropdown description'
              />
            </div>
            
            <div className='mb-3'>
              <Form.Label>Appear on *</Form.Label>
              <div style={{minWidth: '250px'}}>
                <Select
                  isMulti
                  options={[
                    { value: PAGE_TYPES.QUESTION_LIST, label: 'Question List' },
                    { value: PAGE_TYPES.EXERCISE_LIST, label: 'Exercise List' },
                    { value: PAGE_TYPES.VIDEO_LIST, label: 'Video List' }
                  ]}
                  value={formData.display_locations.map(location => ({
                    value: location,
                    label: getPageTypeName(location as PageType)
                  }))}
                  onChange={(selectedOptions) => {
                    if (!selectedOptions) {
                      handleFormChange('display_locations', [])
                    } else {
                      const selectedValues = selectedOptions.map((option: any) => option.value)
                      handleFormChange('display_locations', selectedValues)
                    }
                  }}
                  placeholder="Select page types..."
                  noOptionsMessage={() => "No page types available"}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  menuPortalTarget={document.body}
                  styles={{
                    menuPortal: (provided) => ({
                      ...provided,
                      zIndex: 9999
                    })
                  }}
                />
              </div>
              <Form.Text className='text-muted'>
                Select one or more page types where this dropdown should appear
              </Form.Text>
            </div>
            
            <div className='mb-3'>
              <div className='d-flex justify-content-between align-items-center mb-2'>
                <Form.Label>Options *</Form.Label>
                <Button variant='outline-primary' size='sm' onClick={addOption}>
                  <i className='fas fa-plus me-1'></i>Add Option
                </Button>
              </div>
              
              {formData.options.map((option, index) => (
                <div key={index} className='border rounded p-3 mb-3'>
                  <div className='row'>
                    <div className='col-md-6'>
                      <Form.Label>Tag Option</Form.Label>
                      <Form.Select
                        value={option.option_value}
                        onChange={(e) => {
                          const selectedTag = tagOptions.find(tag => tag.option_value === e.target.value)
                          if (selectedTag) {
                            handleTagOptionSelect(index, selectedTag)
                          }
                        }}
                      >
                        <option value=''>Select a tag option...</option>
                        {tagOptions
                          .filter(tagOption => {
                            // Filter out tags that are already selected in other options
                            return !formData.options.some((otherOption, otherIndex) => 
                              otherIndex !== index && otherOption.option_value === tagOption.option_value
                            )
                          })
                          .map((tagOption) => (
                            <option key={tagOption.option_value} value={tagOption.option_value}>
                              {tagOption.display_text}
                            </option>
                          ))}
                      </Form.Select>
                    </div>
                    <div className='col-md-5'>
                      <Form.Label>Display Text</Form.Label>
                      <Form.Control
                        type='text'
                        value={option.display_text}
                        onChange={(e) => handleOptionChange(index, 'display_text', e.target.value)}
                        placeholder='Enter display text'
                      />
                      <Form.Text className='text-muted'>
                        You may change how this option appears to users
                      </Form.Text>
                    </div>
                    <div className='col-md-1 d-flex align-items-end'>
                      <Button
                        variant='outline-danger'
                        size='sm'
                        onClick={() => removeOption(index)}
                      >
                        <i className='fas fa-trash'></i>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {formData.options.length === 0 && (
                <div className='text-center py-4 text-muted'>
                  <i className='fas fa-plus-circle fs-1 mb-2'></i>
                  <p>No options added yet. Click "Add Option" to get started.</p>
                </div>
              )}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant='primary' onClick={handleSaveDropdown} disabled={loading}>
            {loading ? (
              <>
                <span className='spinner-border spinner-border-sm me-2' role='status'></span>
                Saving...
              </>
            ) : (
              editingDropdown ? 'Update Dropdown' : 'Create Dropdown'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        show={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${dropdownToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  )
}

export default CustomFiltersPage 