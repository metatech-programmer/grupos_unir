'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import InstallAppButton from '@/components/InstallAppButton'
import PushNotificationsToggle from '@/components/PushNotificationsToggle'
import { supabase } from '@/lib/supabase'
import { SparkIcon } from '@/components/icons'
import ConfirmModal from '@/components/ConfirmModal'

export default function SettingsPage() {
  const router = useRouter()
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [dangerError, setDangerError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteKeyword, setDeleteKeyword] = useState('')

  const handleDeleteAccount = async () => {
    if (deletingAccount) return

    if (deleteKeyword !== 'ELIMINAR') {
      setDangerError('Debes escribir ELIMINAR exactamente para confirmar.')
      return
    }

    try {
      setDangerError('')
      setDeletingAccount(true)

      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      if (!accessToken) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'No se pudo eliminar la cuenta')
      }

      await supabase.auth.signOut()
      setShowDeleteModal(false)
      setDeleteKeyword('')
      router.push('/register')
      router.refresh()
    } catch (error) {
      setDangerError(error instanceof Error ? error.message : 'No se pudo eliminar la cuenta')
    } finally {
      setDeletingAccount(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 md:py-10">
      <div className="max-w-4xl mx-auto">
        <header className="card mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-sora)' }}>Ajustes</h1>
            <p className="text-slate-600 text-sm mt-1">Personaliza apariencia, notificaciones e instalación de la app.</p>
          </div>
          <span className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <SparkIcon className="h-5 w-5" />
          </span>
        </header>

        <section className="grid md:grid-cols-3 gap-4 mb-6">
          <article className="card">
            <h2 className="font-semibold mb-2">Tema</h2>
            <p className="text-sm text-slate-600 mb-4">Cambia entre modo claro y oscuro.</p>
            <ThemeToggle className="btn-outline w-full text-sm" />
          </article>

          <article className="card">
            <h2 className="font-semibold mb-2">Notificaciones</h2>
            <p className="text-sm text-slate-600 mb-4">Recibe avisos de mensajes fuera de la app. En iOS debes instalar primero la app en pantalla de inicio.</p>
            <PushNotificationsToggle className="btn-outline w-full text-sm" />
          </article>

          <article className="card">
            <h2 className="font-semibold mb-2">Instalar app</h2>
            <p className="text-sm text-slate-600 mb-4">Instala GrupoFlow como PWA en tu dispositivo. Compatible con Chrome, Edge, Firefox y Zen.</p>
            <InstallAppButton className="btn-outline w-full text-sm" />
          </article>
        </section>

        <section className="card">
          <h2 className="font-semibold mb-3">Atajos rápidos</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <Link href="/dashboard" className="btn-outline text-center">Dashboard</Link>
            <Link href="/explore" className="btn-outline text-center">Explorar</Link>
            <Link href="/create-group" className="btn-outline text-center">Crear grupo</Link>
          </div>
        </section>

        <section className="card mt-6 border border-rose-200 bg-rose-50/30">
          <h2 className="font-semibold mb-2 text-rose-700">Zona de peligro</h2>
          <p className="text-sm text-slate-700 mb-4">Eliminar perfil borra tu cuenta y todos tus datos relacionados de forma permanente.</p>
          {dangerError && <p className="text-sm text-rose-700 mb-3">{dangerError}</p>}
          <button
            onClick={() => {
              setDangerError('')
              setDeleteKeyword('')
              setShowDeleteModal(true)
            }}
            disabled={deletingAccount}
            className="px-4 py-2 rounded-xl border border-rose-300 text-rose-700 font-semibold bg-white hover:bg-rose-100 disabled:opacity-50"
          >
            {deletingAccount ? 'Eliminando perfil...' : 'Eliminar perfil'}
          </button>
        </section>

        <ConfirmModal
          open={showDeleteModal}
          title="Eliminar perfil"
          description="Esta acción es permanente. Se eliminarán tu cuenta y todos los datos relacionados."
          confirmLabel="Eliminar definitivamente"
          cancelLabel="Cancelar"
          onConfirm={handleDeleteAccount}
          onCancel={() => {
            if (deletingAccount) return
            setShowDeleteModal(false)
            setDeleteKeyword('')
          }}
          loading={deletingAccount}
          variant="danger"
        >
          <div className="mt-3 space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Escribe ELIMINAR para confirmar</label>
            <input
              type="text"
              value={deleteKeyword}
              onChange={(e) => setDeleteKeyword(e.target.value)}
              className="input-modern"
              placeholder="ELIMINAR"
            />
          </div>
        </ConfirmModal>
      </div>
    </div>
  )
}
