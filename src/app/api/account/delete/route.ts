import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('auth_id', authUser.id)
      .single()

    const profileId = profile?.id || null

    // Remove groups created by this auth user so no orphan entities remain.
    const { error: deleteCreatedGroupsError } = await supabaseAdmin
      .from('groups')
      .delete()
      .eq('created_by_auth', authUser.id)

    if (deleteCreatedGroupsError) {
      return NextResponse.json({ error: deleteCreatedGroupsError.message }, { status: 500 })
    }

    if (profileId) {
      const { data: membershipRows, error: membershipListError } = await supabaseAdmin
        .from('group_members')
        .select('group_id')
        .eq('user_id', profileId)

      if (membershipListError) {
        return NextResponse.json({ error: membershipListError.message }, { status: 500 })
      }

      const affectedGroupIds = Array.from(new Set((membershipRows || []).map((row) => row.group_id)))

      const { error: deleteMembershipsError } = await supabaseAdmin
        .from('group_members')
        .delete()
        .eq('user_id', profileId)

      if (deleteMembershipsError) {
        return NextResponse.json({ error: deleteMembershipsError.message }, { status: 500 })
      }

      const { error: deleteMessagesError } = await supabaseAdmin
        .from('group_messages')
        .delete()
        .eq('user_id', profileId)

      if (deleteMessagesError) {
        return NextResponse.json({ error: deleteMessagesError.message }, { status: 500 })
      }

      const { error: deleteSubscriptionsError } = await supabaseAdmin
        .from('push_subscriptions')
        .delete()
        .eq('user_id', profileId)

      if (deleteSubscriptionsError) {
        return NextResponse.json({ error: deleteSubscriptionsError.message }, { status: 500 })
      }

      for (const groupId of affectedGroupIds) {
        const { data: membersRows, error: membersError } = await supabaseAdmin
          .from('group_members')
          .select('user_id, joined_at')
          .eq('group_id', groupId)
          .order('joined_at', { ascending: true })

        if (membersError) {
          return NextResponse.json({ error: membersError.message }, { status: 500 })
        }

        const memberIds = (membersRows || []).map((row) => String(row.user_id))

        let timezoneCoverage: string[] = []
        if (memberIds.length > 0) {
          const { data: usersRows, error: usersError } = await supabaseAdmin
            .from('users')
            .select('timezone')
            .in('id', memberIds)

          if (usersError) {
            return NextResponse.json({ error: usersError.message }, { status: 500 })
          }

          timezoneCoverage = Array.from(new Set((usersRows || []).map((row) => row.timezone || 'Europe/Madrid')))
        }

        const { error: updateGroupError } = await supabaseAdmin
          .from('groups')
          .update({
            member_count: memberIds.length,
            members: memberIds,
            timezone_coverage: timezoneCoverage,
          })
          .eq('id', groupId)

        if (updateGroupError) {
          return NextResponse.json({ error: updateGroupError.message }, { status: 500 })
        }
      }
    }

    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id)
    if (deleteAuthError) {
      return NextResponse.json({ error: deleteAuthError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
