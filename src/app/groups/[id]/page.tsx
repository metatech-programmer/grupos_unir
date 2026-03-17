'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Group, User, GroupMessage } from '@/lib/supabase'
import { TeamIcon, ClockIcon, EditIcon, TrashIcon, CheckIcon, CloseIcon } from '@/components/icons'
import LoadingScreen from '@/components/LoadingScreen'

type MessageWithAuthor = GroupMessage & {
  users?: Pick<User, 'id' | 'name' | 'email' | 'phone'> | null
}

type GroupMemberWithRole = {
  role: 'admin' | 'member'
  user: User
}

type MessageBroadcastPayload = {
  id: string
  group_id: string
  user_id: string
  message: string
  created_at: string
  author: Pick<User, 'id' | 'name' | 'email' | 'phone'> | null
}

type DeleteBroadcastPayload = {
  id: string
  group_id: string
}

type EditBroadcastPayload = {
  id: string
  group_id: string
  message: string
}

const isTemporaryMessageId = (messageId: string) => messageId.startsWith('temp-')

const normalizeMessages = (rawMessages: unknown[]): MessageWithAuthor[] => {
  return rawMessages.map((row) => {
    const typedRow = row as GroupMessage & { users?: unknown }
    const usersField = typedRow.users
    const user = Array.isArray(usersField)
      ? (usersField[0] as Pick<User, 'id' | 'name' | 'email' | 'phone'> | undefined)
      : (usersField as Pick<User, 'id' | 'name' | 'email' | 'phone'> | null | undefined)

    return {
      ...typedRow,
      users: user || null,
    }
  })
}

const getFirstName = (fullName: string) => {
  return fullName.trim().split(' ')[0] || fullName
}

