import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store/useStore'
import { FieldNode } from './FieldNode'

function DropZone() {
  const { t } = useTranslation()
  const { isOver, setNodeRef } = useDroppable({
    id: 'schema-drop-zone'
  })
  
  const schema = useStore(state => state.schema)
  const excelData = useStore(state => state.excelData)
  const addFieldToSchema = useStore(state => state.addFieldToSchema)
  const addGroup = useStore(state => state.addGroup)

  const columns = excelData?.columns || []

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 min-h-[200px] p-4 rounded-xl
        border-2 border-dashed transition-all duration-200
        ${isOver 
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-lg shadow-[var(--color-accent)]/20 scale-[1.01]' 
          : 'border-[var(--color-border)]'
        }
      `}
    >
      {schema.length === 0 ? (
        <div className={`
          h-full flex flex-col items-center justify-center text-center p-8
          transition-colors duration-200
          ${isOver ? 'text-[var(--color-accent)]' : ''}
        `}>
          <svg 
            className={`w-12 h-12 mb-4 transition-colors ${isOver ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className={`mb-2 ${isOver ? 'text-[var(--color-accent)] font-medium' : 'text-[var(--color-text-secondary)]'}`}>
            {isOver ? '↓ ' + t('schema.dropHere') : t('schema.dropHint')}
          </p>
          {!isOver && (
            <p className="text-sm text-[var(--color-text-muted)]">
              {t('schema.dropHintAlt')}
            </p>
          )}
        </div>
      ) : (
        <SortableContext
          items={schema.map(n => n.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {schema.map(node => (
              <FieldNode key={node.id} node={node} />
            ))}
          </div>
        </SortableContext>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
        {columns.length > 0 && (
          <select
            onChange={e => {
              if (e.target.value) {
                addFieldToSchema(e.target.value)
                e.target.value = ''
              }
            }}
            className="text-sm px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] cursor-pointer hover:border-[var(--color-accent)]/50"
          >
            <option value="">{t('schema.addField')}</option>
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        )}
        <button
          onClick={() => {
            const name = prompt(t('schema.groupNamePrompt'))
            if (name) addGroup(name)
          }}
          className="text-sm px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
        >
          {t('schema.addGroup')}
        </button>
      </div>
    </div>
  )
}

export function SchemaBuilder() {
  const { t } = useTranslation()
  const excelData = useStore(state => state.excelData)
  const exportMode = useStore(state => state.exportMode)
  const setExportMode = useStore(state => state.setExportMode)

  if (!excelData) return null

  // Obtener columnas que podrían ser keys (para modo hash)
  const keyColumns = excelData.columns

  return (
    <div className="flex flex-col h-full">
      {/* Mode selector */}
      <div className="mb-6 p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">
          {t('schema.outputFormat')}
        </h3>
        
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="exportMode"
              checked={exportMode.type === 'array'}
              onChange={() => setExportMode({ type: 'array' })}
              className="w-4 h-4 accent-[var(--color-accent)]"
            />
            <span className="text-sm text-[var(--color-text)]">{t('schema.arrayMode')}</span>
            <code className="text-xs px-2 py-0.5 bg-[var(--color-surface-elevated)] rounded text-[var(--color-text-muted)]">
              [{'{ }'}]
            </code>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="exportMode"
              checked={exportMode.type === 'hash'}
              onChange={() => setExportMode({ type: 'hash', keyColumn: keyColumns[0] })}
              className="w-4 h-4 accent-[var(--color-accent)]"
            />
            <span className="text-sm text-[var(--color-text)]">{t('schema.hashMode')}</span>
            <code className="text-xs px-2 py-0.5 bg-[var(--color-surface-elevated)] rounded text-[var(--color-text-muted)]">
              {'{ key: { } }'}
            </code>
          </label>
        </div>

        {exportMode.type === 'hash' && (
          <div className="mt-4 flex items-center gap-3">
            <label className="text-sm text-[var(--color-text-secondary)]">
              {t('schema.keyColumn')}
            </label>
            <select
              value={exportMode.keyColumn}
              onChange={e => setExportMode({ type: 'hash', keyColumn: e.target.value })}
              className="px-3 py-1.5 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] cursor-pointer"
            >
              {keyColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Schema title */}
      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">
        {t('schema.title')}
      </h3>

      {/* Drop zone */}
      <DropZone />
    </div>
  )
}
