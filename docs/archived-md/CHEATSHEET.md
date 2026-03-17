# 🎯 Referencia Rápida - Comandos Útiles

## 🚀 Desarrollo

```bash
# Ejecutar localmente
npm run dev

# Ir a http://localhost:3000
```

## 🔨 Build

```bash
# Crear versión de producción
npm run build

# Ejecutar versión producción
npm start

# Verificar errores
npm run lint
```

## 📦 Estructura de Carpetas

```
grupos/
├── src/
│   ├── app/              # Páginas (Next.js App Router)
│   │   ├── page.tsx      # Home
│   │   ├── register/     # Página registro
│   │   ├── login/        # Página login
│   │   ├── dashboard/    # Panel principal
│   │   ├── explore/      # Ver grupos
│   │   └── groups/[id]/  # Detalle grupo
│   ├── lib/              # Lógica compartida
│   │   ├── supabase.ts   # Cliente BD
│   │   ├── ai-matching.ts # Algoritmo IA
│   │   └── timezones.ts  # Zonas horarias
│   └── app/globals.css   # Estilos globales
├── .env.local            # Tus credenciales (No pushear!)
├── README.md             # Documentación completa
├── GETTING_STARTED.md    # Guía rápida
├── QUICK_START.md        # Inicio muy rápido
├── ARCHITECTURE.md       # Cómo funciona
├── SETUP.sql             # Script BD
└── package.json          # Dependencias

```

## 🌐 Variables de Entorno

```env
# En .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## 🔧 Dependencias Principales

- **Next.js 15**: Framework React
- **React 18**: Librería UI
- **Supabase**: Database + Auth
- **Tailwind CSS**: Estilos
- **TypeScript**: Tipado seguro

## 📋 Checklist Configuración

- [ ] Crear proyecto en Supabase.com
- [ ] Ejecutar SETUP.sql en Supabase
- [ ] Copiar credenciales de Supabase
- [ ] Crear `.env.local` con credenciales
- [ ] `npm install` (si no está hecho)
- [ ] `npm run dev`
- [ ] Abrir http://localhost:3000
- [ ] Registrarse y probar

## 🚀 Deploy en Vercel

1. Push a GitHub:
```bash
git init
git add .
git commit -m "Inicial"
git remote add origin https://github.com/TU/grupos
git push -u origin main
```

2. En vercel.com:
   - Click "New Project"
   - Selecciona tu repo
   - Agrega variables de entorno
   - Click "Deploy"

## 📚 Documentos

- **README.md**: Documentación oficial completa
- **GETTING_STARTED.md**: Paso a paso muy detallado
- **QUICK_START.md**: Guía alternativa rápida
- **ARCHITECTURE.md**: Cómo funciona internamente todo
- **SETUP.sql**: Código SQL de la base de datos

---

**Última actualización: Marzo 2026**
