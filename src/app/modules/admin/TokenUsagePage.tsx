import { FC, useEffect, useState, useMemo, useCallback } from 'react'
import { KTCard, KTCardBody } from '../../../_metronic/helpers'
import { TablePagination } from '../../../_metronic/helpers/TablePagination'
import { useTable, useSortBy, Column } from 'react-table'
import axios from 'axios'
import { formatApiTimestamp } from '../../../_metronic/helpers/dateUtils'
import { getHeadersWithSchoolSubject } from '../../../_metronic/helpers/axios'
import { DatePicker } from '../../../_metronic/helpers/components/DatePicker'
import clsx from 'clsx'
import './TokenUsagePage.scss'

const API_URL = import.meta.env.VITE_APP_API_URL

// Purpose mapping
const PURPOSE_MAPPING: { [key: number]: string } = {
  1: "generate-similar-questions",
  2: "image-to-text", 
  3: "chat",
  4: "assistant",
  5: "grade-exercise",
  6: "parse-pdf",
  7: "parse-pdf-enhanced",
  8: "embed-content",
  9: "vector-search",
  10: "vector-search-text"
}

interface TokenUsageRecord {
  provider: string
  model: string
  input_tokens: number
  output_tokens: number
  total_tokens: number
  purpose: string | null
  user_id: string
  user_name: string
  created_at: string
}

interface TokenUsageResponse {
  status: string
  data: TokenUsageRecord[]
  summary: {
    total_input_tokens: number
    total_output_tokens: number
    total_tokens: number
  }
  payload: {
    pagination: {
      page: number
      total: number
      last_page: number
      items_per_page: string
    }
  }
}

interface Subject {
  id: string
  school_id: string
  subject_id: string
  name: string
  custom_name?: string
  school_name: string
  status: number
  created_at: string
  updated_at: string
}

