'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SUBJECTS } from '@/lib/subjects'
import { ACTIVITIES, DAILY_HOURS, WORK_STATUS, SCHEDULE_SLOTS } from '@/lib/profile-options'
import LoadingScreen from '@/components/LoadingScreen'
import { Button, Card } from '@/components/ui'

type GroupForm = {
  name: string
  subject: string
  customSubject: string
  max_size: number
  preferred_work_style: string
  required_daily_hours: number
  active_hours_start: number
  active_hours_end: number
  activity_focus: string[]
  prosText: string
  consText: string
}

const parseLines = (value: string) => {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export default function EditGroupPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params?.id as string

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [canEdit, setCanEdit] = useState(false)
  const [formData, setFormData] = useState<GroupForm>({
    name: '',
    subject: SUBJECTS[0],
    customSubject: '',
    max_size: 5,
    preferred_work_style: 'flexible',
    required_daily_hours: 2,
    active_hours_start: 18,
    active_hours_end: 22,
    activity_focus: [],
    prosText: '',
    consText: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !groupId) return

    const loadData = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const authId = sessionData.session?.user?.id

        if (!authId) {
          router.push('/login')
          return
        }

        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single()

        if (groupError || !groupData) throw groupError || new Error('Grupo no encontrado')

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', authId)
          .single()

        if (userError || !userData) throw userError || new Error('Perfil no encontrado')

        const { data: memberRoleData, error: roleError } = await supabase
          .from('group_members')
          .select('role')
          .eq('group_id', groupId)
          .eq('user_id', userData.id)
          .single()

        if (roleError && roleError.code !== 'PGRST116') throw roleError

        const isAdmin = memberRoleData?.role === 'admin' || groupData.created_by_auth === authId
        setCanEdit(Boolean(isAdmin))

        if (!isAdmin) {
          setError('Solo administradores del grupo pueden editar esta configuración.')
          return
        }

        const subjectIsCustom = !SUBJECTS.includes(groupData.subject)

        setFormData({
          name: groupData.name || '',
          subject: subjectIsCustom ? 'Otro' : groupData.subject,
          customSubject: subjectIsCustom ? groupData.subject : '',
          max_size: groupData.max_size || 5,
          preferred_work_style: groupData.preferred_work_style || 'flexible',
          required_daily_hours: groupData.required_daily_hours || 2,
          active_hours_start: groupData.active_hours_start || 18,
          active_hours_end: groupData.active_hours_end || 22,
          activity_focus: groupData.activity_focus || [],
          prosText: (groupData.pros || []).join('\n'),
          consText: (groupData.cons || []).join('\n'),
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el grupo')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [groupId, mounted, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: ['max_size', 'required_daily_hours', 'active_hours_start', 'active_hours_end'].includes(name)
        ? Number(value)
        : value,
    }))
  }

  const toggleFocus = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      activity_focus: prev.activity_focus.includes(value)
        ? prev.activity_focus.filter((item) => item !== value)
        : [...prev.activity_focus, value],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit || saving) return

    setError('')
    setSaving(true)

    try {
      if (!formData.name.trim()) throw new Error('El nombre del grupo es obligatorio')
      if (formData.max_size < 3 || formData.max_size > 5) throw new Error('El grupo debe tener entre 3 y 5 integrantes')
      if (formData.active_hours_end <= formData.active_hours_start) throw new Error('La franja horaria es inválida')
      if (formData.activity_focus.length === 0) throw new Error('Selecciona al menos una actividad foco')

      const selectedSubject = formData.subject === 'Otro' ? formData.customSubject.trim() : formData.subject
      if (!selectedSubject) throw new Error('Selecciona o escribe una asignatura')

      const { error: updateError } = await supabase
        .from('groups')
        .update({
          name: formData.name.trim(),
          subject: selectedSubject,
          max_size: formData.max_size,
          preferred_work_style: formData.preferred_work_style,
          required_daily_hours: formData.required_daily_hours,
          active_hours_start: formData.active_hours_start,
          active_hours_end: formData.active_hours_end,
          activity_focus: formData.activity_focus,
          pros: parseLines(formData.prosText),
          cons: parseLines(formData.consText),
          updated_at: new Date().toISOString(),
        })
        .eq('id', groupId)

      if (updateError) throw updateError

      router.push(`/groups/${groupId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el grupo')
    } finally {
      setSaving(false)
    }
  }

  if (!mounted || loading) {
    return <LoadingScreen title="Preparando edición" subtitle="Cargando configuración del grupo..." />
  }

  return (
    <div className="min-h-screen px-4 py-8 md:py-10">
      <div className="max-w-3xl mx-auto">
        <Card className="p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-sora)' }}>Editar grupo</h1>
          <p className="text-slate-600 text-sm mt-1">Ajusta la configuración del equipo para mantener compatibilidad y objetivos claros.</p>
        </header>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {!canEdit ? (
          <div className="space-y-3">
            <p className="text-slate-600">No tienes permisos para editar este grupo.</p>
            <Link href={`/groups/${groupId}`} className="btn-ghost inline-flex">Volver al grupo</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del grupo</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-modern"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Asignatura</label>
                <select name="subject" value={formData.subject} onChange={handleChange} className="input-modern">
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>

            {formData.subject === 'Otro' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Asignatura personalizada</label>
                <input
                  type="text"
                  name="customSubject"
                  value={formData.customSubject}
                  onChange={handleChange}
                  className="input-modern"
                  required
                />
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
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ritmo objetivo</label>
                <select name="preferred_work_style" value={formData.preferred_work_style} onChange={handleChange} className="input-modern">
                  <option value="flexible">Flexible</option>
                  {WORK_STATUS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Horas/día recomendadas</label>
                <select name="required_daily_hours" value={formData.required_daily_hours} onChange={handleChange} className="input-modern">
                  {DAILY_HOURS.map((hour) => (
                    <option key={hour} value={hour}>{hour} horas</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Inicio franja activa</label>
                <select name="active_hours_start" value={formData.active_hours_start} onChange={handleChange} className="input-modern">
                  {SCHEDULE_SLOTS.map((slot) => (
                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fin franja activa</label>
                <select name="active_hours_end" value={formData.active_hours_end} onChange={handleChange} className="input-modern">
                  {SCHEDULE_SLOTS.map((slot) => (
                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Actividades foco</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {ACTIVITIES.map((activity) => {
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
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ventajas (una por línea)</label>
                <textarea
                  name="prosText"
                  value={formData.prosText}
                  onChange={handleChange}
                  className="input-modern min-h-28"
                  placeholder="Horario definido\nBuen enfoque"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Consideraciones (una por línea)</label>
                <textarea
                  name="consText"
                  value={formData.consText}
                  onChange={handleChange}
                  className="input-modern min-h-28"
                  placeholder="Faltan integrantes\nAjustar ritmo"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" variant="primary" className="w-full sm:w-auto disabled:opacity-50" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
              <Link href={`/groups/${groupId}`} className="btn-ghost w-full sm:w-auto text-center">Cancelar</Link>
            </div>
          </form>
        )}
        </Card>
      </div>
    </div>
  )
}
