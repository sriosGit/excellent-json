import {
  DndContext,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragMoveEvent,
  type CollisionDetection
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from './store/useStore'
import { FileUploader } from './components/FileUploader'
import { DataPreview } from './components/DataPreview'
import { ColumnList } from './components/ColumnList'
import { SchemaBuilder } from './components/SchemaBuilder'
import { JSONPreview } from './components/JSONPreview'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { Logo } from './components/Logo'
import { DragOverGroupContext } from './context/DragOverGroupContext'

// Estrategia de colisión personalizada que prioriza los droppables de grupos
const customCollisionDetection: CollisionDetection = (args) => {
  // Usar pointerWithin para detectar elementos bajo el cursor
  const pointerCollisions = pointerWithin(args)
  
  if (pointerCollisions.length > 0) {
    // Priorizar group-drop-* sobre otros elementos
    const groupDropCollisions = pointerCollisions.filter(
      collision => String(collision.id).startsWith('group-drop-')
    )
    
    if (groupDropCollisions.length > 0) {
      return groupDropCollisions
    }
    
    return pointerCollisions
  }
  
  // Fallback a rectIntersection
  return rectIntersection(args)
}

function BuilderView() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeName, setActiveName] = useState<string | null>(null)
  const [overGroupId, setOverGroupId] = useState<string | null>(null)
  
  const addFieldToSchema = useStore(state => state.addFieldToSchema)
  const reorderNodes = useStore(state => state.reorderNodes)
  const moveNodeToGroup = useStore(state => state.moveNodeToGroup)
  const schema = useStore(state => state.schema)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Función para encontrar si un ID es un grupo
  const findGroupId = useCallback((overId: string | null): string | null => {
    if (!overId) return null
    
    const overIdStr = String(overId)
    
    // Si es un group-drop-zone, extraer el ID del grupo
    if (overIdStr.startsWith('group-drop-')) {
      return overIdStr.replace('group-drop-', '')
    }
    
    // Buscar recursivamente si el overId es un grupo en el schema
    const findInSchema = (nodes: typeof schema): string | null => {
      for (const node of nodes) {
        if (node.id === overIdStr && node.type === 'group') {
          return node.id
        }
        if (node.children) {
          const found = findInSchema(node.children)
          if (found) return found
        }
      }
      return null
    }
    
    return findInSchema(schema)
  }, [schema])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setOverGroupId(null)
    
    if (event.active.data.current?.type === 'available-column') {
      setActiveName(event.active.data.current.columnName)
    } else if (event.active.data.current?.type === 'schema-node') {
      setActiveName(event.active.data.current.node?.outputName || null)
    } else {
      setActiveName(null)
    }
  }

  const handleDragMove = (event: DragMoveEvent) => {
    const { over } = event
    
    if (!over) {
      setOverGroupId(null)
      return
    }
    
    const overId = String(over.id)
    
    // Si es un group-drop-*, extraer el ID del grupo directamente
    if (overId.startsWith('group-drop-')) {
      setOverGroupId(overId.replace('group-drop-', ''))
      return
    }
    
    // Buscar si el nodo es un grupo
    const groupId = findGroupId(overId)
    setOverGroupId(groupId)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveName(null)
    setOverGroupId(null)

    if (!over) return

    const overId = String(over.id)
    
    // ===== COLUMNA DISPONIBLE siendo dropeada =====
    if (active.data.current?.type === 'available-column') {
      const columnName = active.data.current.columnName
      
      // Dropeado en zona de grupo (group-drop-XXX)
      if (overId.startsWith('group-drop-')) {
        const groupId = overId.replace('group-drop-', '')
        addFieldToSchema(columnName, groupId)
        return
      }
      
      // Dropeado en la zona principal del schema
      if (overId === 'schema-drop-zone') {
        addFieldToSchema(columnName)
        return
      }
      
      // Dropeado en un nodo del schema que es grupo (agregar al grupo)
      const groupId = findGroupId(overId)
      if (groupId) {
        addFieldToSchema(columnName, groupId)
        return
      }
      
      // Si está sobre cualquier nodo del schema, agregar al root
      if (over.data.current?.type === 'schema-node') {
        addFieldToSchema(columnName)
        return
      }
      
      return
    }

    // ===== NODO DEL SCHEMA siendo movido =====
    if (active.data.current?.type === 'schema-node') {
      const nodeId = active.id as string
      
      // Dropeado en zona de grupo
      if (overId.startsWith('group-drop-')) {
        const groupId = overId.replace('group-drop-', '')
        if (nodeId !== groupId) {
          moveNodeToGroup(nodeId, groupId)
        }
        return
      }
      
      // Dropeado en la zona principal (mover al root)
      if (overId === 'schema-drop-zone') {
        moveNodeToGroup(nodeId, null)
        return
      }
      
      // Dropeado en otro nodo que es grupo
      const groupId = findGroupId(overId)
      if (groupId && nodeId !== groupId) {
        moveNodeToGroup(nodeId, groupId)
        return
      }
      
      // Reordenar entre nodos del mismo nivel
      if (active.id !== over.id && over.data.current?.type === 'schema-node') {
        reorderNodes(active.id as string, over.id as string)
        return
      }
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setActiveName(null)
    setOverGroupId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <DragOverGroupContext.Provider value={overGroupId}>
        <div>
          <DataPreview />

          <div className="grid grid-cols-12 gap-6 min-h-[600px]">
            {/* Column list */}
            <div className="col-span-3 p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
              <ColumnList />
            </div>

            {/* Schema builder */}
            <div className="col-span-5 p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
              <SchemaBuilder />
            </div>

            {/* JSON preview */}
            <div className="col-span-4 p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
              <JSONPreview />
            </div>
          </div>
        </div>
      </DragOverGroupContext.Provider>

      {/* Drag overlay */}
      <DragOverlay>
        {activeId && (
          <div className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg shadow-xl font-medium">
            {activeName || 'Moviendo...'}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

function App() {
  const { t } = useTranslation()
  const excelData = useStore(state => state.excelData)

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo />
              <div>
                <h1 className="text-xl font-bold text-[var(--color-text)]">
                  {t('app.title')}
                </h1>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {t('app.subtitle')}
                </p>
              </div>
            </div>

            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!excelData ? (
          // Upload view
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                {t('upload.title')}
              </h2>
              <p className="text-[var(--color-text-secondary)]">
                {t('upload.subtitle')}
              </p>
            </div>
            <FileUploader />
          </div>
        ) : (
          <BuilderView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-sm text-[var(--color-text-muted)] text-center">
            {t('app.footer')}
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
