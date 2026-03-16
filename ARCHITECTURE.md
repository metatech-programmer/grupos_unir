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

### Ejemplo de Cálculo

**Usuario: Juan de Madrid (UTC+1)**

**Grupo: "Equipo Latinoamérica" (Colombia UTC-5, Argentina UTC-3)**

1. **Compatibilidad de Zona Horaria**
   - Diferencia Madrid-Bogotá: 6 horas ✓
   - Diferencia Madrid-BuenosAires: 4 horas ✓
   - TZ_Score = 100
   - Aporte: 100 × 0.40 = 40 puntos

2. **Tamaño del Grupo**
   - Miembros actuales: 3
   - Size_Score = 100 (ideal)
   - Aporte: 100 × 0.30 = 30 puntos

3. **Espacio Disponible**
   - Max: 5, Actuales: 3, Disponible: 2
   - Space_Score = 100
   - Aporte: 100 × 0.20 = 20 puntos

4. **Diversidad Geográfica**
   - Zonas: Colombia, Argentina (2 ≥ 2)
   - Diversity_Score = 100
   - Aporte: 100 × 0.10 = 10 puntos

**TOTAL: 40 + 30 + 20 + 10 = 100% ⭐⭐⭐ RECOMENDADO**

## 🌐 Mapeo de Zonas Horarias

```javascript
Soporte actual:
┌─────────────────────────────────────────┐
│ ESPAÑA & PORTUGAL                       │
│ UTC+1 (Invierno) / UTC+2 (Verano)      │
│ Madrid, Lisboa, etc.                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ COLOMBIA & PAÍSES ANDINOS                │
│ UTC-5                                   │
│ Colombia, Perú, Ecuador                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ CONO SUR                                 │
│ UTC-3 (Invierno) / UTC-2 (Verano)      │
│ Argentina, Uruguay, Brasil             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ MÉXICO & CENTROAMÉRICA                   │
│ UTC-6 / UTC-5                           │
│ México, Honduras, etc.                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ CARIBBEAN                                │
│ UTC-4                                   │
│ República Dominicana, Venezuela         │
└─────────────────────────────────────────┘
```

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

### Autenticación

- Supabase Auth maneja registro/login
- Contraseñas hasheadas con bcrypt
- Tokens JWT para sesiones
- CORS configurado en Supabase

## 📊 Flujo de Datos

### 1. Registro de Usuario
```
Formulario → Validación → Supabase Auth → Tabla Users → Redirect Dashboard
```

### 2. Búsqueda de Grupos
```
Usuario → AI Matching → Calcula Compatibilidad × N Grupos → Ordena → Muestra Top 10
```

### 3. Unirse a Grupo
```
Click "Unirse" → Actualiza user.group_id → Incrementa members[] → Realtime → Actualiza UI
```

### 4. Actualización en Tiempo Real
```
Cambio en BD → Webhook Supabase → Event → Suscriptores notificados → UI actualiza
```

## ⚙️ Configuración Deployed en Vercel

### Variables de Entorno

```env
# PÚBLICA (seguro compartir)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...

# PRIVADA (NO compartir - si fuera necesaria)
# SUPABASE_SERVICE_ROLE=ey...
```

### Performance

- Next.js App Router: SSR + ISR
- Tailwind CSS: Estilos optimizados
- Supabase: Índices en `groups` y `users`
- Realtime: WebSocket para actualizaciones

## 🚀 Escalabilidad Futura

Para soportar **10,000+ usuarios**:

1. Implementar caché con Redis/Vercel KV
2. Agregar índices avanzados en Supabase
3. Usar Edge Functions para matching distribuido
4. Implementar pagination lazy en UI
5. Database replication para failover

## 📈 Métricas Clave

```
Total de usuarios registrados
Grupos creados
Tasa de ocupación de grupos (%)
Promedio de compatibilidad de matches
Usuarios activos por día
Cambios de grupo por usuario
```

## 🐛 Debugging

### Logging
```typescript
// En desarrollo
console.log('Intentando matching para:', user.id)

// En producción
// Usar Supabase Logs o Vercel Analytics
```

### Verificar Datos en Vivo
```sql
-- Ver todos los usuarios
SELECT * FROM users;

-- Ver grupos con miembros
SELECT * FROM groups WHERE member_count > 0;

-- Ver usuarios sin grupo
SELECT * FROM users WHERE group_id IS NULL;
```

---

Esta arquitectura es escalable, segura y completamente gratuita hasta **500k operaciones/mes**.
