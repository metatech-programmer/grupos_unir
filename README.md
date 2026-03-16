# 👥 Grupos - Organizador Inteligente de Equipos de Trabajo

Una plataforma web moderna para formar grupos de trabajo óptimos considerando zonas horarias y preferencias, con recomendaciones impulsadas por IA.

## 🚀 Características

- **🤖 Recomendaciones por IA**: Algoritmo inteligente que sugiere los mejores grupos según tu zona horaria y preferencias
- **⏰ Compatibilidad de Horarios**: Agrupa automáticamente personas del mismo horario para mejor coordinación
- **🌍 Soporte Global**: Soporta múltiples países y zonas horarias (España, Colombia, Perú, Argentina, República Dominicana, etc.)
- **⚡ Actualizaciones en Tiempo Real**: Ve cambios en tiempo real con Supabase Realtime
- **📲 PWA Instalable**: Puedes instalar la app en móvil o escritorio como aplicación nativa
- **🔔 Notificaciones Push**: Recibe avisos de nuevos mensajes incluso cuando no tienes la app abierta
- **📊 Pantalla de Pros/Contras**: Cada grupo muestra ventajas y desventajas claras
- **👥 Grupos de 3-5 Miembros**: Tamaño óptimo para trabajo colaborativo
- **🔐 Autenticación Segura**: Login con Supabase Auth

## 🛠️ Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase (https://supabase.com)
- Vercel (para deployment, opcional)

## 📦 Instalación

### 1. Clonar o descargar el proyecto

```bash
cd grupos
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

#### Crear base de datos en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratis
2. Crea un nuevo proyecto
3. Ve a **SQL Editor** y ejecuta el siguiente script:

```sql
-- Crear tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  country TEXT,
  timezone TEXT,
  group_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de grupos
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  members TEXT[] DEFAULT ARRAY[]::TEXT[],
  member_count INTEGER DEFAULT 0,
  max_size INTEGER DEFAULT 5,
  timezone_coverage TEXT[] DEFAULT ARRAY[]::TEXT[],
  pros TEXT[] DEFAULT ARRAY[]::TEXT[],
  cons TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de miembros del grupo
CREATE TABLE group_members (
  user_id UUID NOT NULL,
  group_id UUID NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, group_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (group_id) REFERENCES groups(id)
);

-- Habilitar Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id);

CREATE POLICY "Anyone can view groups"
  ON groups FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view group members"
  ON group_members FOR SELECT
  USING (true);
```

### 4. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-vapid-key
VAPID_PRIVATE_KEY=your-private-vapid-key
VAPID_SUBJECT=mailto:admin@example.com
```

Reemplaza `your-project` y `your-anon-key` con los valores de tu proyecto Supabase:

1. En Supabase, ve a **Settings > API**
2. Copia `Project URL` y `anon public key`
3. Pégalos en el archivo `.env.local`

### 5. Activar Push Notifications (VAPID)

Genera claves VAPID una sola vez:

```bash
npx web-push generate-vapid-keys
```

Copia esas claves en `.env.local`:

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (por ejemplo: `mailto:tu-correo@dominio.com`)

Luego ejecuta en Supabase SQL Editor el archivo `PUSH_SETUP.sql`.
Ese script es no destructivo y solo agrega lo necesario para notificaciones push.

## 🚀 Ejecutar Localmente

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📱 Uso

### Registrarse
1. Haz clic en "Registrarse"
2. Completa tu perfil:
   - Nombre completo
   - Email
   - País
   - Zona horaria
3. Establece contraseña

### Encontrar Grupo
1. Ve a "Explorar Grupos"
2. La IA te sugerirá grupos basados en tu zona horaria
3. Cada grupo muestra:
   - Porcentaje de compatibilidad
   - Pros (ventajas)
   - Contras (desventajas)
   - Miembros actuales
4. Haz clic en "Unirse a este grupo"

### Ver Tu Grupo
1. Ve al Dashboard
2. Haz clic en "Ver Mi Grupo"
3. Consulta los detalles y miembros

## 🤖 Cómo Funciona el Algoritmo de IA

El sistema de recomendaciones calcula una puntuación de compatibilidad basada en:

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
