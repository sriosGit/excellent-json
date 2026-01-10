import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useExcelParser } from '../hooks/useExcelParser'
import { useStore } from '../store/useStore'

export function FileUploader() {
  const { t } = useTranslation()
  const [isDragging, setIsDragging] = useState(false)
  const { parseFile, isLoading, error } = useExcelParser()
  const setExcelData = useStore(state => state.setExcelData)

  const handleFile = useCallback(async (file: File) => {
    // Validar extensión
    const validExtensions = ['.xlsx', '.xls', '.csv']
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    
    if (!validExtensions.includes(extension)) {
      alert(t('upload.invalidFile'))
      return
    }

    try {
      const data = await parseFile(file)
      setExcelData(data)
    } catch {
      // Error ya manejado en el hook
    }
  }, [parseFile, setExcelData, t])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  return (
    <div className="w-full">
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center
          w-full h-64 
          border-2 border-dashed rounded-2xl
          cursor-pointer
          transition-all duration-300 ease-out
          ${isDragging 
            ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 scale-[1.02]' 
            : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)]'
          }
          ${isLoading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleInputChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center gap-4 p-8">
          {isLoading ? (
            <>
              <div className="w-12 h-12 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
              <p className="text-[var(--color-text-secondary)]">{t('upload.processing')}</p>
            </>
          ) : (
            <>
              <div className={`
                p-4 rounded-2xl transition-colors duration-300
                ${isDragging ? 'bg-[var(--color-accent)]/20' : 'bg-[var(--color-surface-elevated)]'}
              `}>
                <svg 
                  className={`w-10 h-10 transition-colors duration-300 ${isDragging ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
              </div>
              
              <div className="text-center">
                <p className="text-[var(--color-text)] font-medium">
                  {t('upload.dropzone')}
                </p>
                <p className="text-[var(--color-text-muted)] text-sm mt-1">
                  {t('upload.or')} <span className="text-[var(--color-accent)] hover:underline">{t('upload.clickToSelect')}</span>
                </p>
              </div>

              <div className="flex gap-2 mt-2">
                {['.xlsx', '.xls', '.csv'].map(ext => (
                  <span 
                    key={ext}
                    className="px-2 py-1 text-xs rounded-md bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]"
                  >
                    {ext}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </label>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/20">
          <p className="text-[var(--color-error)] text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
