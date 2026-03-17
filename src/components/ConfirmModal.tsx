'use client'

import { useEffect, type ReactNode } from 'react'

type ConfirmModalProps = {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  variant?: 'default' | 'danger'
  showCancel?: boolean
  children?: ReactNode
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Salir',
  onConfirm,
  onCancel,
  loading = false,
  variant = 'default',
  showCancel = true,
  children,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        onCancel()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, loading, onCancel])

  if (!open) return null

  const confirmClass = variant === 'danger'
    ? 'px-4 py-2 rounded-xl border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-50'
    : 'px-4 py-2 rounded-xl border border-sky-300 text-sky-700 bg-sky-50 hover:bg-sky-100 disabled:opacity-50'

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-md modal-backdrop-enter"
        aria-label="Cerrar modal"
        onClick={() => {
          if (!loading) onCancel()
        }}
      />

      <div className="relative w-full max-w-md card modal-panel-enter">
        <button
          type="button"
          onClick={() => {
            if (!loading) onCancel()
          }}
          className="absolute right-3 top-3 h-8 w-8 rounded-full border border-slate-300 bg-white/85 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          disabled={loading}
          aria-label="Cerrar"
          title="Cerrar"
        >
          x
        </button>
        <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-sora)' }}>{title}</h3>
        {description && <p className="text-sm text-slate-600 mb-4">{description}</p>}
        {children}

        <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={confirmClass}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
