'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BellIcon } from '@/components/icons'

type PushNotificationsToggleProps = {
  className?: string
  compact?: boolean
}

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

export default function PushNotificationsToggle({ className, compact = false }: PushNotificationsToggleProps) {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [requiresIosInstall, setRequiresIosInstall] = useState(false)

  const isSupported = useMemo(() => {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
  }, [])

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(ua)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    setRequiresIosInstall(isIOS && !isStandalone)

    const init = async () => {
      if (!isSupported) return

      try {
        const registration = await navigator.serviceWorker.ready
        const existingSubscription = await registration.pushManager.getSubscription()
        setEnabled(Boolean(existingSubscription) && Notification.permission === 'granted')
      } catch (error) {
        console.warn('No se pudo iniciar estado de notificaciones push:', error)
      }
    }

    init()
  }, [isSupported])

  const getAccessToken = async () => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || null
  }

  const enableNotifications = async () => {
    if (!isSupported || loading) return

    if (requiresIosInstall) {
      alert('En iOS primero instala la app en pantalla de inicio y luego activa notificaciones desde la app instalada.')
      return
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidPublicKey) {
      alert('Falta NEXT_PUBLIC_VAPID_PUBLIC_KEY en las variables de entorno')
      return
    }

    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      alert('Las notificaciones push solo funcionan con HTTPS o localhost.')
      return
    }

    try {
      setLoading(true)

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('Debes permitir notificaciones para activarlas.')
        return
      }

      const registration = await navigator.serviceWorker.register('/sw.js')
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        })
      }

      const token = await getAccessToken()
      if (!token) {
        alert('Tu sesión no es válida. Inicia sesión de nuevo.')
        return
      }

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscription }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || 'No se pudo registrar la suscripción push')
      }

      setEnabled(true)
    } catch (error) {
      console.error(error)
      alert('No se pudieron activar las notificaciones push')
    } finally {
      setLoading(false)
    }
  }

  const disableNotifications = async () => {
    if (!isSupported || loading) return

    try {
      setLoading(true)
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        setEnabled(false)
        return
      }

      const endpoint = subscription.endpoint
      await subscription.unsubscribe()

      const token = await getAccessToken()
      if (token) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ endpoint }),
        })
      }

      setEnabled(false)
    } catch (error) {
      console.error(error)
      alert('No se pudieron desactivar las notificaciones push')
    } finally {
      setLoading(false)
    }
  }

  if (!isSupported) {
    return null
  }

  const label = loading ? 'Procesando...' : enabled ? 'Notificaciones activas' : 'Activar notificaciones'
  const baseClass = className || 'btn-outline text-sm'

  return (
    <button
      type="button"
      onClick={enabled ? disableNotifications : enableNotifications}
      disabled={loading}
      className={`${baseClass} ${enabled ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : ''}`}
      aria-label={label}
      title={label}
    >
      {compact ? (
        <span className="inline-flex items-center justify-center relative">
          <BellIcon className="h-4 w-4" />
          {enabled && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500" />}
        </span>
      ) : (
        label
      )}
    </button>
  )
}
