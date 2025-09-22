import { FC, useEffect, useState } from 'react'
import { KTCard, KTCardBody } from '../../../_metronic/helpers'
import { useAuth } from '../auth'
import { formatApiTimestamp } from '../../../_metronic/helpers/dateUtils'
import { formatCurrency, formatCredits } from '../../../_metronic/helpers/mathUtils'
import clsx from 'clsx'
import { isTeachingStaff } from '../../constants/roles'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../../../store'
import { getSchoolSubjectId, getSchoolId } from '../../../_metronic/helpers/axios'
import { 
  fetchCreditsOverview, 
  fetchAvailablePlans, 
  purchasePlan, 
  cancelPlan,
  CANCELLATION_REASONS,
  clearMessages 
} from '../../../store/credits/creditsSlice'
import type { SubscriptionRequest, AvailablePlan, CreditsOverviewResponse, CancelPlanRequest } from '../../../store/credits/creditsSlice'

const API_URL = import.meta.env.VITE_APP_API_URL

interface Plan {
  plan_id: string
  name: string
  description: string
  monthly_price: number
  yearly_price: number
  payment_amount?: number
  currency: string
  credits_included: number
  billing_cycle: number
  billing_cycle_name: string
  max_users: number | null
  max_ai_requests_per_month: number
  status: number
  is_featured: boolean
  created_at: string
  next_reset_date: string | null
  transaction_id?: string
  scheduled_start?: string
  scheduled_date?: string
  purchase_date?: string
  plan_type?: string
  subscription_status?: string
  plan_expires_at?: string
  days_remaining?: number
  type?: string
  effective_date?: string
}

interface PlanCredits {
  scope: string
  scope_name: string
  school_subject_id?: string
  school_id?: string
  plan_credits: number
  top_up_credits: number
  total_credits: number
  current_plan: Plan
  plan_credits_reset_at: string
  last_used_at: string
}



interface AvailablePlansResponse {
  status: string
  data: AvailablePlan[]
  payload: {
    pagination: {
      page: number
      total: number
      last_page: number
      items_per_page: string
    }
  }
}

type SharingScope = 'individual' | 'subject' | 'school'


// Helper function to get the correct price based on toggle state
const getPlanPrice = (plan: Plan | AvailablePlan, showYearly: boolean = false): number => {
  if (showYearly) {
    // If yearly price exists, use it. Otherwise, calculate from monthly (monthly * 12)
    return plan.yearly_price || (plan.monthly_price ? plan.monthly_price * 12 : 0)
  }
  // If monthly price exists, use it. Otherwise, calculate from yearly (yearly / 12)
  return plan.monthly_price || (plan.yearly_price ? plan.yearly_price / 12 : 0)
}

// Helper function to check if a price exists
const hasPrice = (plan: Plan | AvailablePlan, showYearly: boolean): boolean => {
  if (showYearly) {
    return !!(plan.yearly_price && plan.yearly_price > 0)
  }
  return !!(plan.monthly_price && plan.monthly_price > 0)
}

// Helper function to get price display
const getPriceDisplay = (plan: Plan | AvailablePlan, showYearly: boolean, currency: string = 'USD') => {
  const price = getPlanPrice(plan, showYearly)
  
  return {
    price,
    displayText: formatCurrency(price, currency)
  }
}

// Reusable Plan Card Component
interface PlanCardProps {
  plan: any
  planCredits: any
  scope: string
  type: 'active' | 'scheduled'
  showYearlyPrice: boolean
  onOpenAvailablePlans: () => void
  onCancelPlan: (plan: any, scope: string, planCredits: any) => void
  disableCancel?: boolean
}

