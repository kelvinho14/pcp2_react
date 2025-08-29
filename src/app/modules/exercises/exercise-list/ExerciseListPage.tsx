import {FC, useState, useEffect} from 'react'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {KTCard} from '../../../../_metronic/helpers'
import {ExercisesListHeader} from './components/header/ExercisesListHeader'
import {ExercisesTable} from './table/ExercisesTable'
import {ListViewProvider} from './core/ListViewProvider'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../../store'
import {fetchTags} from '../../../../store/tags/tagsSlice'
import Select from 'react-select'
import clsx from 'clsx'


const exercisesListBreadcrumbs: Array<PageLink> = [
  {
    title: 'Home',
    path: '/dashboard',
    isSeparator: false,
    isActive: false,
  },
]

const ExerciseListPage: FC = () => {
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagLogic, setTagLogic] = useState<'and' | 'or'>('and')
  const [selectedLogic, setSelectedLogic] = useState<'and' | 'or'>('and')
  const [showTagFilter, setShowTagFilter] = useState(false)
  
  const dispatch = useDispatch<AppDispatch>()
  const {tags, loading: tagsLoading} = useSelector((state: RootState) => state.tags)

  // Fetch tags on component mount
  useEffect(() => {
    dispatch(fetchTags())
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
      <PageTitle breadcrumbs={exercisesListBreadcrumbs}>
        Exercises List
      </PageTitle>
      
      {/* Welcome Banner */}
      <div className='welcome-section'>
        <div className='welcome-content'>
          <div className='welcome-text'>
            <h2 className='welcome-title'>
              Exercises Management Hub! 📚
            </h2>
            <p className='welcome-subtitle'>
              Create, manage, and assign exercises with questions to your students
            </p>
          </div>
          <div className='welcome-actions'>
            <button 
              className='btn btn-light-primary me-3'
              onClick={() => window.location.href = '/exercises/create'}
            >
              <i className='fas fa-plus me-1'></i>
              Create Exercise
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
                <label htmlFor='exercise-tag-filter' className='form-label mb-0 text-white-50' style={{ fontSize: '0.875rem' }}>Tags:</label>
                <div style={{ width: '180px' }}>
                  <Select
                    id='exercise-tag-filter'
                    options={tags.map((tag: any) => ({
                      value: tag.id,
                      label: tag.name
                    }))}
                    isMulti
                    onChange={handleTagChange}
                    placeholder='Select...'
                    isLoading={tagsLoading}
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
                    name='exerciseTagLogic'
                    id='exerciseTagLogicAnd'
                    value='and'
                    checked={selectedLogic === 'and'}
                    onChange={() => handleLogicChange('and')}
                  />
                  <label className={clsx('btn btn-sm', selectedLogic === 'and' ? 'btn-light-primary' : 'btn-outline-light')} htmlFor='exerciseTagLogicAnd'>
                    AND
                  </label>
                  <input
                    type='radio'
                    className='btn-check'
                    name='exerciseTagLogic'
                    id='exerciseTagLogicOr'
                    value='or'
                    checked={selectedLogic === 'or'}
                    onChange={() => handleLogicChange('or')}
                  />
                  <label className={clsx('btn btn-sm', selectedLogic === 'or' ? 'btn-light-primary' : 'btn-outline-light')} htmlFor='exerciseTagLogicOr'>
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
          <ExercisesListHeader setSearch={setSearch} />
        </ListViewProvider>
        <ExercisesTable 
          search={search} 
          selectedTags={selectedTags} 
          tagLogic={tagLogic}
        />
      </KTCard>
    </>
  )
}

export default ExerciseListPage 