import { useDraggable } from '@dnd-kit/core'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store/useStore'

interface DraggableColumnProps {
  name: string
}

function DraggableColumn({ name }: DraggableColumnProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `available-${name}`,
    data: { type: 'available-column', columnName: name }
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-2 px-3 py-2
        bg-[var(--color-surface-elevated)] 
        border border-[var(--color-border)]
        rounded-lg cursor-grab active:cursor-grabbing
        transition-all duration-200
        hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-accent)]/5
        ${isDragging ? 'opacity-50 scale-95' : ''}
      `}
    >
      <svg 
        className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
      </svg>
      <span className="text-sm text-[var(--color-text)] truncate">{name}</span>
    </div>
  )
}

export function ColumnList() {
  const { t } = useTranslation()
  const excelData = useStore(state => state.excelData)

  if (!excelData) return null

  const columns = excelData.columns

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">
          {t('columnList.title')}
        </h3>
        <span className="text-xs text-[var(--color-text-muted)] px-2 py-1 bg-[var(--color-surface)] rounded-full">
          {columns.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {columns.map(column => (
            <DraggableColumn key={column} name={column} />
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
        <p className="text-xs text-[var(--color-text-muted)]">
          {t('columnList.hint')}
        </p>
      </div>
    </div>
  )
}