const PlanCard: FC<PlanCardProps> = ({
  plan,
  planCredits,
  scope,
  type,
  showYearlyPrice,
  onOpenAvailablePlans,
  onCancelPlan,
  disableCancel = false
}) => {
  const isActive = type === 'active'
  const isCancelled = isActive && plan.subscription_status === 'cancelled'
  const borderClass = isActive ? (isCancelled ? 'border-warning' : 'border-success') : 'border-warning'
  const iconClass = isActive ? (isCancelled ? 'fas fa-exclamation-triangle text-warning' : 'fas fa-check-circle text-success') : 'fas fa-clock text-warning'
  const badgeClass = isActive ? (isCancelled ? 'badge-light-warning' : 'badge-light-success') : 'badge-light-warning'
  const badgeText = isActive ? (isCancelled ? 'Cancelled' : 'Active') : 'Scheduled'
  const creditsValue = isActive ? planCredits.plan_credits : plan.credits_included || 0
  const creditsLabel = isActive ? 'credits left' : 'credits included'

  return (
    <div className={`card ${borderClass} mb-3`}>
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center">
            <div className="symbol symbol-40px me-3">
              <div className={`symbol-label ${isActive ? (isCancelled ? 'bg-light-warning' : 'bg-light-success') : 'bg-light-warning'}`}>
                <i className={`${iconClass} fs-3`}></i>
              </div>
            </div>
            <div>
              <h6 className="fw-bold text-gray-800 mb-1">{plan.name}</h6>
              <span className={`badge ${badgeClass} fs-8 fw-bold`}>{badgeText}</span>
            </div>
          </div>
          <div className="d-flex gap-1">
            {isActive && !isCancelled && (
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={onOpenAvailablePlans}
                title="Change Plan"
              >
                <i className="fas fa-exchange-alt me-1"></i>
                Change
              </button>
            )}
            {isActive && !isCancelled && !disableCancel && (
              <button 
                className="btn btn-sm btn-outline-danger"
                onClick={() => onCancelPlan(plan, scope, planCredits)}
                title="Cancel Plan"
              >
                <i className="fas fa-times me-1"></i>
                Cancel
              </button>
            )}
          </div>
        </div>
        <div className="row g-3">
          <div className="col-6">
            <div className="d-flex align-items-center">
              <div>
                <div className="fs-4 fw-bold text-success">
                  {formatCredits(creditsValue, false)}
                </div>
                <div className="text-muted small">{creditsLabel}</div>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex align-items-center justify-content-end">
              <div>
                <div className="fs-5 fw-bold text-primary">
                  {isActive && plan.payment_amount ? 
                    formatCurrency(plan.payment_amount, plan.currency) : 
                    getPriceDisplay(plan, showYearlyPrice, plan.currency).displayText
                  }
                </div>
                <div className="badge badge-light-primary">
                  {plan.billing_cycle_name}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Show expiration info for cancelled active plans */}
        {isActive && (isCancelled || plan.plan_expires_at) && plan.plan_expires_at && (
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <i className="fas fa-calendar-times text-warning me-2"></i>
                <div>
                  <div className="fw-bold text-warning small">Plan Expires</div>
                  <div className="text-muted small">
                    {formatApiTimestamp(plan.plan_expires_at, { format: 'custom', customFormat: 'YYYY-MM-DD' })}
                  </div>
                </div>
              </div>
              {plan.days_remaining !== undefined && (
                <div className="text-end">
                  <div className="fw-bold text-warning">
                    {plan.days_remaining} {plan.days_remaining === 1 ? 'day' : 'days'} left
                  </div>
                  <div className="text-muted small">remaining</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const TokenSubscriptionPage: FC = () => {
  const { currentUser } = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const { 
    creditsOverview, 
    availablePlans, 
    loading, 
    purchasing, 
    cancelling,
    error, 
    success 
  } = useSelector((state: RootState) => state.credits)
  
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<AvailablePlan | null>(null)
  const [selectedScope, setSelectedScope] = useState<SharingScope>('individual')
  const [showYearlyPrice, setShowYearlyPrice] = useState(false)
  const [showAvailablePlansModal, setShowAvailablePlansModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [planToCancel, setPlanToCancel] = useState<{plan: Plan, scope: string, planCredits: PlanCredits} | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  // Check if user is teaching staff using existing utility function
  const isTeacher = isTeachingStaff(currentUser?.role?.role_type)
  
  // Check if there's any scheduled plan for a given scope
  const hasScheduledPlan = (scope: string): boolean => {
    if (!creditsOverview?.data?.plans) return false
    
    const planCredits = creditsOverview.data.plans.find((plan: any) => {
      if (scope === 'school') return plan.scope === 'school'
      if (scope === 'subject') return plan.scope === 'school_subject'
      if (scope === 'individual') return plan.scope === 'individual'
      return false
    })
    
    if (!planCredits?.scheduled_plans) return false
    
    return planCredits.scheduled_plans.length > 0
  }
  

  // Clear messages when component mounts
  useEffect(() => {
    dispatch(clearMessages())
  }, [dispatch])

  const handleSubscribe = (plan: AvailablePlan, creditScope: number) => {
    setSelectedPlan(plan)
    setSelectedScope(creditScope === 1 ? 'individual' : creditScope === 2 ? 'subject' : 'school')
    setShowSubscribeModal(true)
    setShowAvailablePlansModal(false) // Close the available plans modal
  }

  const handleOpenAvailablePlans = () => {
    setShowAvailablePlansModal(true)
    // Fetch available plans when modal opens
    dispatch(fetchAvailablePlans())
  }

  // Check if user already has a plan for the specific scope

  const handleConfirmSubscription = async () => {
    if (!selectedPlan) return

    const scopeMap = { individual: 1, subject: 2, school: 3 }
    const creditScope = scopeMap[selectedScope]
    
    // Prepare request body
    const requestBody: SubscriptionRequest = {
      plan_id: selectedPlan.plan_id,
      billing_cycle: showYearlyPrice ? 2 : 1, // 1 = monthly, 2 = yearly
      payment_method: 1, // Default payment method
      currency: selectedPlan.currency,
      credit_scope: creditScope.toString()
    }
    
    // Add school_id or school_subject_id based on scope
    if (selectedScope === 'school') {
      // Get school_id from sessionStorage (this is the current school context)
      const schoolId = getSchoolId()
      requestBody.school_id = schoolId || undefined
    } else if (selectedScope === 'subject') {
      // Get school_subject_id from sessionStorage (this is the current subject context)
      const schoolSubjectId = getSchoolSubjectId()
      requestBody.school_subject_id = schoolSubjectId || undefined
    }
    
    
    try {
      // Always use purchase plan API for both new subscriptions and plan changes
      await dispatch(purchasePlan(requestBody)).unwrap()
      
      // Close modal and refresh data
      setShowSubscribeModal(false)
      setSelectedPlan(null)
      dispatch(fetchCreditsOverview())
      
    } catch (err: any) {
      console.error('Error subscribing to plan:', err)
    }
  }

  const handleCancelPlan = (plan: Plan, scope: string, planCredits: PlanCredits) => {
    setPlanToCancel({ plan, scope, planCredits })
    setShowCancelModal(true)
  }

  const handleConfirmCancel = async () => {
    if (!planToCancel) return

    const scopeMap = { individual: 1, subject: 2, school: 3 }
    const creditScope = scopeMap[planToCancel.scope as keyof typeof scopeMap]
    
    // Prepare request body
    const requestBody: CancelPlanRequest = {
      credit_scope: creditScope,
      reason: cancelReason || 'No reason provided'
    }
    
    // Add school_id or school_subject_id based on scope
    if (planToCancel.scope === 'school') {
      const schoolId = getSchoolId()
      requestBody.school_id = schoolId || undefined
    } else if (planToCancel.scope === 'subject') {
      const schoolSubjectId = getSchoolSubjectId()
      requestBody.school_subject_id = schoolSubjectId || undefined
    }
    
    try {
      await dispatch(cancelPlan(requestBody)).unwrap()
      
      // Close modal and refresh data
      setShowCancelModal(false)
      setPlanToCancel(null)
      setCancelReason('')
      dispatch(fetchCreditsOverview())
      
    } catch (err: any) {
      console.error('Error cancelling plan:', err)
    }
  }


  useEffect(() => {
    dispatch(fetchCreditsOverview())
    dispatch(fetchAvailablePlans())
  }, [dispatch])

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


  if (!creditsOverview?.data) {
    return null
  }

  return (
    <>
      {/* Welcome Banner */}
      <div className='welcome-section'>
        <div className='welcome-content'>
          <div className='welcome-text'>
            <h1 className='welcome-title'>Token Subscription</h1>
            <p className='welcome-subtitle'>
              Manage your current plans and subscribe to new ones
            </p>
          </div>
        </div>
      </div>

      {/* Subscribe Message */}
     

      {/* Current Plans Section */}
      <KTCard>
        <KTCardBody>
        <div className="text-center mb-5">
          <h2 className="fw-bold text-gray-800">I want to subscribe a plan for:</h2>
        </div>
          
          {/* Always show the 3 sections */}
            <div className="row g-5">
              {/* School Plans Column */}
              <div className="col-lg-4 d-flex">
                <KTCard className="w-100">
                  <div className="card-header align-items-center border-0 mt-4">
                    <h3 className="card-title align-items-start flex-column">
                      <span className="fw-bold text-gray-900">
                        <i className="fas fa-school text-primary me-2"></i>
                        School
                      </span>
                      <span className="text-muted mt-1 fw-semibold fs-7">Shared across entire school</span>
                    </h3>
                  </div>
                  <div className="card-body pt-3 d-flex flex-column">
                    {creditsOverview.data.plans
                      .filter((planCredits: any) => planCredits.scope === 'school')
                      .length > 0 ? (
                      creditsOverview.data.plans
                      .filter((planCredits: any) => planCredits.scope === 'school')
                      .map((planCredits: any, index: number) => (
                        <div key={index}>
                          <div className="mb-3">
                            <h6 className="text-muted fw-bold mb-3">
                              <i className="fas fa-check-circle me-2"></i>
                              Active Plans
                            </h6>
                          </div>
                          {planCredits.active_plans.map((plan: any, planIndex: number) => (
                            <PlanCard
                              key={planIndex}
                              plan={plan}
                              planCredits={planCredits}
                              scope="school"
                              type="active"
                              showYearlyPrice={showYearlyPrice}
                              onOpenAvailablePlans={handleOpenAvailablePlans}
                              onCancelPlan={handleCancelPlan}
                              disableCancel={hasScheduledPlan('school')}
                            />
                          ))}

                            {/* Scheduled School Plans */}
                            {planCredits.scheduled_plans && planCredits.scheduled_plans.length > 0 && (
                              <>
                                <div className="mt-4">
                                  <h6 className="text-muted fw-bold mb-3">
                                    <i className="fas fa-clock me-2"></i>
                                    Scheduled Plans
                                    {planCredits.scheduled_plans[0]?.scheduled_start && (
                                      <span className="text-muted ms-2">
                                        • {formatApiTimestamp(planCredits.scheduled_plans[0].scheduled_start, { format: 'custom', customFormat: 'YYYY-MM-DD' })}
                                      </span>
                                    )}
                                  </h6>
                                </div>
                                {planCredits.scheduled_plans.map((scheduledPlan: any, scheduledIndex: number) => (
                                  <PlanCard
                                    key={scheduledIndex}
                                    plan={scheduledPlan}
                                    planCredits={planCredits}
                                    scope="school"
                                    type="scheduled"
                                    showYearlyPrice={showYearlyPrice}
                                    onOpenAvailablePlans={handleOpenAvailablePlans}
                                    onCancelPlan={handleCancelPlan}
                                  />
                                ))}
                              </>
                            )}
                          </div>
                        ))
                    ) : (
                      <div 
                        className="text-center py-3 cursor-pointer d-flex flex-column justify-content-center flex-grow-1"
                        onClick={handleOpenAvailablePlans}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className="fas fa-school fs-1 text-muted mb-3"></i>
                        <h6 className="text-muted">No School Plans</h6>
                        <p className="text-muted small">Click to view available plans</p>
                      </div>
                    )}
                  </div>
                </KTCard>
              </div>

              {/* Subject Plans Column */}
              <div className="col-lg-4 d-flex">
                <KTCard className="w-100">
                  <div className="card-header align-items-center border-0 mt-4">
                    <h3 className="card-title align-items-start flex-column">
                      <span className="fw-bold text-gray-900">
                        <i className="fas fa-book text-success me-2"></i>
                        Subject
                      </span>
                      <span className="text-muted mt-1 fw-semibold fs-7">Shared within subject</span>
                    </h3>
                  </div>
                  <div className="card-body pt-3 d-flex flex-column">
                    {creditsOverview.data.plans
                      .filter((planCredits: any) => planCredits.scope === 'school_subject')
                      .length > 0 ? (
                      creditsOverview.data.plans
                      .filter((planCredits: any) => planCredits.scope === 'school_subject')
                      .map((planCredits: any, index: number) => (
                        <div key={index}>
                          <div className="mb-3">
                            <h6 className="text-muted fw-bold mb-3">
                              <i className="fas fa-check-circle me-2"></i>
                              Active Plans
                            </h6>
                          </div>
                          {planCredits.active_plans.map((plan: any, planIndex: number) => (
                            <PlanCard
                              key={planIndex}
                              plan={plan}
                              planCredits={planCredits}
                              scope="subject"
                              type="active"
                              showYearlyPrice={showYearlyPrice}
                              onOpenAvailablePlans={handleOpenAvailablePlans}
                              onCancelPlan={handleCancelPlan}
                              disableCancel={hasScheduledPlan('subject')}
                            />
                          ))}

                            {/* Scheduled Subject Plans */}
                            {planCredits.scheduled_plans && planCredits.scheduled_plans.length > 0 && (
                              <>
                                <div className="mt-4">
                                  <h6 className="text-muted fw-bold mb-3">
                                    <i className="fas fa-clock me-2"></i>
                                    Scheduled Plans
                                    {planCredits.scheduled_plans[0]?.scheduled_start && (
                                      <span className="text-muted ms-2">
                                        • {formatApiTimestamp(planCredits.scheduled_plans[0].scheduled_start, { format: 'custom', customFormat: 'YYYY-MM-DD' })}
                                      </span>
                                    )}
                                  </h6>
                                </div>
                                {planCredits.scheduled_plans.map((scheduledPlan: any, scheduledIndex: number) => (
                                  <PlanCard
                                    key={scheduledIndex}
                                    plan={scheduledPlan}
                                    planCredits={planCredits}
                                    scope="subject"
                                    type="scheduled"
                                    showYearlyPrice={showYearlyPrice}
                                    onOpenAvailablePlans={handleOpenAvailablePlans}
                                    onCancelPlan={handleCancelPlan}
                                  />
                                ))}
                              </>
                            )}
                          </div>
                        ))
                    ) : (
                      <div 
                        className="text-center py-3 cursor-pointer d-flex flex-column justify-content-center flex-grow-1"
                        onClick={handleOpenAvailablePlans}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className="fas fa-book fs-1 text-muted mb-3"></i>
                        <h6 className="text-muted">No Subject Plans</h6>
                        <p className="text-muted small">Click to view available plans</p>
                      </div>
                    )}
                  </div>
                </KTCard>
              </div>

              {/* Individual Plans Column */}
              <div className="col-lg-4 d-flex">
                <KTCard className="w-100">
                  <div className="card-header align-items-center border-0 mt-4">
                    <h3 className="card-title align-items-start flex-column">
                      <span className="fw-bold text-gray-900">
                        <i className="fas fa-user text-info me-2"></i>
                        Myself
                      </span>
                      <span className="text-muted mt-1 fw-semibold fs-7">Personal use only</span>
                    </h3>
                  </div>
                  <div className="card-body pt-3 d-flex flex-column">
                    {creditsOverview.data.plans
                      .filter((planCredits: any) => planCredits.scope === 'individual')
                      .length > 0 ? (
                      creditsOverview.data.plans
                      .filter((planCredits: any) => planCredits.scope === 'individual')
                      .map((planCredits: any, index: number) => (
                        <div key={index}>
                          <div className="mb-3">
                            <h6 className="text-muted fw-bold mb-3">
                              <i className="fas fa-check-circle me-2"></i>
                              Active Plans
                            </h6>
                          </div>
                          {planCredits.active_plans.map((plan: any, planIndex: number) => (
                            <PlanCard
                              key={planIndex}
                              plan={plan}
                              planCredits={planCredits}
                              scope="individual"
                              type="active"
                              showYearlyPrice={showYearlyPrice}
                              onOpenAvailablePlans={handleOpenAvailablePlans}
                              onCancelPlan={handleCancelPlan}
                              disableCancel={hasScheduledPlan('individual')}
                            />
                          ))}

                            {/* Scheduled Individual Plans */}
                            {planCredits.scheduled_plans && planCredits.scheduled_plans.length > 0 && (
                              <>
                                <div className="mt-4">
                                  <h6 className="text-muted fw-bold mb-3">
                                    <i className="fas fa-clock me-2"></i>
                                    Scheduled Plans
                                    {planCredits.scheduled_plans[0]?.scheduled_start && (
                                      <span className="text-muted ms-2">
                                        • {formatApiTimestamp(planCredits.scheduled_plans[0].scheduled_start, { format: 'custom', customFormat: 'YYYY-MM-DD' })}
                                      </span>
                                    )}
                                  </h6>
                                </div>
                                {planCredits.scheduled_plans.map((scheduledPlan: any, scheduledIndex: number) => (
                                  <PlanCard
                                    key={scheduledIndex}
                                    plan={scheduledPlan}
                                    planCredits={planCredits}
                                    scope="individual"
                                    type="scheduled"
                                    showYearlyPrice={showYearlyPrice}
                                    onOpenAvailablePlans={handleOpenAvailablePlans}
                                    onCancelPlan={handleCancelPlan}
                                  />
                                ))}
                              </>
                            )}
                          </div>
                        ))
                    ) : (
                      <div 
                        className="text-center py-3 cursor-pointer d-flex flex-column justify-content-center flex-grow-1"
                        onClick={handleOpenAvailablePlans}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className="fas fa-user fs-1 text-muted mb-3"></i>
                        <h6 className="text-muted">No Individual Plans</h6>
                        <p className="text-muted small">Click to view available plans</p>
                      </div>
                    )}
                  </div>
                </KTCard>
              </div>
            </div>
            
            {/* Total Credits at bottom */}
            <div className="d-flex justify-content-center align-items-center mt-4 pt-3 border-top">
              <div className="text-muted">
                Total Credits: <span className="fw-bold text-primary fs-4">{formatCredits(creditsOverview.data.totals.total_credits, false)}</span>
              </div>
            </div>
        </KTCardBody>
      </KTCard>


      {/* Subscription Modal */}
      {showSubscribeModal && selectedPlan && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Subscribe to {selectedPlan.name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowSubscribeModal(false)
                    setShowAvailablePlansModal(true)
                  }}
                  disabled={purchasing}
                ></button>
              </div>
              <div className="modal-body">
                <div className="card border border-gray-300">
                  <div className="card-body">
                    <h6 className="text-primary mb-4">{selectedPlan.name}</h6>
                    
                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex align-items-center">
                        <i className="fas fa-dollar-sign text-muted me-3" style={{ width: '20px' }}></i>
                        <div>
                          <span className="text-muted">Price: </span>
                          <span className="fw-bold">
                            {getPriceDisplay(selectedPlan, showYearlyPrice, selectedPlan.currency).displayText}
                          </span>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center">
                        <i className="fas fa-coins text-success me-3" style={{ width: '20px' }}></i>
                        <div>
                          <span className="text-muted">Credits: </span>
                          <span className="fw-bold text-success">
                            {formatCredits(selectedPlan.credits_included, false)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center">
                        <i className="fas fa-calendar text-muted me-3" style={{ width: '20px' }}></i>
                        <div>
                          <span className="text-muted">Billing Cycle: </span>
                          <span className="fw-bold">{showYearlyPrice ? 'Yearly' : 'Monthly'}</span>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center">
                        <i className={`fas ${selectedScope === 'individual' ? 'fa-user' : selectedScope === 'subject' ? 'fa-book' : 'fa-school'} text-primary me-3`} style={{ width: '20px' }}></i>
                        <div>
                          <span className="text-muted">Share with: </span>
                          <span className="fw-bold">
                            {selectedScope === 'individual' 
                              ? 'You personally'
                              : selectedScope === 'subject' 
                              ? 'All users within subject'
                              : 'All users within school'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowSubscribeModal(false)
                    setShowAvailablePlansModal(true)
                  }}
                  disabled={purchasing}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmSubscription}
                  disabled={purchasing}
                >
                  {purchasing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Subscribing...
                    </>
                  ) : (
                    'Confirm Subscription'
                  )}
                </button>
              </div>
            </div>
        </div>
      </div>
    )}

      {/* Available Plans Modal */}
      {showAvailablePlansModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Available Plans</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAvailablePlansModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Price Toggle */}
                <div className="d-flex justify-content-center mb-4">
                  <div className="d-flex align-items-center bg-light rounded p-3">
                    <span className={`me-3 fw-bold ${!showYearlyPrice ? 'text-primary' : 'text-muted'}`}>
                      Monthly
                    </span>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="modalPriceToggle"
                        checked={showYearlyPrice}
                        onChange={(e) => setShowYearlyPrice(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="modalPriceToggle">
                        <span className="visually-hidden">Toggle between monthly and yearly pricing</span>
                      </label>
                    </div>
                    <span className={`ms-3 fw-bold ${showYearlyPrice ? 'text-primary' : 'text-muted'}`}>
                      Yearly
                    </span>
                  </div>
                </div>

                {/* Plans Grid */}
                <div className="row g-4">
                  {availablePlans && availablePlans.length > 0 ? availablePlans.map((plan: any, index: number) => (
                    <div key={index} className="col-lg-4 col-md-6">
                      <div className={`card h-100 position-relative ${plan.is_featured ? 'border-primary shadow-sm' : 'border-gray-300'}`}>
                        {plan.is_featured && (
                          <div className="position-absolute top-0 start-50 translate-middle">
                            <span className="badge badge-primary fs-7 px-3 py-2">Featured</span>
                          </div>
                        )}
                        
                        {/* Savings Ribbon */}
                        {showYearlyPrice && plan.monthly_price > 0 && plan.yearly_price > 0 && (
                          <div className="ribbon ribbon-top ribbon-end">
                            <span className="ribbon-label bg-success text-white fw-bold">
                              Save {((plan.monthly_price * 12 - plan.yearly_price) / (plan.monthly_price * 12) * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                        
                        <div className="card-body p-4">
                          <div className="text-center mb-4">
                            <h4 className={`fw-bold mb-2 ${plan.is_featured ? 'text-primary' : 'text-gray-800'}`}>
                              {plan.name}
                            </h4>
                            <p className="text-muted small mb-0">{plan.description || 'No description available'}</p>
                          </div>
                          
                          <div className="text-center mb-4">
                            <div className="fs-1 fw-bold text-primary mb-1">
                              {showYearlyPrice 
                                ? formatCurrency(plan.yearly_price / 12, plan.currency || 'USD')
                                : formatCurrency(plan.monthly_price, plan.currency || 'USD')
                              }
                            </div>
                            <div className="text-muted fs-6">per month</div>
                          </div>
                          
                          <div className="text-center mb-4">
                            <div className="d-flex align-items-center justify-content-center mb-2">
                              <i className="fas fa-coins text-success me-2"></i>
                              <span className="fs-4 fw-bold text-success">
                                {formatCredits(plan.credits_included || 0, false)}
                              </span>
                            </div>
                            <div className="text-muted">Credits Included</div>
                          </div>
                          
                          {plan.max_users && (
                            <div className="text-center mb-4">
                              <div className="d-flex align-items-center justify-content-center mb-2">
                                <i className="fas fa-users text-info me-2"></i>
                                <span className="fs-5 fw-bold text-info">
                                  {plan.max_users}
                                </span>
                              </div>
                              <div className="text-muted">Max Users</div>
                            </div>
                          )}
                          
                          <div className="mt-auto">
                            {isTeacher ? (
                              <div className="dropdown d-flex justify-content-center">
                                <button 
                                  className={`btn ${plan.is_featured ? 'btn-primary' : 'btn-outline-primary'} dropdown-toggle`}
                                  type="button"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                  style={{ minWidth: '120px' }}
                                >
                                  <i className="fas fa-plus me-2"></i>
                                  Subscribe
                                </button>
                                <ul className="dropdown-menu" style={{ minWidth: '120px' }}>
                                  <li>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleSubscribe(plan, 1)}
                                    >
                                      <i className="fas fa-user me-2"></i>
                                      Subscribe as Individual
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleSubscribe(plan, 2)}
                                    >
                                      <i className="fas fa-book me-2"></i>
                                      Subscribe as Subject
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleSubscribe(plan, 3)}
                                    >
                                      <i className="fas fa-school me-2"></i>
                                      Subscribe as School
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            ) : (
                              <div className="d-flex justify-content-center">
                                <button 
                                  className={`btn ${plan.is_featured ? 'btn-primary' : 'btn-outline-primary'} btn-lg`}
                                  onClick={() => handleSubscribe(plan, 1)}
                                  style={{ minWidth: '120px' }}
                                >
                                  <i className="fas fa-plus me-2"></i>
                                  Subscribe Now
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-12">
                      <div className="text-center py-5">
                        <i className="fas fa-box-open fs-1 text-muted mb-3"></i>
                        <h5 className="text-muted">No plans available</h5>
                        <p className="text-muted">Please check back later for available subscription plans</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Plan Modal */}
      {showCancelModal && planToCancel && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                  Cancel Plan
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowCancelModal(false)
                    setPlanToCancel(null)
                    setCancelReason('')
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Warning:</strong> This action will cancel your current plan. You can still use your remaining credits until the end of your current billing period, after which the plan will be deactivated.
                </div>
                
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">Plan Details:</h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="fw-bold mb-1">{planToCancel.plan.name}</h6>
                          <p className="text-muted mb-0">
                            {getPriceDisplay(planToCancel.plan, showYearlyPrice, planToCancel.plan.currency).displayText} • {planToCancel.plan.billing_cycle_name}
                          </p>
                        </div>
                        <span className="badge badge-light-primary">
                          {planToCancel.scope === 'school' ? 'School Plan' : 
                           planToCancel.scope === 'subject' ? 'Subject Plan' : 'Individual Plan'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="cancelReason" className="form-label fw-bold">
                    Reason for Cancellation <span className="text-danger">*</span>
                  </label>
                  <select 
                    className="form-select" 
                    id="cancelReason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    required
                  >
                    <option value="">Select a reason...</option>
                    {CANCELLATION_REASONS.map((reason, index) => (
                      <option key={index} value={reason}>{reason}</option>
                    ))}
                  </select>
                </div>

                <div className="text-muted small">
                  <i className="fas fa-info-circle me-1"></i>
                  This action cannot be undone. You can subscribe to a new plan at any time.
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowCancelModal(false)
                    setPlanToCancel(null)
                    setCancelReason('')
                  }}
                >
                  Keep Plan
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleConfirmCancel}
                  disabled={!cancelReason || cancelling}
                >
                  {cancelling ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-times me-2"></i>
                      Cancel Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

export default TokenSubscriptionPage
