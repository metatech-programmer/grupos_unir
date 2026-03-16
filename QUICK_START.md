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
   (O manualmente: copiar y renombrar)

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

---

## 🌐 Desplegar en Vercel (1 minuto)

### Opción A: Con GitHub
```bash
# En terminal, desde la carpeta del proyecto:
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU-USUARIO/grupos.git
git push -u origin main
```

Luego:
1. Ve a https://vercel.com
2. Haz clic en **"New Project"**
3. Selecciona tu repo de GitHub
4. En **Environment Variables** agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **"Deploy"**

### Opción B: Sin GitHub (directo en Vercel)
1. Ve a https://vercel.com y crea cuenta
2. Carga el zip de la carpeta del proyecto
3. Sigue el proceso

¡Tu app está en vivo! 🚀

---

## 📝 Crear Datos de Prueba

Ejecuta esto en Supabase SQL Editor:

```sql
-- Agregar grupos de ejemplo
INSERT INTO groups (name, subject, max_size, timezone_coverage, pros, cons) VALUES
('Equipo España', 'Matemáticas', 5, ARRAY['Europe/Madrid', 'Europe/London'], 
 ARRAY['Compatible horario España', 'Comunicación fluida'], 
 ARRAY['Solo zona horaria Europa']),

('Equipo Latinoamérica', 'Programación', 5, ARRAY['America/Bogota', 'America/Buenos_Aires'], 
 ARRAY['Equipo multicultural', 'Excelente horario'], 
 ARRAY['Zona horaria variable']),

('Equipo Global', 'Inglés', 4, ARRAY['Europe/Madrid', 'America/Bogota', 'America/Buenos_Aires'], 
 ARRAY['Diversidad máxima', 'Aprenderás de otros países'], 
 ARRAY['Horarios difíciles']);
```

---

## ❓ FAQ Rápidas

**P: ¿Es realmente gratis?**
R: Sí 100%. Supabase es gratis hasta 500k filas. Vercel es gratis para proyectos pequeños.

**P: ¿Necesi to tarjeta?**
R: Supabase sí pide conexión de tarjeta pero no cobra (free tier). Vercel no necesita.

**P: ¿Dónde guardo mis contraseñas?**
R: Supabase maneja la seguridad. Las contraseñas se hashean automáticamente.

**P: ¿Puedo cambiar los colores?**
R: Sí, edita `src/app/globals.css` y `tailwind.config.ts`

**P: ¿Cómo agrego más países?**
R: Edita `src/lib/timezones.ts` en los arrays `TIMEZONES` y `COUNTRIES`

---

## 🆘 Problemas Comunes

| Problema | Solución |
|----------|----------|
| "Error de autenticación" | Verifica `.env.local` tiene las claves correctas |
| "Cannot find supabase" | Ejecuta `npm install` nuevamente |
| "Base de datos vacía" | Ejecuta el SQL de SETUP en Supabase |
| "Página blanca" | Revisa Console (F12) para errores |
| "Puerto 3000 ocupado" | Usa `npm run dev -- -p 3001` |

---

## 📚 Recursos

- 📖 [Next.js Docs](https://nextjs.org/docs)
- 📘 [Supabase Docs](https://supabase.com/docs)
- 🎨 [Tailwind CSS](https://tailwindcss.com)
- 🚀 [Vercel Docs](https://vercel.com/docs)

---

**¿Necesitas ayuda?** Abre un issue o contacta al desarrollador principal.

**¡Buena suerte con tu proyecto! 🎉**
