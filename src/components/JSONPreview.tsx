import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store/useStore'
import { buildJSON, formatJSON, hasContent } from '../utils/jsonBuilder'

// Simple JSON syntax highlighting
function highlightJSON(json: string): string {
  return json
    // Strings (keys and values)
    .replace(/"([^"]+)":/g, '<span style="color: #22d3ee;">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span style="color: #4ade80;">"$1"</span>')
    // Numbers
    .replace(/: (\d+\.?\d*)/g, ': <span style="color: #fbbf24;">$1</span>')
    // Booleans and null
    .replace(/: (true|false|null)/g, ': <span style="color: #f87171;">$1</span>')
}

export function JSONPreview() {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [minified, setMinified] = useState(false)
  
  const previewRows = useStore(state => state.previewRows)
  const excelData = useStore(state => state.excelData)
  const schema = useStore(state => state.schema)
  const exportMode = useStore(state => state.exportMode)

  // Verificar si hay contenido para mostrar
  const showContent = hasContent(schema, exportMode)

  // Generar JSON con las filas de preview
  const previewJSON = useMemo(() => {
    if (previewRows.length === 0) return ''
    return formatJSON(buildJSON(previewRows, schema, exportMode), minified)
  }, [previewRows, schema, exportMode, minified])

  // Generar JSON completo (para exportar)
  const fullJSON = useMemo(() => {
    if (!excelData) return ''
    return formatJSON(buildJSON(excelData.rows, schema, exportMode), minified)
  }, [excelData, schema, exportMode, minified])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullJSON)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Error al copiar al portapapeles')
    }
  }

  const handleDownload = () => {
    const blob = new Blob([fullJSON], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = excelData?.fileName.replace(/\.[^/.]+$/, '') + '.json' || 'data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!excelData) return null

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">
            {t('jsonPreview.title')}
          </h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            {t('jsonPreview.showingOf', { shown: previewRows.length, total: excelData.totalRows })}
          </p>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          {/* Minify toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={minified}
                onChange={(e) => setMinified(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-full peer-checked:bg-[var(--color-accent)] transition-colors"></div>
              <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">
              {t('jsonPreview.minify')}
            </span>
          </label>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!showContent}
              title={t('jsonPreview.copyAll')}
              className={`
                flex items-center justify-center w-8 h-8 rounded-lg
                transition-all duration-200
                ${!showContent 
                  ? 'bg-[var(--color-surface)] text-[var(--color-text-muted)] cursor-not-allowed' 
                  : copied
                    ? 'bg-[var(--color-success)] text-white'
                    : 'bg-[var(--color-surface-elevated)] text-[var(--color-text)] hover:bg-[var(--color-accent)]/20 hover:text-[var(--color-accent)]'
                }
                border border-[var(--color-border)]
              `}
            >
              {copied ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>

            <button
              onClick={handleDownload}
              disabled={!showContent}
              title={t('jsonPreview.download')}
              className={`
                flex items-center justify-center w-8 h-8 rounded-lg
                transition-all duration-200
                ${!showContent 
                  ? 'bg-[var(--color-surface)] text-[var(--color-text-muted)] cursor-not-allowed' 
                  : 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]'
                }
              `}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* JSON display */}
      <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {!showContent ? (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <svg 
                className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <p className="text-[var(--color-text-secondary)]">
                {t('jsonPreview.addFieldsHint')}
              </p>
            </div>
          </div>
        ) : (
          <pre className="h-full overflow-auto p-4 text-sm font-mono">
            <code 
              className="text-[var(--color-text)]"
              dangerouslySetInnerHTML={{ __html: highlightJSON(previewJSON) }}
            />
          </pre>
        )}
      </div>

      {/* Stats */}
      {showContent && (
        <div className="mt-4 flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
          <span>
            {t('jsonPreview.total', { count: excelData.totalRows })}
          </span>
          <span>•</span>
          <span>
            {t('jsonPreview.estimatedSize', { size: (fullJSON.length / 1024).toFixed(1) })}
          </span>
          {exportMode.type === 'hash' && (
            <>
              <span>•</span>
              <span>
                Key: {exportMode.keyColumn}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
