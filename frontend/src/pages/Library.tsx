import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../context/ToastContext'
import { libraryApi } from '../api'
import type { LibraryItem, LibraryItemType } from '../types'
import { ITEM_TYPES, TYPE_ICONS, LibraryItemForm } from '../components/LibraryItemForm'
import { LibraryFilterBar } from '../components/LibraryFilterBar'
import { LibraryCard } from '../components/LibraryCard'
import { itemSummary, typeLabel } from '../utils/libraryUtils'
import { useLibraryFilter } from '../hooks/useLibraryFilter'
import { useConfirmDelete } from '../hooks/useConfirmDelete'
import { useAsyncData } from '../hooks/useAsyncData'

export default function Library() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { data: items, setData: setItems, loading, error } = useAsyncData(() => libraryApi.getAll(), [] as LibraryItem[])
  const [adding, setAdding] = useState(false)
  const [selectedType, setSelectedType] = useState<LibraryItemType>('YARN')

  const { filterType, setFilterType, filterColors, setFilterColors, search, setSearch, showColorFilter, availableColors, filtered } = useLibraryFilter(items)

  const grouped = useMemo(() => ITEM_TYPES.map(type => ({
    type,
    items: filtered.filter(i => i.itemType === type),
  })).filter(g => g.items.length > 0), [filtered])

  const confirmDelete = useConfirmDelete()

  const handleDelete = useCallback(async (id: number) => {
    await confirmDelete(
      t('lib_delete_confirm'),
      async () => {
        await libraryApi.delete(id)
        setItems(prev => prev.filter(i => i.id !== id))
      },
      'lib_item_deleted_toast',
    )
  }, [confirmDelete, t, setItems])

  const handleCreated = useCallback((item: LibraryItem) => {
    setItems(prev => [item, ...prev])
    setAdding(false)
    showToast(t('lib_item_created_toast'))
  }, [setItems, showToast, t])

  const handleUpdated = useCallback((item: LibraryItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? item : i))
  }, [setItems])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">{t('library_heading')}</h2>
        <button onClick={() => { if (!adding) setSelectedType(filterType ?? 'YARN'); setAdding(v => !v) }} className="btn-secondary text-sm">
          {adding ? t('cancel') : `+ ${t('library_add')}`}
        </button>
      </div>

      <LibraryFilterBar
        filterType={filterType}
        setFilterType={setFilterType}
        filterColors={filterColors}
        setFilterColors={setFilterColors}
        search={search}
        setSearch={setSearch}
        showColorFilter={showColorFilter}
        availableColors={availableColors}
      />

      {adding && (
        <LibraryItemForm
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          onCreated={handleCreated}
          onCancel={() => setAdding(false)}
        />
      )}

      {loading ? (
        <div className="text-center py-12 text-warm-gray">{t('loading')}</div>
      ) : error ? (
        <div className="text-center py-12 text-red-400 text-sm">{t('load_failed')}</div>
      ) : filtered.length === 0 && !adding ? (
        <div className="card text-center py-10">
          <p className="text-warm-gray text-sm">{t('library_empty')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ type, items: groupItems }) => (
            <div key={type}>
              <h3 className="text-xs font-semibold text-sand-blue-deep uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>{TYPE_ICONS[type]}</span>
                <span>{typeLabel(type, t)}</span>
              </h3>
              <div className="space-y-2">
                {groupItems.map(item => (
                  <LibraryCard
                    key={item.id}
                    item={item}
                    subtitle={itemSummary(item)}
                    onDelete={handleDelete}
                    onImageUploaded={handleUpdated}
                    onUpdated={handleUpdated}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
