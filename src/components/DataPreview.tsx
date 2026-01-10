import { useTranslation } from 'react-i18next'
import { useStore } from '../store/useStore'

export function DataPreview() {
  const { t } = useTranslation()
  const excelData = useStore(state => state.excelData)
  const previewRows = useStore(state => state.previewRows)
  const clearData = useStore(state => state.clearData)

  if (!excelData) return null

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--color-success)]/10 rounded-lg">
            <svg className="w-5 h-5 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              {excelData.fileName}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              {excelData.totalRows} {t('preview.rows')} • {excelData.columns.length} {t('preview.columns')}
            </p>
          </div>
        </div>

        <button
          onClick={clearData}
          className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {t('preview.changeFile')}
        </button>
      </div>

      {/* Preview table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-surface-elevated)]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)]">
                #
              </th>
              {excelData.columns.map(col => (
                <th 
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-[var(--color-surface)]">
            {previewRows.map((row, idx) => (
              <tr 
                key={idx}
                className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-elevated)]/50"
              >
                <td className="px-4 py-3 text-[var(--color-text-muted)]">
                  {idx + 1}
                </td>
                {excelData.columns.map(col => (
                  <td 
                    key={col}
                    className="px-4 py-3 text-[var(--color-text)] truncate max-w-[200px]"
                    title={String(row[col] ?? '')}
                  >
                    {String(row[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {excelData.totalRows > previewRows.length && (
        <p className="mt-2 text-xs text-[var(--color-text-muted)] text-center">
          {t('preview.showingOf', { shown: previewRows.length, total: excelData.totalRows })}
        </p>
      )}
    </div>
  )
}