const getInitials = (fullName: string) => {
  const parts = fullName.trim().split(' ').filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

const sortMessagesByCreatedAt = (a: MessageWithAuthor, b: MessageWithAuthor) => {
  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
}

export default function GroupDetailPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params?.id as string
  const [group, setGroup] = useState<Group | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isMember, setIsMember] = useState(false)
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false)
  const [members, setMembers] = useState<GroupMemberWithRole[]>([])
  const [messages, setMessages] = useState<MessageWithAuthor[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingMessageText, setEditingMessageText] = useState('')
  const [savingEditMessageId, setSavingEditMessageId] = useState<string | null>(null)
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chatChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!messagesContainerRef.current) return
    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
  }, [messages])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const loadGroup = async () => {
      try {
        const [{ data: sessionData }, { data: groupData, error: groupError }] = await Promise.all([
          supabase.auth.getSession(),
          supabase
            .from('groups')
            .select('*')
            .eq('id', groupId)
            .single(),
        ])

        if (groupError) throw groupError
        setGroup(groupData)

        const authUser = sessionData.session?.user
        const authId = authUser?.id
        setCanDelete(Boolean(authId && groupData?.created_by_auth === authId))

        if (!authId) {
          setCurrentUser(null)
          setIsMember(false)
          setIsCurrentUserAdmin(false)
          setMembers([])
          setMessages([])
          setTypingUsers([])
          return
        }

        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', authId)
          .single()

        if (userError && userError.code !== 'PGRST116') throw userError

        let userData = existingUser
        if (!userData) {
          const { data: createdUser, error: createError } = await supabase
            .from('users')
            .upsert([
              {
                auth_id: authId,
                name: authUser?.user_metadata?.name || authUser?.email || 'Usuario',
                email: authUser?.email || '',
                phone: authUser?.user_metadata?.phone || null,
                country: authUser?.user_metadata?.country || 'other',
                timezone: authUser?.user_metadata?.timezone || 'Europe/Madrid',
                work_status: authUser?.user_metadata?.work_status || 'student',
                daily_hours: authUser?.user_metadata?.daily_hours || 2,
                availability_start: authUser?.user_metadata?.availability_start || 18,
                availability_end: authUser?.user_metadata?.availability_end || 22,
                activities: authUser?.user_metadata?.activities || ['Backend'],
              },
            ], { onConflict: 'auth_id' })
            .select('*')
            .single()

          if (createError || !createdUser) throw createError || new Error('No se pudo crear el perfil de usuario')
          userData = createdUser
        }

        setCurrentUser(userData)

        const { data: membershipData, error: membershipError } = await supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', groupId)
          .eq('user_id', userData.id)

        if (membershipError && membershipError.code !== 'PGRST116') {
          console.warn('Membership check warning:', membershipError)
        }

        let hasMembershipRow = Boolean(membershipData && membershipData.length > 0)
        const isMemberByGroupState = Boolean(
          (groupData.members || []).includes(userData.id) || userData.group_id === groupId,
        )

        if (!hasMembershipRow && isMemberByGroupState) {
          const inferredRole: 'admin' | 'member' = groupData.created_by_auth === authId ? 'admin' : 'member'
          const { error: repairError } = await supabase
            .from('group_members')
            .upsert([
              {
                user_id: userData.id,
                group_id: groupId,
                role: inferredRole,
              },
            ], { onConflict: 'user_id,group_id' })

          if (repairError) {
            console.warn('Could not auto-repair group membership:', repairError)
          } else {
            hasMembershipRow = true
          }
        }

        const memberOfGroup = hasMembershipRow || isMemberByGroupState
        setIsMember(memberOfGroup)

        if (!memberOfGroup) {
          setIsCurrentUserAdmin(false)
          setMembers([])
          setMessages([])
          setTypingUsers([])
          return
        }

        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select('role, users(id, auth_id, name, email, phone, country, timezone, work_status, activities, daily_hours, availability_start, availability_end, created_at, group_id)')
          .eq('group_id', groupId)

        if (membersError) throw membersError

        const normalizedMembers: GroupMemberWithRole[] = (membersData || [])
          .map((row: unknown) => {
            const typedRow = row as { role?: 'admin' | 'member'; users?: User | null }
            if (!typedRow.users) return null

            return {
              role: typedRow.role || 'member',
              user: typedRow.users,
            }
          })
          .filter((member): member is GroupMemberWithRole => Boolean(member))

        let finalMembers = normalizedMembers

        if (!finalMembers.some((member) => member.user.id === userData.id)) {
          const fallbackRole: 'admin' | 'member' = groupData.created_by_auth === authId ? 'admin' : 'member'

          const { error: selfRepairError } = await supabase
            .from('group_members')
            .upsert([
              {
                user_id: userData.id,
                group_id: groupId,
                role: fallbackRole,
              },
            ], { onConflict: 'user_id,group_id' })

          if (selfRepairError) {
            console.warn('Could not ensure current user in group_members:', selfRepairError)
          }

          finalMembers = [
            ...finalMembers,
            {
              role: fallbackRole,
              user: userData,
            },
          ]
        }

        setMembers(finalMembers)
        setIsCurrentUserAdmin(finalMembers.some((member) => member.user.id === userData.id && member.role === 'admin'))

        const { data: messagesData, error: messagesError } = await supabase
          .from('group_messages')
          .select('id, group_id, user_id, message, created_at, users(id, name, email, phone)')
          .eq('group_id', groupId)
          .order('created_at', { ascending: true })

        if (messagesError) throw messagesError
        setMessages(normalizeMessages(messagesData || []))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando grupo')
      } finally {
        setLoading(false)
      }
    }

    if (groupId) loadGroup()
  }, [groupId, mounted])

  useEffect(() => {
    if (!mounted || !groupId || !isMember || !currentUser) return

    const syncTypingUsers = (channel: ReturnType<typeof supabase.channel>) => {
      const presenceState = channel.presenceState() as Record<string, Array<{ userId?: string; name?: string; typing?: boolean }>>
      const activeTypingUsers = Object.values(presenceState)
        .flat()
        .filter((entry) => entry.typing && entry.userId && entry.userId !== currentUser.id)
        .map((entry) => entry.name || 'Alguien')

      setTypingUsers(Array.from(new Set(activeTypingUsers)))
    }

    const channel = supabase
      .channel(`group_chat_${groupId}`, {
        config: {
          presence: { key: currentUser.id },
        },
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'group_messages',
        filter: `group_id=eq.${groupId}`,
      }, async () => {
        const { data, error: messagesError } = await supabase
          .from('group_messages')
          .select('id, group_id, user_id, message, created_at, users(id, name, email, phone)')
          .eq('group_id', groupId)
          .order('created_at', { ascending: true })

        if (!messagesError) {
          setMessages(normalizeMessages(data || []))
        }
      })
      .on('broadcast', { event: 'message_sent' }, ({ payload }) => {
        const incoming = payload as MessageBroadcastPayload
        if (!incoming?.id || incoming.group_id !== groupId) return

        const nextMessage: MessageWithAuthor = {
          id: incoming.id,
          group_id: incoming.group_id,
          user_id: incoming.user_id,
          message: incoming.message,
          created_at: incoming.created_at,
          users: incoming.author,
        }

        setMessages((prev) => {
          const withoutTemp = prev.filter((message) => {
            if (!isTemporaryMessageId(message.id)) return true
            return !(message.user_id === incoming.user_id && message.message === incoming.message)
          })

          if (withoutTemp.some((message) => message.id === incoming.id)) {
            return withoutTemp
          }

          return [...withoutTemp, nextMessage].sort(sortMessagesByCreatedAt)
        })
      })
      .on('broadcast', { event: 'message_deleted' }, ({ payload }) => {
        const incoming = payload as DeleteBroadcastPayload
        if (!incoming?.id || incoming.group_id !== groupId) return

        setMessages((prev) => prev.filter((message) => message.id !== incoming.id))
        setSelectedMessageId((prev) => (prev === incoming.id ? null : prev))
        setEditingMessageId((prev) => (prev === incoming.id ? null : prev))
      })
      .on('broadcast', { event: 'message_edited' }, ({ payload }) => {
        const incoming = payload as EditBroadcastPayload
        if (!incoming?.id || incoming.group_id !== groupId) return

        setMessages((prev) => prev.map((message) => (
          message.id === incoming.id
            ? { ...message, message: incoming.message }
            : message
        )))
      })
      .on('presence', { event: 'sync' }, () => {
        syncTypingUsers(channel)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: currentUser.id,
            name: currentUser.name,
            typing: false,
          })
        }
      })

    chatChannelRef.current = channel

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      setTypingUsers([])
      channel.untrack()
      channel.unsubscribe()
      chatChannelRef.current = null
    }
  }, [groupId, isMember, mounted, currentUser])

  const toWhatsappLink = (phone: string) => {
    const normalized = phone.replace(/[^\d]/g, '')
    return `https://wa.me/${normalized}`
  }

  const updateTypingState = async (typing: boolean) => {
    if (!chatChannelRef.current || !currentUser || !isMember) return
    await chatChannelRef.current.track({
      userId: currentUser.id,
      name: currentUser.name,
      typing,
    })
  }

  const handleSendMessage = async () => {
    const trimmedMessage = newMessage.trim()
    if (!trimmedMessage || !currentUser || !isMember || sending) return

    const tempId = `temp-${Date.now()}`
    const optimisticMessage: MessageWithAuthor = {
      id: tempId,
      group_id: groupId,
      user_id: currentUser.id,
      message: trimmedMessage,
      created_at: new Date().toISOString(),
      users: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
      },
    }

    setMessages((prev) => [...prev, optimisticMessage])
    setNewMessage('')

    try {
      setSending(true)
      const { data: insertedMessage, error: insertError } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          user_id: currentUser.id,
          message: trimmedMessage,
        })
        .select('id, group_id, user_id, message, created_at')
        .single()

      if (insertError) throw insertError

      if (insertedMessage && chatChannelRef.current) {
        await chatChannelRef.current.send({
          type: 'broadcast',
          event: 'message_sent',
          payload: {
            ...insertedMessage,
            author: {
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              phone: currentUser.phone,
            },
          } satisfies MessageBroadcastPayload,
        })
      }

      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (accessToken) {
        fetch('/api/push/new-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            groupId,
            groupName: group?.name || null,
            message: trimmedMessage,
          }),
        }).catch((notifyError) => {
          console.warn('No se pudo enviar push de nuevo mensaje:', notifyError)
        })
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = null
      }
      await updateTypingState(false)
    } catch (err) {
      setMessages((prev) => prev.filter((message) => message.id !== tempId))
      setNewMessage(trimmedMessage)
      setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje')
    } finally {
      setSending(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!currentUser || deletingMessageId) return
    if (isTemporaryMessageId(messageId)) return

    const targetMessage = messages.find((message) => message.id === messageId)
    if (!targetMessage || targetMessage.user_id !== currentUser.id) return

    const confirmed = window.confirm('¿Deseas eliminar este mensaje?')
    if (!confirmed) return

    const previousMessages = messages
    setDeletingMessageId(messageId)
    setMessages((prev) => prev.filter((message) => message.id !== messageId))

    try {
      const { error: deleteError } = await supabase
        .from('group_messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', currentUser.id)

      if (deleteError) throw deleteError

      if (chatChannelRef.current) {
        await chatChannelRef.current.send({
          type: 'broadcast',
          event: 'message_deleted',
          payload: {
            id: messageId,
            group_id: groupId,
          } satisfies DeleteBroadcastPayload,
        })
      }
    } catch (err) {
      setMessages(previousMessages)
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el mensaje')
    } finally {
      setDeletingMessageId(null)
    }
  }

  const startEditingMessage = (messageId: string) => {
    const targetMessage = messages.find((message) => message.id === messageId)
    if (!targetMessage || isTemporaryMessageId(messageId)) return
    if (!currentUser || targetMessage.user_id !== currentUser.id) return

    setEditingMessageId(messageId)
    setEditingMessageText(targetMessage.message)
  }

  const cancelEditingMessage = () => {
    setEditingMessageId(null)
    setEditingMessageText('')
  }

  const handleSaveEditedMessage = async () => {
    if (!editingMessageId || !currentUser || savingEditMessageId) return

    const nextText = editingMessageText.trim()
    if (!nextText) {
      setError('El mensaje no puede quedar vacío')
      return
    }

    const originalMessage = messages.find((message) => message.id === editingMessageId)
    if (!originalMessage || originalMessage.user_id !== currentUser.id) return
    if (originalMessage.message === nextText) {
      cancelEditingMessage()
      return
    }

    const previousMessages = messages
    setSavingEditMessageId(editingMessageId)
    setMessages((prev) => prev.map((message) => (
      message.id === editingMessageId
        ? { ...message, message: nextText }
        : message
    )))

    try {
      const messageId = editingMessageId
      const { error: updateError } = await supabase
        .from('group_messages')
        .update({ message: nextText })
        .eq('id', messageId)
        .eq('user_id', currentUser.id)

      if (updateError) throw updateError

      if (chatChannelRef.current) {
        await chatChannelRef.current.send({
          type: 'broadcast',
          event: 'message_edited',
          payload: {
            id: messageId,
            group_id: groupId,
            message: nextText,
          } satisfies EditBroadcastPayload,
        })
      }

      setEditingMessageId(null)
      setEditingMessageText('')
      setSelectedMessageId(null)
    } catch (err) {
      setMessages(previousMessages)
      setError(err instanceof Error ? err.message : 'No se pudo editar el mensaje')
    } finally {
      setSavingEditMessageId(null)
    }
  }

  const handleChangeMemberRole = async (targetUserId: string, nextRole: 'admin' | 'member') => {
    if (!isCurrentUserAdmin || !currentUser || updatingRoleUserId) return
    if (targetUserId === currentUser.id) return

    try {
      setUpdatingRoleUserId(targetUserId)

      const { error: updateError } = await supabase
        .from('group_members')
        .update({ role: nextRole })
        .eq('group_id', groupId)
        .eq('user_id', targetUserId)

      if (updateError) throw updateError

      setMembers((prev) => prev.map((member) => (
        member.user.id === targetUserId
          ? { ...member, role: nextRole }
          : member
      )))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el rol')
    } finally {
      setUpdatingRoleUserId(null)
    }
  }

  const handleDeleteGroup = async () => {
    if (!group || !canDelete || deleting) return

    const confirmed = window.confirm('Esta acción eliminará el grupo. ¿Deseas continuar?')
    if (!confirmed) return

    try {
      setDeleting(true)
      const { data: { session } } = await supabase.auth.getSession()
      const authId = session?.user?.id
      if (!authId) {
        router.push('/login')
        return
      }

      const { error: deleteError } = await supabase
          .from('groups')
        .delete()
          .eq('id', groupId)
        .eq('created_by_auth', authId)

      if (deleteError) throw deleteError
      router.push('/explore')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el grupo')
    } finally {
      setDeleting(false)
    }
  }

  const handleLeaveGroup = async () => {
    if (!currentUser || !group || leaving || deleting) return

    if (group.created_by_auth && currentUser.auth_id === group.created_by_auth) {
      setError('Eres el creador del grupo. Para salir, elimina el grupo o transfiere la administración primero.')
      return
    }

    const confirmed = window.confirm('¿Seguro que quieres salir de este grupo?')
    if (!confirmed) return

    try {
      setLeaving(true)

      const { error: leaveRpcError } = await supabase.rpc('leave_group_atomic', {
        p_group_id: groupId,
      })

      // Fallback for environments where leave_group_atomic is not installed yet.
      if (leaveRpcError) {
        const maybeMissingFunction = leaveRpcError.message?.toLowerCase().includes('leave_group_atomic')
        if (!maybeMissingFunction) throw leaveRpcError

        const nextMembers = (group.members || []).filter((memberId) => memberId !== currentUser.id)

        const { error: deleteMembershipError } = await supabase
          .from('group_members')
          .delete()
          .eq('group_id', groupId)
          .eq('user_id', currentUser.id)

        if (deleteMembershipError) throw deleteMembershipError

        const { error: clearUserGroupError } = await supabase
          .from('users')
          .update({ group_id: null })
          .eq('id', currentUser.id)

        if (clearUserGroupError) throw clearUserGroupError

        const { error: syncGroupError } = await supabase
          .from('groups')
          .update({
            members: nextMembers,
            member_count: Math.max((group.member_count || 1) - 1, 0),
          })
          .eq('id', groupId)

        if (syncGroupError) throw syncGroupError
      }

      router.push('/explore')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo salir del grupo')
    } finally {
      setLeaving(false)
    }
  }

  if (!mounted || loading) {
    return <LoadingScreen title="Abriendo grupo" subtitle="Recuperando detalles y estado actual..." />
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <p className="text-xl text-gray-600 mb-4">Grupo no encontrado</p>
          <Link href="/explore" className="btn-primary">Volver a explorar</Link>
        </div>
      </div>
    )
  }

  const occupancy = Math.round((group.member_count / group.max_size) * 100)

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="card mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start sm:items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <TeamIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold break-words" style={{ fontFamily: 'var(--font-sora)' }}>{group.name}</h1>
              <p className="text-slate-600">{group.subject}</p>
            </div>
          </div>
          <div className="w-full md:w-auto md:justify-end">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Link
                href="/explore"
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 text-center w-full sm:w-auto"
              >
                Cambiar grupo
              </Link>
              {canDelete ? (
                <button
                  onClick={handleDeleteGroup}
                  disabled={deleting || leaving}
                  className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 font-semibold hover:bg-rose-50 disabled:opacity-50 w-full sm:w-auto"
                >
                  {deleting ? 'Eliminando...' : 'Eliminar grupo'}
                </button>
              ) : (
                <button
                  onClick={handleLeaveGroup}
                  disabled={leaving || deleting}
                  className="px-4 py-2 rounded-xl border border-amber-200 text-amber-700 font-semibold hover:bg-amber-50 disabled:opacity-50 w-full sm:w-auto"
                >
                  {leaving ? 'Saliendo...' : 'Salir del grupo'}
                </button>
              )}
            </div>
          </div>
        </header>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <section className="card mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-500">Integrantes</p>
              <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-sora)' }}>{group.member_count}/{group.max_size}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Horas recomendadas</p>
              <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-sora)' }}>{group.required_daily_hours}h</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Ritmo esperado</p>
              <p className="text-xl font-semibold">{group.preferred_work_style}</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2 text-slate-700 mb-2">
              <ClockIcon className="h-4 w-4" />
              <span className="text-sm font-semibold">Franja activa del equipo</span>
            </div>
            <p className="text-slate-700">{String(group.active_hours_start).padStart(2, '0')}:00 - {String(group.active_hours_end).padStart(2, '0')}:00</p>
          </div>

          <div className="mt-6">
            <p className="text-sm text-slate-500 mb-2">Ocupacion del grupo</p>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${occupancy}%` }} />
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="card">
            <h2 className="text-lg font-bold mb-3 text-emerald-700">Ventajas del grupo</h2>
            <ul className="space-y-2">
              {(group.pros || []).length > 0
                ? group.pros.map((pro, i) => <li key={i} className="text-sm text-slate-700">- {pro}</li>)
                : <li className="text-sm text-slate-600">Por definir</li>}
            </ul>
          </div>
          <div className="card">
            <h2 className="text-lg font-bold mb-3 text-rose-700">Consideraciones</h2>
            <ul className="space-y-2">
              {(group.cons || []).length > 0
                ? group.cons.map((con, i) => <li key={i} className="text-sm text-slate-700">- {con}</li>)
                : <li className="text-sm text-slate-600">Por definir</li>}
            </ul>
          </div>
        </section>

        <section className="card mb-6">
          <h2 className="text-lg font-bold mb-3">Actividades foco</h2>
          <div className="flex flex-wrap gap-2">
            {(group.activity_focus || []).map((activity, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm border border-slate-200">{activity}</span>
            ))}
          </div>
        </section>

        <section className="card mb-6">
          <h2 className="text-lg font-bold mb-3">Integrantes y contacto</h2>
          {!isMember ? (
            <p className="text-slate-600 text-sm">
              Debes pertenecer a este grupo para ver correo, teléfono y enlaces directos de contacto.
            </p>
          ) : members.length === 0 ? (
            <p className="text-slate-600 text-sm">Aún no hay miembros visibles.</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.user.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{member.user.name}</p>
                      {member.role === 'admin' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Admin</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{member.user.timezone}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm items-center w-full md:w-auto">
                    <a href={`mailto:${member.user.email}`} className="px-3 py-1 rounded-full border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100" target="_blank" rel="noreferrer">
                      Correo
                    </a>
                    {member.user.phone && (
                      <a href={toWhatsappLink(member.user.phone)} className="px-3 py-1 rounded-full border border-sky-200 text-sky-700 bg-sky-50 hover:bg-sky-100" target="_blank" rel="noreferrer">
                        WhatsApp
                      </a>
                    )}
                    {isCurrentUserAdmin && member.user.id !== currentUser?.id && (
                      member.role === 'admin' ? (
                        <button
                          onClick={() => handleChangeMemberRole(member.user.id, 'member')}
                          disabled={updatingRoleUserId === member.user.id}
                          className="px-3 py-1 rounded-full border border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 disabled:opacity-50"
                        >
                          {updatingRoleUserId === member.user.id ? 'Actualizando...' : 'Quitar admin'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleChangeMemberRole(member.user.id, 'admin')}
                          disabled={updatingRoleUserId === member.user.id}
                          className="px-3 py-1 rounded-full border border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 disabled:opacity-50"
                        >
                          {updatingRoleUserId === member.user.id ? 'Actualizando...' : 'Hacer admin'}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {isCurrentUserAdmin && (
            <p className="text-xs text-slate-500 mt-3">
              Como admin puedes asignar o quitar rol admin a otros miembros del grupo.
            </p>
          )}
        </section>

        <section className="card mb-6">
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 className="text-lg font-bold">Chat del grupo</h2>
            <span className="text-xs px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600 font-semibold">
              {messages.length} {messages.length === 1 ? 'mensaje' : 'mensajes'}
            </span>
          </div>
          {!isMember ? (
            <p className="text-slate-600 text-sm">Debes pertenecer a este grupo para usar el chat en tiempo real.</p>
          ) : (
            <>
              <div ref={messagesContainerRef} className="chat-surface h-80 overflow-y-auto rounded-2xl border border-slate-200 p-3 sm:p-4 space-y-3 mb-3">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <p className="text-sm text-slate-500 max-w-xs">Todavía no hay mensajes. Rompe el hielo con el primero.</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwnMessage = Boolean(currentUser && message.user_id === currentUser.id)
                    const authorName = message.users?.name || 'Miembro'
                    const showOwnActions = isOwnMessage && selectedMessageId === message.id && !isTemporaryMessageId(message.id)
                    const isEditing = editingMessageId === message.id

                    return (
                      <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[88%] sm:max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            {!isOwnMessage && (
                              <span className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                                {getInitials(authorName)}
                              </span>
                            )}
                            <span className="font-semibold">{isOwnMessage ? 'Tú' : getFirstName(authorName)}</span>
                            <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (!isOwnMessage || isTemporaryMessageId(message.id)) return
                              if (editingMessageId && editingMessageId !== message.id) return
                              setSelectedMessageId((prev) => (prev === message.id ? null : message.id))
                            }}
                            className={`text-left rounded-2xl px-3 py-2 shadow-sm border transition ${isOwnMessage ? 'bg-blue-600 text-white border-blue-500 rounded-br-md' : 'bg-white text-slate-800 border-slate-200 rounded-bl-md'} ${isOwnMessage && !isTemporaryMessageId(message.id) ? 'cursor-pointer' : 'cursor-default'} ${showOwnActions ? 'ring-2 ring-blue-200' : ''}`}
                          >
                            {isEditing ? (
                              <input
                                value={editingMessageText}
                                onChange={(e) => setEditingMessageText(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleSaveEditedMessage()
                                  }

                                  if (e.key === 'Escape') {
                                    e.preventDefault()
                                    cancelEditingMessage()
                                  }
                                }}
                                className="w-full min-w-[200px] text-sm rounded-lg border border-white/50 bg-white/95 text-slate-900 px-2 py-1"
                                placeholder="Editar mensaje"
                                autoFocus
                              />
                            ) : (
                              <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                            )}
                          </button>

                          {showOwnActions && (
                            <div className="flex items-center gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={handleSaveEditedMessage}
                                    disabled={savingEditMessageId === message.id}
                                    className="h-7 w-7 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center disabled:opacity-50"
                                    title="Guardar edición"
                                    aria-label="Guardar edición"
                                  >
                                    <CheckIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEditingMessage}
                                    disabled={savingEditMessageId === message.id}
                                    className="h-7 w-7 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center disabled:opacity-50"
                                    title="Cancelar edición"
                                    aria-label="Cancelar edición"
                                  >
                                    <CloseIcon className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => startEditingMessage(message.id)}
                                    className="h-7 w-7 rounded-full border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 flex items-center justify-center"
                                    title="Editar mensaje"
                                    aria-label="Editar mensaje"
                                  >
                                    <EditIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMessage(message.id)}
                                    disabled={deletingMessageId === message.id}
                                    className="h-7 w-7 rounded-full border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center justify-center disabled:opacity-50"
                                    title="Eliminar mensaje"
                                    aria-label="Eliminar mensaje"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}

                {typingUsers.length > 0 && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] flex flex-col gap-1 items-start">
                      <span className="text-xs text-slate-500 font-semibold">{typingUsers.join(', ')}</span>
                      <div className="rounded-2xl rounded-bl-md px-3 py-2 border border-slate-200 bg-white shadow-sm flex items-center gap-1.5">
                        <span className="typing-dot" />
                        <span className="typing-dot typing-dot-delay-1" />
                        <span className="typing-dot typing-dot-delay-2" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => {
                    const nextValue = e.target.value
                    setNewMessage(nextValue)

                    if (!currentUser || !isMember) return

                    if (nextValue.trim()) {
                      updateTypingState(true)
                      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
                      typingTimeoutRef.current = setTimeout(() => {
                        updateTypingState(false)
                      }, 1500)
                    } else {
                      if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current)
                        typingTimeoutRef.current = null
                      }
                      updateTypingState(false)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="input-modern"
                  placeholder="Escribe un mensaje para el grupo..."
                />
                <button onClick={handleSendMessage} disabled={sending || !newMessage.trim()} className="btn-primary sm:whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto">
                  {sending ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </>
          )}
        </section>

        <section className="card">
          <h2 className="text-lg font-bold mb-3">Cobertura de zonas horarias</h2>
          <div className="flex flex-wrap gap-2">
            {(group.timezone_coverage || []).map((tz, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-sm border border-blue-100">{tz}</span>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

