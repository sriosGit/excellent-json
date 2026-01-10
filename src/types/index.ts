// Datos crudos del Excel
export interface ExcelData {
  columns: string[]
  rows: Record<string, unknown>[]
  fileName: string
  totalRows: number
}

// Nodo en el schema del JSON (campo o grupo)
export interface SchemaNode {
  id: string
  type: 'field' | 'group'
  originalName?: string      // Nombre original de la columna (solo para fields)
  outputName: string         // Nombre en el JSON final
  children?: SchemaNode[]    // Solo para grupos
}

// Modo de exportación
export type ExportMode = 
  | { type: 'array' }
  | { type: 'hash'; keyColumn: string }

// Estado completo de la aplicación
export interface AppState {
  // Datos del Excel
  excelData: ExcelData | null
  previewRows: Record<string, unknown>[]
  
  // Schema del JSON
  schema: SchemaNode[]
  exportMode: ExportMode
  
  // Acciones
  setExcelData: (data: ExcelData) => void
  clearData: () => void
  
  setExportMode: (mode: ExportMode) => void
  
  addFieldToSchema: (columnName: string, targetGroupId?: string) => void
  removeFieldFromSchema: (nodeId: string) => void
  renameField: (nodeId: string, newName: string) => void
  
  addGroup: (groupName: string, targetGroupId?: string) => void
  removeGroup: (groupId: string) => void
  
  moveNode: (nodeId: string, targetGroupId: string | null, index: number) => void
  reorderNodes: (activeId: string, overId: string) => void
  moveNodeToGroup: (nodeId: string, targetGroupId: string | null) => void
}

