# 🎯 Comenzar Ahora - Instrucciones Paso a Paso

## ✅ Requisitos Previos
- Node.js 18+ instalado
- Cuenta GitHub (opcional)
- Cuenta en Supabase (gratis en supabase.com)

---

## 📋 Pasos (5-10 minutos)

### PASO 1: Crear Proyecto Supabase
1. Abre https://supabase.com en tu navegador
2. Click en **"Start your project"** o **"Sign In"**
3. Usa GitHub para crear cuenta (más rápido)
4. Click **"New Project"**
   - Nombre: `grupos`
   - Contraseña: Cualquiera (no es importante)
   - Región: Más cercana a ti
5. **Espera 2-3 minutos** a que se cree

### PASO 2: Crear La Base de Datos
1. En Supabase, lado izquierdo, busca **"SQL Editor"**
2. Click en **"New query"**
3. Abre [SETUP.sql](./SETUP.sql) en tu editor
4. Copia TODO el código
5. Pégalo en Supabase SQL Editor
6. Click **"Run"** (botón verde)
7. ¡Listo! La BD está lista

### PASO 3: Obtener Credenciales
1. En Supabase, lado izquierdo: **"Settings"**
2. Luego: **"API"**
3. Copia estos 2 valores:
   ```
   Project URL:  https://xxxxxxxxxxxx.supabase.co
   anon public:  eyJhbGc...xxxxx
   ```

### PASO 4: Configurar App Localmente
1. En esta carpeta, crea file `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...xxxxx
   ```
   *(Reemplaza con tus valores del Paso 3)*

2. Abre **Terminal** en esta carpeta
3. Ejecuta:
   ```bash
   npm run dev
   ```

4. Abre http://localhost:3000 en tu navegador
5. ✅ **¡Tu app está funcionando!**

---

## 🧪 Prueba la App

### Crear Cuenta
1. Click "Registrarse"
2. Completa:
   - Nombre: Tu nombre
   - Email: cualquier@email.com
   - País: Tu país
   - Zona Horaria: La tuya
   - Contraseña: Tu contraseña
3. Click "Registrarse"

### Explorar Grupos
1. Verás Dashboard
2. Click "Explorar Grupos"
3. La IA te sugiere grupos con:
   - ✅ Pros (ventajas)
   - ⚠️ Cons (desventajas)
   - % Compatibilidad
4. Click "Unirse a Este Grupo"
5. ¡Listo!

---

## 🚀 Desplegar en Vercel (GRATIS)

### Opción A: Usando GitHub (Recomendado)
```bash
# En Terminal, en la carpeta del proyecto:
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU-USUARIO/grupos.git
git push -u origin main
```

Luego:
1. Ve a https://vercel.com
2. Click "New Project"
3. Selecciona tu repo "grupos"
4. Click "Import"
5. En **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu clave
6. Click "Deploy"
7. **¡Tu app está VIVA en Internet!** 🎉

### Opción B: Directo en Vercel
1. Ve a https://vercel.com
2. Click "New Project"
3. Selecciona esta carpeta (zip)
4. Llena variables de entorno
5. Deploy

---

## 📊 Datos de Prueba

Ejecuta esto en Supabase SQL Editor para agregar grupos de ejemplo:

```sql
INSERT INTO groups (name, subject, max_size, timezone_coverage, pros, cons) VALUES
('Equipo Backend', 'Programación', 5, 
 ARRAY['Europe/Madrid'], 
 ARRAY['España juntos', 'Excelente coordin.'], 
 ARRAY[]),

('Equipo Global', 'Inglés', 4, 
 ARRAY['Europe/Madrid', 'America/Bogota'], 
 ARRAY['Multicultural', 'Aprenderás'], 
 ARRAY['Horarios complicados']);
```

---

## 🔥 Características Principales

| Feature | Estado |
|---------|--------|
| Registro/Login | ✅ Funcionando |
| Base de Datos | ✅ Supabase |
| Recomendaciones IA | ✅ Matching inteligente |
| Temps Reales | ✅ WebSocket |
| Mostrar Pros/Cons | ✅ Cada grupo |
| Zonas Horarias | ✅ 15+ países |
| Responsive | ✅ Mobile friendly |
| Gratuito | ✅ 100% free |

---

## 🛠️ Troubleshooting

| Error | Solución |
|-------|----------|
| "NEXT_PUBLIC_SUPABASE_URL not found" | Verifica `.env.local` existe |
| "Cannot connect to database" | Copia BIEN los valores de Supabase |
| "Blank page" | F12 > Console, busca red errors |
| "Puerto 3000 ocupado" | `npm run dev -- -p 3001` |
| "Build failed" | `npm run build` para ver errores |

---

## 📚 Documentación Completa

- [README.md](./README.md) - Documentación completa
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Cómo funciona la IA
- [SETUP.sql](./SETUP.sql) - Base de datos SQL
- [QUICK_START.md](./QUICK_START.md) - Guía alternativa

---

## 🎓 Aprender Más

- **Next.js**: https://nextjs.org/learn
- **Supabase**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com
- **React**: https://react.dev

---

## ✨ Siguientes Pasos (Opcional)

Después de que funcione, puedes:
1. Cambiar colores en `tailwind.config.ts`
2. Agregar más países en `src/lib/timezones.ts`
3. Agregar tu logo en `public/logo.png`
4. Crear tu propio grupo en la BD
5. Invitar amigos

---

## 💡 Tips

- Usa **Incognito** para simular otro usuario
- Los datos en Supabase se ven en **Table Editor**
- Las contraseñas se hashean automáticamente
- Todo es GRATIS hasta 500k filas en BD
- Vercel es gratis para proyectos pequeños

---

## 🤝 Soporte

Si algo no funciona:
1. Ve a [README.md](./README.md) - Sección FAQ
2. Mira [ARCHITECTURE.md](./ARCHITECTURE.md) - Entender sistema
3. Verifica Console (F12) para errores
4. Compara tus valores de Supabase

---

**¡Felicidades, tu app de grupos está lista! 🎉**

**Comparte con tus compañeros y que se organicen mejor.**
