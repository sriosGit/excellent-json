import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useTranslation } from 'react-i18next'
import type { SchemaNode } from '../types'
import { useStore } from '../store/useStore'
import { useDragOverGroup } from '../App'

interface FieldNodeProps {
  node: SchemaNode
  depth?: number
}

export function FieldNode({ node, depth = 0 }: FieldNodeProps) {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(node.outputName)
  
  const renameField = useStore(state => state.renameField)
  const removeFieldFromSchema = useStore(state => state.removeFieldFromSchema)
  const removeGroup = useStore(state => state.removeGroup)
  const addFieldToSchema = useStore(state => state.addFieldToSchema)
  const addGroup = useStore(state => state.addGroup)
  const excelData = useStore(state => state.excelData)
  
  const columns = excelData?.columns || []
  
  // Usar el contexto para saber si estamos sobre este grupo
  const overGroupId = useDragOverGroup()
  const isOverFromContext = node.type === 'group' && overGroupId === node.id

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: node.id,
    data: { type: 'schema-node', node }
  })

  // Droppable para grupos - área separada del sortable
  const { isOver: isOverDroppable, setNodeRef: setDroppableRef } = useDroppable({
    id: `group-drop-${node.id}`,
    data: { type: 'group-drop-zone', groupId: node.id },
    disabled: node.type !== 'group'
  })

  // isOver es true si el contexto lo indica O si el droppable lo indica
  const isOver = node.type === 'group' && (isOverFromContext || isOverDroppable)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const handleRename = () => {
    if (editValue.trim() && editValue !== node.outputName) {
      renameField(node.id, editValue.trim())
    }
    setIsEditing(false)
  }

  const handleRemove = () => {
    if (node.type === 'field') {
      removeFieldFromSchema(node.id)
    } else {
      removeGroup(node.id)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename()
    } else if (e.key === 'Escape') {
      setEditValue(node.outputName)
      setIsEditing(false)
    }
  }

  const isGroup = node.type === 'group'
  const paddingLeft = depth * 16

  if (isGroup) {
    // Render grupo con área droppable expandida
    return (
      <div
        ref={setNodeRef}
        style={{ ...style, paddingLeft }}
        className={`${isDragging ? 'opacity-50 z-50' : ''}`}
      >
        {/* Contenedor del grupo completo - area droppable */}
        <div
          ref={setDroppableRef}
          className={`
            rounded-xl transition-all duration-200
            ${isOver ? 'bg-[var(--color-accent)]/5' : ''}
          `}
        >
          {/* Header del grupo */}
          <div className={`
            flex items-center gap-2 px-3 py-2 rounded-lg
            transition-all duration-200
            ${isOver
              ? 'bg-[var(--color-accent)]/10 border-2 border-[var(--color-accent)]'
              : 'bg-[var(--color-surface-elevated)] border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
            }
          `}>
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              className="p-1 cursor-grab active:cursor-grabbing hover:bg-[var(--color-surface)] rounded"
            >
              <svg 
                className="w-4 h-4 text-[var(--color-text-muted)]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </button>

            {/* Icon */}
            <svg className={`w-4 h-4 transition-colors ${isOver ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>

            {/* Name */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="w-full px-2 py-0.5 text-sm bg-[var(--color-surface)] border border-[var(--color-accent)] rounded outline-none text-[var(--color-text)]"
                />
              ) : (
                <span className="text-sm font-medium text-[var(--color-text)] truncate">
                  {node.outputName}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setEditValue(node.outputName)
                  setIsEditing(true)
                }}
                className="p-1 hover:bg-[var(--color-surface)] rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                title={t('schema.rename')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleRemove}
                className="p-1 hover:bg-[var(--color-error)]/10 rounded text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                title={t('schema.delete')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Children area */}
          <div className={`
            mt-2 ml-4 pl-4 border-l-2 
            ${isOver ? 'border-[var(--color-accent)]' : 'border-[var(--color-border-subtle)]'}
            transition-colors duration-200
          `}>
            {/* Drop indicator */}
            {isOver && (
              <div className="mb-2 py-2 px-3 rounded-md border border-dashed border-[var(--color-accent)]/60 bg-[var(--color-accent)]/10 flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0 0l-4-4m4 4l4-4" />
                </svg>
                <span className="text-xs text-[var(--color-accent)]">
                  {t('schema.dropFieldHere')}
                </span>
              </div>
            )}
            
            {node.children && node.children.length > 0 && (
              node.children.map(child => (
                <div key={child.id} className="mb-2">
                  <FieldNode node={child} depth={depth + 1} />
                </div>
              ))
            )}
            
            {/* Add field/group buttons inside group */}
            <div className="flex gap-2 mt-2">
              {columns.length > 0 && (
                <select
                  onChange={e => {
                    if (e.target.value) {
                      addFieldToSchema(e.target.value, node.id)
                      e.target.value = ''
                    }
                  }}
                  className="text-xs px-2 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text-muted)] cursor-pointer"
                >
                  <option value="">{t('schema.addField')}</option>
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              )}
              <button
                onClick={() => {
                  const name = prompt(t('schema.subgroupNamePrompt'))
                  if (name) addGroup(name, node.id)
                }}
                className="text-xs px-2 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/50"
              >
                {t('schema.addSubgroup')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render campo normal (no grupo)
  return (
    <div
      ref={setNodeRef}
      style={{ ...style, paddingLeft }}
      className={`${isDragging ? 'opacity-50 z-50' : ''}`}
    >
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing hover:bg-[var(--color-surface)] rounded"
        >
          <svg 
            className="w-4 h-4 text-[var(--color-text-muted)]" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        {/* Icon */}
        <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>

        {/* Name */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full px-2 py-0.5 text-sm bg-[var(--color-surface)] border border-[var(--color-accent)] rounded outline-none text-[var(--color-text)]"
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-text)] truncate">
                {node.outputName}
              </span>
              {node.originalName !== node.outputName && (
                <span className="text-xs text-[var(--color-text-muted)]">
                  ← {node.originalName}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setEditValue(node.outputName)
              setIsEditing(true)
            }}
            className="p-1 hover:bg-[var(--color-surface)] rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            title={t('schema.rename')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleRemove}
            className="p-1 hover:bg-[var(--color-error)]/10 rounded text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
            title={t('schema.delete')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
