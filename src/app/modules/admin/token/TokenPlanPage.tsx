import { FC, useEffect, useState, useMemo, useCallback } from 'react'
import { KTCard, KTCardBody } from '../../../../_metronic/helpers'
import { TablePagination } from '../../../../_metronic/helpers/TablePagination'
import { useTable, useSortBy, Column } from 'react-table'
import axios from 'axios'
import { formatApiTimestamp } from '../../../../_metronic/helpers/dateUtils'
import { formatCurrency } from '../../../../_metronic/helpers/mathUtils'
import clsx from 'clsx'
import './TokenPlanPage.scss'

const API_URL = import.meta.env.VITE_APP_API_URL

// Helper function to get the correct price based on billing cycle
const getPlanPrice = (plan: TokenPlan): number => {
  if (plan.billing_cycle === 1) { // Monthly
    return plan.monthly_price || 0
  } else if (plan.billing_cycle === 2) { // Yearly
    return plan.yearly_price || 0
  }
  return plan.monthly_price || 0 // Default to monthly
}

interface AddPlanFormProps {
  onClose: () => void
  onSuccess: () => void
  isSubmitting: boolean
  setIsSubmitting: (value: boolean) => void
  editingPlan?: TokenPlan | null
}

const AddPlanForm: FC<AddPlanFormProps> = ({ onClose, onSuccess, isSubmitting, setIsSubmitting, editingPlan }) => {
  const [formData, setFormData] = useState({
    name: editingPlan?.name || '',
    description: editingPlan?.description || '',
    monthly_price: editingPlan?.monthly_price?.toString() || '',
    yearly_price: editingPlan?.yearly_price?.toString() || '',
    currency: editingPlan?.currency || 'HKD',
    credits_included: editingPlan?.credits_included?.toString() || '',
    billing_cycle: editingPlan?.billing_cycle || 1,
    is_featured: editingPlan?.is_featured || false,
    sort_order: editingPlan?.sort_order?.toString() || '',
    status: editingPlan?.status || 1
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required'
    }
    
    if (!formData.monthly_price || parseFloat(formData.monthly_price) < 0) {
      newErrors.monthly_price = 'Monthly price must be 0 or greater'
    }
    
    if (!formData.yearly_price || parseFloat(formData.yearly_price) < 0) {
      newErrors.yearly_price = 'Yearly price must be 0 or greater'
    }
    
    if (!formData.credits_included || parseInt(formData.credits_included) <= 0) {
      newErrors.credits_included = 'Credits included must be greater than 0'
    }
    
    if (formData.sort_order && (parseInt(formData.sort_order) < 0)) {
      newErrors.sort_order = 'Sort order must be 0 or greater'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        monthly_price: parseFloat(formData.monthly_price),
        yearly_price: parseFloat(formData.yearly_price),
        currency: formData.currency,
        credits_included: parseInt(formData.credits_included),
        billing_cycle: parseInt(formData.billing_cycle.toString()),
        is_featured: formData.is_featured,
        sort_order: formData.sort_order ? parseInt(formData.sort_order) : 0,
        status: parseInt(formData.status.toString())
      }

      console.log('Editing plan ID:', editingPlan?.plan_id)
      console.log('API URL:', `${API_URL}/credits/plans/${editingPlan?.plan_id}`)
      
      const response = editingPlan 
        ? await axios.put(`${API_URL}/credits/plans/${editingPlan.plan_id}`, requestData, {
            withCredentials: true
          })
        : await axios.post(`${API_URL}/credits/plans`, requestData, {
            withCredentials: true
          })
      
      if (response.data.status === 'success') {
        onSuccess()
      } else {
        throw new Error(response.data.message || `Failed to ${editingPlan ? 'update' : 'create'} plan`)
      }
    } catch (error: any) {
      console.error('Error creating plan:', error)
      setErrors({
        submit: error.response?.data?.message || error.message || 'Failed to create plan'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Plan Name *</label>
          <input
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter plan name"
            disabled={isSubmitting}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
        
        
        <div className="col-md-6">
          <label className="form-label">Currency</label>
          <select
            className="form-select"
            name="currency"
            value={formData.currency}
            onChange={handleInputChange}
            disabled={isSubmitting}
          >
            <option value="HKD">HKD</option>
            <option value="USD">USD</option>
          </select>
        </div>
        
        <div className="col-md-6">
          <label className="form-label">Monthly Price *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className={`form-control ${errors.monthly_price ? 'is-invalid' : ''}`}
            name="monthly_price"
            value={formData.monthly_price}
            onChange={handleInputChange}
            placeholder="0.00"
            disabled={isSubmitting}
          />
          {errors.monthly_price && <div className="invalid-feedback">{errors.monthly_price}</div>}
        </div>
        
        <div className="col-md-6">
          <label className="form-label">Yearly Price *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className={`form-control ${errors.yearly_price ? 'is-invalid' : ''}`}
            name="yearly_price"
            value={formData.yearly_price}
            onChange={handleInputChange}
            placeholder="0.00"
            disabled={isSubmitting}
          />
          {errors.yearly_price && <div className="invalid-feedback">{errors.yearly_price}</div>}
        </div>
        
        <div className="col-md-6">
          <label className="form-label">Credits Included *</label>
          <input
            type="number"
            min="1"
            className={`form-control ${errors.credits_included ? 'is-invalid' : ''}`}
            name="credits_included"
            value={formData.credits_included}
            onChange={handleInputChange}
            placeholder="1000"
            disabled={isSubmitting}
          />
          {errors.credits_included && <div className="invalid-feedback">{errors.credits_included}</div>}
        </div>
        
        
        <div className="col-md-6">
          <label className="form-label">Sort Order</label>
          <input
            type="number"
            min="0"
            className={`form-control ${errors.sort_order ? 'is-invalid' : ''}`}
            name="sort_order"
            value={formData.sort_order}
            onChange={handleInputChange}
            placeholder="0"
            disabled={isSubmitting}
          />
          {errors.sort_order && <div className="invalid-feedback">{errors.sort_order}</div>}
        </div>
        
        <div className="col-md-6">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            disabled={isSubmitting}
          >
            <option value={1}>Active</option>
            <option value={0}>Inactive</option>
          </select>
        </div>
        
        <div className="col-12">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
            <label className="form-check-label">
              Is Featured
            </label>
          </div>
        </div>
        
        <div className="col-12">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter plan description (optional)"
            rows={3}
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      {errors.submit && (
        <div className="alert alert-danger mt-3">
          {errors.submit}
        </div>
      )}
      
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {editingPlan ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            editingPlan ? 'Update Plan' : 'Create Plan'
          )}
        </button>
      </div>
    </form>
  )
}

interface TokenPlan {
  id: string
  plan_id: string
  name: string
  description?: string
  monthly_price: number
  yearly_price: number
  currency: string
  credits_included: number
  billing_cycle: number
  is_featured: boolean
  sort_order: number
  status: number
  created_at: string
  updated_at: string
}

interface TokenPlanResponse {
  status: string
  data: TokenPlan[]
  payload: {
    pagination: {
      page: number
      total: number
      last_page: number
      items_per_page: string
    }
  }
}

const TokenPlanPage: FC = () => {
  const [apiData, setApiData] = useState<TokenPlanResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ id: string; desc: boolean } | null>({ id: 'created_at', desc: true })
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingPlan, setEditingPlan] = useState<TokenPlan | null>(null)
  const itemsPerPage = 10

  const fetchTokenPlans = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Call the API endpoint
      const response = await axios.get(`${API_URL}/credits/plans`, {
        params: {
          page,
          limit: itemsPerPage,
          sort: sort?.id,
          order: sort ? (sort.desc ? 'desc' : 'asc') : undefined
        },
        withCredentials: true
      })
      
      console.log('Token plans API response:', response.data)
      setApiData(response.data)
    } catch (err: any) {
      console.error('Error fetching token plans:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch token plans data')
    } finally {
      setLoading(false)
    }
  }, [page, itemsPerPage, sort])

  useEffect(() => {
    fetchTokenPlans()
  }, [fetchTokenPlans])

  // Define table columns
  const columns = useMemo<Column<TokenPlan>[]>(() => [
    {
      Header: 'Name',
      accessor: 'name',
      id: 'name',
      Cell: ({ value, row }) => (
        <div className="d-flex align-items-center">
          <div className="d-flex flex-column">
            <span 
              className="text-gray-800 fw-bold cursor-pointer text-hover-primary"
              onClick={() => handleEditPlan(row.original)}
              style={{ cursor: 'pointer' }}
            >
              {value}
            </span>
          </div>
        </div>
      ),
    },
    {
      Header: 'Description',
      accessor: 'description',
      id: 'description',
      Cell: ({ value }) => (
        <div className="text-gray-800">
          {value ? (
            <span className="text-muted">{value}</span>
          ) : (
            <span className="text-muted">-</span>
          )}
        </div>
      ),
    },
    {
      Header: 'Monthly Price',
      accessor: 'monthly_price',
      id: 'monthly_price',
      Cell: ({ value, row }) => (
        <div className="text-center">
          <span className="badge badge-light-primary fs-7 fw-bold">
            {formatCurrency(value || 0, row.original.currency)}
          </span>
        </div>
      ),
    },
    {
      Header: 'Yearly Price',
      accessor: 'yearly_price',
      id: 'yearly_price',
      Cell: ({ value, row }) => (
        <div className="text-center">
          <span className="badge badge-light-success fs-7 fw-bold">
            {formatCurrency(value || 0, row.original.currency)}
          </span>
        </div>
      ),
    },
    {
      Header: 'Position',
      accessor: 'sort_order',
      id: 'sort_order',
      Cell: ({ value }) => (
        <div className="text-center">
          <span className="badge badge-light-warning fs-7 fw-bold">
            {value || 0}
          </span>
        </div>
      ),
    },
    {
      Header: 'Tokens',
      accessor: 'credits_included',
      id: 'tokens',
      Cell: ({ value }) => (
        <div className="text-center">
          <span className="badge badge-light-info fs-7 fw-bold">{(value || 0).toLocaleString()}</span>
        </div>
      ),
    },
    {
      Header: 'Status',
      accessor: 'status',
      id: 'status',
      Cell: ({ value }) => (
        <div className="text-center">
          <span className={`badge ${value === 1 ? 'badge-light-success' : 'badge-light-danger'} fs-7 fw-bold`}>
            {value === 1 ? 'Active' : 'Inactive'}
          </span>
        </div>
      ),
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
    setPage(1) // Reset page on sort change
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

  const handleEditPlan = useCallback((plan: TokenPlan) => {
    console.log('Plan object:', plan)
    console.log('Plan ID:', plan.plan_id)
    setEditingPlan(plan)
    setShowAddModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowAddModal(false)
    setEditingPlan(null)
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
      {/* Welcome Banner */}
      <div className='welcome-section'>
        <div className='welcome-content'>
          <div className='welcome-text'>
            <p className='welcome-subtitle'>
              Manage token plans and pricing for AI services
            </p>
          </div>
          <div className='welcome-actions'>
            {/* Add Plan Button */}
            <button 
              className='btn btn-light-primary me-3'
              onClick={() => setShowAddModal(true)}
            >
              <i className='fas fa-plus me-1'></i>
              Add Plan
            </button>
            
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
        
        {/* Filters Section - Empty for now */}
        {showFilters && (
          <div className='tag-filter-section mt-3 d-flex justify-content-end'>
            <div className='d-flex align-items-center gap-3 flex-wrap'>
              <div className='text-white-50'>
                <small>No filters available yet</small>
              </div>
            </div>
          </div>
        )}
      </div>

      <KTCard>
        <KTCardBody>
          {error && (
            <div className="alert alert-warning">
              <strong>API Error:</strong> {error}
            </div>
          )}

          <div className="table-responsive">
            <table
              id="kt_table_token_plans"
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
                        className={clsx(
                          "min-w-125px cursor-pointer text-hover-primary",
                          // Center align headers for Monthly Price, Yearly Price, Position, Tokens, and Status columns
                          (column.id === 'monthly_price' || column.id === 'yearly_price' || column.id === 'sort_order' || column.id === 'tokens' || column.id === 'status') && 'text-center'
                        )}
                        onClick={() => handleSortChange(column)}
                        style={{ userSelect: 'none' }}
                      >
                        <div className={clsx(
                          'd-flex align-items-center',
                          // Center align the content for Monthly Price, Yearly Price, Position, Tokens, and Status columns
                          (column.id === 'monthly_price' || column.id === 'yearly_price' || column.id === 'sort_order' || column.id === 'tokens' || column.id === 'status') && 'justify-content-center',
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
                      <div className="text-muted">No token plans found</div>
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

      {/* Add Plan Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingPlan ? 'Edit Token Plan' : 'Add New Token Plan'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                ></button>
              </div>
              <div className="modal-body">
                <AddPlanForm 
                  onClose={handleCloseModal}
                  onSuccess={() => {
                    handleCloseModal()
                    fetchTokenPlans() // Refresh the list
                  }}
                  isSubmitting={isSubmitting}
                  setIsSubmitting={setIsSubmitting}
                  editingPlan={editingPlan}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TokenPlanPage
