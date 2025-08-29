import { ListViewProvider, useListView } from './core/ListViewProvider'
import { useState, useEffect } from 'react'
import { QuestionsListHeader } from './components/header/QuestionsListHeader'
import { QuestionsTable } from './table/QuestionsTable'
import { KTCard } from '../../../../../_metronic/helpers'
import { PageLink, PageTitle } from '../../../../../_metronic/layout/core'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../../../../store'
import { fetchQuestionTags } from '../../../../../store/tags/tagsSlice'
import Select from 'react-select'
import clsx from 'clsx'
import '../../questions.css'

const questionsListBreadcrumbs: Array<PageLink> = [
  {
    title: 'Home',
    path: '/dashboard',
    isSeparator: false,
    isActive: false,
  }
]

const QuestionsList = () => {
  const { itemIdForUpdate } = useListView()
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagLogic, setTagLogic] = useState<'and' | 'or'>('and')
  const [selectedLogic, setSelectedLogic] = useState<'and' | 'or'>('and')
  const [showTagFilter, setShowTagFilter] = useState(false)
  
  const dispatch = useDispatch<AppDispatch>()
  const { questionTags, questionTagsLoading } = useSelector((state: RootState) => state.tags)

  // Fetch question tags on component mount
  useEffect(() => {
    dispatch(fetchQuestionTags('lq'))
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
    <>
      <PageTitle breadcrumbs={questionsListBreadcrumbs}>
        Long Questions
      </PageTitle>
      
      {/* Welcome Banner */}
      <div className='welcome-section'>
        <div className='welcome-content'>
          <div className='welcome-text'>
            <h2 className='welcome-title'>
              Long Questions Bank! 📝
            </h2>
            <p className='welcome-subtitle'>
              Create, manage, and assign long questions to an exercise and assign them to students
            </p>
          </div>
          <div className='welcome-actions'>
            <button 
              className='btn btn-light-primary me-3'
              onClick={() => window.location.href = '/questions/lq/create'}
            >
              <i className='fas fa-plus me-1'></i>
              Add Question
            </button>
            
            {/* Tag Filter */}
            <div className='d-flex align-items-center gap-2'>
              <button
                type='button'
                className='btn btn-light-dark btn-sm'
                onClick={() => setShowTagFilter(!showTagFilter)}
              >
                <i className={`fas fa-chevron-${showTagFilter ? 'up' : 'down'} me-2`}></i>
                Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Tag Filter Dropdown - Right Aligned */}
        {showTagFilter && (
          <div className='tag-filter-section mt-3 d-flex justify-content-end'>
            <div className='d-flex align-items-center gap-3 flex-wrap'>
              <div className='d-flex align-items-center gap-2'>
                <label htmlFor='lq-tag-filter' className='form-label mb-0 text-white-50' style={{ fontSize: '0.875rem' }}>Tags:</label>
                <div style={{ width: '180px' }}>
                  <Select
                    id='lq-tag-filter'
                    options={questionTags.map((tag: any) => ({
                      value: tag.tag_id,
                      label: `${tag.name} (${tag.usage_count})`
                    }))}
                    isMulti
                    onChange={handleTagChange}
                    placeholder='Select...'
                    isLoading={questionTagsLoading}
                    isClearable
                    isSearchable
                    styles={{
                      option: (provided, state) => ({
                        ...provided,
                        color: state.isSelected ? 'white' : '#000000',
                        backgroundColor: state.isSelected ? '#667eea' : state.isFocused ? '#f8f9fa' : 'white',
                      }),
                      menu: (provided) => ({
                        ...provided,
                        backgroundColor: 'white',
                      }),
                    }}
                  />
                </div>
              </div>
              
              <div className='d-flex align-items-center gap-2'>
                <span className='text-white-50' style={{ fontSize: '0.875rem' }}>Logic:</span>
                <div className='btn-group btn-group-sm' role='group'>
                  <input
                    type='radio'
                    className='btn-check'
                    name='lqTagLogic'
                    id='lqTagLogicAnd'
                    value='and'
                    checked={selectedLogic === 'and'}
                    onChange={() => handleLogicChange('and')}
                  />
                  <label className={clsx('btn btn-sm', selectedLogic === 'and' ? 'btn-light-primary' : 'btn-outline-light')} htmlFor='lqTagLogicAnd'>
                    AND
                  </label>
                  <input
                    type='radio'
                    className='btn-check'
                    name='lqTagLogic'
                    id='lqTagLogicOr'
                    value='or'
                    checked={selectedLogic === 'or'}
                    onChange={() => handleLogicChange('or')}
                  />
                  <label className={clsx('btn btn-sm', selectedLogic === 'or' ? 'btn-light-primary' : 'btn-outline-light')} htmlFor='lqTagLogicOr'>
                    OR
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <KTCard>
        <ListViewProvider>
          <QuestionsListHeader setSearch={setSearch} />
          <QuestionsTable 
            search={search} 
            selectedTags={selectedTags} 
            tagLogic={tagLogic}
          />
        </ListViewProvider>
      </KTCard>
    </>
  )
}

const QuestionsListWrapper = () => {
  return (
    <ListViewProvider>
      <QuestionsList />
    </ListViewProvider>
  )
}

export default QuestionsListWrapper 