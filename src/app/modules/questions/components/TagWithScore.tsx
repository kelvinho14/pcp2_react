import {FC, useState} from 'react'
import Select from 'react-select'
import {Tag} from '../../../../store/tags/tagsSlice'

// Tag with Score Component
export interface TagWithScoreData {
  id: string
  name: string
  score: number
  isNew?: boolean
}

export interface TagWithScoreProps {
  options: Tag[]
  selectedTags: TagWithScoreData[]
  onChange: (tags: TagWithScoreData[]) => void
  placeholder?: string
  className?: string
}

const TagWithScore: FC<TagWithScoreProps> = ({ 
  options, 
  selectedTags, 
  onChange, 
  placeholder = "Search and select existing tags...",
  className 
}) => {
  const [newTagName, setNewTagName] = useState('')
  const [newTagScore, setNewTagScore] = useState(0)
  const [showNewTagForm, setShowNewTagForm] = useState(false)
  const [selectedOption, setSelectedOption] = useState<any>(null)

  const handleAddExistingTag = (selectedOption: any) => {
    if (selectedOption && !selectedTags.find(t => t.id === selectedOption.value)) {
      const newTag: TagWithScoreData = {
        id: selectedOption.value,
        name: selectedOption.label,
        score: 0
      }
      onChange([...selectedTags, newTag])
    }
    // Clear the dropdown after selection
    setSelectedOption(null)
  }

  const handleAddNewTag = () => {
    if (newTagName.trim() && newTagScore >= 0) {
      const newTag: TagWithScoreData = {
        id: `temp-${Date.now()}`,
        name: newTagName.trim(),
        score: newTagScore,
        isNew: true
      }
      onChange([...selectedTags, newTag])
      setNewTagName('')
      setNewTagScore(0)
      setShowNewTagForm(false)
    }
  }

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTags.filter(tag => tag.id !== tagId))
  }

  const handleUpdateScore = (tagId: string, newScore: number) => {
    onChange(selectedTags.map(tag => 
      tag.id === tagId ? { ...tag, score: newScore } : tag
    ))
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
              <div className='col-md-6'>
                <label className='form-label'>Tag Name:</label>
                <input
                  type='text'
                  className='form-control'
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder='Enter tag name'
                />
              </div>
              <div className='col-md-3'>
                <label className='form-label'>Score:</label>
                <input
                  type='number'
                  min='0'
                  className='form-control'
                  value={newTagScore}
                  onChange={(e) => setNewTagScore(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className='col-md-3 d-flex align-items-end'>
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
                      setNewTagScore(0)
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
          <div>
            {selectedTags.map(tag => (
              <div key={tag.id} className='d-flex align-items-center gap-2 mb-2 p-2 border rounded'>
                <span className='badge badge-primary'>{tag.name}</span>
                <div className='d-flex align-items-center gap-1'>
                  <label className='form-label mb-0 me-1'>Score:</label>
                  <input
                    type='number'
                    min='0'
                    value={tag.score}
                    onChange={(e) => handleUpdateScore(tag.id, parseInt(e.target.value) || 0)}
                    className='form-control form-control-sm'
                    style={{ width: '60px' }}
                  />
                </div>
                <button
                  type='button'
                  className='btn btn-sm btn-outline-danger'
                  onClick={() => handleRemoveTag(tag.id)}
                >
                  <i className='fas fa-times'></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TagWithScore 