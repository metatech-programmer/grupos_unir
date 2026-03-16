'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { supabase, User as AppUser } from '@/lib/supabase'
import { TeamIcon } from '@/components/icons'

type NavLink = {
  href: string
  label: string
}

export default function GlobalNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authId, setAuthId] = useState<string | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)

  useEffect(() => {
    const loadSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const currentAuthId = sessionData.session?.user?.id || null
      setAuthId(currentAuthId)

      if (!currentAuthId) {
        setProfile(null)
        return
      }

      const { data: profileData, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', currentAuthId)
        .single()

      if (!error) {
        setProfile(profileData)
      }
    }

    loadSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadSession()
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const links = useMemo<NavLink[]>(() => {
    const base: NavLink[] = [
      { href: '/', label: 'Inicio' },
      { href: '/explore', label: 'Explorar' },
    ]

    if (!authId) {
      return base
    }

    const authLinks: NavLink[] = [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/create-group', label: 'Crear grupo' },
      { href: '/register', label: 'Perfil' },
    ]

    if (profile?.group_id) {
      authLinks.splice(2, 0, { href: `/groups/${profile.group_id}`, label: 'Mi grupo' })
    }

    return [...base, ...authLinks]
  }, [authId, profile?.group_id])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setMobileOpen(false)
    router.push('/login')
  }

  const desktopLinkClass = (href: string) => {
    const active = pathname === href
    return active
      ? 'px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold'
      : 'px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-semibold'
  }

  const mobileLinkClass = (href: string) => {
    const active = pathname === href
    return active
      ? 'px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold'
      : 'px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-sm font-semibold'
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <span className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <TeamIcon className="h-4.5 w-4.5" />
          </span>
          <span className="text-slate-900 font-bold" style={{ fontFamily: 'var(--font-sora)' }}>GrupoFlow</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={desktopLinkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {authId ? (
            <>
              <span className="text-xs text-slate-500 font-semibold px-2 py-1 rounded-md bg-slate-100">
                {profile?.name ? profile.name.split(' ')[0] : 'Cuenta'}
              </span>
              <button onClick={handleLogout} className="btn-outline text-sm">Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-outline text-sm">Iniciar sesión</Link>
              <Link href="/register" className="btn-primary text-sm">Crear cuenta</Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden h-10 w-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center"
          aria-label="Abrir menú"
        >
          <span className="flex flex-col gap-1.5">
            <span className="h-0.5 w-4 bg-slate-700" />
            <span className="h-0.5 w-4 bg-slate-700" />
            <span className="h-0.5 w-4 bg-slate-700" />
          </span>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={mobileLinkClass(link.href)}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {authId ? (
              <>
                <button onClick={handleLogout} className="btn-outline w-full text-sm">Cerrar sesión</button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-outline w-full text-sm" onClick={() => setMobileOpen(false)}>Iniciar sesión</Link>
                <Link href="/register" className="btn-primary w-full text-sm" onClick={() => setMobileOpen(false)}>Crear cuenta</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
