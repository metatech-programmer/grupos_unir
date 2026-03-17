'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { supabase, User as AppUser } from '@/lib/supabase'
import {
  CloseIcon,
  CompassIcon,
  GridIcon,
  HomeIcon,
  LogoutIcon,
  MenuIcon,
  PlusIcon,
  SettingsIcon,
  TeamIcon,
  UserIcon,
} from '@/components/icons'
import PushNotificationsToggle from '@/components/PushNotificationsToggle'
import ThemeToggle from '@/components/ThemeToggle'
import InstallAppButton from '@/components/InstallAppButton'
import type { SVGProps } from 'react'

type NavLink = {
  href: string
  label: string
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element
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
      { href: '/', label: 'Inicio', icon: HomeIcon },
      { href: '/explore', label: 'Explorar', icon: CompassIcon },
    ]

    if (!authId) {
      return base
    }

    const authLinks: NavLink[] = [
      { href: '/dashboard', label: 'Dashboard', icon: GridIcon },
      { href: '/create-group', label: 'Crear grupo', icon: PlusIcon },
      { href: '/settings', label: 'Ajustes', icon: SettingsIcon },
      { href: '/register', label: 'Perfil', icon: UserIcon },
    ]

    if (profile?.group_id) {
      authLinks.splice(2, 0, { href: `/groups/${profile.group_id}`, label: 'Mi grupo', icon: TeamIcon })
    }

    return [...base, ...authLinks]
  }, [authId, profile?.group_id])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setMobileOpen(false)
    router.push('/login')
  }

  const desktopLinkClass = (href: string) => {
    const active = pathname === href || pathname?.startsWith(`${href}/`)
    return active
      ? 'h-10 px-3 rounded-xl bg-slate-900 text-white text-sm font-semibold inline-flex items-center gap-2'
      : 'h-10 px-3 rounded-xl text-slate-700 hover:bg-slate-100 text-sm font-semibold inline-flex items-center gap-2'
  }

  const mobileLinkClass = (href: string) => {
    const active = pathname === href || pathname?.startsWith(`${href}/`)
    return active
      ? 'px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold'
      : 'px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-sm font-semibold'
  }

  return (
    <nav className="app-nav-shell sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <span className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <TeamIcon className="h-4.5 w-4.5" />
          </span>
          <span className="text-slate-900 font-bold hidden sm:inline" style={{ fontFamily: 'var(--font-sora)' }}>GrupoFlow</span>
        </Link>

        <div className="app-nav-dock hidden lg:flex items-center gap-1.5 p-1 rounded-2xl border border-slate-200 bg-slate-100/80 shadow-sm">
          {links.map((link) => (
            <div key={link.href} className="relative group">
              <Link href={link.href} className={desktopLinkClass(link.href)} aria-label={link.label}>
                <link.icon className="h-4 w-4" />
                <span className="hidden xl:inline">{link.label}</span>
              </Link>
              <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 xl:hidden">
                {link.label}
              </span>
            </div>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {authId ? (
            <>
              <div className="relative group">
                <ThemeToggle compact className="h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-700 inline-flex items-center justify-center" />
                <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">Tema</span>
              </div>
              <div className="relative group">
                <InstallAppButton compact className="h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-700 inline-flex items-center justify-center" />
                <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">Instalar</span>
              </div>
              <div className="relative group">
                <PushNotificationsToggle compact className="h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-700 inline-flex items-center justify-center" />
                <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">Notificaciones</span>
              </div>
              <div className="relative group">
                <button
                  onClick={handleLogout}
                  className="h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-700 inline-flex items-center justify-center"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogoutIcon className="h-4 w-4" />
                </button>
                <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">Salir</span>
              </div>
            </>
          ) : (
            <>
              <div className="relative group">
                <ThemeToggle compact className="h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-700 inline-flex items-center justify-center" />
                <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">Tema</span>
              </div>
              <Link href="/login" className="btn-outline text-sm">Entrar</Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden h-10 w-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center"
          aria-label="Abrir menú"
        >
          {mobileOpen ? <CloseIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="app-nav-mobile md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={mobileLinkClass(link.href)}
                onClick={() => setMobileOpen(false)}
              >
                <span className="inline-flex items-center gap-2">
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ThemeToggle className="btn-outline w-full text-sm" />
            <InstallAppButton className="btn-outline w-full text-sm" />
          </div>
          <div className="flex items-center gap-2">
            {authId ? (
              <>
                <PushNotificationsToggle className="btn-outline w-full text-sm" />
                <button onClick={handleLogout} className="btn-outline w-full text-sm">Cerrar sesión</button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-outline w-full text-sm" onClick={() => setMobileOpen(false)}>Iniciar sesión</Link>
                <Link href="/register" className="btn-primary w-full text-sm" onClick={() => setMobileOpen(false)}>Registro</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
