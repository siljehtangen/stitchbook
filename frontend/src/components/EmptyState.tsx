import type { ReactNode } from 'react'

export function EmptyState({
  icon,
  heading,
  description,
  action,
  secondaryAction,
  tone = 'accent',
}: {
  icon: ReactNode
  heading: string
  description?: string
  action?: { label: string; onClick: () => void; icon?: ReactNode }
  secondaryAction?: { label: string; onClick: () => void; icon?: ReactNode }
  tone?: 'accent' | 'danger'
}) {
  const iconToneClass = tone === 'danger' ? 'bg-[#fbeae4] text-[#b86a55]' : 'bg-sand-green-dark/15 text-sand-green-dark'

  return (
    <div className="card flex flex-col items-center py-9 px-6 text-center">
      <div
        className={`mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-2xl text-2xl ${iconToneClass}`}
        aria-hidden
      >
        {icon}
      </div>
      <h3 className="font-serif text-xl leading-tight text-ink">{heading}</h3>
      {description && <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-warm-gray">{description}</p>}
      {(action || secondaryAction) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="btn-primary inline-flex items-center gap-1.5 text-sm"
            >
              {action.icon}
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="btn-secondary inline-flex items-center gap-1.5 text-sm"
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
