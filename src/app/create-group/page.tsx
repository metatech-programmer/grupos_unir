 'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, User } from '@/lib/supabase'
import { SUBJECTS } from '@/lib/subjects'
import { ACTIVITIES, DAILY_HOURS, WORK_STATUS, SCHEDULE_SLOTS } from '@/lib/profile-options'
import { TeamIcon } from '@/components/icons'
import LoadingScreen from '@/components/LoadingScreen'
import { Button, Input, Card } from '@/components/ui'

export default function CreateGroupPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
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
        const authUser = session?.user
        if (!authUser) {
        router.push('/login')
        return
      }

        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', authUser.id)
          .maybeSingle()

        if (profile?.id) {
          const { data: adminMembership } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', profile.id)
            .eq('role', 'admin')
            .limit(1)
            .maybeSingle()

          if (adminMembership?.group_id) {
            router.push(`/groups/${adminMembership.group_id}`)
            return
          }
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
      throw new Error('Debes iniciar sesión para crear un grupo')
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

        if (syncError || !syncedUser) throw syncError || new Error('No fue posible sincronizar teléfono')
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
    setFieldErrors({})
    setLoading(true)

    try {
      const errors: Record<string, string> = {}
      if (!formData.name.trim()) errors.name = 'El nombre del grupo es obligatorio'
      if (formData.max_size < 3 || formData.max_size > 5) errors.max_size = 'El grupo debe tener entre 3 y 5 integrantes'
      if (formData.active_hours_end <= formData.active_hours_start) errors.active_hours = 'El horario del grupo no es válido'
      if (formData.activity_focus.length === 0) errors.activity_focus = 'Selecciona al menos una actividad objetivo'

      const selectedSubject = formData.subject === 'Otro' ? formData.customSubject.trim() : formData.subject
      if (!selectedSubject) errors.subject = 'Selecciona o escribe una asignatura'

      if (Object.keys(errors).length) {
        setFieldErrors(errors)
        throw new Error('Corrige los errores del formulario')
      }

      await ensureUserProfile()
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
        p_cons: ['Aún faltan integrantes para completar el equipo'],
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
    return <LoadingScreen title="Preparando creador" subtitle="Cargando configuración del nuevo grupo..." />
  }

  return (
    <div className="min-h-screen px-4 py-8 md:py-14">
      <div className="max-w-3xl mx-auto">
        <Card className="p-6">
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
                <Input label="Nombre del Grupo" name="name" value={formData.name} onChange={handleChange} placeholder="Equipo Producto Internacional" />
                {fieldErrors.name && <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Asignatura</label>
                <select name="subject" value={formData.subject} onChange={handleChange} className="input-modern">
                  {SUBJECTS.map(subject => <option key={subject} value={subject}>{subject}</option>)}
                </select>
                {fieldErrors.subject && <p className="text-sm text-red-600 mt-1">{fieldErrors.subject}</p>}
              </div>
            </div>

            {formData.subject === 'Otro' && (
              <div>
                <Input label="Asignatura personalizada" name="customSubject" value={formData.customSubject} onChange={handleChange} placeholder="Escribe la asignatura" />
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Máximo integrantes</label>
                <select name="max_size" value={formData.max_size} onChange={handleChange} className="input-modern">
                  <option value={3}>3 integrantes</option>
                  <option value={4}>4 integrantes</option>
                  <option value={5}>5 integrantes</option>
                </select>
                {fieldErrors.max_size && <p className="text-sm text-red-600 mt-1">{fieldErrors.max_size}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ritmo laboral objetivo</label>
                <select name="preferred_work_style" value={formData.preferred_work_style} onChange={handleChange} className="input-modern">
                  <option value="flexible">Flexible</option>
                  {WORK_STATUS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Horas recomendadas al día</label>
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
                {fieldErrors.active_hours && <p className="text-sm text-red-600 mt-1">{fieldErrors.active_hours}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Actividades foco del equipo</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {ACTIVITIES.map(activity => {
                  const selected = formData.activity_focus.includes(activity)
                  return (
                    <Button
                      key={activity}
                      type="button"
                      variant={selected ? 'primary' : 'ghost'}
                      className={`px-3 py-2 text-sm ${selected ? 'border-slate-800' : 'border-slate-200'}`}
                      onClick={() => toggleFocus(activity)}
                    >
                      {activity}
                    </Button>
                  )
                })}
              </div>
              {fieldErrors.activity_focus && <p className="text-sm text-red-600 mt-2">{fieldErrors.activity_focus}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:justify-items-start">
              <Button type="submit" variant="primary" className="w-full sm:w-auto disabled:opacity-50" disabled={loading}>
                {loading ? 'Creando grupo...' : 'Crear Grupo'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

