import { create } from 'zustand'
import type { AppState, ExcelData, ExportMode, SchemaNode } from '../types'

const PREVIEW_ROWS_COUNT = 10

// Genera un ID único
const generateId = () => Math.random().toString(36).substring(2, 9)

// Encuentra un nodo por ID en el árbol
const findNode = (nodes: SchemaNode[], id: string): SchemaNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

// Elimina un nodo por ID del árbol
const removeNode = (nodes: SchemaNode[], id: string): SchemaNode[] => {
  return nodes
    .filter(node => node.id !== id)
    .map(node => ({
      ...node,
      children: node.children ? removeNode(node.children, id) : undefined
    }))
}

// Inserta un nodo en una posición específica
const insertNode = (
  nodes: SchemaNode[],
  node: SchemaNode,
  targetGroupId: string | null,
  index: number
): SchemaNode[] => {
  if (targetGroupId === null) {
    // Insertar en el nivel raíz
    const result = [...nodes]
    result.splice(index, 0, node)
    return result
  }

  return nodes.map(n => {
    if (n.id === targetGroupId && n.type === 'group') {
      const children = [...(n.children || [])]
      children.splice(index, 0, node)
      return { ...n, children }
    }
    if (n.children) {
      return { ...n, children: insertNode(n.children, node, targetGroupId, index) }
    }
    return n
  })
}

export const useStore = create<AppState>((set, get) => ({
  // Estado inicial
  excelData: null,
  previewRows: [],
  schema: [],
  exportMode: { type: 'array' },

  // Acciones de datos
  setExcelData: (data: ExcelData) => {
    const previewRows = data.rows.slice(0, PREVIEW_ROWS_COUNT)
    set({
      excelData: data,
      previewRows,
      schema: [],
      exportMode: { type: 'array' }
    })
  },

  clearData: () => {
    set({
      excelData: null,
      previewRows: [],
      schema: [],
      exportMode: { type: 'array' }
    })
  },

  // Modo de exportación
  setExportMode: (mode: ExportMode) => {
    set({ exportMode: mode })
  },

  // Agregar campo al schema (las columnas se pueden reutilizar)
  addFieldToSchema: (columnName: string, targetGroupId?: string) => {
    const { schema, excelData } = get()
    
    // Verificar que la columna existe
    if (!excelData?.columns.includes(columnName)) return

    const newField: SchemaNode = {
      id: generateId(),
      type: 'field',
      originalName: columnName,
      outputName: columnName
    }

    let newSchema: SchemaNode[]
    
    if (targetGroupId) {
      // Función recursiva para agregar al grupo correcto
      const addToGroup = (nodes: SchemaNode[]): SchemaNode[] => {
        return nodes.map(node => {
          if (node.id === targetGroupId && node.type === 'group') {
            return {
              ...node,
              children: [...(node.children || []), newField]
            }
          }
          if (node.children) {
            return { ...node, children: addToGroup(node.children) }
          }
          return node
        })
      }
      newSchema = addToGroup(schema)
    } else {
      newSchema = [...schema, newField]
    }

    set({ schema: newSchema })
  },

  // Eliminar campo del schema
  removeFieldFromSchema: (nodeId: string) => {
    const { schema } = get()
    const node = findNode(schema, nodeId)
    
    if (!node || node.type !== 'field') return

    const newSchema = removeNode(schema, nodeId)
    set({ schema: newSchema })
  },

  // Renombrar campo o grupo
  renameField: (nodeId: string, newName: string) => {
    const { schema } = get()
    
    const updateName = (nodes: SchemaNode[]): SchemaNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, outputName: newName }
        }
        if (node.children) {
          return { ...node, children: updateName(node.children) }
        }
        return node
      })
    }

    set({ schema: updateName(schema) })
  },

  // Agregar grupo
  addGroup: (groupName: string, targetGroupId?: string) => {
    const { schema } = get()

    const newGroup: SchemaNode = {
      id: generateId(),
      type: 'group',
      outputName: groupName,
      children: []
    }

    let newSchema: SchemaNode[]

    if (targetGroupId) {
      const addToGroup = (nodes: SchemaNode[]): SchemaNode[] => {
        return nodes.map(node => {
          if (node.id === targetGroupId && node.type === 'group') {
            return {
              ...node,
              children: [...(node.children || []), newGroup]
            }
          }
          if (node.children) {
            return { ...node, children: addToGroup(node.children) }
          }
          return node
        })
      }
      newSchema = addToGroup(schema)
    } else {
      newSchema = [...schema, newGroup]
    }

    set({ schema: newSchema })
  },

  // Eliminar grupo
  removeGroup: (groupId: string) => {
    const { schema } = get()
    const group = findNode(schema, groupId)
    
    if (!group || group.type !== 'group') return

    const newSchema = removeNode(schema, groupId)
    set({ schema: newSchema })
  },

  // Mover nodo a otra posición
  moveNode: (nodeId: string, targetGroupId: string | null, index: number) => {
    const { schema } = get()
    const node = findNode(schema, nodeId)
    
    if (!node) return

    // Primero eliminamos el nodo de su posición actual
    let newSchema = removeNode(schema, nodeId)
    
    // Luego lo insertamos en la nueva posición
    newSchema = insertNode(newSchema, node, targetGroupId, index)

    set({ schema: newSchema })
  },

  // Reordenar nodos (para drag and drop simple)
  reorderNodes: (activeId: string, overId: string) => {
    const { schema } = get()
    
    // Encontrar índices en el nivel raíz
    const activeIndex = schema.findIndex(n => n.id === activeId)
    const overIndex = schema.findIndex(n => n.id === overId)
    
    if (activeIndex === -1 || overIndex === -1) return
    
    const newSchema = [...schema]
    const [removed] = newSchema.splice(activeIndex, 1)
    newSchema.splice(overIndex, 0, removed)
    
    set({ schema: newSchema })
  },

  // Mover nodo a un grupo (o al root si targetGroupId es null)
  moveNodeToGroup: (nodeId: string, targetGroupId: string | null) => {
    const { schema } = get()
    const node = findNode(schema, nodeId)
    
    if (!node) return
    
    // No permitir mover un grupo dentro de sí mismo o sus descendientes
    if (node.type === 'group' && targetGroupId) {
      const isDescendant = (parent: SchemaNode, childId: string): boolean => {
        if (parent.id === childId) return true
        if (parent.children) {
          return parent.children.some(c => isDescendant(c, childId))
        }
        return false
      }
      if (isDescendant(node, targetGroupId)) return
    }

    // Primero eliminamos el nodo de su posición actual
    let newSchema = removeNode(schema, nodeId)
    
    if (targetGroupId === null) {
      // Mover al nivel raíz
      newSchema = [...newSchema, node]
    } else {
      // Mover dentro de un grupo
      const addToGroup = (nodes: SchemaNode[]): SchemaNode[] => {
        return nodes.map(n => {
          if (n.id === targetGroupId && n.type === 'group') {
            return {
              ...n,
              children: [...(n.children || []), node]
            }
          }
          if (n.children) {
            return { ...n, children: addToGroup(n.children) }
          }
          return n
        })
      }
      newSchema = addToGroup(newSchema)
    }

    set({ schema: newSchema })
  }
}))

