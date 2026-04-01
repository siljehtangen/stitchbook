import { useTranslation } from 'react-i18next'
import { GiChopsticks, GiPirateHook, GiSewingMachine } from 'react-icons/gi'
import type { Project, ProjectCategory } from '../types'

const CATEGORY_ICONS: Record<ProjectCategory, React.ReactNode> = {
  KNITTING: <GiChopsticks className="text-sand-green-dark" />,
  CROCHET: <GiPirateHook className="text-sand-blue-deep" />,
  SEWING: <GiSewingMachine className="text-warm-gray" />,
}

function categoryBadgeClass(cat: ProjectCategory) {
  if (cat === 'KNITTING') return 'badge-knitting'
  if (cat === 'CROCHET') return 'badge-crochet'
  return 'badge-sewing'
}

export default function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const { t } = useTranslation()
  const progress = project.rowCounter && project.rowCounter.totalRounds > 0
    ? Math.round((project.rowCounter.checkedStitches ? JSON.parse(project.rowCounter.checkedStitches).length : 0) / (project.rowCounter.stitchesPerRound * project.rowCounter.totalRounds) * 100)
    : null

  return (
    <button onClick={onClick} className="card w-full text-left hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-800 truncate">{project.name}</span>
            <span className={categoryBadgeClass(project.category)}>
              {t(`category_${project.category.toLowerCase()}` as const)}
            </span>
          </div>
          {project.description && (
            <p className="text-sm text-warm-gray mt-1 truncate">{project.description}</p>
          )}
          {project.materials.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {project.materials.slice(0, 3).map(m => (
                <span key={m.id} className="px-2 py-0.5 rounded-full bg-soft-brown/20 text-warm-gray text-xs truncate max-w-[120px]">
                  {m.type}
                </span>
              ))}
              {project.materials.length > 3 && (
                <span className="px-2 py-0.5 rounded-full bg-soft-brown/20 text-warm-gray text-xs">+{project.materials.length - 3}</span>
              )}
            </div>
          )}
        </div>
        {project.imageUrl ? (
          <img src={project.imageUrl} alt={project.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <span className="text-2xl flex-shrink-0">{CATEGORY_ICONS[project.category]}</span>
        )}
      </div>
      {progress !== null && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-warm-gray mb-1">
            <span>{t('row_counter', { current: JSON.parse(project.rowCounter!.checkedStitches || '[]').length, total: project.rowCounter!.stitchesPerRound * project.rowCounter!.totalRounds })}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-soft-brown/30 rounded-full h-1.5">
            <div className="bg-sand-green-dark h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </button>
  )
}
