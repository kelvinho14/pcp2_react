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