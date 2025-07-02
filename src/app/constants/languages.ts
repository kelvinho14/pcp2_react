export interface Language {
  value: string
  label: string
  isDefault?: boolean
}

export const LANGUAGES: Language[] = [
  {
    value: 'en',
    label: 'English',
    isDefault: true
  },
  {
    value: 'zh-tw',
    label: '繁體中文 - Traditional Chinese'
  }
]

export const DEFAULT_LANGUAGE = 'en'

export const getLanguageByValue = (value: string): Language | undefined => {
  return LANGUAGES.find(lang => lang.value === value)
}

export const getDefaultLanguage = (): Language => {
  return LANGUAGES.find(lang => lang.isDefault) || LANGUAGES[0]
} 