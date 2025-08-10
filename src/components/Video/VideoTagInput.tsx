import {FC, useState} from 'react'
import Select from 'react-select'
import {Tag} from '../../store/tags/tagsSlice'

// Video Tag Component (without scores)
export interface VideoTagData {
  id: string
  name: string
  isNew?: boolean
}

export interface VideoTagInputProps {
  options: Tag[]
  selectedTags: VideoTagData[]
  onChange: (tags: VideoTagData[]) => void
  placeholder?: string
  className?: string
}

const VideoTagInput: FC<VideoTagInputProps> = ({ 
  options, 
  selectedTags, 
  onChange, 
  placeholder = "Search and select existing tags...",
  className 
}) => {
  const [newTagName, setNewTagName] = useState('')
  const [showNewTagForm, setShowNewTagForm] = useState(false)
  const [selectedOption, setSelectedOption] = useState<any>(null)

  const handleAddExistingTag = (selectedOption: any) => {
    if (selectedOption && !selectedTags.find(t => t.id === selectedOption.value)) {
      const newTag: VideoTagData = {
        id: selectedOption.value,
        name: selectedOption.label
      }
      onChange([...selectedTags, newTag])
    }
    // Clear the dropdown after selection
    setSelectedOption(null)
  }

  const handleAddNewTag = () => {
    if (newTagName.trim()) {
      const newTag: VideoTagData = {
        id: `new-${newTagName.trim()}`,  // Use a prefix to distinguish new tags
        name: newTagName.trim(),
        isNew: true
      }
      onChange([...selectedTags, newTag])
      setNewTagName('')
      setShowNewTagForm(false)
    }
  }

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTags.filter(tag => tag.id !== tagId))
  }

  const availableOptions = options
    .filter(option => !selectedTags.find(tag => tag.id === option.id))
    .map(option => ({
      value: option.id,
      label: option.name
    }))

  return (
    <div className={className}>
      {/* Searchable Tag Dropdown */}
      {availableOptions.length > 0 && (
        <div className='mb-3'>
          <Select
            options={availableOptions}
            value={selectedOption}
            onChange={handleAddExistingTag}
            placeholder={placeholder}
            isClearable
            isSearchable
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
      )}

      {/* Add New Tag */}
      <div className='mb-3'>
        {!showNewTagForm ? (
          <button
            type='button'
            className='btn btn-outline-primary btn-sm'
            onClick={() => setShowNewTagForm(true)}
          >
            <i className='fas fa-plus me-1'></i>
            New Tag
          </button>
        ) : (
          <div className='border rounded p-3'>
            <div className='row g-2'>
              <div className='col-md-8'>
                <label className='form-label'>Tag Name:</label>
                <input
                  type='text'
                  className='form-control'
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder='Enter tag name'
                />
              </div>
              <div className='col-md-4 d-flex align-items-end'>
                <div className='d-flex gap-1'>
                  <button
                    type='button'
                    className='btn btn-primary btn-sm'
                    onClick={handleAddNewTag}
                    disabled={!newTagName.trim()}
                  >
                    Add
                  </button>
                  <button
                    type='button'
                    className='btn btn-secondary btn-sm'
                    onClick={() => {
                      setShowNewTagForm(false)
                      setNewTagName('')
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className='mb-3'>
          <label className='form-label'>Selected Tags:</label>
          <div className='d-flex flex-wrap gap-2'>
            {selectedTags.map(tag => (
              <span key={tag.id} className='badge badge-primary d-inline-flex align-items-center gap-1'>
                {tag.name}
                <button
                  type='button'
                  className='btn btn-sm p-0 border-0 bg-transparent text-white'
                  style={{fontSize: '0.75rem', lineHeight: '1'}}
                  onClick={() => handleRemoveTag(tag.id)}
                >
                  <i className='fas fa-times'></i>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoTagInput 