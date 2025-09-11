export interface Theme {
  value: number
  label: string
}

export const THEMES: Theme[] = [
  {
    value: 1,
    label: 'Light theme'
  },
  {
    value: 2,
    label: 'Dark theme'
  },
  {
    value: 3,
    label: 'Follow system preference'
  }
]

export const DEFAULT_THEME = 3

// Helper constants for better readability
export const THEME_LIGHT = 1
export const THEME_DARK = 2
export const THEME_SYSTEM = 3

export const getThemeByValue = (value: number): Theme | undefined => {
  return THEMES.find(theme => theme.value === value)
}

export const getDefaultTheme = (): Theme => {
  return THEMES.find(theme => theme.value === DEFAULT_THEME) || THEMES[0]
}
