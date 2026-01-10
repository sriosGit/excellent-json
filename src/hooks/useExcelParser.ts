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
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })

      // Usar la primera hoja
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]

      // Convertir a JSON
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet)

      if (jsonData.length === 0) {
        throw new Error('El archivo Excel está vacío o no tiene datos válidos')
      }

      // Obtener nombres de columnas de la primera fila
      const columns = Object.keys(jsonData[0])

      const result: ExcelData = {
        columns,
        rows: jsonData,
        fileName: file.name,
        totalRows: jsonData.length
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

