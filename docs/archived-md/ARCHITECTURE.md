# 🏗️ Arquitectura del Sistema

## 📋 Visión General

```
┌─────────────────┐
│   Frontend      │  Next.js + React + Tailwind
│   (Next.js)     │  Interfaz de usuario
└────────┬────────┘
         │
         │ API Routes
         │
┌─────────────────┐     ┌──────────────────────┐
│  API Routes     │────▶│  Supabase Backend    │
│  (Matching AI)  │     │  (PostgreSQL)        │
└────────┬────────┘     └──────────────────────┘
         │                         │
         │                         │
         └─────────────┬───────────┘
                       │
                       ▼
              ┌────────────────────┐
              │  Realtime Updates  │
              │  WebSocket (RT)    │
              └────────────────────┘
```

## 🗄️ Estructura de la Base de Datos

### Tabla: `users`
```sql
id (UUID)           -- Identificador único
auth_id (UUID)      -- ID de Supabase Auth
name (TEXT)         -- Nombre del usuario
email (TEXT)        -- Email único
country (TEXT)      -- País (código: es, co, pe, etc.)
timezone (TEXT)     -- Zona horaria (e.g., "America/Bogota")
group_id (UUID)     -- ID del grupo al que pertenece
created_at (DATE)   -- Fecha de registro
```

### Tabla: `groups`
```sql
id (UUID)              -- Identificador único
name (TEXT)            -- Nombre del grupo
subject (TEXT)         -- Asignatura (Programación, Matemáticas, etc.)
members (TEXT[])       -- Array de IDs de usuarios
member_count (INT)     -- Contador rápido de miembros
max_size (INT)         -- Máximo permitido (3-5)
timezone_coverage (TEXT[]) -- Zonas horarias cubiertas
pros (TEXT[])          -- Ventajas del grupo
cons (TEXT[])          -- Desventajas del grupo
created_at (DATE)      -- Fecha de creación
```

### Tabla: `group_members`
```sql
user_id (UUID)     -- Referencia a usuario
group_id (UUID)    -- Referencia a grupo
joined_at (DATE)   -- Fecha de incorporación
```

## 🧠 Algoritmo de Matching de IA

### Fórmula de Compatibilidad

```
Puntuación = (TZ_Score × 0.40) + (Size_Score × 0.30) + (Space_Score × 0.20) + (Diversity_Score × 0.10)

Donde:
- TZ_Score (Zona Horaria): 0-100 (40% del peso)
  - Si diferencia ≤ 8 horas: 100 puntos
  - Si diferencia > 8 horas: 25 puntos (penalización)
  
- Size_Score (Tamaño): 0-100 (30% del peso)
  - 2-3 miembros: 100 puntos (ideal)
  - 4 miembros: 67 puntos
  - 5 miembros: 0 puntos (lleno)
  
- Space_Score (Espacio): 0-100 (20% del peso)
  - 2+ espacios: 100 puntos
  - 1 espacio: 50 puntos
  - 0 espacios: 0 puntos
  
- Diversity_Score (Diversidad): 0-100 (10% del peso)
  - 2+ zonas horarias: 100 puntos
  - 1 zona horaria: 0 puntos
```

---

## 🔐 Seguridad

### Row Level Security (RLS)

```sql
-- Los usuarios solo ven sus propios datos
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = auth_id);

-- Todos pueden ver los grupos (lectura)
CREATE POLICY "Anyone can view groups"
  ON groups FOR SELECT
  USING (true);

-- Solo el creador puede editar su grupo
CREATE POLICY "Only group creator can edit"
  ON groups FOR UPDATE
  USING (creator_id = auth.uid());
```

---

## ⚙️ Configuración Deployed en Vercel

### Variables de Entorno

```env
# PÚBLICA (seguro compartir)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...

# PRIVADA (NO compartir - si fuera necesaria)
# SUPABASE_SERVICE_ROLE=ey...
```

---

Esta arquitectura es escalable, segura y documentada para permitir despliegues en Vercel y una integración fácil con Supabase.
