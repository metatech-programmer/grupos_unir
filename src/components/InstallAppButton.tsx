'use client'

import { useEffect, useState } from 'react'
import { CheckIcon, DownloadIcon } from '@/components/icons'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type InstallAppButtonProps = {
  className?: string
  compact?: boolean
}

export default function InstallAppButton({ className, compact = false }: InstallAppButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [browserLabel, setBrowserLabel] = useState('tu navegador')
  const [isIOS, setIsIOS] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [hideHelp, setHideHelp] = useState(false)

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    const onInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone) {
      setInstalled(true)
    }

    const ua = navigator.userAgent.toLowerCase()
    setIsIOS(/iphone|ipad|ipod/.test(ua))

    if (ua.includes('safari') && !ua.includes('chrome') && !ua.includes('crios') && !ua.includes('fxios')) {
      setBrowserLabel('Safari')
    } else if (ua.includes('crios')) {
      setBrowserLabel('Chrome iOS')
    } else if (ua.includes('fxios')) {
      setBrowserLabel('Firefox iOS')
    } else if (ua.includes('edgios')) {
      setBrowserLabel('Edge iOS')
    } else
    if (ua.includes('zen')) {
      setBrowserLabel('Zen')
    } else if (ua.includes('firefox')) {
      setBrowserLabel('Firefox')
    } else if (ua.includes('edg')) {
      setBrowserLabel('Edge')
    } else if (ua.includes('chrome')) {
      setBrowserLabel('Chrome')
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  useEffect(() => {
    const shouldHide = window.localStorage.getItem('grupoflow-install-help-hidden') === 'true'
    setHideHelp(shouldHide)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowHelpModal(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!showHelpModal) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [showHelpModal])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  const showManualInstructions = () => {
    if (hideHelp) {
      return
    }
    setShowHelpModal(true)
  }

  const closeHelpModal = () => {
    setShowHelpModal(false)
  }

  const toggleHideHelp = () => {
    const next = !hideHelp
    setHideHelp(next)
    window.localStorage.setItem('grupoflow-install-help-hidden', String(next))
  }

  const instructions = isIOS
    ? [
      `En ${browserLabel}, toca el boton Compartir del navegador.`,
      'Selecciona Agregar a pantalla de inicio.',
      'Abre la app instalada desde tu inicio para habilitar notificaciones push.',
    ]
    : browserLabel === 'Firefox' || browserLabel === 'Zen'
    ? [
      `En ${browserLabel}, abre el menu del navegador.`,
      'Busca Instalar app o Agregar a pantalla de inicio.',
      'Confirma la instalacion y abre la app desde tu sistema.',
    ]
    : [
      `En ${browserLabel}, usa el icono de instalar en la barra de direcciones si aparece.`,
      'Si no aparece, abre el menu del navegador.',
      'Selecciona Instalar app y confirma la instalacion.',
    ]

  if (installed) {
    return (
      <button type="button" className={className || 'btn-outline text-sm'} disabled aria-label="App instalada" title="App instalada">
        {compact ? <CheckIcon className="h-4 w-4" /> : 'App instalada'}
      </button>
    )
  }

  if (!deferredPrompt) {
    return (
      <>
        <button
          type="button"
          onClick={showManualInstructions}
          className={className || 'btn-outline text-sm'}
          title={hideHelp ? 'Guia oculta. Activala en Ajustes si la necesitas.' : 'Ver guia de instalacion'}
          aria-label="Instalar app"
        >
          {compact ? <DownloadIcon className="h-4 w-4" /> : 'Instalar app'}
        </button>

        {showHelpModal && (
          <div
            className="fixed inset-0 z-[70] bg-slate-950/65 backdrop-blur-md modal-backdrop-enter"
            onClick={closeHelpModal}
            role="presentation"
          >
            <div className="h-dvh w-full grid place-items-center p-4 overflow-y-auto">
              <div
                className="card relative w-full max-w-lg max-h-[90dvh] overflow-y-auto modal-panel-enter"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={`Instalar en ${browserLabel}`}
              >
                <button
                  type="button"
                  onClick={closeHelpModal}
                  className="absolute right-3 top-3 h-8 w-8 rounded-full border border-slate-300 bg-white/85 text-slate-700 hover:bg-slate-100"
                  aria-label="Cerrar"
                  title="Cerrar"
                >
                  x
                </button>
                <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-sora)' }}>
                  Instalar en {browserLabel}
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Sigue estos pasos para instalar GrupoFlow como app.
                </p>

                <div className="mt-4 grid sm:grid-cols-3 gap-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-slate-900 text-white text-[10px] font-bold">IOS</span>
                    <p className="text-xs font-semibold text-slate-700">iOS / Safari</p>
                    <p className="text-[11px] text-slate-600 mt-1">Compartir {'->'} Agregar a pantalla de inicio</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-slate-900 text-white text-[10px] font-bold">AND</span>
                    <p className="text-xs font-semibold text-slate-700">Android</p>
                    <p className="text-[11px] text-slate-600 mt-1">Menu {'->'} Instalar app o Agregar a inicio</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-slate-900 text-white text-[10px] font-bold">WEB</span>
                    <p className="text-xs font-semibold text-slate-700">Desktop</p>
                    <p className="text-[11px] text-slate-600 mt-1">Icono de instalar en barra o menu</p>
                  </div>
                </div>

                <ol className="mt-4 space-y-2 text-sm text-slate-700 list-decimal list-inside">
                  {instructions.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>

                <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={hideHelp}
                    onChange={toggleHideHelp}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  No mostrar esta guía de nuevo
                </label>

                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" className="btn-outline text-sm" onClick={closeHelpModal}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      className={className || 'btn-outline text-sm'}
      aria-label="Instalar app"
      title="Instalar app"
    >
      {compact ? <DownloadIcon className="h-4 w-4" /> : 'Instalar app'}
    </button>
  )
}
