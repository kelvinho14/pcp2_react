import { useListView } from '../../core/ListViewProvider'
import QuestionsListGrouping from './QuestionsListGrouping'
import { QuestionsListSearchComponent } from './QuestionsListSearchComponent'
import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../../../../../store'
import { fetchQuestionTags } from '../../../../../../../store/tags/tagsSlice'
import Select from 'react-select'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'

type Props = {
  setSearch: (value: string) => void
  setSelectedTags: (value: string[]) => void
  setTagLogic: (value: 'and' | 'or') => void
}

const QuestionsListHeader: React.FC<Props> = ({ setSearch, setSelectedTags, setTagLogic }) => {
  const { selected } = useListView()
  const dispatch = useDispatch<AppDispatch>()
  const { questionTags, questionTagsLoading } = useSelector((state: RootState) => state.tags)
  const [selectedLogic, setSelectedLogic] = useState<'and' | 'or'>('and')
  const [showTagFilter, setShowTagFilter] = useState(false)
  const navigate = useNavigate()
  const filterBtnRef = useRef<HTMLButtonElement>(null)

  // Fetch question tags on component mount
  useEffect(() => {
    dispatch(fetchQuestionTags('mc'))
  }, [dispatch])

  const handleTagChange = (selectedOptions: any) => {
    const tagIds = selectedOptions ? selectedOptions.map((option: any) => option.value) : []
    setSelectedTags(tagIds)
  }

  const handleLogicChange = (logic: 'and' | 'or') => {
    setSelectedLogic(logic)
    setTagLogic(logic)
  }

  return (
    <div className='card-header border-0 pt-6 d-block'>
      <div className='d-flex flex-column gap-2'>
        <div className='d-flex align-items-center justify-content-between gap-3'>
          <QuestionsListSearchComponent setSearch={setSearch} />
          <button
            type='button'
            className='btn btn-sm btn-primary'
            onClick={() => navigate('/questions/mc/create')}
          >
            <i className='fas fa-plus me-1'></i>
            Create New MC
          </button>
        </div>
        <div className='d-flex justify-content-end align-items-center'>
          <button
            ref={filterBtnRef}
            type='button'
            className='btn btn-sm btn-light-primary'
            data-kt-menu-trigger='click'
            data-kt-menu-placement='bottom-end'
            data-kt-menu-flip='bottom'
          >
            <i className={`fas fa-chevron-down me-2`}></i>
            Filter by Tag
          </button>
          {/* Floating filter dropdown */}
          <div className='menu menu-sub menu-sub-dropdown w-420px p-5' data-kt-menu='true'>
            <div className='d-flex align-items-center gap-4'>
              <label htmlFor='tag-filter' className='form-label mb-0'>Filter by Tag:</label>
              <div style={{ minWidth: '220px', flex: 1 }}>
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
              <span className='text-muted ms-2'>Logic:</span>
              <div className='btn-group btn-group-sm ms-1' role='group'>
                <input
                  type='radio'
                  className='btn-check'
                  name='tagLogic'
                  id='tagLogicAnd'
                  value='and'
                  checked={selectedLogic === 'and'}
                  onChange={() => handleLogicChange('and')}
                />
                <label className={clsx('btn', selectedLogic === 'and' ? 'btn-light-primary' : 'btn-outline-primary')} htmlFor='tagLogicAnd'>
                  All (AND)
                </label>
                <input
                  type='radio'
                  className='btn-check'
                  name='tagLogic'
                  id='tagLogicOr'
                  value='or'
                  checked={selectedLogic === 'or'}
                  onChange={() => handleLogicChange('or')}
                />
                <label className={clsx('btn', selectedLogic === 'or' ? 'btn-light-primary' : 'btn-outline-primary')} htmlFor='tagLogicOr'>
                  Any (OR)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='card-toolbar'>
        {selected.length > 0 ? <QuestionsListGrouping /> : null}
      </div>
    </div>
  )
}

export { QuestionsListHeader } 