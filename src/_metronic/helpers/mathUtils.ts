/**
 * Math utility functions for the application
 */
import { config } from './config'

/**
 * Rounds a number to the specified decimal places
 * Uses centralized configuration from config.ts
 * @param value - The number to round
 * @returns The rounded number
 */
export const roundNumber = (value: number): number => {
  const decimalPlaces = config.mathRounding
  const multiplier = Math.pow(10, decimalPlaces)
  return Math.round(value * multiplier) / multiplier
}

/**
 * Formats a percentage with proper rounding
 * @param value - The percentage value (0-100)
 * @returns The formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  const rounded = roundNumber(value)
  return `${rounded}%`
}

/**
 * Formats a decimal as a percentage with proper rounding
 * @param value - The decimal value (0-1)
 * @returns The formatted percentage string
 */
export const formatDecimalAsPercentage = (value: number): string => {
  const percentage = value * 100
  return formatPercentage(percentage)
}

/**
 * Rounds a number and returns it as a string
 * @param value - The number to round
 * @returns The rounded number as a string
 */
export const roundToString = (value: number): string => {
  return roundNumber(value).toString()
}

/**
 * Formats a number as currency with proper locale formatting
 * @param value - The number to format
 * @param currency - The currency code (e.g., 'USD', 'HKD', 'EUR')
 * @param locale - The locale for formatting (defaults to 'en-US')
 * @returns The formatted currency string
 */
export const formatCurrency = (value: number, currency: string = 'USD', locale: string = 'en-US'): string => {
  try {
    // HKD typically uses 1 decimal place, others use 2
    const decimalDigits = currency === 'HKD' ? 1 : 2
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimalDigits,
      maximumFractionDigits: decimalDigits,
    }).format(value)
  } catch (error) {
    // Fallback to simple formatting if Intl.NumberFormat fails
    const decimalDigits = currency === 'HKD' ? 1 : 2
    return `${currency} ${value.toFixed(decimalDigits)}`
  }
}

/**
 * Formats a number as credits with proper formatting
 * @param value - The number to format
 * @param showDecimals - Whether to show decimal places (defaults to true)
 * @param locale - The locale for formatting (defaults to 'en-US')
 * @returns The formatted credits string
 */
export const formatCredits = (value: number, showDecimals: boolean = true, locale: string = 'en-US'): string => {
  try {
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }
    
    const formatted = new Intl.NumberFormat(locale, options).format(value)
    return `${formatted} credits`
  } catch (error) {
    // Fallback to simple formatting if Intl.NumberFormat fails
    const formatted = showDecimals ? value.toFixed(2) : Math.round(value).toString()
    return `${formatted} credits`
  }
}

/**
 * Formats a large number with appropriate suffixes (K, M, B, T)
 * @param value - The number to format
 * @param decimals - Number of decimal places to show (defaults to 1)
 * @returns The formatted number with suffix
 */
export const formatLargeNumber = (value: number, decimals: number = 1): string => {
  const suffixes = ['', 'K', 'M', 'B', 'T']
  const magnitude = Math.floor(Math.log10(Math.abs(value)) / 3)
  const scaledValue = value / Math.pow(1000, magnitude)
  
  if (magnitude >= suffixes.length) {
    return `${scaledValue.toFixed(decimals)}${suffixes[suffixes.length - 1]}`
  }
  
  return `${scaledValue.toFixed(decimals)}${suffixes[magnitude]}`
}

/**
 * Formats credits with large number formatting for better readability
 * @param value - The number of credits to format
 * @param showDecimals - Whether to show decimal places (defaults to true)
 * @returns The formatted credits string with large number formatting
 */
export const formatCreditsCompact = (value: number, showDecimals: boolean = true): string => {
  const decimals = showDecimals ? 1 : 0
  const formatted = formatLargeNumber(value, decimals)
  return `${formatted} credits`
} 