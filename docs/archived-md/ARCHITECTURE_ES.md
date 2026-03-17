# Arquitectura del Sistema

## Descripción General

```
┌─────────────────┐
│   Frontend      │  Next.js + React + Tailwind
│   (Next.js)     │  Interfaz de Usuario
└────────┬────────┘
         │
         │ Rutas API
         │
┌─────────────────┐     ┌──────────────────────┐
│  Rutas API      │────▶│  Backend Supabase    │
│  (Coincidencia) │     │  (PostgreSQL)        │
└────────┬────────┘     └──────────────────────┘
         │                         │
         │                         │
         └─────────────┬───────────┘
                       │
                       ▼
              ┌────────────────────┐
              │  Actualizaciones   │
              │  en Tiempo Real    │
              │  WebSocket         │
              └────────────────────┘
```

## Esquema de Base de Datos

### Tabla: `users`
```sql
id (UUID)           -- Identificador único
auth_id (UUID)      -- ID de Supabase Auth
name (TEXT)         -- Nombre completo del usuario
email (TEXT)        -- Dirección de email única
country (TEXT)      -- Código de país (ej: es, co, pe)
timezone (TEXT)     -- Zona horaria IANA (ej: America/Bogota)
group_id (UUID)     -- Grupo actual (clave foránea)
created_at (DATE)   -- Fecha de registro
```

### Tabla: `groups`
```sql
id (UUID)                 -- Identificador único
name (TEXT)               -- Nombre del grupo
subject (TEXT)            -- Área de asignatura (Programación, Matemáticas, etc.)
members (TEXT[])          -- Array de IDs de usuarios
member_count (INT)        -- Contador rápido de miembros
max_size (INT)            -- Tamaño máximo permitido (3-5)
timezone_coverage (TEXT[])-- Zonas horarias representadas
pros (TEXT[])             -- Ventajas del grupo
cons (TEXT[])             -- Desventajas del grupo
created_at (DATE)         -- Fecha de creación
```

### Tabla: `group_members`
```sql
user_id (UUID)     -- Referencia a usuario
group_id (UUID)    -- Referencia a grupo
joined_at (DATE)   -- Fecha de incorporación
```

## Algoritmo de Coincidencia

### Fórmula de Puntuación de Compatibilidad

El algoritmo de coincidencia evalúa grupos en múltiples criterios con una puntuación máxima de 100:

```
Compatibilidad de Zona Horaria (25 puntos máximo)
  - Zona horaria compatible (≤8 horas de diferencia): 25 puntos
  - Zona horaria incompatible (>8 horas): 6 puntos

Superposición de Horarios (25 puntos máximo)
  - 4+ horas superpuestas: 25 puntos
  - 2-3 horas superpuestas: 16 puntos
  - 1 hora superpuesta: 8 puntos
  - Menos de 1 hora: 0 puntos

Disponibilidad de Horas Diarias (20 puntos máximo)
  - Coincidencia exacta: 20 puntos
  - Diferencia de ±1 hora: 15 puntos
  - Diferencia de ±2 horas: 8 puntos
  - Diferencia >2 horas: 0 puntos

Compatibilidad de Estilo de Trabajo (15 puntos máximo)
  - Estilo de trabajo coincidente o flexible: 15 puntos
  - Estilo de trabajo diferente: 6 puntos

Actividades Compartidas (15 puntos máximo)
  - 2+ actividades compartidas: 15 puntos
  - 1 actividad compartida: 9 puntos
  - Sin actividades compartidas: 0 puntos

Ajuste por Tamaño de Grupo (5 puntos bonificación)
  - 2-3 miembros (ideal): +5 puntos
  - 4 miembros: +3 puntos
  - 5+ miembros: +1 punto

Ajuste por Espacios Disponibles (5 puntos bonificación)
  - 2+ lugares abiertos: +5 puntos
  - 1 lugar abierto: +2 puntos
  - Grupo lleno: 0 puntos

Puntuación Total: 0-100 puntos
```

## Seguridad

### Políticas de Row Level Security (RLS)

```sql
-- Los usuarios ven solo sus propios datos
CREATE POLICY "Los usuarios ven sus propios datos"
  ON users FOR SELECT
  USING (auth.uid() = auth_id);

-- Todos pueden ver grupos públicamente
CREATE POLICY "Cualquiera puede ver grupos"
  ON groups FOR SELECT
  USING (true);

-- Solo el creador puede editar su grupo
CREATE POLICY "Solo el creador puede editar"
  ON groups FOR UPDATE
  USING (creator_id = auth.uid());
```

### Variables de Entorno

```env
# Público (seguro de compartir)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...

# Privado (nunca compartir)
# Clave de rol de servicio solo del lado del servidor (si es necesaria)
```

## Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|----------|
| Frontend | Next.js 15 | Framework React |
| Librería de UI | React 18 | Biblioteca de componentes |
| Estilos | Tailwind CSS | CSS de utilidades |
| Autenticación | Supabase Auth | Gestión de usuarios |
| Base de Datos | PostgreSQL de Supabase | Persistencia de datos |
| Seguridad de Tipos | TypeScript | Tipado estático |
| Despliegue | Vercel | Hosting |
| Tiempo Real | Supabase Realtime | Actualizaciones WebSocket |

## Rutas API

### Endpoints Disponibles

- `POST /api/account/delete` - Eliminar cuenta de usuario
- `POST /api/push/subscribe` - Suscribirse a notificaciones
- `POST /api/push/unsubscribe` - Desuscribirse de notificaciones
- `POST /api/push/new-message` - Enviar notificación push

Esta arquitectura es escalable, segura y está documentada para permitir despliegues sin interrupciones en Vercel con integración fácil de Supabase.
