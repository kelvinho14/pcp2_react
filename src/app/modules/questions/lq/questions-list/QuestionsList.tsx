import { ListViewProvider, useListView } from './core/ListViewProvider'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { QuestionsListHeader } from './components/header/QuestionsListHeader'
import { QuestionsTable } from './table/QuestionsTable'
import { KTCard } from '../../../../../_metronic/helpers'
import { PageLink, PageTitle } from '../../../../../_metronic/layout/core'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../../../../store'
import { fetchCustomDropdownsByLocation } from '../../../../../store/customDropdowns/customDropdownsSlice'
import Select from 'react-select'
import clsx from 'clsx'


const questionsListBreadcrumbs: Array<PageLink> = [
  {
    title: 'Home',
    path: '/dashboard',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'Long Questions Bank',
    path: '/questions/lq/list',
    isSeparator: false,
    isActive: true,
  }
]

const QuestionsList = () => {
  const { itemIdForUpdate } = useListView()
  const [search, setSearch] = useState('')
  const [selectedLogic, setSelectedLogic] = useState<'and' | 'or'>('and')
  const [showTagFilter, setShowTagFilter] = useState(false)
  const [selectedCustomDropdowns, setSelectedCustomDropdowns] = useState<Record<string, string[]>>({})
  
  const dispatch = useDispatch<AppDispatch>()
  const { dropdownsByLocation, dropdownsByLocationLoading } = useSelector((state: RootState) => state.customDropdowns)

  // Fetch custom dropdowns on component mount
  useEffect(() => {
    dispatch(fetchCustomDropdownsByLocation(1)) // 1 = QuestionList
  }, [dispatch])

  const handleLogicChange = (logic: 'and' | 'or') => {
    setSelectedLogic(logic)
  }

  const handleCustomDropdownChange = (dropdownId: string, selectedOptions: any) => {
    const optionValues = selectedOptions ? selectedOptions.map((option: any) => option.value) : []
    setSelectedCustomDropdowns(prev => ({
      ...prev,
      [dropdownId]: optionValues
    }))
  }

  // Get custom dropdowns for this location
  const customDropdowns = useMemo(() => dropdownsByLocation[1] || [], [dropdownsByLocation])
  const customDropdownsLoading = useMemo(() => dropdownsByLocationLoading[1] || false, [dropdownsByLocationLoading])

  // Combine all selected filters (custom dropdowns only)
  const getAllSelectedFilters = useCallback(() => {
    const allFilters: string[] = []
    
    // Add custom dropdown selections
    Object.values(selectedCustomDropdowns).forEach(dropdownSelections => {
      allFilters.push(...dropdownSelections)
    })
    
    return allFilters
  }, [selectedCustomDropdowns])

  // Memoize the combined filters to prevent infinite re-renders
  const combinedFilters = useMemo(() => getAllSelectedFilters(), [getAllSelectedFilters])

  return (
    <>
      <PageTitle breadcrumbs={questionsListBreadcrumbs}>
        Long Questions Bank
      </PageTitle>
      
      {/* Welcome Banner */}
      <div className='welcome-section'>
        <div className='welcome-content'>
          <div className='welcome-text'>
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
        
        {/* Custom Dropdown Filters */}
        {showTagFilter && (
          <div className='custom-filter-section mt-3 d-flex justify-content-end'>
            <div className='d-flex align-items-center gap-3 flex-wrap'>
              {/* Custom Dropdowns */}
              {customDropdowns.map((dropdown) => (
                <div key={dropdown.dropdown_id} className='d-flex align-items-center gap-2'>
                  <label htmlFor={`custom-${dropdown.dropdown_id}`} className='form-label mb-0 text-white-50' style={{ fontSize: '0.875rem' }}>
                    {dropdown.name}:
                  </label>
                  <div style={{ width: '180px' }}>
                    <Select
                      id={`custom-${dropdown.dropdown_id}`}
                      options={dropdown.options.map((option) => ({
                        value: option.option_value,
                        label: option.display_text
                      }))}
                      isMulti
                      onChange={(selectedOptions) => handleCustomDropdownChange(dropdown.dropdown_id, selectedOptions)}
                      placeholder='Select...'
                      isLoading={customDropdownsLoading}
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
              ))}
              
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
            selectedTags={combinedFilters} 
            tagLogic={selectedLogic}
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