import {FC} from 'react'
import DatePickerLib from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import '../datepicker-custom.css'

interface DatePickerProps {
  selected: Date | null
  onChange: (date: Date | null) => void
  placeholderText?: string
  minDate?: Date
  maxDate?: Date
  isClearable?: boolean
  disabled?: boolean
  className?: string
  wrapperClassName?: string
  dateFormat?: string
  showPopperArrow?: boolean
  popperPlacement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end'
  calendarClassName?: string
  popperClassName?: string
  dayClassName?: (date: Date) => string
  customInput?: React.ReactElement
}

const DatePicker: FC<DatePickerProps> = ({
  selected,
  onChange,
  placeholderText = "Select date",
  minDate,
  maxDate,
  isClearable = true,
  disabled = false,
  className = "form-control form-control-solid",
  wrapperClassName = "w-100",
  dateFormat = "yyyy-MM-dd",
  showPopperArrow = false,
  popperPlacement = "bottom-start",
  calendarClassName = "shadow-lg border-0",
  popperClassName = "shadow-lg",
  dayClassName,
  customInput
}) => {
  const defaultCustomInput = (
    <input
      className={className}
      style={{
        backgroundColor: '#f5f8fa',
        borderColor: '#e1e3ea',
        borderRadius: '6px',
        padding: '0.75rem 1rem',
        fontSize: '0.95rem',
        transition: 'all 0.2s ease',
      }}
    />
  )

  return (
    <DatePickerLib
      selected={selected}
      onChange={onChange}
      dateFormat={dateFormat}
      placeholderText={placeholderText}
      minDate={minDate}
      maxDate={maxDate}
      isClearable={isClearable}
      disabled={disabled}
      className={className}
      wrapperClassName={wrapperClassName}
      showPopperArrow={showPopperArrow}
      popperPlacement={popperPlacement}
      calendarClassName={calendarClassName}
      dayClassName={dayClassName}
      popperClassName={popperClassName}
      customInput={customInput || defaultCustomInput}
    />
  )
}

export {DatePicker} 