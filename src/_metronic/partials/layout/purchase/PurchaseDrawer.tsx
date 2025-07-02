import React, {useState} from 'react'
import {Link} from 'react-router-dom'
import {KTIcon} from '../../../helpers'

const PurchaseDrawer = () => {
  const [tokenAmount, setTokenAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePurchase = async () => {
    if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
      alert('Please enter a valid token amount')
      return
    }

    setIsProcessing(true)
    // Simulate purchase process
    setTimeout(() => {
      setIsProcessing(false)
      alert(`Successfully purchased ${tokenAmount} tokens!`)
      setTokenAmount('')
    }, 2000)
  }

  const tokenPrice = 0.10 // $0.10 per token
  const totalCost = tokenAmount ? (parseFloat(tokenAmount) * tokenPrice).toFixed(2) : '0.00'

  return (
    <div
      id='kt_help'
      className='bg-body'
      data-kt-drawer='true'
      data-kt-drawer-name='help'
      data-kt-drawer-activate='true'
      data-kt-drawer-overlay='true'
      data-kt-drawer-width="{default:'350px', 'md': '525px'}"
      data-kt-drawer-direction='end'
      data-kt-drawer-toggle='#kt_help_toggle'
      data-kt-drawer-close='#kt_help_close'
    >
      {/* begin::Card */}
      <div className='card shadow-none rounded-0 w-100'>
        {/* begin::Header */}
        <div className='card-header' id='kt_help_header'>
          <h5 className='card-title fw-bold text-gray-600'>Purchase Tokens</h5>

          <div className='card-toolbar'>
            <button
              type='button'
              className='btn btn-sm btn-icon explore-btn-dismiss me-n5'
              id='kt_help_close'
            >
              <KTIcon iconName='cross' className='fs-2' />
            </button>
          </div>
        </div>
        {/* end::Header */}

        {/* begin::Body */}
        <div className='card-body' id='kt_help_body'>
          {/* begin::Content */}
          <div
            id='kt_help_scroll'
            className='hover-scroll-overlay-y'
            data-kt-scroll='true'
            data-kt-scroll-height='auto'
            data-kt-scroll-wrappers='#kt_help_body'
            data-kt-scroll-dependencies='#kt_help_header'
            data-kt-scroll-offset='5px'
          >
            {/* begin::Token Info */}
            <div className='rounded border border-dashed border-gray-300 p-6 p-lg-8 mb-10'>
              {/* begin::Heading */}
              <h2 className='fw-bolder mb-5'>
                Token Purchase
              </h2>
              {/* end::Heading */}

              {/* begin::Description */}
              <div className='fs-5 fw-bold mb-5'>
                <span className='text-gray-500'>
                  Purchase tokens to access premium features and services.
                </span>
              </div>
              {/* end::Description */}

              {/* begin::Price Info */}
              <div className='d-flex justify-content-between align-items-center mb-4'>
                <span className='text-gray-600 fw-bold'>Token Price:</span>
                <span className='text-primary fw-bold'>${tokenPrice.toFixed(2)} per token</span>
              </div>
              {/* end::Price Info */}
            </div>
            {/* end::Token Info */}

            {/* begin::Purchase Form */}
            <div className='mb-8'>
              {/* begin::Token Amount */}
              <div className='mb-6'>
                <label className='form-label fw-bold text-gray-700 mb-3'>Number of Tokens</label>
                <div className='input-group'>
                  <input
                    type='number'
                    className='form-control form-control-lg'
                    placeholder='Enter token amount'
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    min='1'
                    step='1'
                  />
                  <span className='input-group-text'>tokens</span>
                </div>
              </div>
              {/* end::Token Amount */}

              {/* begin::Payment Method */}
              <div className='mb-6'>
                <label className='form-label fw-bold text-gray-700 mb-3'>Payment Method</label>
                <div className='d-flex flex-column gap-3'>
                  <div className='form-check'>
                    <input
                      className='form-check-input'
                      type='radio'
                      name='paymentMethod'
                      id='credit_card'
                      value='credit_card'
                      checked={paymentMethod === 'credit_card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className='form-check-label' htmlFor='credit_card'>
                      <div className='d-flex align-items-center'>
                        <KTIcon iconName='credit-card' className='text-primary fs-2 me-3' />
                        <span>Credit Card</span>
                      </div>
                    </label>
                  </div>
                  <div className='form-check'>
                    <input
                      className='form-check-input'
                      type='radio'
                      name='paymentMethod'
                      id='paypal'
                      value='paypal'
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className='form-check-label' htmlFor='paypal'>
                      <div className='d-flex align-items-center'>
                        <KTIcon iconName='paypal' className='text-primary fs-2 me-3' />
                        <span>PayPal</span>
                      </div>
                    </label>
                  </div>
                  <div className='form-check'>
                    <input
                      className='form-check-input'
                      type='radio'
                      name='paymentMethod'
                      id='crypto'
                      value='crypto'
                      checked={paymentMethod === 'crypto'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className='form-check-label' htmlFor='crypto'>
                      <div className='d-flex align-items-center'>
                        <KTIcon iconName='bitcoin' className='text-primary fs-2 me-3' />
                        <span>Cryptocurrency</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              {/* end::Payment Method */}

              {/* begin::Total Cost */}
              <div className='rounded bg-light-primary p-4 mb-6'>
                <div className='d-flex justify-content-between align-items-center'>
                  <span className='text-gray-700 fw-bold'>Total Cost:</span>
                  <span className='text-primary fw-bold fs-4'>${totalCost}</span>
                </div>
              </div>
              {/* end::Total Cost */}

              {/* begin::Purchase Button */}
              <button
                className='btn btn-lg btn-primary w-100'
                onClick={handlePurchase}
                disabled={isProcessing || !tokenAmount || parseFloat(tokenAmount) <= 0}
              >
                {isProcessing ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <KTIcon iconName='shopping-cart' className='fs-2 me-2' />
                    Purchase Tokens
                  </>
                )}
              </button>
              {/* end::Purchase Button */}
            </div>
            {/* end::Purchase Form */}

            {/* begin::Benefits */}
            <div className='border-top pt-6'>
              <h6 className='fw-bold text-gray-700 mb-4'>Token Benefits</h6>
              <div className='d-flex flex-column gap-3'>
                <div className='d-flex align-items-center'>
                  <KTIcon iconName='check-circle' className='text-success fs-2 me-3' />
                  <span className='text-gray-600'>Access premium features</span>
                </div>
                <div className='d-flex align-items-center'>
                  <KTIcon iconName='check-circle' className='text-success fs-2 me-3' />
                  <span className='text-gray-600'>Priority customer support</span>
                </div>
                <div className='d-flex align-items-center'>
                  <KTIcon iconName='check-circle' className='text-success fs-2 me-3' />
                  <span className='text-gray-600'>Advanced analytics</span>
                </div>
                <div className='d-flex align-items-center'>
                  <KTIcon iconName='check-circle' className='text-success fs-2 me-3' />
                  <span className='text-gray-600'>Exclusive content access</span>
                </div>
              </div>
            </div>
            {/* end::Benefits */}
          </div>
          {/* end::Content */}
        </div>
        {/* end::Body */}
      </div>
      {/* end::Card */}
    </div>
  )
}

export {PurchaseDrawer}
