import {FC, useState, useEffect, useMemo, useCallback} from 'react'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {KTCard} from '../../../../_metronic/helpers'
import {ExercisesListHeader} from './components/header/ExercisesListHeader'
import {ExercisesTable} from './table/ExercisesTable'
import {ListViewProvider} from './core/ListViewProvider'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../../store'
import {fetchExerciseTypes} from '../../../../store/exercise/exerciseSlice'
import {fetchCustomDropdownsByLocation} from '../../../../store/customDropdowns/customDropdownsSlice'
import Select from 'react-select'
import clsx from 'clsx'


const exercisesListBreadcrumbs: Array<PageLink> = [
  {
    title: 'Home',
    path: '/dashboard',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'Exercise List',
    path: '/exercises/list',
    isSeparator: false,
    isActive: true,
  },
]

const ExerciseListPage: FC = () => {
  const [search, setSearch] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [showTypeFilter, setShowTypeFilter] = useState(false)
  const [statusFilter, setStatusFilter] = useState<number | ''>('')
  const [selectedLogic, setSelectedLogic] = useState<'and' | 'or'>('and')
  const [selectedCustomDropdowns, setSelectedCustomDropdowns] = useState<Record<string, string[]>>({})
  
  const dispatch = useDispatch<AppDispatch>()
  const {exerciseTypes, loading: exerciseTypesLoading} = useSelector((state: RootState) => state.exercise)
  const { dropdownsByLocation, dropdownsByLocationLoading } = useSelector((state: RootState) => state.customDropdowns)

  // Fetch exercise types and custom dropdowns on component mount
  useEffect(() => {
    dispatch(fetchExerciseTypes())
    dispatch(fetchCustomDropdownsByLocation(2)) // 2 = ExerciseList
  }, [dispatch])

  const handleTypeChange = (selectedOptions: any) => {
    const typeIds = selectedOptions ? selectedOptions.map((option: any) => option.value) : []
    setSelectedTypes(typeIds)
  }

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
  const customDropdowns = useMemo(() => dropdownsByLocation[2] || [], [dropdownsByLocation])
  const customDropdownsLoading = useMemo(() => dropdownsByLocationLoading[2] || false, [dropdownsByLocationLoading])

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

  // Reset page when filters change
  useEffect(() => {
    // This will trigger a re-render and reset the page in the table component
  }, [search, selectedTypes, statusFilter, combinedFilters, selectedLogic])

  return (
    <>
      <PageTitle breadcrumbs={exercisesListBreadcrumbs}>
        Exercises List
      </PageTitle>
      
      {/* Welcome Banner */}
      <div className='welcome-section'>
        <div className='welcome-content'>
          <div className='welcome-text'>
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
            
            {/* Type Filter */}
            <div className='d-flex align-items-center gap-2'>
              <button
                type='button'
                className='btn btn-light-dark btn-sm'
                onClick={() => setShowTypeFilter(!showTypeFilter)}
              >
                <i className={`fas fa-chevron-${showTypeFilter ? 'up' : 'down'} me-2`}></i>
                Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Custom Dropdown Filters */}
        {showTypeFilter && (
          <div className='custom-filter-section mt-3 d-flex justify-content-end'>
            <div className='d-flex align-items-center gap-3 flex-wrap'>
              {/* Types Filter */}
              <div className='d-flex align-items-center gap-2'>
                <label htmlFor='exercise-type-filter' className='form-label mb-0 text-white-50' style={{ fontSize: '0.875rem' }}>Types:</label>
                <div style={{ width: '180px' }}>
                  <Select
                    id='exercise-type-filter'
                    options={exerciseTypes.map((type: any) => ({
                      value: type.type_id,
                      label: type.name
                    }))}
                    isMulti
                    onChange={handleTypeChange}
                    placeholder='Select...'
                    isLoading={exerciseTypesLoading}
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

              {/* Status Filter */}
              <div className='d-flex align-items-center gap-2'>
                <label htmlFor='exercise-status-filter' className='form-label mb-0 text-white-50' style={{ fontSize: '0.875rem' }}>Status:</label>
                <select
                  id='exercise-status-filter'
                  className='form-select form-select-sm'
                  style={{ width: '120px' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value === '' ? '' : parseInt(e.target.value))}
                >
                  <option value=''>All</option>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>

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
          <ExercisesTable 
            search={search} 
            selectedTypes={selectedTypes} 
            statusFilter={statusFilter}
            selectedTags={combinedFilters}
            tagLogic={selectedLogic}
          />
        </ListViewProvider>
      </KTCard>
    </>
  )
}

export default ExerciseListPage 