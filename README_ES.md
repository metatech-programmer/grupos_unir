# Grupos — Plataforma Inteligente de Organización de Equipos

Una aplicación web para crear grupos de trabajo optimizados según compatibilidad de zonas horarias y preferencias de los usuarios.

## Descripción General

Grupos ayuda a estudiantes y profesionales a organizarse en grupos de estudio o proyectos con horarios compatibles y diversidad geográfica. El algoritmo de coincidencia impulsado por IA recomienda el mejor grupo para cada usuario basándose en la superposición de zonas horarias, preferencias de tamaño de grupo, espacios disponibles y métricas de diversidad.

## Inicio Rápido

**Guía rápida**: Lee [GETTING_STARTED_ES.md](./GETTING_STARTED_ES.md) para obtener instrucciones paso a paso.

Para detalles completos de arquitectura, consulta [ARCHITECTURE.md](./docs/archived-md/ARCHITECTURE.md).

## Seguridad

- **Importante**: Nunca hagas commit de `.env.local` — contiene credenciales sensibles
- Licencia: MIT (ver [LICENSE](./LICENSE))

## Algoritmo de Puntuación de Compatibilidad

El algoritmo de coincidencia evalúa grupos usando los siguientes criterios ponderados:

- **Compatibilidad de Zona Horaria (25 puntos)**: ¿La zona horaria del grupo se superpone dentro de 8 horas?
- **Superposición de Horario (25 puntos)**: ¿Cuántas horas de superposición diaria existen entre el usuario y el grupo?
- **Coincidencia de Horas Diarias (20 puntos)**: ¿El compromiso diario requerido coincide con la disponibilidad del usuario?
- **Compatibilidad de Estilo de Trabajo (15 puntos)**: ¿El estilo de trabajo del grupo coincide con las preferencias del usuario?
- **Actividades Compartidas (15 puntos)**: ¿Cuántos intereses de actividades se comparten?
- **Preferencia de Tamaño de Grupo (5 puntos)**: Los grupos con 2-4 miembros puntúan más alto
- **Espacios Disponibles (5 puntos)**: Los grupos con lugares abiertos puntúan más alto

**Puntuación Final: 0-100 puntos**

## Desplegar en Vercel

### Subir a GitHub
```bash
git add .
git commit -m "Commit inicial"
git push origin main
```

### Importar a Vercel
1. Visita [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en **"New Project"**
3. Selecciona tu repositorio de GitHub
4. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Haz clic en **"Deploy"**

Tu aplicación estará en vivo en minutos.

## Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx              # Página principal
│   ├── globals.css           # Estilos globales
│   ├── layout.tsx            # Componente de diseño principal
│   ├── register/page.tsx      # Página de registro
│   ├── login/page.tsx         # Página de inicio de sesión
│   ├── dashboard/page.tsx     # Panel de control del usuario
│   ├── explore/page.tsx       # Explorar grupos
│   └── groups/[id]/page.tsx   # Detalles del grupo
├── lib/
│   ├── supabase.ts           # Cliente de Supabase
│   ├── timezones.ts          # Utilidades de zonas horarias
│   └── ai-matching.ts        # Algoritmo de coincidencia
├── components/               # Componentes React reutilizables
└── styles/                   # Hojas de estilo adicionales
```

## Seguridad

- Autenticación mediante Supabase Auth (segura y gratuita)
- Row Level Security (RLS) aplicado en la base de datos
- Variables de entorno protegidas
- Las contraseñas nunca se almacenan en localStorage

## Características

- Recomendaciones de grupos impulsadas por IA
- Coincidencia en tiempo real basada en zonas horarias
- Soporte para múltiples países (15+ países)
- Pantalla de ventajas y desventajas para cada grupo
- Base de datos PostgreSQL gratuita mediante Supabase
- Despliegue gratuito mediante Vercel
- Diseño responsive amigable para dispositivos móviles

## Mejoras Futuras

- [ ] Crear grupos personalizados
- [ ] Cambiar de grupo por asignatura
- [ ] Sistema de calificación de grupos
- [ ] Integración con Google Meet/Discord
- [ ] Notificaciones en tiempo real
- [ ] Mensajería directa entre miembros
- [ ] Panel de análisis y estadísticas

## Solución de Problemas

### Error de Autenticación
- Verifica que las variables de entorno estén configuradas correctamente
- Confirma que tu proyecto Supabase está activo

### El Grupo No Se Carga
- Revisa la consola del navegador para mensajes de error
- Asegúrate de que la tabla `groups` existe en Supabase

### Zona Horaria Incorrecta
- Supabase almacena las horas internamente en UTC
- El algoritmo convierte automáticamente a la zona horaria local

## Soporte

Para problemas o preguntas:
1. Revisa la documentación de [Next.js](https://nextjs.org)
2. Consulta la documentación de [Supabase](https://supabase.com/docs)
3. Abre un issue en este repositorio

## Licencia

Licencia MIT - Libre para usar en proyectos personales y comerciales.

---

## Zonas Horarias Soportadas

La plataforma soporta las siguientes zonas horarias y regiones:

| País | Zona Horaria | Diferencia UTC |
|------|-------------|-----------------|
| España | Europe/Madrid | UTC+1 |
| Colombia | America/Bogota | UTC-5 |
| Perú | America/Lima | UTC-5 |
| Argentina | America/Argentina/Buenos_Aires | UTC-3 |
| Brasil | America/Sao_Paulo | UTC-3/-2 |
| México | America/Mexico_City | UTC-6/-5 |
| Chile | America/Santiago | UTC-3/-4 |
| Uruguay | America/Montevideo | UTC-3 |
| Venezuela | America/Caracas | UTC-4 |
| Ecuador | America/Guayaquil | UTC-5 |
| República Dominicana | America/Santo_Domingo | UTC-4 |
| Reino Unido | Europe/London | UTC+0 |
| Francia | Europe/Paris | UTC+1/+2 |
| Alemania | Europe/Berlin | UTC+1/+2 |
| India | Asia/Kolkata | UTC+5:30 |

## Requisitos del Proyecto Implementados

- Tamaño máximo de grupo: 3-5 miembros
- Programación consciente de zonas horarias
- Recomendaciones de coincidencia impulsadas por IA
- Base de datos gratuita (PostgreSQL de Supabase)
- Sincronización en tiempo real (Supabase Realtime)
- Despliegue gratuito (Vercel)
- Pantalla de ventajas y desventajas por grupo
- Los usuarios pueden anular recomendaciones de IA si lo desean
