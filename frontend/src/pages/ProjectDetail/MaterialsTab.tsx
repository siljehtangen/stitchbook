import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { projectsApi } from '../../api'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import type { Project, Material, LibraryItemType } from '../../types'
import { TYPE_ICONS } from '../../components/LibraryItemForm'
import { EditIcon } from '../../components/UiIcons'
import { MaterialColorSwatches } from '../../components/MaterialColorSwatches'
import { EmptyState } from '../../components/EmptyState'
import { FiPlus, FiX, FiCheck } from 'react-icons/fi'
import { HiOutlineColorSwatch } from 'react-icons/hi'
import { AddMaterialPanel } from './AddMaterialPanel'

function EditMaterialRow({
  material,
  projectId,
  onUpdate,
  onDone,
  onRemove,
}: {
  material: Material
  projectId: number
  onUpdate: (p: Project) => void
  onDone: () => void
  onRemove: () => void
}) {
  const { t } = useTranslation()
  const [type, setType] = useState(material.type)
  const [amount, setAmount] = useState(material.amount)
  const [unit, setUnit] = useState(material.unit)
  const [color, setColor] = useState(material.color)
  const [colorHex, setColorHex] = useState(material.colorHex)
  const [saving, setSaving] = useState(false)
  const mainImg = material.images?.find(img => img.isMain) ?? material.images?.[0]
  const thumbSrc = mainImg?.storedName

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await projectsApi.updateMaterial(projectId, material.id, { type, color, colorHex, amount, unit })
      onUpdate(updated)
      onDone()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card space-y-3.5">
      <div className="flex items-center gap-2">
        {thumbSrc ? (
          <img src={thumbSrc} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg object-cover" loading="lazy" />
        ) : (
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-soft-brown/20 text-base text-warm-gray"
            aria-hidden
          >
            {material.itemType ? TYPE_ICONS[material.itemType as LibraryItemType] : '·'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{material.type}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 block text-sm">
          <span className="mb-1.5 block font-medium text-ink/80">{t('lib_item_type')}</span>
          <input className="input text-sm py-1.5" value={type} onChange={e => setType(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink/80">{t('amount')}</span>
          <input className="input text-sm py-1.5" value={amount} onChange={e => setAmount(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink/80">{t('unit')}</span>
          <input className="input text-sm py-1.5" value={unit} onChange={e => setUnit(e.target.value)} />
        </label>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink/80">{t('lib_colors')}</span>
        <MaterialColorSwatches
          selected={color}
          onChange={(name, hex) => {
            setColor(name)
            setColorHex(hex)
          }}
        />
      </div>

      <div className="flex items-center justify-between border-t border-[rgb(var(--border-light))] pt-3">
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#b08075] hover:text-[#b06a4f]"
        >
          <FiX className="text-base" />
          {t('remove_from_project')}
        </button>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onDone} className="btn-ghost text-sm">
            {t('cancel')}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="btn-primary inline-flex min-h-[44px] items-center gap-1.5 text-sm"
          >
            <FiCheck className="text-base" />
            {saving ? t('saving') : t('lib_save_changes')}
          </button>
        </div>
      </div>
    </div>
  )
}

export function MaterialsTab({
  project,
  projectId,
  onUpdate,
}: {
  project: Project
  projectId: number
  onUpdate: (p: Project) => void
}) {
  const { t } = useTranslation()
  const confirmDelete = useConfirmDelete()
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  function handleRemove(m: Material) {
    void confirmDelete(
      t('delete_material_confirm', { name: m.type }),
      async () => {
        onUpdate(await projectsApi.deleteMaterial(projectId, m.id))
        setEditingId(null)
      },
      'material_removed_toast',
      { tone: 'neutral' }
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {!adding && (
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif text-lg leading-none text-ink">
            {t('section_materials')}
            {project.materials.length > 0 && (
              <span className="ml-2 align-middle text-sm font-sans text-warm-gray">{project.materials.length}</span>
            )}
          </h3>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="btn-primary inline-flex min-h-[44px] items-center gap-1.5 text-sm"
          >
            <FiPlus className="text-base" />
            {t('library_add')}
          </button>
        </div>
      )}

      {adding ? (
        <AddMaterialPanel
          projectId={projectId}
          projectName={project.name}
          onUpdate={onUpdate}
          onClose={() => setAdding(false)}
        />
      ) : project.materials.length === 0 ? (
        <EmptyState
          icon={<HiOutlineColorSwatch />}
          heading={t('no_materials_yet')}
          action={{ label: t('library_add'), onClick: () => setAdding(true), icon: <FiPlus className="text-base" /> }}
        />
      ) : (
        project.materials.map(m =>
          m.id === editingId ? (
            <EditMaterialRow
              key={m.id}
              material={m}
              projectId={projectId}
              onUpdate={onUpdate}
              onDone={() => setEditingId(null)}
              onRemove={() => handleRemove(m)}
            />
          ) : (
            <div key={m.id} className="card">
              <div className="flex items-center gap-2">
                <div className="flex min-h-[3rem] flex-1 items-center gap-2 min-w-0">
                  {(() => {
                    const mainImg = m.images?.find(img => img.isMain) ?? m.images?.[0]
                    const thumbSrc = mainImg?.storedName
                    return thumbSrc ? (
                      <img
                        src={thumbSrc}
                        alt={mainImg?.originalName ?? m.name}
                        className="h-12 w-12 flex-shrink-0 rounded-lg object-cover pointer-events-none select-none"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-soft-brown/20 text-base text-warm-gray pointer-events-none select-none"
                        aria-hidden
                      >
                        {m.itemType ? TYPE_ICONS[m.itemType as LibraryItemType] : '·'}
                      </div>
                    )
                  })()}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{m.type}</p>
                    <div className="flex items-center gap-2">
                      {m.colorHex && (
                        <span
                          className="h-3 w-3 flex-shrink-0 rounded-full border border-black/10"
                          style={{ backgroundColor: m.colorHex }}
                          aria-hidden
                        />
                      )}
                      {(m.amount || m.unit) && (
                        <p className="text-xs text-warm-gray">
                          {m.amount}
                          {m.amount && m.unit ? ` ${m.unit}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingId(m.id)}
                  className="flex-shrink-0 px-1 text-warm-gray hover:text-ink"
                  title={t('edit_material')}
                  aria-label={t('edit_material')}
                >
                  <EditIcon className="h-[18px] w-[18px]" />
                </button>
              </div>
            </div>
          )
        )
      )}
    </div>
  )
}
