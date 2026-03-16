'use client'

import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import InstallAppButton from '@/components/InstallAppButton'
import PushNotificationsToggle from '@/components/PushNotificationsToggle'
import { SparkIcon } from '@/components/icons'

export default function SettingsPage() {
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
      </div>
    </div>
  )
}
