# 🚀 Guía Rápida de Inicio

## ⚡ Primeros Pasos (5 minutos)

### 1️⃣ Crear Proyecto Supabase Gratuito
1. Ve a https://supabase.com
2. Haz clic en **"Start your project"**
3. Crea una cuenta (GitHub de la forma más rápida)
4. Crea un nuevo proyecto con nombre "grupos"
5. Espera a que se cree (2-3 minutos)

### 2️⃣ Crear Tablas en Supabase
1. En tu proyecto, ve a **SQL Editor** (lado izquierdo)
2. Haz clic en **"New Query"**
3. Copia TODO el código SQL del archivo [SETUP.sql](./SETUP.sql)
4. Haz clic en **"Run"**
5. ¡Listo! La base de datos está creada

### 3️⃣ Obtener Credenciales
1. Ve a **Settings > API** (lado izquierdo)
2. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4️⃣ Configurar Variables de Entorno
1. En la carpeta del proyecto, copia el archivo `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

2. Abre `.env.local` y pega:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-aqui
   ```

### 5️⃣ Ejecutar Localmente
```bash
npm run dev
```

Ve a http://localhost:3000 ¡Tu app está lista! 🎉
