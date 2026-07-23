import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../context/ToastContext'
import { useConfirmDelete } from '../hooks/useConfirmDelete'
import { libraryApi } from '../api'
import type { LibraryItem, LibraryItemType } from '../types'
import {
  Field,
  ColorPicker,
  TYPE_ICONS,
  COLOR_ITEM_TYPES,
  MAX_LIBRARY_PHOTOS,
  LIBRARY_PHOTO_ACCEPT,
} from './LibraryItemForm'
import { LibraryItemTypeFields } from './LibraryItemTypeFields'
import {
  itemSummary,
  libraryItemImageUrl,
  isImageUrl,
  libraryFieldsToPayload,
  type LibraryFormFields,
} from '../utils/libraryUtils'
import { FileTypeIcon } from './FileTypeIcon'
import { StarIcon, CloseIcon, PlusIcon, LoadingDotsIcon } from './UiIcons'
import { FiCheck, FiTrash2 } from 'react-icons/fi'
import { reportError } from '../sentry'

function itemToFields(item: LibraryItem): LibraryFormFields {
  return {
    name: item.name,
    colors: (item.colors ?? []) as string[],
    yarnBrand: item.yarnBrand ?? '',
    yarnMaterial: item.yarnMaterial ?? '',
    yarnAmountG: item.yarnAmountG?.toString() ?? '',
    yarnAmountM: item.yarnAmountM?.toString() ?? '',
    fabricLength: item.fabricLengthCm?.toString() ?? '',
    fabricWidth: item.fabricWidthCm?.toString() ?? '',
    needleSize: item.needleSizeMm ?? '',
    circularLength: item.circularLengthCm?.toString() ?? '',
    hookSize: item.hookSizeMm ?? '',
  }
}

