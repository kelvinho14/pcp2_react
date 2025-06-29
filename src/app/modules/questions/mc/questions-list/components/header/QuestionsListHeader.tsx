import { useListView } from '../../core/ListViewProvider'
import { QuestionsListToolbar } from './QuestionsListToolbar'
import QuestionsListGrouping from './QuestionsListGrouping'
import { QuestionsListSearchComponent } from './QuestionsListSearchComponent'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../../../../../store'
import { fetchQuestionTags } from '../../../../../../../store/tags/tagsSlice'
import Select from 'react-select'

type Props = {
  setSearch: (value: string) => void
  setSelectedTags: (value: string[]) => void
  setTagLogic: (value: 'and' | 'or') => void
}

const QuestionsListHeader: React.FC<Props> = ({ setSearch, setSelectedTags, setTagLogic }) => {
  const { selected } = useListView()
  const dispatch = useDispatch<AppDispatch>()
  const { questionTags, questionTagsLoading } = useSelector((state: RootState) => state.tags)

  // Fetch question tags on component mount
  useEffect(() => {
    dispatch(fetchQuestionTags('mc'))
  }, [dispatch])

  const handleTagChange = (selectedOptions: any) => {
    const tagIds = selectedOptions ? selectedOptions.map((option: any) => option.value) : []
    setSelectedTags(tagIds)
  }

  const handleLogicChange = (logic: 'and' | 'or') => {
    setTagLogic(logic)
  }

  return (
    <div className='card-header border-0 pt-6'>
      <div className='d-flex flex-column gap-4'>
        {/* Tag Filter */}
        <div className='d-flex align-items-center gap-3'>
          <label htmlFor='tag-filter' className='form-label mb-0'>Filter by Tag:</label>
          <div style={{ minWidth: '300px' }}>
            <Select
              id='tag-filter'
              options={questionTags.map((tag: any) => ({
                value: tag.tag_id,
                label: `${tag.name} (${tag.usage_count})`
              }))}
              isMulti
              onChange={handleTagChange}
              placeholder='Select tags...'
              isLoading={questionTagsLoading}
              isClearable
              isSearchable
            />
          </div>
          
          {/* Logic Toggle */}
          <div className='d-flex align-items-center gap-2'>
            <span className='text-muted'>Logic:</span>
            <div className='btn-group btn-group-sm' role='group'>
              <input
                type='radio'
                className='btn-check'
                name='tagLogic'
                id='tagLogicAnd'
                value='and'
                defaultChecked
                onChange={() => handleLogicChange('and')}
              />
              <label className='btn btn-outline-primary' htmlFor='tagLogicAnd'>
                All (AND)
              </label>
              
              <input
                type='radio'
                className='btn-check'
                name='tagLogic'
                id='tagLogicOr'
                value='or'
                onChange={() => handleLogicChange('or')}
              />
              <label className='btn btn-outline-primary' htmlFor='tagLogicOr'>
                Any (OR)
              </label>
            </div>
          </div>
        </div>
        
        <QuestionsListSearchComponent setSearch={setSearch} />
      </div>
      
      <div className='card-toolbar'>
        {selected.length > 0 ? <QuestionsListGrouping /> : <QuestionsListToolbar />}
      </div>
    </div>
  )
}

export { QuestionsListHeader } 