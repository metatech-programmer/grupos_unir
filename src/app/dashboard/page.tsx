'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, User } from '@/lib/supabase'
import { ActivityIcon, BrainIcon, TeamIcon, ClockIcon } from '@/components/icons'
import LoadingScreen from '@/components/LoadingScreen'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const authUser = session?.user
        if (!authUser) {
          router.push('/login')
          return
        }

        const { data: existingUser, error: userQueryError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', authUser.id)
          .single()

        if (userQueryError && userQueryError.code !== 'PGRST116') {
          throw userQueryError
        }

        let userData = existingUser
        if (userData && (!userData.phone || userData.phone.trim() === '') && authUser.user_metadata?.phone) {
          const { data: syncedUser, error: syncError } = await supabase
            .from('users')
            .update({
              phone: String(authUser.user_metadata.phone),
            })
            .eq('auth_id', authUser.id)
            .select('*')
            .single()

          if (syncError) throw syncError
          userData = syncedUser
        }

        if (!userData) {
          const { data: createdUser, error: createError } = await supabase
            .from('users')
            .upsert([
              {
                auth_id: authUser.id,
                name: authUser.user_metadata?.name || authUser.email || 'Usuario',
                email: authUser.email || '',
                phone: authUser.user_metadata?.phone || null,
                country: authUser.user_metadata?.country || 'other',
                timezone: authUser.user_metadata?.timezone || 'Europe/Madrid',
                work_status: authUser.user_metadata?.work_status || 'student',
                daily_hours: authUser.user_metadata?.daily_hours || 2,
                availability_start: authUser.user_metadata?.availability_start || 18,
                availability_end: authUser.user_metadata?.availability_end || 22,
                activities: authUser.user_metadata?.activities || ['Backend'],
              },
            ], { onConflict: 'auth_id' })
            .select('*')
            .single()

          if (createError) throw createError
          userData = createdUser
        }

        setUser(userData)
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, mounted])

  if (!mounted || loading) {
    return <LoadingScreen title="Cargando panel" subtitle="Sincronizando tus datos y tu grupo..." />
  }

  if (!user) return null

  return (
    <div className="min-h-screen px-4 py-6 md:py-10">
      <header className="max-w-6xl mx-auto card mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <TeamIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-sora)' }}>Panel de Coordinación</h1>
            <p className="text-slate-600 text-sm">Hola, {user.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
        <section className="card lg:col-span-1">
          <h2 className="font-semibold text-lg mb-4" style={{ fontFamily: 'var(--font-sora)' }}>Perfil de trabajo</h2>
          <div className="space-y-2 text-sm text-slate-700">
            <p><strong>Nombre:</strong> {user.name}</p>
            <p><strong>País:</strong> {user.country}</p>
            <p><strong>Zona horaria:</strong> {user.timezone}</p>
            <p><strong>Trabajo:</strong> {user.work_status}</p>
            <p><strong>Horas al día:</strong> {user.daily_hours}</p>
            <p><strong>Horario:</strong> {String(user.availability_start).padStart(2, '0')}:00 - {String(user.availability_end).padStart(2, '0')}:00</p>
            <p><strong>Actividades:</strong> {(user.activities || []).join(', ')}</p>
          </div>
          <Link href="/register" className="btn-outline mt-5 inline-flex">Actualizar perfil</Link>
        </section>

        <section className="card lg:col-span-2">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
              <BrainIcon className="h-5 w-5 text-slate-700" />
              <p className="text-sm text-slate-600 mt-2">Recomendación IA</p>
              <p className="font-semibold">Activa y gratuita</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
              <ClockIcon className="h-5 w-5 text-slate-700" />
              <p className="text-sm text-slate-600 mt-2">Disponibilidad</p>
              <p className="font-semibold">{user.daily_hours} h por día</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
              <ActivityIcon className="h-5 w-5 text-slate-700" />
              <p className="text-sm text-slate-600 mt-2">Estado</p>
              <p className="font-semibold">{user.group_id ? 'En grupo' : 'Sin grupo'}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/explore" className="btn-primary text-center">Explorar grupos sugeridos</Link>
            <Link href="/create-group" className="btn-outline text-center">Crear grupo nuevo</Link>
          </div>

          {user.group_id && (
            <Link href={`/groups/${user.group_id}`} className="btn-secondary text-center mt-4 block">Ver mi grupo actual</Link>
          )}
        </section>
      </main>
    </div>
  )
}

