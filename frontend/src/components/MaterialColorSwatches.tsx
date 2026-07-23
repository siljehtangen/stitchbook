import { useTranslation } from 'react-i18next'
import { FiCheck } from 'react-icons/fi'
import { COLORS, getColorName } from '../colors'

export function MaterialColorSwatches({
  selected,
  onChange,
}: {
  selected: string
  onChange: (name: string, hex: string) => void
}) {
  const { t, i18n } = useTranslation()

  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={t('lib_colors')}>
      {COLORS.map(color => {
        const isSelected = selected === color.name
        const label = getColorName(color, i18n.language)
        return (
          <button
            key={color.name}
            type="button"
            role="radio"
            aria-checked={isSelected}
            title={label}
            aria-label={label}
            onClick={() => onChange(color.name, color.hex)}
            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all hover:scale-110 ${
              isSelected ? 'border-ink ring-2 ring-ink/30 scale-110' : 'border-black/10 hover:border-black/25'
            }`}
            style={{ backgroundColor: color.hex }}
          >
            {isSelected && <FiCheck className="h-3.5 w-3.5 text-white drop-shadow" aria-hidden />}
          </button>
        )
      })}
    </div>
  )
}
