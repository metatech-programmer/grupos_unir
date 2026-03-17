# 👥 Grupos — Organizador inteligente de equipos

Pequeña aplicación web para formar grupos de trabajo optimizados por zona horaria y preferencias.

Principales acciones para publicar el repo públicamente:

- Lee `GETTING_STARTED.md` para arranque rápido y pasos de configuración.
- Documentación detallada y notas antiguas han sido movidas a `docs/archived-md/`.
- License: `LICENSE` (MIT).

Archivos conservados en la raíz:

- `README.md` (esta versión concisa)
- `GETTING_STARTED.md` (guía paso a paso)

Si necesitas que deje otro documento en la raíz (por ejemplo `ARCHITECTURE.md`), dímelo y lo restauro.

Advertencia: no subas `.env.local`, contiene datos sensibles.


- **Compatibilidad de Zona Horaria (40 puntos)**: ¿Tus horarios se solapan?
- **Tamaño del Grupo (30 puntos)**: Preferencia por grupos de 3-4 miembros
- **Espacio Disponible (20 puntos)**: ¿Hay lugares vacíos?
- **Diversidad Geográfica (10 puntos)**: Valor agregado de equipos multicultural

**Puntuación Total: 0-100%**

## 🌐 Desplegar en Vercel

### 1. Subir a GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Importar a Vercel
1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en "New Project"
3. Selecciona tu repositorio de GitHub
4. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click en "Deploy"

¡Tu app estará en vivo en poco tiempo!

## 📊 Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx              # Home
│   ├── globals.css            # Estilos globales
│   ├── layout.tsx             # Layout principal
│   ├── register/page.tsx       # Página de registro
│   ├── login/page.tsx          # Página de login
│   ├── dashboard/page.tsx      # Dashboard del usuario
│   ├── explore/page.tsx        # Explorar grupos
│   └── groups/[id]/page.tsx    # Detalles del grupo
├── lib/
│   ├── supabase.ts            # Cliente de Supabase
│   ├── timezones.ts           # Utilidades de zonas horarias
│   └── ai-matching.ts         # Algoritmo de recomendación
├── components/                # Componentes React (reutilizables)
└── styles/                    # Estilos adicionales

```

## 🔒 Seguridad

- Autenticación con Supabase Auth (segura y gratuita)
- Row Level Security en la base de datos
- Variables de entorno protegidas
- No se almacenan contraseñas en localStorage

## 💡 Ideas Futuras

- [ ] Crear grupos propios
- [ ] Cambiar de grupo por asignatura
- [ ] Sistema de calificación de grupos
- [ ] Integración con Google Meet/Discord para llamadas
- [ ] Notificaciones en tiempo real
- [ ] Sistema de mensajes entre miembros
- [ ] Dashboard con estadísticas

## 🐛 Solución de Problemas

### "Error de autenticación"
- Verifica que tus variables de entorno están configuradas correctamente
- Confirma que tu proyecto Supabase está activo

### "El grupo no se carga"
- Revisa la consola del navegador para mensajes de error
- Asegúrate de que la tabla `groups` existe en Supabase

### "La zona horaria no es correcta"
- Supabase usa UTC internamente
- El algoritmo convierte automáticamente a tu zona horaria local

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisa la documentación de [Next.js](https://nextjs.org)
2. Consulta la documentación de [Supabase](https://supabase.com/docs)
3. Abre un issue en el repositorio

## 📄 Licencia

MIT License - Libre para usar en proyectos personales y comerciales.

---

**¡Hecho con ❤️ para facilitarte la organización de grupos de trabajo!**

### Zonas Horarias Soportadas:
- 🇪🇸 España (UTC+1)
- 🇨🇴 Colombia (UTC-5)
- 🇵🇪 Perú (UTC-5)
- 🇦🇷 Argentina (UTC-3)
- 🇧🇷 Brasil (UTC-3/-2)
- 🇲🇽 México (UTC-6/-5)
- 🇨🇭 Chile (UTC-3/-4)
- 🇺🇾 Uruguay (UTC-3)
- 🇻🇪 Venezuela (UTC-4)
- 🇪🇨 Ecuador (UTC-5)
- 🇩🇴 República Dominicana (UTC-4)
- 🇬🇧 Reino Unido (UTC+0)
- 🇫🇷 Francia (UTC+1/+2)
- 🇩🇪 Alemania (UTC+1/+2)
- 🇮🇳 India (UTC+5:30)

### Requisitos del Proyecto:
- ✅ Grupos de 3-5 miembros máximo
- ✅ Considerar horarios y zonas horarias
- ✅ IA para sugerir mejor grupo
- ✅ Base de datos gratuita (Supabase)
- ✅ Tiempo real (Supabase Realtime)
- ✅ Despliegue en Vercel
- ✅ Mostrar pros y contras de cada grupo
- ✅ Usuarios pueden elegir grupo aunque vaya en contra de la recomendación
