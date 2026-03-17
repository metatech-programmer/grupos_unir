'use client'

import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SparkIcon } from '@/components/icons'

function CheckEmailContent() {
  const searchParams = useSearchParams()
  const email = useMemo(() => searchParams.get('email') || '', [searchParams])
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleResend = async () => {
    if (!email || sending) return

    try {
      setSending(true)
      setError('')
      setMessage('')

      const redirectBaseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin

      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${redirectBaseUrl}/login`,
        },
      })

      if (resendError) throw resendError

      setMessage('Te reenviamos el correo de verificación. Revisa bandeja de entrada y spam.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reenviar el correo')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 md:py-14">
      <div className="max-w-2xl mx-auto card">
        <header className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-sora)' }}>Revisa tu correo</h1>
            <p className="text-slate-600 mt-2">Tu cuenta fue creada. Solo falta confirmar tu email para poder iniciar sesión.</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <SparkIcon className="h-6 w-6" />
          </div>
        </header>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-5">
          <p className="text-sm text-amber-900">Correo registrado:</p>
          <p className="font-semibold text-amber-900 break-all">{email || 'No disponible'}</p>
        </div>

        <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 mb-6">
          <li>Abre tu bandeja de entrada (y spam/promociones).</li>
          <li>Busca el correo de verificación de Supabase.</li>
          <li>Haz clic en el enlace y vuelve a iniciar sesión.</li>
        </ol>

        {message && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}
        {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/login" className="btn-primary text-center">Ir a iniciar sesión</Link>
          <button type="button" className="btn-outline" onClick={handleResend} disabled={sending || !email}>
            {sending ? 'Reenviando...' : 'Reenviar correo'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen px-4 py-8 md:py-14">
        <div className="max-w-2xl mx-auto card">
          <p className="text-sm text-slate-600">Cargando verificación de correo...</p>
        </div>
      </div>
    }
    >
      <CheckEmailContent />
    </Suspense>
  )
}
