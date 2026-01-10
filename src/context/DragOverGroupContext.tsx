import { createContext, useContext } from 'react'

export const DragOverGroupContext = createContext<string | null>(null)
export const useDragOverGroup = () => useContext(DragOverGroupContext)

