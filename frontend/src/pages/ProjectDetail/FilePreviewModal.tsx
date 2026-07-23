import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ProjectFile } from '../../types'
import { FileTypeIcon } from '../../components/FileTypeIcon'
import { CloseIcon } from '../../components/UiIcons'
import { useModalA11y } from '../../hooks/useModalA11y'
import { FiMinus, FiPlus, FiExternalLink } from 'react-icons/fi'

export function FilePreviewModal({ file, onClose }: { file: ProjectFile; onClose: () => void }) {
  const { t } = useTranslation()
  const [zoom, setZoom] = useState(1)
  const url = file.storedName
  const panelRef = useRef<HTMLDivElement>(null)
  useModalA11y(panelRef, onClose)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={file.originalName}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{ background: 'radial-gradient(120% 90% at 50% 40%, rgba(58,46,38,.85), rgba(28,22,19,.97))' }}
    >
      <button
        type="button"
        aria-label={t('close')}
        className="absolute inset-0 w-full h-full cursor-default"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative z-10 flex flex-col items-center gap-3 w-full max-w-4xl outline-none"
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-white text-sm font-medium truncate max-w-xs">{file.originalName}</span>
          <button
            onClick={onClose}
            className="ml-4 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            title={t('close')}
            aria-label={t('close')}
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {file.fileType === 'image' ? (
          <>
            <div
              className="overflow-auto rounded-lg w-full flex items-center justify-center"
              style={{ maxHeight: '75vh' }}
            >
              <img
                src={url}
                alt={file.originalName}
                style={{
                  display: 'block',
                  maxWidth: zoom === 1 ? '100%' : `${zoom * 100}%`,
                  maxHeight: zoom === 1 ? '72vh' : undefined,
                  width: zoom === 1 ? 'auto' : `${zoom * 100}%`,
                  height: zoom === 1 ? 'auto' : undefined,
                }}
                className="rounded-lg"
              />
            </div>
            <div className="flex items-center gap-1 rounded-full bg-[#1c1613]/70 border border-white/10 p-1">
              <button
                onClick={() => setZoom(z => Math.max(0.25, parseFloat((z - 0.25).toFixed(2))))}
                className="flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10"
                title={t('zoom_out')}
                aria-label={t('zoom_out')}
              >
                <FiMinus className="w-[18px] h-[18px]" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="h-11 min-w-[3rem] rounded-full px-2 text-xs text-white hover:bg-white/10"
                title={t('zoom_reset')}
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={() => setZoom(z => Math.min(4, parseFloat((z + 0.25).toFixed(2))))}
                className="flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10"
                title={t('zoom_in')}
                aria-label={t('zoom_in')}
              >
                <FiPlus className="w-[18px] h-[18px]" />
              </button>
            </div>
          </>
        ) : file.fileType === 'pdf' ? (
          <iframe
            src={url}
            title={file.originalName}
            className="w-full rounded-lg bg-white"
            style={{ height: '78vh' }}
          />
        ) : (
          <div className="bg-white rounded-xl p-10 text-center">
            <div className="mb-4 flex justify-center text-warm-gray">
              <FileTypeIcon fileType={file.fileType} className="w-16 h-16" />
            </div>
            <p className="text-ink font-medium mb-6">{file.originalName}</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-1.5"
            >
              <FiExternalLink className="text-base" />
              {t('open_file')}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
