# Referencia Rápida - Comandos y Estructura Útiles

## Comandos de Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Acceder a la aplicación
# Navega a http://localhost:3000
```

## Compilación y Producción

```bash
# Crear compilación de producción
npm run build

# Ejecutar versión de producción
npm start

# Verificar errores
npm run lint
```

## Estructura de Carpetas

```
grupos/
├── src/
│   ├── app/              # Páginas (Next.js App Router)
│   │   ├── page.tsx      # Página principal
│   │   ├── register/     # Página de registro
│   │   ├── login/        # Página de inicio de sesión
│   │   ├── dashboard/    # Panel principal
│   │   ├── explore/      # Explorar grupos
│   │   └── groups/[id]/  # Detalles del grupo
│   ├── lib/              # Utilidades compartidas
│   │   ├── supabase.ts   # Cliente de base de datos
│   │   ├── ai-matching.ts # Algoritmo de coincidencia
│   │   └── timezones.ts  # Utilidades de zonas horarias
│   ├── components/       # Componentes reutilizables
│   └── app/globals.css   # Estilos globales
├── .env.local           # Credenciales (no hacer commit)
├── README_ES.md         # Documentación completa
├── GETTING_STARTED_ES.md # Guía de configuración
├── QUICK_START_ES.md    # Referencia rápida
├── ARCHITECTURE.md      # Diseño del sistema
├── SETUP.sql            # Esquema de base de datos
└── package.json         # Dependencias
```

## Variables de Entorno

```env
# Requeridas en .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## Dependencias Principales

- **Next.js 15**: Framework React
- **React 18**: Librería de UI
- **Supabase**: Base de datos y autenticación
- **Tailwind CSS**: Utilidades de CSS
- **TypeScript**: Seguridad de tipos

## Lista de Verificación de Configuración

- [ ] Crear proyecto en Supabase.com
- [ ] Ejecutar SETUP.sql en Supabase
- [ ] Copiar credenciales de Supabase
- [ ] Crear `.env.local` con credenciales
- [ ] Ejecutar `npm install` (si es necesario)
- [ ] Ejecutar `npm run dev`
- [ ] Abrir http://localhost:3000
- [ ] Registrarse y probar funcionalidad

## Desplegar en Vercel

1. Enviar a GitHub:
```bash
git init
git add .
git commit -m "Commit inicial"
git remote add origin https://github.com/USUARIO/grupos
git push -u origin main
```

2. En vercel.com:
   - Haz clic en "New Project"
   - Selecciona tu repositorio
   - Agrega variables de entorno
   - Haz clic en "Deploy"

## Archivos de Documentación

- **README_ES.md**: Documentación completa en español
- **README.md**: Documentación completa en inglés
- **GETTING_STARTED_ES.md**: Guía paso a paso en español
- **QUICK_START_ES.md**: Referencia rápida en español
