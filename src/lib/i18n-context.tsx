'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { en } from './translations/en'
import { de } from './translations/de'

export type Language = 'de' | 'en'

const translations = { en, de }

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

function resolveKey(obj: Record<string, any>, key: string): string {
  const parts = key.split('.')
  let current: any = obj
  for (const part of parts) {
    if (current === undefined || current === null) return key
    current = current[part]
  }
  return typeof current === 'string' ? current : key
}

function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => String(params[k] ?? `{{${k}}}`))
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('de')

  useEffect(() => {
    const stored = localStorage.getItem('hemora-lang') as Language | null
    if (stored === 'en' || stored === 'de') {
      setLanguageState(stored)
      document.documentElement.lang = stored
    }
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('hemora-lang', lang)
    document.documentElement.lang = lang
  }, [])

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const dict = translations[language] as Record<string, any>
    const str = resolveKey(dict, key)
    return interpolate(str, params)
  }, [language])

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}
