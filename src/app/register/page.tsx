'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TIMEZONES, COUNTRIES } from '@/lib/timezones'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ACTIVITIES, DAILY_HOURS, SCHEDULE_SLOTS, WORK_STATUS } from '@/lib/profile-options'
import { SparkIcon, TeamIcon } from '@/components/icons'
import LoadingScreen from '@/components/LoadingScreen'

export default function RegisterPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    timezone: 'Europe/Madrid',
    work_status: 'student',
    daily_hours: 2,
    availability_start: 18,
    availability_end: 22,
    activities: [] as string[],
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: ['daily_hours', 'availability_start', 'availability_end'].includes(name)
        ? Number(value)
        : value,
    }))
  }

  const handleToggleActivity = (activity: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Las contrasenas no coinciden')
        return
      }

      if (!formData.name || !formData.email || !formData.phone || !formData.country || !formData.timezone) {
        setError('Por favor completa todos los campos')
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

      const redirectBaseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${redirectBaseUrl}/login`,
          data: {
            name: formData.name,
            country: formData.country,
            timezone: formData.timezone,
            phone: formData.phone,
            work_status: formData.work_status,
            daily_hours: formData.daily_hours,
            availability_start: formData.availability_start,
            availability_end: formData.availability_end,
            activities: formData.activities,
          },
        },
      })

      if (authError) throw authError

      const identitiesCount = authData.user?.identities?.length ?? 0
      if (authData.user && identitiesCount === 0) {
        setError('Este correo ya esta registrado. Inicia sesion o recupera tu contrasena.')
        return
      }

      if (authData.user) {
        if (!authData.session) {
          setShowConfirmModal(true)
          return
        }

        const { error: dbError } = await supabase.from('users').insert([
          {
            auth_id: authData.user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            country: formData.country,
            timezone: formData.timezone,
            work_status: formData.work_status,
            daily_hours: formData.daily_hours,
            availability_start: formData.availability_start,
            availability_end: formData.availability_end,
            activities: formData.activities,
          },
        ])

        if (dbError) throw dbError
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return <LoadingScreen title="Cargando registro" subtitle="Armando tu formulario inteligente..." />
  }

  return (
    <div className="min-h-screen px-4 py-8 md:py-14">
      <div className="max-w-4xl mx-auto card">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-sora)' }}>Crear Perfil Operativo</h2>
            <p className="text-slate-600 mt-2">La distribucion inteligente usa horario, carga diaria, trabajo y actividades.</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <SparkIcon className="h-6 w-6" />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-modern" placeholder="Laura Gomez" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-modern" placeholder="tu@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Numero (WhatsApp)</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-modern" placeholder="+573001112233" required />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pais</label>
              <select name="country" value={formData.country} onChange={handleChange} className="input-modern" required>
                <option value="">Selecciona tu pais</option>
                {COUNTRIES.map(country => (
                  <option key={country.value} value={country.value}>{country.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Zona Horaria</label>
              <select name="timezone" value={formData.timezone} onChange={handleChange} className="input-modern" required>
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Situacion Laboral</label>
              <select name="work_status" value={formData.work_status} onChange={handleChange} className="input-modern">
                {WORK_STATUS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Horas por Dia</label>
              <select name="daily_hours" value={formData.daily_hours} onChange={handleChange} className="input-modern">
                {DAILY_HOURS.map(h => (
                  <option key={h} value={h}>{h} horas</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Inicio</label>
                <select name="availability_start" value={formData.availability_start} onChange={handleChange} className="input-modern">
                  {SCHEDULE_SLOTS.map(slot => (
                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fin</label>
                <select name="availability_end" value={formData.availability_end} onChange={handleChange} className="input-modern">
                  {SCHEDULE_SLOTS.map(slot => (
                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-700">
              <TeamIcon className="h-4 w-4" />
              <label className="text-sm font-semibold">Actividades que dominas</label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ACTIVITIES.map(activity => {
                const active = formData.activities.includes(activity)
                return (
                  <button
                    key={activity}
                    type="button"
                    onClick={() => handleToggleActivity(activity)}
                    className={`px-3 py-2 rounded-xl border text-sm transition ${active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}
                  >
                    {activity}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contrasena</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-modern" placeholder="********" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Contrasena</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input-modern" placeholder="********" required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Ya tienes cuenta?{' '}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Inicia sesion
          </Link>
        </p>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-sora)' }}>
              Cuenta creada
            </h3>
            <p className="mt-3 text-slate-600">
              Revisa tu correo para confirmar la cuenta y luego inicia sesion.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="btn-primary flex-1"
              >
                Ir a iniciar sesion
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="btn-outline flex-1"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