const TokenUsagePage: FC = () => {
  const [apiData, setApiData] = useState<TokenUsageResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ id: string; desc: boolean } | null>({ id: 'created_at', desc: true })
  const [purposeFilter, setPurposeFilter] = useState<string>('')
  const [selectedPurpose, setSelectedPurpose] = useState<string>('')
  const [subjectFilter, setSubjectFilter] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [startTime, setStartTime] = useState<string>('')
  const [endTime, setEndTime] = useState<string>('')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const itemsPerPage = 10

  // Helper function to format date with timezone for API
  const formatDateForAPI = (date: Date | null, isEndOfDay: boolean = false): string => {
    if (!date) return ''
    const hours = isEndOfDay ? 23 : 0
    const minutes = isEndOfDay ? 59 : 0  
    const seconds = isEndOfDay ? 59 : 0
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, seconds).toISOString()
  }

  const handleDateChange = (key: string, date: Date | null) => {
    const isEndOfDay = key.includes('end')
    const dateString = formatDateForAPI(date, isEndOfDay)
    
    if (key === 'start') {
      setStartDate(date)
      setStartTime(dateString)
    } else if (key === 'end') {
      setEndDate(date)
      setEndTime(dateString)
    }
  }

  const fetchTokenUsage = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to call the API endpoint
      const response = await axios.get(`${API_URL}/ai/usage`, {
        params: {
          page,
          limit: itemsPerPage,
          sort: sort?.id,
          order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
          purpose: purposeFilter || undefined,
          school_subject_id: subjectFilter || undefined,
          start_time: startTime || undefined,
          end_time: endTime || undefined
        },
        withCredentials: true
      })
      
      console.log('Token usage API response:', response.data)
      setApiData(response.data)
    } catch (err: any) {
      console.error('Error fetching token usage:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch token usage data')
    } finally {
      setLoading(false)
    }
  }, [page, itemsPerPage, sort, purposeFilter, subjectFilter, startTime, endTime])

  useEffect(() => {
    fetchTokenUsage()
  }, [fetchTokenUsage])

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      setSubjectsLoading(true)
      try {
        const headers = getHeadersWithSchoolSubject(`${API_URL}/subjects/school-subjects`)
        const response = await axios.get(`${API_URL}/subjects/school-subjects?all=1`, {
          headers,
          withCredentials: true
        })
        if (response.data.status === 'success' && response.data.data) {
          setSubjects(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching subjects:', error)
      } finally {
        setSubjectsLoading(false)
      }
    }

    fetchSubjects()
  }, [])

  // Auto-apply filters when selections change
  useEffect(() => {
    // Convert purpose text back to integer key for API
    if (selectedPurpose) {
      const purposeKey = Object.keys(PURPOSE_MAPPING).find(key => (PURPOSE_MAPPING as any)[Number(key)] === selectedPurpose)
      setPurposeFilter(purposeKey || selectedPurpose)
    } else {
      setPurposeFilter('')
    }
  }, [selectedPurpose])

  useEffect(() => {
    setSubjectFilter(selectedSubject)
  }, [selectedSubject])

  // Reset filters
  const resetFilters = () => {
    setSelectedPurpose('')
    setPurposeFilter('')
    setSelectedSubject('')
    setSubjectFilter('')
    setStartDate(null)
    setEndDate(null)
    setStartTime('')
    setEndTime('')
  }

  // Define table columns
  const columns = useMemo<Column<TokenUsageRecord>[]>(() => [
    {
      Header: 'User',
      accessor: 'user_name',
      id: 'user_name',
      Cell: ({ value }) => (
        <div className="d-flex align-items-center">
          <div className="d-flex flex-column">
            <span className="text-gray-800 fw-bold">{value || 'Unknown'}</span>
          </div>
        </div>
      ),
    },
    {
      Header: 'Provider',
      accessor: 'provider',
      id: 'provider',
      Cell: ({ value }) => (
        <div className="d-flex align-items-center">
          <span className="badge badge-light-primary">{value}</span>
        </div>
      ),
    },
    {
      Header: 'Model',
      accessor: 'model',
      id: 'model',
      Cell: ({ value }) => (
        <div className="text-gray-800 fw-bold">{value}</div>
      ),
    },
    {
      Header: 'Input Tokens',
      accessor: 'input_tokens',
      id: 'input_tokens',
      Cell: ({ value }) => (
        <div className="text-center">
          <span className="badge badge-light-info fs-7 fw-bold">{value?.toLocaleString() || 0}</span>
        </div>
      ),
    },
    {
      Header: 'Output Tokens',
      accessor: 'output_tokens',
      id: 'output_tokens',
      Cell: ({ value }) => (
        <div className="text-center">
          <span className="badge badge-light-success fs-7 fw-bold">{value?.toLocaleString() || 0}</span>
        </div>
      ),
    },
    {
      Header: 'Total Tokens',
      accessor: 'total_tokens',
      id: 'total_tokens',
      Cell: ({ value }) => (
        <div className="text-center">
          <span className="badge badge-light-warning fs-7 fw-bold">{value?.toLocaleString() || 0}</span>
        </div>
      ),
    },
    {
      Header: 'Purpose',
      accessor: 'purpose',
      id: 'purpose',
      Cell: ({ value }) => {
        // Find the key for the purpose value in PURPOSE_MAPPING
        const purposeKey = Object.keys(PURPOSE_MAPPING).find(key => (PURPOSE_MAPPING as any)[Number(key)] === value)
        const displayValue = purposeKey ? (PURPOSE_MAPPING as any)[Number(purposeKey)] : value
        
        return (
          <div className="text-gray-800">
            {displayValue ? (
              <span className="badge badge-light-secondary">{displayValue}</span>
            ) : (
              <span className="text-muted">-</span>
            )}
          </div>
        )
      },
    },
    {
      Header: 'Created',
      accessor: 'created_at',
      id: 'created_at',
      Cell: ({ value }) => formatApiTimestamp(value, { format: 'custom' }),
    },
  ], [])

  const data = useMemo(() => (Array.isArray(apiData?.data) ? apiData.data : []), [apiData?.data])

  const { getTableProps, getTableBodyProps, headers, rows, prepareRow } = useTable(
    {
      columns,
      data,
    },
    useSortBy
  )

  const handleSortChange = useCallback((column: any) => {
    setSort((currentSort) => {
      if (!currentSort || currentSort.id !== column.id) {
        return { id: column.id, desc: false }
      } else if (currentSort && !currentSort.desc) {
        return { id: column.id, desc: true }
      } else {
        return { id: column.id, desc: false }
      }
    })
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  if (loading) {
    return (
      <KTCard>
        <div className="card-body">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </KTCard>
    )
  }

  return (
    <>
      {/* Welcome Banner with Filters */}
      <div className='welcome-section'>
        <div className='welcome-content'>
          <div className='welcome-text'>
            <p className='welcome-subtitle'>
              Monitor AI token usage across different purposes and users
            </p>
          </div>
          <div className='welcome-actions'>
            {/* Filters Toggle */}
            <div className='d-flex align-items-center gap-2'>
              <button
                type='button'
                className='btn btn-light-dark btn-sm'
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className={`fas fa-chevron-${showFilters ? 'up' : 'down'} me-2`}></i>
                Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Filters Section */}
        {showFilters && (
          <div className='tag-filter-section mt-3 d-flex justify-content-end'>
            <div className='d-flex align-items-center gap-3 flex-wrap'>
              
              {/* Purpose Filter */}
              <div className='d-flex align-items-center gap-2'>
                <label className='form-label mb-0 text-white-50' style={{ fontSize: '0.875rem' }}>Purpose:</label>
                <div style={{ width: '200px' }}>
                  <select
                    className='form-select form-select-sm'
                    value={selectedPurpose}
                    onChange={(e) => setSelectedPurpose(e.target.value)}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value=''>All Purposes</option>
                    {Object.entries(PURPOSE_MAPPING).map(([key, value]) => (
                      <option key={key} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Filter */}
              <div className='d-flex align-items-center gap-2'>
                <label className='form-label mb-0 text-white-50' style={{ fontSize: '0.875rem' }}>Subject:</label>
                <div style={{ width: '250px' }}>
                  <select
                    className='form-select form-select-sm'
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    disabled={subjectsLoading}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value=''>All Subjects</option>
                    {(() => {
                      // Group subjects by school name
                      const groupedSubjects = subjects.reduce((acc, subject) => {
                        const schoolName = subject.school_name
                        if (!acc[schoolName]) {
                          acc[schoolName] = []
                        }
                        acc[schoolName].push(subject)
                        return acc
                      }, {} as Record<string, Subject[]>)

                      // Sort schools alphabetically
                      const sortedSchools = Object.keys(groupedSubjects).sort()

                      return sortedSchools.map((schoolName) => (
                        <optgroup key={schoolName} label={schoolName}>
                          {groupedSubjects[schoolName]
                            .sort((a, b) => (a.custom_name || a.name).localeCompare(b.custom_name || b.name))
                            .map((subject) => (
                              <option key={subject.id} value={subject.id}>
                                {subject.custom_name || subject.name}
                              </option>
                            ))}
                        </optgroup>
                      ))
                    })()}
                  </select>
                </div>
              </div>

              {/* Date From Filter */}
              <div className='d-flex align-items-center gap-2'>
                <label className='form-label mb-0 text-white-50' style={{ fontSize: '0.875rem' }}>From:</label>
                <div style={{ width: '150px' }}>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => handleDateChange('start', date)}
                    placeholderText="Start date"
                    isClearable={true}
                    maxDate={endDate || new Date()}
                    dateFormat="yyyy-MM-dd"
                    customInput={
                      <input
                        className="form-control form-control-sm"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontSize: '0.875rem'
                        }}
                      />
                    }
                  />
                </div>
              </div>

              {/* Date To Filter */}
              <div className='d-flex align-items-center gap-2'>
                <label className='form-label mb-0 text-white-50' style={{ fontSize: '0.875rem' }}>To:</label>
                <div style={{ width: '150px' }}>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => handleDateChange('end', date)}
                    placeholderText="End date"
                    isClearable={true}
                    minDate={startDate || undefined}
                    maxDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    customInput={
                      <input
                        className="form-control form-control-sm"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontSize: '0.875rem'
                        }}
                      />
                    }
                  />
                </div>
              </div>
              
              {/* Reset Button */}
              <div className='d-flex gap-2'>
                <button
                  type='button'
                  className='btn btn-sm btn-outline-light'
                  onClick={resetFilters}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {apiData?.summary && (
        <div className="assigned-exercises-progress-overview">
          <div className="assigned-exercises-status-cards-grid">
            <div>
              <div className="progress-card total">
                <div className="d-flex align-items-center">
                  <div className="card-icon me-3">
                    <i className="fas fa-coins text-white fs-2"></i>
                  </div>
                  <div className="card-content">
                    <div className="card-number">{apiData.summary.total_tokens.toLocaleString()}</div>
                    <div className="card-label">Total Tokens</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="progress-card completed">
                <div className="d-flex align-items-center">
                  <div className="card-icon me-3">
                    <i className="fas fa-arrow-down text-white fs-2"></i>
                  </div>
                  <div className="card-content">
                    <div className="card-number">{apiData.summary.total_input_tokens.toLocaleString()}</div>
                    <div className="card-label">Input Tokens</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="progress-card in-progress">
                <div className="d-flex align-items-center">
                  <div className="card-icon me-3">
                    <i className="fas fa-arrow-up text-white fs-2"></i>
                  </div>
                  <div className="card-content">
                    <div className="card-number">{apiData.summary.total_output_tokens.toLocaleString()}</div>
                    <div className="card-label">Output Tokens</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <KTCard>
      <KTCardBody>
        {error && (
          <div className="alert alert-warning">
            <strong>API Error:</strong> {error}
          </div>
        )}
        
        <div className="table-responsive">
          <table
            id="kt_table_token_usage"
            className="table align-middle table-row-dashed fs-6 gy-5"
            {...getTableProps()}
          >
            <thead>
              <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                {headers.map((column: any, index: number) => {
                  const headerProps = column.getHeaderProps(column.getSortByToggleProps())
                  const { key, ...headerPropsWithoutKey } = headerProps
                  
                  const isSelectedForSorting = sort && sort.id === column.id
                  const order = isSelectedForSorting ? (sort.desc ? 'desc' : 'asc') : undefined
                  
                  return (
                    <th
                      key={key || index}
                      {...headerPropsWithoutKey}
                      className="min-w-125px cursor-pointer text-hover-primary"
                      onClick={() => handleSortChange(column)}
                      style={{ userSelect: 'none' }}
                    >
                      <div className={clsx(
                        'd-flex align-items-center',
                        isSelectedForSorting && order !== undefined && `table-sort-${order}`
                      )}>
                        {column.render('Header')}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="text-gray-600 fw-semibold" {...getTableBodyProps()}>
              {rows.length > 0 ? (
                rows.map((row: any, index: number) => {
                  prepareRow(row)
                  const rowProps = row.getRowProps()
                  const { key, ...rowPropsWithoutKey } = rowProps
                  return (
                    <tr key={key || index} {...rowPropsWithoutKey}>
                      {row.cells.map((cell: any, cellIndex: number) => {
                        const cellProps = cell.getCellProps()
                        const { key: cellKey, ...cellPropsWithoutKey } = cellProps
                        return (
                          <td key={cellKey || cellIndex} {...cellPropsWithoutKey}>
                            {cell.render('Cell')}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-5">
                    <div className="text-muted">No token usage records found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {apiData?.payload?.pagination && (
          <TablePagination
            page={apiData.payload.pagination.page}
            total={apiData.payload.pagination.total}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            showPageNumbers={true}
            showInfo={true}
          />
        )}
      </KTCardBody>
      </KTCard>
    </>
  )
}

export default TokenUsagePage
