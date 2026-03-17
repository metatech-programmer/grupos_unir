'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { TIMEZONES, COUNTRIES } from '@/lib/timezones'
import { ACTIVITIES, DAILY_HOURS, SCHEDULE_SLOTS, WORK_STATUS } from '@/lib/profile-options'
import { UserIcon } from '@/components/icons'
import LoadingScreen from '@/components/LoadingScreen'
import { Button, Input, Card } from '@/components/ui'

type ProfileForm = {
  name: string
  email: string
  phone: string
  country: string
  timezone: string
  work_status: string
  daily_hours: number
  availability_start: number
  availability_end: number
  activities: string[]
}

export default function ProfilePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState<ProfileForm>({
    name: '',
    email: '',
    phone: '',
    country: 'other',
    timezone: 'Europe/Madrid',
    work_status: 'student',
    daily_hours: 2,
    availability_start: 18,
    availability_end: 22,
    activities: [],
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const loadProfile = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const authUser = sessionData.session?.user

        if (!authUser) {
          router.push('/login')
          return
        }

        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', authUser.id)
          .single()

        if (userError && userError.code !== 'PGRST116') throw userError

        let userData = existingUser

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

          if (createError || !createdUser) throw createError || new Error('No se pudo crear el perfil')
          userData = createdUser
        }

        setFormData({
          name: userData.name || '',
          email: userData.email || authUser.email || '',
          phone: userData.phone || '',
          country: userData.country || 'other',
          timezone: userData.timezone || 'Europe/Madrid',
          work_status: userData.work_status || 'student',
          daily_hours: userData.daily_hours || 2,
          availability_start: userData.availability_start || 18,
          availability_end: userData.availability_end || 22,
          activities: userData.activities || [],
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el perfil')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [mounted, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: ['daily_hours', 'availability_start', 'availability_end'].includes(name)
        ? Number(value)
        : value,
    }))
  }

  const handleToggleActivity = (activity: string) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter((item) => item !== activity)
        : [...prev.activities, activity],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    // basic client validation
    if (formData.availability_end <= formData.availability_start) {
      setError('La hora de fin debe ser mayor que la hora de inicio')
      return
    }

    try {
      if (!formData.name || !formData.phone || !formData.country || !formData.timezone) {
        setError('Por favor completa todos los campos obligatorios')
        return
      }

      if (formData.availability_end <= formData.availability_start) {
        setError('La hora de fin debe ser mayor que la hora de inicio')
        return
      }

      if (formData.activities.length === 0) {
        setError('Selecciona al menos una actividad')
        return
      }

      setSaving(true)

      const { data: sessionData } = await supabase.auth.getSession()
      const authUser = sessionData.session?.user
      if (!authUser) {
        router.push('/login')
        return
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: formData.name,
          phone: formData.phone,
          country: formData.country,
          timezone: formData.timezone,
          work_status: formData.work_status,
          daily_hours: formData.daily_hours,
          availability_start: formData.availability_start,
          availability_end: formData.availability_end,
          activities: formData.activities,
        })
        .eq('auth_id', authUser.id)

      if (updateError) throw updateError

      setSuccess('Perfil actualizado correctamente')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el perfil')
    } finally {
      setSaving(false)
    }
  }

  if (!mounted || loading) {
    return <LoadingScreen title="Cargando perfil" subtitle="Preparando tu información personal..." />
  }

  return (
    <div className="min-h-screen px-4 py-8 md:py-10">
      <div className="max-w-4xl mx-auto">
        <Card>
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-sora)' }}>Mi Perfil</h1>
              <p className="text-slate-600 mt-2">Aquí puedes ver y editar tu perfil personal.</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <UserIcon className="h-6 w-6" />
            </div>
          </header>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Input label="Nombre completo" name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input type="email" name="email" value={formData.email} className="input-modern opacity-80" disabled />
              </div>
              <div>
                <Input label="Número (WhatsApp)" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">País</label>
                <select name="country" value={formData.country} onChange={handleChange} className="input-modern" required>
                  {COUNTRIES.map((country) => (
                    <option key={country.value} value={country.value}>{country.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Zona horaria</label>
                <select name="timezone" value={formData.timezone} onChange={handleChange} className="input-modern" required>
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Situación laboral</label>
                <select name="work_status" value={formData.work_status} onChange={handleChange} className="input-modern">
                  {WORK_STATUS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Horas por día</label>
                <select name="daily_hours" value={formData.daily_hours} onChange={handleChange} className="input-modern">
                  {DAILY_HOURS.map((hours) => (
                    <option key={hours} value={hours}>{hours} horas</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Inicio</label>
                  <select name="availability_start" value={formData.availability_start} onChange={handleChange} className="input-modern">
                    {SCHEDULE_SLOTS.map((slot) => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fin</label>
                  <select name="availability_end" value={formData.availability_end} onChange={handleChange} className="input-modern">
                    {SCHEDULE_SLOTS.map((slot) => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Actividades</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {ACTIVITIES.map((activity) => {
                  const active = formData.activities.includes(activity)
                  return (
                    <Button
                      key={activity}
                      type="button"
                      variant={active ? 'primary' : 'ghost'}
                      className={`px-3 py-2 text-sm ${active ? 'border-slate-800' : 'border-slate-200'}`}
                      onClick={() => handleToggleActivity(activity)}
                    >
                      {activity}
                    </Button>
                  )
                })}
              </div>
            </div>

            <Button type="submit" variant="primary" className="disabled:opacity-50" disabled={saving}>
              {saving ? 'Guardando cambios...' : 'Guardar perfil'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
