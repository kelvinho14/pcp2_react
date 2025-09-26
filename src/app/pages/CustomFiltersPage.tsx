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
  reorderCustomDropdowns,
  CustomDropdown,
  TagOption,
  CreateDropdownPayload,
  CustomDropdownOption
} from '../../store/customDropdowns/customDropdownsSlice'
import { PAGE_TYPES, getPageTypeName, PageType } from '../constants/pageTypes'
import { formatApiTimestamp } from '../../_metronic/helpers/dateUtils'
import { ConfirmationDialog } from '../../_metronic/helpers/ConfirmationDialog'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Sortable Dropdown Card Component
interface SortableDropdownCardProps {
  dropdown: CustomDropdown
  index: number
  onEdit: (dropdown: CustomDropdown) => void
  onDelete: (dropdown: CustomDropdown) => void
}

const SortableDropdownCard: FC<SortableDropdownCardProps> = ({
  dropdown,
  index,
  onEdit,
  onDelete
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dropdown.dropdown_id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    position: isDragging ? 'relative' : 'static',
  }

  return (
    <div ref={setNodeRef} style={style} className='col-md-6 col-lg-4 mb-4'>
      <Card>
        <Card.Body className='p-3'>
          <div className='d-flex justify-content-between align-items-start mb-3'>
            <div className='flex-grow-1'>
              <div 
                className='d-flex align-items-center mb-2'
                {...attributes}
                {...listeners}
                style={{ cursor: 'grab' }}
              >
                <i className='fas fa-grip-vertical text-muted me-2'></i>
                <h5 
                  className='card-title mb-1 fw-bold me-2' 
                  style={{ cursor: 'pointer' }}
                  onClick={() => onEdit(dropdown)}
                >
                  {dropdown.name}
                </h5>
                <span className='badge bg-primary text-white'>
                  {dropdown.options.length} option{dropdown.options.length !== 1 ? 's' : ''}
                </span>
              </div>
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
                    onClick={() => onEdit(dropdown)}
                  >
                    <i className='fas fa-edit me-2'></i>Edit
                  </button>
                </li>
                <li>
                  <button 
                    className='dropdown-item text-danger'
                    onClick={() => onDelete(dropdown)}
                  >
                    <i className='fas fa-trash me-2'></i>Delete
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <div className='d-flex align-items-center'>
            <span className='text-muted small me-2'>Pages:</span>
            <div className='d-flex flex-wrap gap-1'>
              {dropdown.display_locations.map((location, idx) => (
                <span key={idx} className='badge bg-light text-dark'>
                  {getPageTypeName(location as PageType)}
                </span>
              ))}
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

// Sortable Option Component
interface SortableOptionProps {
  option: CustomDropdownOption
  index: number
  tagOptions: TagOption[]
  allOptions: CustomDropdownOption[]
  onOptionChange: (index: number, field: keyof CustomDropdownOption, value: any) => void
  onRemoveOption: (index: number) => void
}

const SortableOption: FC<SortableOptionProps> = ({
  option,
  index,
  tagOptions,
  allOptions,
  onOptionChange,
  onRemoveOption
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.option_value })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    position: isDragging ? 'relative' : 'static',
  }

  return (
    <div ref={setNodeRef} style={style} className='border rounded p-3 mb-3'>
      <div className='d-flex align-items-center mb-2'>
        <div 
          className='me-2 cursor-pointer'
          {...attributes}
          {...listeners}
          style={{ cursor: 'grab' }}
        >
          <i className='fas fa-grip-vertical text-muted'></i>
        </div>
        <div className='flex-grow-1'>
          <span className='text-muted small'>Option {index + 1}</span>
        </div>
        <Button
          variant='outline-danger'
          size='sm'
          onClick={() => onRemoveOption(index)}
        >
          <i className='fas fa-trash'></i>
        </Button>
      </div>
      
      <div className='row'>
        <div className='col-12'>
          <Form.Label>Display Text</Form.Label>
          <Form.Control
            type='text'
            value={option.display_text || ''}
            onChange={(e) => onOptionChange(index, 'display_text', e.target.value)}
            placeholder='Enter display text...'
          />
          <Form.Text className='text-muted'>
            You may change how this option appears to users
          </Form.Text>
        </div>
      </div>
    </div>
  )
}

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
    is_active: true,
    options: []
  })
  const [selectedMasterTags, setSelectedMasterTags] = useState<TagOption[]>([])

  // Drag and drop state
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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



  // Remove option
  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index).map((option, i) => ({
        ...option,
        sort_order: i
      }))
    }))
  }

  // Get available tags (excluding already selected ones)
  const getAvailableTags = () => {
    const selectedTagValues = formData.options.map(option => option.option_value)
    return tagOptions.filter(tag => !selectedTagValues.includes(tag.option_value))
  }

  // Add selected tags from master dropdown
  const handleAddSelectedTags = () => {
    if (selectedMasterTags.length === 0) {
      toast.error('Please select at least one tag to add')
      return
    }

    const newOptions: CustomDropdownOption[] = selectedMasterTags.map((tag, index) => ({
      option_type: 1,
      option_value: tag.option_value,
      display_text: tag.display_text,
      sort_order: formData.options.length + index
    }))

    setFormData(prev => ({
      ...prev,
      options: [...prev.options, ...newOptions]
    }))

    // Clear the master selection
    setSelectedMasterTags([])
  }


  // Handle create dropdown
  const handleCreateDropdown = () => {
    setEditingDropdown(null)
    setFormData({
      name: '',
      description: '',
      display_locations: [], // No default selection
      is_active: true,
      options: []
    })
    setSelectedMasterTags([])
    setShowModal(true)
  }

  // Handle edit dropdown
  const handleEditDropdown = (dropdown: CustomDropdown) => {
    setEditingDropdown(dropdown)
    setFormData({
      name: dropdown.name,
      description: dropdown.description || '',
      display_locations: dropdown.display_locations || [],
      is_active: dropdown.is_active,
      options: dropdown.options.map((option, index) => ({
        ...option,
        sort_order: option.sort_order !== undefined ? option.sort_order : index
      }))
    })
    setSelectedMasterTags([])
    setShowModal(true)
  }

  // Handle save dropdown
  const handleSaveDropdown = async () => {
    if (!formData.name.trim()) {
      toast.error('Dropdown name is required')
      return
    }


    if (formData.options.length === 0) {
      toast.error('At least one option is required')
      return
    }

    // Check that at least one option has a valid tag selection
    const validOptions = formData.options.filter(option => 
      option.option_value && option.option_value.trim() !== ''
    )
    
    if (validOptions.length === 0) {
      toast.error('Please add at least one option with a valid tag selection')
      return
    }

    // Ensure sort_order is properly set as integers and filter out database fields
    // Only include valid options (those with option_value filled)
    const validOptionsWithSortOrder = validOptions.map((option, index) => ({
      option_type: option.option_type,
      option_value: option.option_value,
      display_text: option.display_text,
      sort_order: typeof option.sort_order === 'number' ? option.sort_order : index
    }))

    const payload = {
      name: formData.name,
      description: formData.description,
      display_locations: formData.display_locations,
      is_active: true, // Always set to true for active dropdowns
      options: validOptionsWithSortOrder
    }

    // Debug: Log the data being sent
    console.log('Sending formData:', JSON.stringify(payload, null, 2))
    console.log('Options with sort_order:', payload.options.map(opt => ({
      ...opt,
      sort_order: opt.sort_order,
      sort_order_type: typeof opt.sort_order
    })))

    try {
      if (editingDropdown) {
        await dispatch(updateCustomDropdown({ 
          dropdownId: editingDropdown.dropdown_id, 
          payload: payload 
        })).unwrap()
      } else {
        await dispatch(createCustomDropdown(payload)).unwrap()
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

  // Drag and drop handlers
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = formData.options.findIndex(option => option.option_value === active.id)
    const newIndex = formData.options.findIndex(option => option.option_value === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOptions = arrayMove(formData.options, oldIndex, newIndex)
      
      // Update sort_order for all options
      const updatedOptions = newOptions.map((option, index) => ({
        ...option,
        sort_order: index
      }))

      setFormData(prev => ({
        ...prev,
        options: updatedOptions
      }))
    }
  }

  // Handle drag start for dropdowns
  const handleDropdownDragStart = (event: any) => {
    setActiveDropdownId(event.active.id)
  }

  // Handle drag end for dropdowns
  const handleDropdownDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      setActiveDropdownId(null)
      return
    }

    const oldIndex = dropdowns.findIndex(dropdown => dropdown.dropdown_id === active.id)
    const newIndex = dropdowns.findIndex(dropdown => dropdown.dropdown_id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      // Create reorder payload with items wrapper based on current order
      const reorderData = {
        items: dropdowns.map((dropdown, index) => ({
          dropdown_id: dropdown.dropdown_id,
          sort_order: index
        }))
      }

      // Update the sort_order for the moved items
      reorderData.items[oldIndex].sort_order = newIndex
      reorderData.items[newIndex].sort_order = oldIndex

      // Call API to update order
      try {
        console.log('Sending reorder data:', reorderData)
        const result = await dispatch(reorderCustomDropdowns(reorderData)).unwrap()
        console.log('Reorder API response:', result)
        // The Redux state will be updated with the API response
      } catch (error) {
        // Error handling is done in the thunk
        console.error('Failed to reorder dropdowns:', error)
      }
    }

    setActiveDropdownId(null)
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
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDropdownDragStart}
                    onDragEnd={handleDropdownDragEnd}
                  >
                    <SortableContext
                      items={dropdowns.map(dropdown => dropdown.dropdown_id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className='row'>
                        {dropdowns.map((dropdown, index) => (
                          <SortableDropdownCard
                            key={dropdown.dropdown_id}
                            dropdown={dropdown}
                            index={index}
                            onEdit={handleEditDropdown}
                            onDelete={handleDeleteClick}
                          />
                        ))}
                      </div>
                    </SortableContext>
                    <DragOverlay>
                      {activeDropdownId ? (
                        (() => {
                          const dropdown = dropdowns.find(d => d.dropdown_id === activeDropdownId)
                          return dropdown ? (
                            <SortableDropdownCard
                              dropdown={dropdown}
                              index={dropdowns.findIndex(d => d.dropdown_id === activeDropdownId)}
                              onEdit={handleEditDropdown}
                              onDelete={handleDeleteClick}
                            />
                          ) : null
                        })()
                      ) : null}
                    </DragOverlay>
                  </DndContext>
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
              <Form.Label>Add Tags as Options *</Form.Label>
              <div className='d-flex gap-2 mb-3 align-items-end'>
                <div className='flex-grow-1'>
                  <Select
                    isMulti
                    isSearchable
                    isClearable
                    value={selectedMasterTags}
                    onChange={(selected) => setSelectedMasterTags(selected as TagOption[])}
                    options={getAvailableTags()}
                    getOptionLabel={(option) => option.display_text}
                    getOptionValue={(option) => option.option_value}
                    placeholder="Search and select tags to add as options..."
                    noOptionsMessage={() => "No available tags"}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        minHeight: '38px',
                      }),
                    }}
                  />
                </div>
                <Button 
                  variant='primary' 
                  onClick={handleAddSelectedTags}
                  disabled={selectedMasterTags.length === 0}
                  style={{ height: '38px' }}
                >
                  <i className='fas fa-plus me-1'></i>Add Selected
                </Button>
              </div>
              
              {formData.options.length > 0 && (
                <div className='mb-3'>
                  <Form.Label>Current Options</Form.Label>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={formData.options.map(option => option.option_value)}
                      strategy={verticalListSortingStrategy}
                    >
                      {formData.options.map((option, index) => (
                        <SortableOption
                          key={option.option_value || index}
                          option={option}
                          index={index}
                          tagOptions={tagOptions}
                          allOptions={formData.options}
                          onOptionChange={handleOptionChange}
                          onRemoveOption={removeOption}
                        />
                      ))}
                    </SortableContext>
                    <DragOverlay>
                      {activeId ? (
                        (() => {
                          const option = formData.options.find(opt => opt.option_value === activeId)
                          return option ? (
                        <SortableOption
                          option={option}
                          index={formData.options.findIndex(opt => opt.option_value === activeId)}
                          tagOptions={tagOptions}
                          allOptions={formData.options}
                          onOptionChange={handleOptionChange}
                          onRemoveOption={removeOption}
                        />
                          ) : null
                        })()
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </div>
              )}
              
              {formData.options.length === 0 && (
                <div className='text-center py-4 text-muted'>
                  <i className='fas fa-tags fs-1 mb-2'></i>
                  <p>No options added yet. Select tags from the dropdown above and click "Add Selected" to get started.</p>
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