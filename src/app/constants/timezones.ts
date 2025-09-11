export interface Timezone {
  value: string
  label: string
  offset: string
  region?: string
}

export interface TimezoneGroup {
  offset: string
  label: string
  timezones: Timezone[]
}

export const TIMEZONES: Timezone[] = [
  // UTC
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: '+00:00', region: 'UTC' },
  
  // North America
  { value: 'America/New_York', label: 'New York (Eastern Time)', offset: '-05:00', region: 'North America' },
  { value: 'America/Chicago', label: 'Chicago (Central Time)', offset: '-06:00', region: 'North America' },
  { value: 'America/Denver', label: 'Denver (Mountain Time)', offset: '-07:00', region: 'North America' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (Pacific Time)', offset: '-08:00', region: 'North America' },
  { value: 'America/Anchorage', label: 'Anchorage (Alaska Time)', offset: '-09:00', region: 'North America' },
  { value: 'Pacific/Honolulu', label: 'Honolulu (Hawaii Time)', offset: '-10:00', region: 'North America' },
  { value: 'America/Toronto', label: 'Toronto (Eastern Time)', offset: '-05:00', region: 'North America' },
  { value: 'America/Vancouver', label: 'Vancouver (Pacific Time)', offset: '-08:00', region: 'North America' },
  { value: 'America/Mexico_City', label: 'Mexico City (Central Time)', offset: '-06:00', region: 'North America' },
  
  // Europe
  { value: 'Europe/London', label: 'London (Greenwich Mean Time)', offset: '+00:00', region: 'Europe' },
  { value: 'Europe/Paris', label: 'Paris (Central European Time)', offset: '+01:00', region: 'Europe' },
  { value: 'Europe/Berlin', label: 'Berlin (Central European Time)', offset: '+01:00', region: 'Europe' },
  { value: 'Europe/Rome', label: 'Rome (Central European Time)', offset: '+01:00', region: 'Europe' },
  { value: 'Europe/Madrid', label: 'Madrid (Central European Time)', offset: '+01:00', region: 'Europe' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (Central European Time)', offset: '+01:00', region: 'Europe' },
  { value: 'Europe/Stockholm', label: 'Stockholm (Central European Time)', offset: '+01:00', region: 'Europe' },
  { value: 'Europe/Oslo', label: 'Oslo (Central European Time)', offset: '+01:00', region: 'Europe' },
  { value: 'Europe/Copenhagen', label: 'Copenhagen (Central European Time)', offset: '+01:00', region: 'Europe' },
  { value: 'Europe/Helsinki', label: 'Helsinki (Eastern European Time)', offset: '+02:00', region: 'Europe' },
  { value: 'Europe/Athens', label: 'Athens (Eastern European Time)', offset: '+02:00', region: 'Europe' },
  { value: 'Europe/Istanbul', label: 'Istanbul (Eastern European Time)', offset: '+02:00', region: 'Europe' },
  { value: 'Europe/Moscow', label: 'Moscow (Moscow Time)', offset: '+03:00', region: 'Europe' },
  
  // Asia
  { value: 'Asia/Tokyo', label: 'Tokyo (Japan Standard Time)', offset: '+09:00', region: 'Asia' },
  { value: 'Asia/Shanghai', label: 'Shanghai (China Standard Time)', offset: '+08:00', region: 'Asia' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (Hong Kong Time)', offset: '+08:00', region: 'Asia' },
  { value: 'Asia/Singapore', label: 'Singapore (Singapore Time)', offset: '+08:00', region: 'Asia' },
  { value: 'Asia/Seoul', label: 'Seoul (Korea Standard Time)', offset: '+09:00', region: 'Asia' },
  { value: 'Asia/Bangkok', label: 'Bangkok (Indochina Time)', offset: '+07:00', region: 'Asia' },
  { value: 'Asia/Jakarta', label: 'Jakarta (Western Indonesian Time)', offset: '+07:00', region: 'Asia' },
  { value: 'Asia/Manila', label: 'Manila (Philippine Time)', offset: '+08:00', region: 'Asia' },
  { value: 'Asia/Kolkata', label: 'Kolkata (India Standard Time)', offset: '+05:30', region: 'Asia' },
  { value: 'Asia/Dhaka', label: 'Dhaka (Bangladesh Time)', offset: '+06:00', region: 'Asia' },
  { value: 'Asia/Karachi', label: 'Karachi (Pakistan Time)', offset: '+05:00', region: 'Asia' },
  { value: 'Asia/Dubai', label: 'Dubai (Gulf Standard Time)', offset: '+04:00', region: 'Asia' },
  { value: 'Asia/Qatar', label: 'Qatar (Arabia Standard Time)', offset: '+03:00', region: 'Asia' },
  { value: 'Asia/Riyadh', label: 'Riyadh (Arabia Standard Time)', offset: '+03:00', region: 'Asia' },
  { value: 'Asia/Tehran', label: 'Tehran (Iran Standard Time)', offset: '+03:30', region: 'Asia' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem (Israel Standard Time)', offset: '+02:00', region: 'Asia' },
  
  // Australia & Oceania
  { value: 'Australia/Sydney', label: 'Sydney (Australian Eastern Time)', offset: '+10:00', region: 'Australia & Oceania' },
  { value: 'Australia/Melbourne', label: 'Melbourne (Australian Eastern Time)', offset: '+10:00', region: 'Australia & Oceania' },
  { value: 'Australia/Perth', label: 'Perth (Australian Western Time)', offset: '+08:00', region: 'Australia & Oceania' },
  { value: 'Australia/Adelaide', label: 'Adelaide (Australian Central Time)', offset: '+09:30', region: 'Australia & Oceania' },
  { value: 'Australia/Darwin', label: 'Darwin (Australian Central Time)', offset: '+09:30', region: 'Australia & Oceania' },
  { value: 'Pacific/Auckland', label: 'Auckland (New Zealand Standard Time)', offset: '+12:00', region: 'Australia & Oceania' },
  { value: 'Pacific/Fiji', label: 'Fiji (Fiji Time)', offset: '+12:00', region: 'Australia & Oceania' },
  
  // Africa
  { value: 'Africa/Cairo', label: 'Cairo (Eastern European Time)', offset: '+02:00', region: 'Africa' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (South Africa Standard Time)', offset: '+02:00', region: 'Africa' },
  { value: 'Africa/Lagos', label: 'Lagos (West Africa Time)', offset: '+01:00', region: 'Africa' },
  { value: 'Africa/Casablanca', label: 'Casablanca (Western European Time)', offset: '+00:00', region: 'Africa' },
  { value: 'Africa/Nairobi', label: 'Nairobi (East Africa Time)', offset: '+03:00', region: 'Africa' },
  
  // South America
  { value: 'America/Sao_Paulo', label: 'São Paulo (Brasilia Time)', offset: '-03:00', region: 'South America' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (Argentina Time)', offset: '-03:00', region: 'South America' },
  { value: 'America/Santiago', label: 'Santiago (Chile Time)', offset: '-03:00', region: 'South America' },
  { value: 'America/Lima', label: 'Lima (Peru Time)', offset: '-05:00', region: 'South America' },
  { value: 'America/Bogota', label: 'Bogotá (Colombia Time)', offset: '-05:00', region: 'South America' },
]

// Group timezones by offset for better organization
export const TIMEZONE_GROUPS: TimezoneGroup[] = [
  {
    offset: '+12:00',
    label: 'UTC+12:00 (New Zealand, Fiji)',
    timezones: TIMEZONES.filter(tz => tz.offset === '+12:00')
  },
  {
    offset: '+10:00',
    label: 'UTC+10:00 (Australia East Coast)',
    timezones: TIMEZONES.filter(tz => tz.offset === '+10:00')
  },
  {
    offset: '+09:30',
    label: 'UTC+09:30 (Australia Central)',
    timezones: TIMEZONES.filter(tz => tz.offset === '+09:30')
  },
  {
    offset: '+09:00',
    label: 'UTC+09:00 (Japan, Korea)',
    timezones: TIMEZONES.filter(tz => tz.offset === '+09:00')
  },
  {
    offset: '+08:00',
    label: 'UTC+08:00 (China, Singapore, Philippines)',
    timezones: TIMEZONES.filter(tz => tz.offset === '+08:00')
  },
  {
    offset: '+07:00',
    label: 'UTC+07:00 (Thailand, Indonesia)',
    timezones: TIMEZONES.filter(tz => tz.offset === '+07:00')
  },
  {
    offset: '+06:00',
    label: 'UTC+06:00 (Bangladesh)',
    timezones: TIMEZONES.filter(tz => tz.offset === '+06:00')
  },
  {
    offset: '+05:30',
    label: 'UTC+05:30 (India)',
    timezones: TIMEZONES.filter(tz => tz.offset === '+05:30')
  },
  {
    offset: '+05:00',
    label: 'UTC+05:00 (Pakistan)',
    timezones: TIMEZONES.filter(tz => tz.offset === '+05:00')
  },
  {
    offset: '+04:00',
    label: 'UTC+04:00 (UAE)',
    timezones: TIMEZONES.filter(tz => tz.offset === '+04:00')
  },
  {
    offset: '+03:30',
    label: 'UTC+03:30 (Iran)',
    timezones: TIMEZONES.filter(tz => tz.offset === '+03:30')
  },
  {
    offset: '+03:00',
    label: 'UTC+03:00 (Moscow, Nairobi)',
    timezones: TIMEZONES.filter(tz => tz.offset === '+03:00')
  },
  {
    offset: '+02:00',
    label: 'UTC+02:00 (Eastern Europe, Africa)',
    timezones: TIMEZONES.filter(tz => tz.offset === '+02:00')
  },
  {
    offset: '+01:00',
    label: 'UTC+01:00 (Central Europe, West Africa)',
    timezones: TIMEZONES.filter(tz => tz.offset === '+01:00')
  },
  {
    offset: '+00:00',
    label: 'UTC+00:00 (UTC, London, Casablanca)',
    timezones: TIMEZONES.filter(tz => tz.offset === '+00:00')
  },
  {
    offset: '-03:00',
    label: 'UTC-03:00 (Brazil, Argentina, Chile)',
    timezones: TIMEZONES.filter(tz => tz.offset === '-03:00')
  },
  {
    offset: '-05:00',
    label: 'UTC-05:00 (Eastern Time - New York, Toronto)',
    timezones: TIMEZONES.filter(tz => tz.offset === '-05:00')
  },
  {
    offset: '-06:00',
    label: 'UTC-06:00 (Central Time - Chicago, Mexico City)',
    timezones: TIMEZONES.filter(tz => tz.offset === '-06:00')
  },
  {
    offset: '-07:00',
    label: 'UTC-07:00 (Mountain Time - Denver)',
    timezones: TIMEZONES.filter(tz => tz.offset === '-07:00')
  },
  {
    offset: '-08:00',
    label: 'UTC-08:00 (Pacific Time - Los Angeles, Vancouver)',
    timezones: TIMEZONES.filter(tz => tz.offset === '-08:00')
  },
  {
    offset: '-09:00',
    label: 'UTC-09:00 (Alaska Time - Anchorage)',
    timezones: TIMEZONES.filter(tz => tz.offset === '-09:00')
  },
  {
    offset: '-10:00',
    label: 'UTC-10:00 (Hawaii Time - Honolulu)',
    timezones: TIMEZONES.filter(tz => tz.offset === '-10:00')
  }
]

export const DEFAULT_TIMEZONE = 'UTC'

export const getTimezoneByValue = (value: string): Timezone | undefined => {
  return TIMEZONES.find(tz => tz.value === value)
}

export const getDefaultTimezone = (): Timezone => {
  return TIMEZONES.find(tz => tz.value === DEFAULT_TIMEZONE) || TIMEZONES[0]
}
