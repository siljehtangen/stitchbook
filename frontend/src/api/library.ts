import type { LibraryItem } from '../types'
import { api, uploadFile } from './client'
import { libraryItemSchema, safeParsed } from './schemas'
import { z } from 'zod'

export const libraryApi = {
  getAll: async (): Promise<LibraryItem[]> => {
    const r = await api.get<LibraryItem[]>('/library')
    return safeParsed(z.array(libraryItemSchema), r.data, 'LibraryItem[]')
  },

  create: async (data: {
    itemType: string
    name: string
    colors?: string[]
    yarnMaterial?: string
    yarnBrand?: string
    yarnAmountG?: number
    yarnAmountM?: number
    fabricWidthCm?: number
    fabricLengthCm?: number
    needleSizeMm?: string
    circularLengthCm?: number
    hookSizeMm?: string
  }): Promise<LibraryItem> => {
    const r = await api.post<LibraryItem>('/library', data)
    return safeParsed(libraryItemSchema, r.data, 'LibraryItem')
  },

  registerLibraryImage: async (id: number, file: File): Promise<LibraryItem> => {
    const publicUrl = await uploadFile(file, `library/${id}`)
    const r = await api.post<LibraryItem>(`/library/${id}/images/register`, {
      originalName: file.name,
      fileUrl: publicUrl,
    })
    return safeParsed(libraryItemSchema, r.data, 'LibraryItem')
  },

  setLibraryImageMain: async (libraryItemId: number, imageId: number): Promise<LibraryItem> => {
    const r = await api.put<LibraryItem>(`/library/${libraryItemId}/images/${imageId}/main`)
    return safeParsed(libraryItemSchema, r.data, 'LibraryItem')
  },

  deleteLibraryImage: async (libraryItemId: number, imageId: number): Promise<LibraryItem> => {
    const r = await api.delete<LibraryItem>(`/library/${libraryItemId}/images/${imageId}`)
    return safeParsed(libraryItemSchema, r.data, 'LibraryItem')
  },

  update: async (
    id: number,
    data: {
      name?: string
      colors?: string[]
      yarnMaterial?: string
      yarnBrand?: string
      yarnAmountG?: number
      yarnAmountM?: number
      fabricWidthCm?: number
      fabricLengthCm?: number
      needleSizeMm?: string
      circularLengthCm?: number
      hookSizeMm?: string
    }
  ): Promise<LibraryItem> => {
    const r = await api.put<LibraryItem>(`/library/${id}`, data)
    return safeParsed(libraryItemSchema, r.data, 'LibraryItem')
  },

  delete: (id: number) => api.delete(`/library/${id}`),
}
