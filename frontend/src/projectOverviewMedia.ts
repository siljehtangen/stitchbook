import type { LibraryItem, Material, Project } from './types'

/** Ensure nested image arrays exist so overview/PDF logic always sees every material photo from the API. */
export function normalizeProject(p: Project): Project {
  return {
    ...p,
    coverImages: Array.isArray(p.coverImages) ? p.coverImages : [],
    materials: (p.materials ?? []).map(m => ({
      ...m,
      images: Array.isArray(m.images) ? m.images : [],
    })),
  }
}

/** All project cover image URLs (main gallery). */
export function projectCoverImageUrls(project: Project): string[] {
  return (project.coverImages ?? []).map(c => c.storedName).filter(Boolean)
}

/** Browser- or PDF-loadable URL for a material/cover stored name (Supabase and `/api/files/...` pass through). */
export function resolveProjectMediaUrl(projectId: number, storedName: string): string {
  if (!storedName) return ''
  if (
    storedName.startsWith('http://') ||
    storedName.startsWith('https://') ||
    storedName.startsWith('/api/')
  ) {
    return storedName
  }
  return `/api/files/${projectId}/${storedName}`
}

/** All image URLs for a material: gallery rows (★ first). Pass `projectId` so disk-backed filenames resolve under `/api/files/...`. */
export function materialImageUrls(m: Material, projectId?: number): string[] {
  const rows = m.images ?? []
  const mainFirst = [...rows].sort((a, b) => (a.isMain === b.isMain ? 0 : a.isMain ? -1 : 1))
  const fromRows = mainFirst.map(i => i.storedName).filter(Boolean)
  const raw = fromRows
  if (projectId == null) return raw
  return raw.map(u => resolveProjectMediaUrl(projectId, u))
}

export function uniqueImageUrls(urls: string[]): string[] {
  return [...new Set(urls.filter(Boolean))]
}

/** Library item images in display order (main first) for copying onto a project material. */
export function libraryItemImagesForProject(item: LibraryItem): { storedName: string; originalName: string }[] {
  const list = item.images ?? []
  if (list.length === 0) return []
  const main = list.find(i => i.isMain)
  const rest = list.filter(i => !i.isMain)
  const ordered = main ? [main, ...rest] : [...list]
  return ordered.map(i => ({
    storedName: i.storedName,
    originalName: i.originalName ?? '',
  }))
}