export function EditLibraryItemPanel({
  item,
  onClose,
  onUpdated,
  onDelete,
}: {
  item: LibraryItem
  onClose: () => void
  onUpdated: (updated: LibraryItem) => void
  onDelete: (id: number) => void
}) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const confirmDelete = useConfirmDelete()

  const [fields, setFields] = useState(() => itemToFields(item))
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const itemType = item.itemType as LibraryItemType
  const hasColors = COLOR_ITEM_TYPES.includes(itemType)
  const displayUrl = libraryItemImageUrl(item)

  function setField<K extends keyof LibraryFormFields>(key: K, val: LibraryFormFields[K]) {
    setFields(f => ({ ...f, [key]: val }))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || (item.images?.length ?? 0) >= MAX_LIBRARY_PHOTOS) return
    setUploading(true)
    try {
      const updated = await libraryApi.registerLibraryImage(item.id, file)
      onUpdated(updated)
      showToast(t('library_photo_added_toast'))
    } catch (err) {
      reportError(err, { context: 'library photo upload', itemId: item.id })
      showToast(t('upload_failed'), 'error')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await libraryApi.update(item.id, libraryFieldsToPayload(itemType, fields, item.name))
      onUpdated(updated)
      showToast({ title: t('lib_item_updated_toast'), detail: updated.name }, 'success')
      onClose()
    } catch (err) {
      reportError(err, { context: 'library item update', itemId: item.id })
      showToast(t('action_failed'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card space-y-3.5">
      <div className="flex items-center gap-3">
        {displayUrl ? (
          isImageUrl(displayUrl) ? (
            <img
              src={displayUrl}
              alt={item.name}
              className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-soft-brown/20 text-warm-gray">
              <FileTypeIcon url={displayUrl} className="h-6 w-6" />
            </div>
          )
        ) : (
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-soft-brown/20 text-base text-warm-gray"
            aria-hidden
          >
            {TYPE_ICONS[itemType]}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{item.name}</p>
          {itemSummary(item) && <p className="truncate text-xs text-warm-gray">{itemSummary(item)}</p>}
        </div>
      </div>

      <Field label={t('lib_name')} required>
        <input
          className="input max-w-none text-sm"
          value={fields.name}
          onChange={e => setField('name', e.target.value)}
          placeholder={t('lib_name')}
        />
      </Field>

      {hasColors && (
        <Field label={t('lib_colors')}>
          <ColorPicker selected={fields.colors} onChange={v => setField('colors', v)} />
        </Field>
      )}

      <LibraryItemTypeFields
        itemType={itemType}
        yarnBrand={fields.yarnBrand}
        setYarnBrand={v => setField('yarnBrand', v)}
        yarnMaterial={fields.yarnMaterial}
        setYarnMaterial={v => setField('yarnMaterial', v)}
        yarnAmountG={fields.yarnAmountG}
        setYarnAmountG={v => setField('yarnAmountG', v)}
        yarnAmountM={fields.yarnAmountM}
        setYarnAmountM={v => setField('yarnAmountM', v)}
        fabricLength={fields.fabricLength}
        setFabricLength={v => setField('fabricLength', v)}
        fabricWidth={fields.fabricWidth}
        setFabricWidth={v => setField('fabricWidth', v)}
        needleSize={fields.needleSize}
        setNeedleSize={v => setField('needleSize', v)}
        circularLength={fields.circularLength}
        setCircularLength={v => setField('circularLength', v)}
        hookSize={fields.hookSize}
        setHookSize={v => setField('hookSize', v)}
      />

      <div className="space-y-2 border-t border-[rgb(var(--border-light))] pt-3.5">
        <p className="text-sm font-medium text-ink/80">{t('lib_photos_label')}</p>
        <div className="flex flex-wrap items-center gap-2.5">
          {(item.images ?? []).map(img => (
            <LibraryPhotoThumb
              key={img.id}
              img={img}
              itemId={item.id}
              onUpdated={onUpdated}
              confirmDelete={confirmDelete}
            />
          ))}
          {(item.images ?? []).length < MAX_LIBRARY_PHOTOS && (
            <label
              className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-soft-brown/40 bg-soft-brown/10 text-warm-gray transition-colors hover:border-sand-green-dark hover:bg-sand-green/10 hover:text-sand-green-dark ${uploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
              title={t('lib_upload_image')}
            >
              {uploading ? <LoadingDotsIcon className="h-6 w-6" /> : <PlusIcon className="h-6 w-6" />}
              <input
                type="file"
                accept={LIBRARY_PHOTO_ACCEPT}
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
                aria-label={t('lib_upload_image')}
              />
            </label>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[rgb(var(--border-light))] pt-3">
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#b08075] hover:text-[#b06a4f]"
        >
          <FiTrash2 className="text-base" />
          {t('delete')}
        </button>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="btn-ghost text-sm">
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

function LibraryPhotoThumb({
  img,
  itemId,
  onUpdated,
  confirmDelete,
}: {
  img: NonNullable<LibraryItem['images']>[number]
  itemId: number
  onUpdated: (updated: LibraryItem) => void
  confirmDelete: ReturnType<typeof useConfirmDelete>
}) {
  const { t } = useTranslation()
  const { showToast } = useToast()

  return (
    <div className="group relative flex-shrink-0">
      {isImageUrl(img.storedName) ? (
        <img
          src={img.storedName}
          alt={img.originalName}
          className={`h-16 w-16 rounded-xl border-2 object-cover ${img.isMain ? 'border-sand-green-dark' : 'border-soft-brown/20'}`}
          loading="lazy"
        />
      ) : (
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-xl border-2 text-warm-gray ${img.isMain ? 'border-sand-green-dark' : 'border-soft-brown/20'}`}
        >
          <FileTypeIcon url={img.storedName} className="h-6 w-6" />
        </div>
      )}
      <button
        type="button"
        onClick={async () => {
          try {
            onUpdated(await libraryApi.setLibraryImageMain(itemId, img.id))
            showToast(t('lib_item_updated_toast'))
          } catch (err) {
            reportError(err, { context: 'library set main image', itemId, imageId: img.id })
            showToast(t('action_failed'), 'error')
          }
        }}
        aria-label={img.isMain ? t('main_image') : t('set_as_main')}
        className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full transition-colors ${img.isMain ? 'bg-sand-green-dark text-white' : 'bg-black/40 text-white hover:bg-sand-green-dark'}`}
        title={img.isMain ? t('main_image') : t('set_as_main')}
      >
        <StarIcon className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() =>
          confirmDelete(
            t('delete_library_photo_confirm'),
            async () => {
              onUpdated(await libraryApi.deleteLibraryImage(itemId, img.id))
            },
            'library_photo_removed_toast'
          )
        }
        aria-label={t('delete')}
        className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 group-hover:flex"
        title={t('delete')}
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
