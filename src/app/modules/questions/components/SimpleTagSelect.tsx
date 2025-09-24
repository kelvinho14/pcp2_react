import React, { FC } from 'react'
import CreatableSelect from 'react-select/creatable'
import { Tag } from '../../../../store/tags/tagsSlice'

export interface SimpleTagData {
  id: string
  name: string
}

export interface SimpleTagSelectProps {
  options: Tag[]
  selectedTags: SimpleTagData[]
  onChange: (tags: SimpleTagData[]) => void
  placeholder?: string
  className?: string
}

const SimpleTagSelect: FC<SimpleTagSelectProps> = ({ 
  options, 
  selectedTags, 
  onChange, 
  placeholder = "Search and select existing tags...",
  className 
}) => {

  const handleAddExistingTag = (selectedOption: any) => {
    if (selectedOption && !selectedTags.find(t => t.id === selectedOption.value)) {
      const newTag: SimpleTagData = {
        id: selectedOption.value,
        name: selectedOption.label
      }
      onChange([...selectedTags, newTag])
    }
  }

  const handleCreateTag = (inputValue: string) => {
    const trimmedValue = inputValue.trim()
    if (trimmedValue && 
        trimmedValue.length >= 2 && 
        trimmedValue.length <= 50 &&
        !selectedTags.find(t => t.name.toLowerCase() === trimmedValue.toLowerCase())) {
      const newTag: SimpleTagData = {
        id: `temp-${Date.now()}`,
        name: trimmedValue
      }
      onChange([...selectedTags, newTag])
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
      <div className="mb-3">
        <CreatableSelect
          options={availableOptions}
          onChange={handleAddExistingTag}
          onCreateOption={handleCreateTag}
          placeholder={placeholder}
          isClearable
          isSearchable
          className={className}
          classNamePrefix="react-select"
          value={null}
          noOptionsMessage={() => "No tags found"}
          formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
        />
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="d-flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="badge badge-light-primary d-flex align-items-center gap-1 fs-7"
            >
              <span>{tag.name}</span>
              <button
                type="button"
                className="btn btn-icon btn-sm btn-light-primary p-0 ms-1"
                onClick={() => handleRemoveTag(tag.id)}
                aria-label={`Remove ${tag.name} tag`}
              >
                <i className="fas fa-times fs-8"></i>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default SimpleTagSelect
