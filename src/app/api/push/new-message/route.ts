import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const vapidSubject = process.env.VAPID_SUBJECT
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

let vapidConfigured = false

const configureVapid = () => {
  if (vapidConfigured) return

  if (!vapidSubject || !vapidPublicKey || !vapidPrivateKey) {
    throw new Error('Missing VAPID_SUBJECT, NEXT_PUBLIC_VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY')
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
  vapidConfigured = true
}

const getAuthUser = async (request: NextRequest) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  const authorization = request.headers.get('authorization') || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null

  if (!token) return null

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data, error } = await supabase.auth.getUser(token)
  if (error) return null
  return data.user
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    configureVapid()

    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const groupId = body?.groupId as string | undefined
    const groupName = body?.groupName as string | undefined
    const message = body?.message as string | undefined

    if (!groupId || !message) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, name')
      .eq('auth_id', authUser.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const { data: recipientRows, error: membersError } = await supabaseAdmin
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .neq('user_id', profile.id)

    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 500 })
    }

    const recipientIds = (recipientRows || []).map((row) => row.user_id)
    if (recipientIds.length === 0) {
      return NextResponse.json({ ok: true, sent: 0 })
    }

    const { data: subscriptions, error: subscriptionsError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth, user_id')
      .in('user_id', recipientIds)

    if (subscriptionsError) {
      return NextResponse.json({ error: subscriptionsError.message }, { status: 500 })
    }

    const notificationPayload = JSON.stringify({
      title: groupName ? `Nuevo mensaje en ${groupName}` : 'Nuevo mensaje de grupo',
      body: `${profile.name}: ${String(message).slice(0, 120)}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      url: `/groups/${groupId}`,
    })

    let sent = 0

    for (const subscription of subscriptions || []) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          notificationPayload
        )
        sent += 1
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          await supabaseAdmin
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', subscription.endpoint)
        }
      }
    }

    return NextResponse.json({ ok: true, sent })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
