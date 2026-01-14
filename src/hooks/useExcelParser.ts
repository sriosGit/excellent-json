import { useCallback, useState } from 'react'
import * as XLSX from 'xlsx'
import type { ExcelData } from '../types'

interface UseExcelParserResult {
  parseFile: (file: File) => Promise<ExcelData>
  isLoading: boolean
  error: string | null
}

export function useExcelParser(): UseExcelParserResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parseFile = useCallback(async (file: File): Promise<ExcelData> => {
    setIsLoading(true)
    setError(null)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { 
        type: 'array',
        cellDates: true  // Convertir fechas de Excel a objetos Date
      })

      // Usar la primera hoja
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]

      // Convertir a JSON (raw: false formatea fechas como strings legibles)
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        raw: false,
        dateNF: 'yyyy-mm-dd',  // Formato ISO para fechas
        defval: ''             // Valor por defecto para celdas vacías
      })

      if (jsonData.length === 0) {
        throw new Error('El archivo Excel está vacío o no tiene datos válidos')
      }

      // Obtener nombres de columnas, filtrando las columnas vacías (__EMPTY, __empty, etc.)
      const allColumns = Object.keys(jsonData[0])
      const columns = allColumns.filter(col => !col.toLowerCase().startsWith('__empty'))

      // Limpiar las filas removiendo las columnas vacías
      const cleanedRows = jsonData.map(row => {
        const cleanedRow: Record<string, unknown> = {}
        for (const col of columns) {
          cleanedRow[col] = row[col]
        }
        return cleanedRow
      })

      const result: ExcelData = {
        columns,
        rows: cleanedRows,
        fileName: file.name,
        totalRows: cleanedRows.length
      }

      setIsLoading(false)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al leer el archivo'
      setError(message)
      setIsLoading(false)
      throw err
    }
  }, [])

  return { parseFile, isLoading, error }
}

