import React, {useState} from 'react'
import {Link} from 'react-router-dom'
import {KTIcon} from '../../../helpers'

const PurchaseDrawer = () => {
  const [tokenAmount, setTokenAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePurchase = () => {
    setIsProcessing(true)
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false)
      alert('Purchase completed!')
    }, 2000)
  }

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
              className='btn btn-sm btn-icon btn-active-light-primary'
              id='kt_help_close'
            >
              <KTIcon iconName='cross' className='fs-1' />
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
            {/* begin::Form */}
            <div className='mb-8'>
              <h2 className='fw-bolder mb-3'>Purchase Tokens</h2>
              <p className='text-gray-600'>
                Enter the amount of tokens you want to purchase and select your payment method.
              </p>
            </div>

            <div className='mb-6'>
              <label className='form-label fw-bold text-gray-700 mb-3'>Token Amount</label>
              <input
                type='number'
                className='form-control form-control-solid'
                placeholder='Enter token amount'
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
              />
            </div>

            <div className='mb-6'>
              <label className='form-label fw-bold text-gray-700 mb-3'>Payment Method</label>
              <select
                className='form-select form-select-solid'
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value='credit_card'>Credit Card</option>
                <option value='paypal'>PayPal</option>
                <option value='bank_transfer'>Bank Transfer</option>
              </select>
            </div>

            <div className='d-flex justify-content-end'>
              <button
                className='btn btn-primary'
                onClick={handlePurchase}
                disabled={isProcessing || !tokenAmount}
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
            </div>
            {/* end::Form */}
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