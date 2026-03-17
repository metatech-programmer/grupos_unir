# Guía Rápida de Inicio

## Comenzar en 5 Minutos

### Paso 1: Crear Proyecto Supabase Gratuito
1. Visita https://supabase.com
2. Haz clic en **"Start your project"**
3. Crea una cuenta usando GitHub (opción más rápida)
4. Crea un nuevo proyecto llamado "grupos"
5. Espera 2-3 minutos a que se configure

### Paso 2: Configurar Base de Datos
1. En tu proyecto, navega a **SQL Editor** (barra lateral izquierda)
2. Haz clic en **"New Query"**
3. Copia todo el código SQL del archivo [SETUP.sql](./SETUP.sql)
4. Haz clic en **"Run"**
5. La base de datos está lista

### Paso 3: Obtener Credenciales
1. Abre **Settings > API** (barra lateral izquierda)
2. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Paso 4: Configurar Variables de Entorno
1. Copia el archivo `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

2. Edita `.env.local` y pega:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-aqui
   ```

### Paso 5: Ejecutar Localmente
```bash
npm run dev
```

Visita http://localhost:3000 — ¡Tu aplicación está ejecutándose!
