'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { TeamIcon } from '@/components/icons'
import LoadingScreen from '@/components/LoadingScreen'

export default function LoginPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ email: '', password: '' })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError
      router.push('/dashboard')
    } catch (err) {
      const typedError = err as { message?: string; code?: string }
      const isEmailNotConfirmed =
        typedError?.code === 'email_not_confirmed' ||
        /email\s+not\s+confirmed/i.test(typedError?.message || '')

      if (isEmailNotConfirmed) {
        setError('Tu proyecto aun exige verificacion por correo. Desactiva Confirm email en Supabase Authentication > Providers > Email.')
      } else {
        setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return <LoadingScreen title="Cargando acceso" subtitle="Preparando la autenticacion segura..." />
  }

  return (
    <div className="min-h-screen px-4 py-10 flex items-center justify-center">
      <div className="card w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <TeamIcon className="h-5 w-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: 'var(--font-sora)' }}>Acceder a GrupoFlow</h2>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-modern" placeholder="tu@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-modern" placeholder="********" required />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          ¿No tienes cuenta? <Link href="/register" className="text-blue-600 font-semibold hover:underline">Crear perfil</Link>
        </p>
      </div>
    </div>
  )
}

