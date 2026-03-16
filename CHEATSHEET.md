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

## 📊 API Endpoints (Futuros)

```
GET    /api/groups              # Listar grupos
GET    /api/groups/:id          # Detalles grupo
POST   /api/groups              # Crear grupo
PUT    /api/groups/:id          # Editar grupo
POST   /api/users/:id/join-group # Unirse grupo
```

## 🔐 Seguridad

- Las contraseñas se hashean en Supabase
- Usa Row Level Security en BD
- Variables sensibles en `.env.local`
- Never commit `.env.local` a git

## 🎨 Personalizaciones Comunes

### Cambiar colores
Edita: `tailwind.config.ts`

### Agregar más países
Edita: `src/lib/timezones.ts`

### Cambiar logo
Reemplaza: `public/logo.png`

### Modificar algoritmo IA
Edita: `src/lib/ai-matching.ts`

## 📈 Limites Gratis

| Servicio | Límite |
|----------|--------|
| Supabase BD Filas | 500k |
| Supabase Auth Usuarios | Sin límite |
| Supabase Almacenamiento | 1 GB |
| Vercel Deploy | Sin límite |
| Vercel Bandwidth | 100 GB/mes |

## 🆘 Problemas Comunes

**"Error: Cannot find module '@supabase'"**
```bash
npm install
```

**"Error: NEXT_PUBLIC_SUPABASE_URL not found"**
- Verifica `.env.local` existe
- Reinicia `npm run dev`

**"Blank white page"**
- Abre F12 Console en navegador
- Busca mensajes de error en rojo

**"Base de datos vacía"**
- Ejecuta SETUP.sql en Supabase

**"No puedo registrarme"**
- Verifica que Supabase está activo
- Comprueba credenciales en `.env.local`

## 💡 Tips "Pro"

1. Usa **Incognito** para probar con otro usuario
2. Monitorea BD en Supabase **Table Editor**
3. Lee console errors con **F12 > Console**
4. Usa **npm run build** para detectar errores antes de deploy
5. Prueba en mobile con **F12 > Device Toggle**

## 📚 Documentos

- **README.md**: Documentación oficial completa
- **GETTING_STARTED.md**: Paso a paso muy detallado
- **QUICK_START.md**: Guía alternative rápida
- **ARCHITECTURE.md**: Cómo funciona internamente todo
- **SETUP.sql**: Código SQL de la base de datos

## 🎓 Recursos Externos

- Docs Next.js: https://nextjs.org/docs
- API Supabase: https://supabase.com/docs
- Tailwind: https://tailwindcss.com
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org

---

**Última actualización: Marzo 2026**
**Versión: 0.1.0**

¿Preguntas? Abre el README o GETTING_STARTED.
