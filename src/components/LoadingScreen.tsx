interface LoadingScreenProps {
  title?: string
  subtitle?: string
}

export default function LoadingScreen({
  title = 'Preparando tu espacio',
  subtitle = 'Sincronizando información en tiempo real...',
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md text-center">
        <div className="relative mx-auto mb-5 h-20 w-20 loader-pulse">
          <svg viewBox="0 0 100 100" className="h-20 w-20 text-slate-900">
            <circle cx="50" cy="50" r="10" fill="currentColor" />
            <g className="loader-orbit">
              <circle cx="50" cy="14" r="6" fill="#2b6cb0" />
              <circle cx="86" cy="50" r="5" fill="#15b79e" />
              <circle cx="50" cy="86" r="4" fill="#79b8ff" />
              <circle cx="14" cy="50" r="5" fill="#1f4d7a" />
            </g>
          </svg>
        </div>

        <h3 className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'var(--font-sora)' }}>
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>

        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
