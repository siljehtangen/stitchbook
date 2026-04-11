import { useMemo, useState } from 'react'
import type { Project, ProjectCategory } from '../types'

export function useProjectFilter(projects: Project[]) {
  const [filter, setFilter] = useState<ProjectCategory | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  const q = search.toLowerCase()

  const { filtered, counts } = useMemo(() => {
    const counts = { ALL: 0, KNITTING: 0, CROCHET: 0, SEWING: 0 } as Record<ProjectCategory | 'ALL', number>
    const filtered: Project[] = []
    for (const p of projects) {
      counts[p.category]++
      counts.ALL++
      if (filter !== 'ALL' && p.category !== filter) continue
      if (q && ![p.name, p.description, p.tags].some(v => v?.toLowerCase().includes(q))) continue
      filtered.push(p)
    }
    return { filtered, counts }
  }, [projects, filter, q])

  const newProjectPath = filter === 'ALL' ? '/projects/new' : `/projects/new?category=${filter}`

  return { filter, setFilter, search, setSearch, filtered, counts, newProjectPath }
}
