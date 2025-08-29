import {FC, useState, useEffect} from 'react'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {KTCard} from '../../../../_metronic/helpers'
import {ExercisesListHeader} from './components/header/ExercisesListHeader'
import {ExercisesTable} from './table/ExercisesTable'
import {ListViewProvider} from './core/ListViewProvider'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../../store'
import {fetchExerciseTypes} from '../../../../store/exercise/exerciseSlice'
import Select from 'react-select'


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
  
  const dispatch = useDispatch<AppDispatch>()
  const {exerciseTypes, loading: exerciseTypesLoading} = useSelector((state: RootState) => state.exercise)

  // Fetch exercise types on component mount
  useEffect(() => {
    dispatch(fetchExerciseTypes())
  }, [dispatch])

  const handleTypeChange = (selectedOptions: any) => {
    const typeIds = selectedOptions ? selectedOptions.map((option: any) => option.value) : []
    setSelectedTypes(typeIds)
  }

  // Reset page when filters change
  useEffect(() => {
    // This will trigger a re-render and reset the page in the table component
  }, [search, selectedTypes, statusFilter])

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
        
        {/* Type Filter Dropdown - Right Aligned */}
        {showTypeFilter && (
          <div className='tag-filter-section mt-3 d-flex justify-content-end'>
            <div className='d-flex align-items-center gap-3 flex-wrap'>
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
          />
        </ListViewProvider>
      </KTCard>
    </>
  )
}

export default ExerciseListPage 