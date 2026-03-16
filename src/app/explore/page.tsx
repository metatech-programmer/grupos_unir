'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, User, Group } from '@/lib/supabase'
import { suggestGroupsForUser, GroupSuggestion } from '@/lib/ai-matching'
import { SUBJECTS } from '@/lib/subjects'
import { BrainIcon, TeamIcon } from '@/components/icons'
import LoadingScreen from '@/components/LoadingScreen'

export default function ExplorePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [suggestions, setSuggestions] = useState<GroupSuggestion[]>([])
  const [allGroups, setAllGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [mounted, setMounted] = useState(false)

  const buildPublicSuggestions = useCallback((groups: Group[]) => {
    return groups.map((group) => ({
      group,
      compatibility_score: 50,
      pros: group.pros || ['Grupo disponible para revisar'],
      cons: group.cons || ['Inicia sesion para ver recomendacion personalizada'],
      recommendation_reason: 'Vista publica activa. Inicia sesion para recomendaciones personalizadas con IA.',
    }))
  }, [])

  const buildSuggestions = useCallback(async (userData: User | null, groups: Group[]) => {
    if (userData) {
      return suggestGroupsForUser(userData, groups)
    }
    return buildPublicSuggestions(groups)
  }, [buildPublicSuggestions])

  const refreshGroups = useCallback(async (currentUser: User | null) => {
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .lt('member_count', 5)

    if (groupsError) throw groupsError

    const groups = groupsData || []
    setAllGroups(groups)
    setSuggestions(await buildSuggestions(currentUser, groups))
  }, [buildSuggestions])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const loadData = async () => {
      try {
        const [sessionRes, groupsRes] = await Promise.all([
          supabase.auth.getSession(),
          supabase
            .from('groups')
            .select('*')
            .lt('member_count', 5),
        ])

        const authUser = sessionRes.data.session?.user
        const groupsData = groupsRes.data || []

        if (groupsRes.error) throw groupsRes.error

        setAllGroups(groupsData)

        let userData: User | null = null
        if (authUser) {
          const { data: existingUser, error: userQueryError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', authUser.id)
            .single()

          if (userQueryError && userQueryError.code !== 'PGRST116') throw userQueryError

          userData = existingUser
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
        } else {
          setUser(null)
        }

        setSuggestions(await buildSuggestions(userData, groupsData))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando grupos')
      } finally {
        setLoading(false)
      }
    }

    loadData()

    try {
      const subscription = supabase
        .channel('groups_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, () => {
          refreshGroups(user)
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    } catch (subscribeError) {
      console.warn('Realtime subscription error:', subscribeError)
      return () => {}
    }
  }, [mounted, buildSuggestions, refreshGroups, user])

  const handleJoinGroup = async (groupId: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      const targetGroup = allGroups.find(g => g.id === groupId)
      if (!targetGroup) throw new Error('Grupo no encontrado')

      if (targetGroup.members?.includes(user.id)) {
        router.push(`/groups/${groupId}`)
        return
      }

      if (targetGroup.member_count >= targetGroup.max_size) throw new Error('El grupo ya esta lleno')

      const { error: joinError } = await supabase
        .rpc('join_group_atomic', { p_group_id: groupId })

      if (joinError) throw joinError
      router.push(`/groups/${groupId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al unirse al grupo')
    }
  }

  const filteredSuggestions = useMemo(() => {
    if (!filterSubject) return suggestions
    return suggestions.filter(s => s.group.subject === filterSubject)
  }, [filterSubject, suggestions])

  if (!mounted || loading) {
    return <LoadingScreen title="Buscando grupos" subtitle="Calculando recomendaciones y compatibilidad..." />
  }

  return (
    <div className="min-h-screen px-4 py-6 md:py-10">
      <div className="max-w-6xl mx-auto">
        <header className="card mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <BrainIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-sora)' }}>Recomendaciones Inteligentes</h1>
              <p className="text-slate-600 text-sm">IA gratuita local: horario, trabajo, actividades y tiempo diario.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full lg:w-auto lg:justify-end">
            {user ? (
              <>
                <Link href="/create-group" className="btn-outline w-full sm:w-auto">Crear grupo</Link>
                <Link href="/dashboard" className="btn-outline w-full sm:w-auto">Dashboard</Link>
              </>
            ) : (
              <Link href="/login" className="btn-outline w-full sm:w-auto sm:col-span-2">Iniciar sesion</Link>
            )}
          </div>
        </header>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <div className="card mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrar por asignatura</label>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="input-modern"
          >
            <option value="">Todas las asignaturas</option>
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        {filteredSuggestions.length === 0 ? (
          <div className="card text-center py-12">
            <TeamIcon className="h-8 w-8 mx-auto text-slate-500" />
            <p className="text-xl text-gray-600 mt-4 mb-4">
              {suggestions.length === 0 ? 'No hay grupos disponibles en este momento' : 'No hay grupos para ese filtro'}
            </p>
            <Link href="/create-group" className="btn-primary">Crear mi propio grupo</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredSuggestions.map((suggestion, index) => (
              <article key={suggestion.group.id} className="card">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-semibold">Top {index + 1}</span>
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">{Math.round(suggestion.compatibility_score)}% compatible</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-sora)' }}>{suggestion.group.name}</h2>
                    <p className="text-slate-600 mt-1"><strong>Asignatura:</strong> {suggestion.group.subject}</p>
                    <p className="text-slate-600"><strong>Horario equipo:</strong> {String(suggestion.group.active_hours_start).padStart(2, '0')}:00 - {String(suggestion.group.active_hours_end).padStart(2, '0')}:00</p>
                  </div>
                  <div className="text-sm text-slate-600 md:text-right">
                    <p>{suggestion.group.member_count}/{suggestion.group.max_size} integrantes</p>
                    <p>{suggestion.group.required_daily_hours}h recomendadas por dia</p>
                  </div>
                </div>

                <p className="text-slate-700 mb-4"><strong>Recomendacion:</strong> {suggestion.recommendation_reason}</p>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="font-bold text-emerald-700 mb-2">Ventajas</h3>
                    <ul className="space-y-1">
                      {suggestion.pros.map((pro, i) => <li key={i} className="text-sm text-slate-700">- {pro}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-rose-700 mb-2">Consideraciones</h3>
                    <ul className="space-y-1">
                      {suggestion.cons.map((con, i) => <li key={i} className="text-sm text-slate-700">- {con}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:justify-items-start">
                  <button onClick={() => handleJoinGroup(suggestion.group.id)} className="btn-primary w-full sm:w-auto">{user ? 'Unirme a este grupo' : 'Inicia sesion para unirte'}</button>
                  <Link href={`/groups/${suggestion.group.id}`} className="btn-outline w-full sm:w-auto">Ver detalle</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

