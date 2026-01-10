import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'es', name: 'ES', flag: '🇪🇸' },
  { code: 'en', name: 'EN', flag: '🇺🇸' }
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="flex items-center gap-1 bg-[var(--color-surface)] rounded-lg p-1">
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium
            transition-all duration-200
            ${i18n.language === lang.code || i18n.language.startsWith(lang.code)
              ? 'bg-[var(--color-accent)] text-white'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]'
            }
          `}
        >
          <span>{lang.flag}</span>
          <span>{lang.name}</span>
        </button>
      ))}
    </div>
  )
}

