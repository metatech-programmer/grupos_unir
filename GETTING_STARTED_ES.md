# Comenzar Ahora - Guía Rápida de Configuración

## Requisitos Previos
- Node.js 18+ instalado
- Cuenta de GitHub (opcional)
- Cuenta en Supabase (gratuita en supabase.com)

---

## Pasos de Configuración (5-10 minutos)

### Paso 1: Crear Proyecto Supabase
1. Navega a https://supabase.com en tu navegador
2. Haz clic en **"Start your project"** o **"Sign In"**
3. Crea una cuenta usando GitHub (opción más rápida)
4. Haz clic en **"New Project"**
   - Nombre: `grupos`
   - Contraseña: Elige una contraseña segura
   - Región: Selecciona la región más cercana a ti
5. Espera 2-3 minutos a que se cree el proyecto

### Paso 2: Configurar Base de Datos
1. En Supabase, navega a **"SQL Editor"** en la barra lateral izquierda
2. Haz clic en **"New query"**
3. Abre [SETUP.sql](./SETUP.sql) en tu editor de texto
4. Copia todo el código SQL
5. Pégalo en el editor SQL de Supabase
6. Haz clic en **"Run"** (botón verde)
7. La base de datos está configurada

### Paso 3: Obtener Credenciales
1. En Supabase, navega a **"Settings"** en la barra lateral izquierda
2. Selecciona **"API"**
3. Copia los siguientes valores:
   ```
   Project URL:  https://xxxxxxxxxxxx.supabase.co
   anon public:  eyJhbGc...xxxxx
   ```

### Paso 4: Configurar Variables de Entorno Locales
1. Crea un archivo `.env.local` en la raíz del proyecto:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...xxxxx
   ```
   *Reemplaza estos valores con los obtenidos en el Paso 3*

2. Abre Terminal en el directorio del proyecto
3. Ejecuta:
   ```bash
   npm run dev
   ```

4. Navega a http://localhost:3000 en tu navegador
5. La aplicación está ejecutándose

---

## Prueña la Aplicación

### Crear una Cuenta
1. Haz clic en **"Registrarse"**
2. Completa la siguiente información:
   - Nombre: Tu nombre
   - Email: tu-email@ejemplo.com
   - País: Tu país
   - Zona Horaria: Tu zona horaria
   - Contraseña: Tu contraseña
3. Haz clic en **"Registrarse"**

### Explorar Grupos
1. Verás el Panel de Control
2. Haz clic en **"Explorar Grupos"**
3. La IA recomienda grupos basados en:
   - Ventajas
   - Desventajas
   - Porcentaje de compatibilidad
4. Haz clic en **"Unirse a Este Grupo"**
5. ¡Completado!

---

## Desplegar en Vercel (Gratuito)

### Opción A: Usando GitHub (Recomendado)
```bash
# En la terminal, en el directorio del proyecto:
git init
git add .
git commit -m "Commit inicial"
git remote add origin https://github.com/TU-USUARIO/grupos.git
git push -u origin main
```

Luego:
1. Ve a https://vercel.com
2. Haz clic en **"New Project"**
3. Selecciona tu repositorio "grupos"
4. Haz clic en **"Import"**
5. En **Environment Variables**, agrega:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu clave
6. Haz clic en **"Deploy"**
7. Tu aplicación está en vivo en Internet

### Opción B: Carga Directa en Vercel
1. Ve a https://vercel.com
2. Haz clic en **"New Project"**
3. Carga esta carpeta como archivo zip
4. Configura las variables de entorno
5. Despliega

---

## Datos de Prueba

Para agregar grupos de ejemplo, ejecuta esto en el editor SQL de Supabase:

```sql
INSERT INTO groups (name, subject, max_size, timezone_coverage, pros, cons) VALUES
('Equipo Backend', 'Programación', 5, 
 ARRAY['Europe/Madrid'], 
 ARRAY['Misma ubicación', 'Excelente coordinación'], 
 ARRAY[]),

('Equipo Global', 'Inglés', 4, 
 ARRAY['Europe/Madrid', 'America/Bogota'], 
 ARRAY['Multicultural', 'Aprendizaje de idiomas'], 
 ARRAY['Horarios complejos']);
```

---

## Características Principales

| Característica | Estado |
|-----------------|--------|
| Registrarse/Iniciar Sesión | Funcionando |
| Base de Datos | PostgreSQL de Supabase |
| Recomendaciones de IA | Coincidencia inteligente |
| Actualizaciones en Tiempo Real | WebSocket |
| Pantalla de Ventajas/Desventajas | Por grupo |
| Soporte de Zonas Horarias | 15+ países |
| Diseño Responsive | Amigable para dispositivos móviles |
| Costo | 100% gratuito |

---

## Solución de Problemas

| Error | Solución |
|-------|----------|
| "NEXT_PUBLIC_SUPABASE_URL no encontrado" | Verifica que `.env.local` existe con los valores correctos |
| "No se puede conectar a la base de datos" | Verifica dos veces las credenciales de Supabase |
| "Página en blanco" | Presiona F12, revisa la Consola para mensajes de error |
| "Puerto 3000 ya en uso" | Ejecuta `npm run dev -- -p 3001` |
| "Build falló" | Ejecuta `npm run build` para ver errores detallados |

---

## Recursos Adicionales

- [README_ES.md](./README_ES.md) - Documentación completa
- [README.md](./README.md) - Documentación en inglés
- [ARCHITECTURE.md](./docs/archived-md/ARCHITECTURE.md) - Diseño del sistema
- [SETUP.sql](./SETUP.sql) - Esquema de base de datos
- [QUICK_START.md](./docs/archived-md/QUICK_START.md) - Guía alternativa rápida

---

## Recursos de Aprendizaje

- **Next.js**: https://nextjs.org/learn
- **Supabase**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com
- **React**: https://react.dev

---

## Pasos Siguientes (Opcional)

Después de que la aplicación esté funcionando:
1. Personaliza los colores en `tailwind.config.ts`
2. Agrega más países en `src/lib/timezones.ts`
3. Carga tu logo en `public/logo.png`
4. Crea tu primer grupo en la base de datos
5. Invita a colegas a unirse

---

## Consejos

- Usa el modo **Incógnito** para simular múltiples usuarios
- Ve los datos en el **Editor de Tablas** de Supabase
- Las contraseñas se hashean automáticamente
- La base de datos es gratuita hasta 500k filas
- Vercel es gratuito para proyectos pequeños

---

## Soporte

Si algo no funciona:
1. Revisa [README_ES.md](./README_ES.md) - Sección de Solución de Problemas
2. Consulta [ARCHITECTURE.md](./docs/archived-md/ARCHITECTURE.md) - Entender el sistema
3. Verifica la Consola (F12) para errores
4. Compara tus valores de Supabase

---

**¡Felicidades, tu aplicación de grupos está lista! 🎉**

**Comparte con tus compañeros y que se organicen mejor.**
