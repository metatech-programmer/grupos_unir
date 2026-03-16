'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, User } from '@/lib/supabase'
import { SUBJECTS } from '@/lib/subjects'
import { ACTIVITIES, DAILY_HOURS, WORK_STATUS, SCHEDULE_SLOTS } from '@/lib/profile-options'
import { TeamIcon } from '@/components/icons'
import LoadingScreen from '@/components/LoadingScreen'

export default function CreateGroupPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    subject: SUBJECTS[0],
    max_size: 5,
    customSubject: '',
    preferred_work_style: 'flexible',
    required_daily_hours: 2,
    active_hours_start: 18,
    active_hours_end: 22,
    activity_focus: [] as string[],
  })

  useEffect(() => {
    const checkAuth = async () => {
      setMounted(true)
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) {
        router.push('/login')
        return
      }
      setAuthChecked(true)
    }

    checkAuth()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: ['max_size', 'required_daily_hours', 'active_hours_start', 'active_hours_end'].includes(name)
        ? Number(value)
        : value,
    }))
  }

  const toggleFocus = (value: string) => {
    setFormData(prev => ({
      ...prev,
      activity_focus: prev.activity_focus.includes(value)
        ? prev.activity_focus.filter(v => v !== value)
        : [...prev.activity_focus, value],
    }))
  }

  const ensureUserProfile = async (): Promise<User> => {
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()
    const authUser = session?.user

    if (authError || !authUser) {
      throw new Error('Debes iniciar sesion para crear un grupo')
    }

    const { data: existingUser, error: userQueryError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single()

    if (userQueryError && userQueryError.code !== 'PGRST116') {
      throw userQueryError
    }

    if (existingUser) {
      if ((!existingUser.phone || existingUser.phone.trim() === '') && authUser.user_metadata?.phone) {
        const { data: syncedUser, error: syncError } = await supabase
          .from('users')
          .update({
            phone: String(authUser.user_metadata.phone),
          })
          .eq('auth_id', authUser.id)
          .select('*')
          .single()

        if (syncError || !syncedUser) throw syncError || new Error('No fue posible sincronizar telefono')
        return syncedUser as User
      }

      return existingUser as User
    }

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

    if (createError || !createdUser) throw createError || new Error('No fue posible crear el perfil de usuario')
    return createdUser as User
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.name.trim()) throw new Error('El nombre del grupo es obligatorio')
      if (formData.max_size < 3 || formData.max_size > 5) throw new Error('El grupo debe tener entre 3 y 5 integrantes')
      if (formData.active_hours_end <= formData.active_hours_start) throw new Error('El horario del grupo no es valido')
      if (formData.activity_focus.length === 0) throw new Error('Selecciona al menos una actividad objetivo')

      await ensureUserProfile()
      const selectedSubject = formData.subject === 'Otro' ? formData.customSubject.trim() : formData.subject
      if (!selectedSubject) throw new Error('Selecciona o escribe una asignatura')

      const { data: createdGroupId, error: createGroupError } = await supabase.rpc('create_group_atomic', {
        p_name: formData.name.trim(),
        p_subject: selectedSubject,
        p_max_size: formData.max_size,
        p_preferred_work_style: formData.preferred_work_style,
        p_required_daily_hours: formData.required_daily_hours,
        p_active_hours_start: formData.active_hours_start,
        p_active_hours_end: formData.active_hours_end,
        p_activity_focus: formData.activity_focus,
        p_pros: ['Horario inicial definido', 'Foco de trabajo claro'],
        p_cons: ['Aun faltan integrantes para completar el equipo'],
      })

      if (createGroupError || !createdGroupId) throw createGroupError || new Error('No se pudo crear el grupo')
      router.push(`/groups/${createdGroupId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando grupo')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || !authChecked) {
    return <LoadingScreen title="Preparando creador" subtitle="Cargando configuracion del nuevo grupo..." />
  }

  return (
    <div className="min-h-screen px-4 py-8 md:py-14">
      <div className="max-w-3xl mx-auto card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-sora)' }}>Crear Grupo</h1>
            <p className="text-slate-600 mt-2">Define estructura, disponibilidad y foco de actividades para recibir mejores recomendaciones.</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <TeamIcon className="h-6 w-6" />
          </div>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Grupo</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-modern" placeholder="Equipo Producto Internacional" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Asignatura</label>
              <select name="subject" value={formData.subject} onChange={handleChange} className="input-modern">
                {SUBJECTS.map(subject => <option key={subject} value={subject}>{subject}</option>)}
              </select>
            </div>
          </div>

          {formData.subject === 'Otro' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Asignatura personalizada</label>
              <input type="text" name="customSubject" value={formData.customSubject} onChange={handleChange} className="input-modern" placeholder="Escribe la asignatura" required />
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Maximo integrantes</label>
              <select name="max_size" value={formData.max_size} onChange={handleChange} className="input-modern">
                <option value={3}>3 integrantes</option>
                <option value={4}>4 integrantes</option>
                <option value={5}>5 integrantes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ritmo laboral objetivo</label>
              <select name="preferred_work_style" value={formData.preferred_work_style} onChange={handleChange} className="input-modern">
                <option value="flexible">Flexible</option>
                {WORK_STATUS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Horas recomendadas al dia</label>
              <select name="required_daily_hours" value={formData.required_daily_hours} onChange={handleChange} className="input-modern">
                {DAILY_HOURS.map(h => <option key={h} value={h}>{h} horas</option>)}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Inicio franja activa</label>
              <select name="active_hours_start" value={formData.active_hours_start} onChange={handleChange} className="input-modern">
                {SCHEDULE_SLOTS.map(slot => <option key={slot.value} value={slot.value}>{slot.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fin franja activa</label>
              <select name="active_hours_end" value={formData.active_hours_end} onChange={handleChange} className="input-modern">
                {SCHEDULE_SLOTS.map(slot => <option key={slot.value} value={slot.value}>{slot.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Actividades foco del equipo</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ACTIVITIES.map(activity => {
                const selected = formData.activity_focus.includes(activity)
                return (
                  <button
                    key={activity}
                    type="button"
                    onClick={() => toggleFocus(activity)}
                    className={`px-3 py-2 rounded-xl border text-sm transition ${selected ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}
                  >
                    {activity}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:justify-items-start">
            <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto disabled:opacity-50">
              {loading ? 'Creando grupo...' : 'Crear Grupo'}
            </button>
            <Link href="/explore" className="btn-outline w-full sm:w-auto">Volver a explorar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

