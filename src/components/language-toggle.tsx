'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n-context'

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
      className="text-xs font-bold w-9 h-9"
      title={language === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln'}
    >
      {language === 'de' ? 'DE' : 'EN'}
    </Button>
  )
}
