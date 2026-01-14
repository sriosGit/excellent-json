import type { SchemaNode, ExportMode } from '../types'

/**
 * Construye un objeto según el schema definido
 */
function buildObjectFromSchema(
  row: Record<string, unknown>,
  schema: SchemaNode[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const node of schema) {
    if (node.type === 'field') {
      // Campo simple: obtener valor de la fila usando el nombre original
      if (node.originalName) {
        result[node.outputName] = row[node.originalName]
      }
    } else if (node.type === 'group') {
      // Grupo: construir recursivamente
      result[node.outputName] = buildObjectFromSchema(row, node.children || [])
    }
  }

  return result
}

/**
 * Genera el JSON final según los datos, schema y modo de exportación
 */
export function buildJSON(
  rows: Record<string, unknown>[],
  schema: SchemaNode[],
  exportMode: ExportMode
): unknown {
  if (exportMode.type === 'array') {
    // Modo array
    if (schema.length === 0) {
      return []
    }
    return rows.map(row => buildObjectFromSchema(row, schema))
  } else {
    // Modo hash: usar una columna como key
    const result: Record<string, unknown> = {}
    
    for (const row of rows) {
      const key = String(row[exportMode.keyColumn] ?? '')
      if (key) {
        if (schema.length === 0) {
          // Sin schema: mostrar objeto vacío para cada key
          result[key] = {}
        } else {
          // Con schema: construir el objeto incluyendo todos los campos del schema
          result[key] = buildObjectFromSchema(row, schema)
        }
      }
    }

    return result
  }
}

/**
 * Formatea el JSON con indentación para visualización
 */
export function formatJSON(data: unknown, minified: boolean = false): string {
  return minified ? JSON.stringify(data) : JSON.stringify(data, null, 2)
}

/**
 * Verifica si hay algo que mostrar en el preview
 */
export function hasContent(schema: SchemaNode[], exportMode: ExportMode): boolean {
  // En modo hash siempre hay algo que mostrar (los keys)
  if (exportMode.type === 'hash') {
    return true
  }
  // En modo array solo si hay schema
  return schema.length > 0
}
