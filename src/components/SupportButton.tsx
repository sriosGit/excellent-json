import { useTranslation } from 'react-i18next'

// ⚠️ Cambia esta URL por tu página de Buy Me a Coffee o Ko-fi
const SUPPORT_URL = 'https://buymeacoffee.com/sriosdev'

export function SupportButton() {
  const { t } = useTranslation()

  return (
    <a
      href={SUPPORT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="
        inline-flex items-center gap-2 px-4 py-2
        text-sm font-medium
        bg-gradient-to-r from-amber-500 to-orange-500
        text-white
        rounded-full
        shadow-md shadow-orange-500/25
        hover:shadow-lg hover:shadow-orange-500/40
        hover:scale-105
        transition-all duration-200
      "
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M18.5 3H6c-1.1 0-2 .9-2 2v14.5c0 .28.22.5.5.5h13c.55 0 1-.45 1-1V9h3V5.5C21.5 4.12 20.38 3 18.5 3zM6 18.5V5h11v6H6v7.5zm13-11h-1V5h1c.28 0 .5.22.5.5V7c0 .28-.22.5-.5.5z"/>
        <path d="M10.5 11.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
      </svg>
      <span>{t('support.button')}</span>
    </a>
  )
}
