'use client'

import Link from 'next/link'
import { ActivityIcon, BrainIcon, ClockIcon, TeamIcon } from '@/components/icons'

const features = [
  {
    title: 'Motor de recomendacion IA gratuito',
    description: 'La plataforma calcula compatibilidad por zona horaria, disponibilidad diaria, actividades y carga de trabajo.',
    icon: BrainIcon,
  },
  {
    title: 'Coordinacion real por horarios',
    description: 'Compara franjas horarias para sugerir equipos con mayor solape de tiempo y menos friccion operativa.',
    icon: ClockIcon,
  },
  {
    title: 'Seguimiento de equipo en vivo',
    description: 'Con Supabase en tiempo real todos ven cambios de grupos, cupos y actualizaciones sin recargar.',
    icon: ActivityIcon,
  },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="max-w-6xl mx-auto px-4 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <TeamIcon className="h-5 w-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-sora)' }}>GrupoFlow</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto sm:justify-end">
          <Link href="/login" className="btn-outline w-full sm:w-auto">Iniciar sesion</Link>
          <Link href="/register" className="btn-primary w-full sm:w-auto">Crear cuenta</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-16">
        <section className="hero-grid card overflow-hidden relative">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Distribucion Inteligente de Equipos
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight text-slate-900" style={{ fontFamily: 'var(--font-sora)' }}>
                Organiza grupos con una experiencia clara y moderna.
              </h2>
              <p className="mt-5 text-slate-600 text-base sm:text-lg max-w-xl">
                Diseñada para clases internacionales: crea equipos de 3 a 5 personas, compara pros y contras, y decide con informacion real.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                <Link href="/explore" className="btn-primary w-full sm:w-auto">Explorar grupos</Link>
                <Link href="/create-group" className="btn-outline w-full sm:w-auto">Crear grupo</Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="card bg-slate-900 text-white border-slate-800">
                <p className="text-sm text-slate-300">Criterios de decision</p>
                <p className="mt-2 text-xl font-semibold" style={{ fontFamily: 'var(--font-sora)' }}>Horario, trabajo, actividades y disponibilidad</p>
              </div>
              <div className="card bg-white/95">
                <p className="text-sm text-slate-500">Tamano recomendado</p>
                <p className="mt-2 text-3xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-sora)' }}>3 a 5 integrantes</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mt-10">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <article key={feature.title} className="card">
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold mt-4" style={{ fontFamily: 'var(--font-sora)' }}>{feature.title}</h3>
                <p className="text-slate-600 mt-3 leading-relaxed">{feature.description}</p>
              </article>
            )
          })}
        </section>
      </main>
    </div>
  )
}

