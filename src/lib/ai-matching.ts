import { User, Group } from './supabase'
import { areTimezoneCompatible } from './timezones'

export interface GroupSuggestion {
  group: Group
  compatibility_score: number
  pros: string[]
  cons: string[]
  recommendation_reason: string
}

export async function suggestGroupsForUser(
  user: User,
  availableGroups: Group[]
): Promise<GroupSuggestion[]> {
  const suggestions: GroupSuggestion[] = []

  for (const group of availableGroups) {
    // Filtrar grupos que no tengan espacio
    if (group.members.length >= group.max_size) {
      continue
    }

    const score = calculateCompatibilityScore(user, group)
    
    const pros = generatePros(user, group, score)
    const cons = generateCons(user, group, score)
    const reason = generateRecommendationReason(score, pros)

    suggestions.push({
      group,
      compatibility_score: score,
      pros,
      cons,
      recommendation_reason: reason,
    })
  }

  // Ordenar por puntuación de compatibilidad (descendente)
  return suggestions.sort((a, b) => b.compatibility_score - a.compatibility_score)
}

function calculateCompatibilityScore(user: User, group: Group): number {
  let score = 0

  // 1. Compatibilidad de zona horaria (25 puntos)
  const hasCompatibleTimezone = group.timezone_coverage.some(tz =>
    areTimezoneCompatible(user.timezone, tz, 8)
  )
  if (hasCompatibleTimezone) {
    score += 25
  } else {
    score += 6
  }

  // 2. Solape de horario (25 puntos)
  const overlapHours = calculateScheduleOverlap(
    user.availability_start,
    user.availability_end,
    group.active_hours_start,
    group.active_hours_end
  )
  if (overlapHours >= 4) {
    score += 25
  } else if (overlapHours >= 2) {
    score += 16
  } else if (overlapHours >= 1) {
    score += 8
  }

  // 3. Horas diarias disponibles (20 puntos)
  const dailyGap = Math.abs(user.daily_hours - group.required_daily_hours)
  if (dailyGap === 0) {
    score += 20
  } else if (dailyGap <= 1) {
    score += 15
  } else if (dailyGap <= 2) {
    score += 8
  }

  // 4. Compatibilidad de trabajo/ritmo (15 puntos)
  if (group.preferred_work_style === 'flexible' || group.preferred_work_style === user.work_status) {
    score += 15
  } else {
    score += 6
  }

  // 5. Afinidad por actividades (15 puntos)
  const sharedActivities = group.activity_focus.filter(activity =>
    user.activities?.includes(activity)
  ).length
  if (sharedActivities >= 2) {
    score += 15
  } else if (sharedActivities === 1) {
    score += 9
  }

  // Ajuste por tamaño del grupo
  // Preferencia por grupos con 3-4 miembros
  const memberCount = group.members.length
  if (memberCount === 2 || memberCount === 3) {
    score += 5
  } else if (memberCount === 4) {
    score += 3
  } else {
    score += 1
  }

  // Ajuste por espacio disponible
  const spotsLeft = group.max_size - memberCount
  if (spotsLeft >= 2) {
    score += 5
  } else if (spotsLeft === 1) {
    score += 2
  }

  return Math.min(100, Math.max(0, score))
}

function generatePros(user: User, group: Group, score: number): string[] {
  const pros: string[] = []

  // Verificar compatibilidad de zona horaria
  const hasCompatibleTimezone = group.timezone_coverage.some(tz =>
    areTimezoneCompatible(user.timezone, tz, 8)
  )
  if (hasCompatibleTimezone) {
    pros.push('Compatible con tu zona horaria')
  }

  const overlapHours = calculateScheduleOverlap(
    user.availability_start,
    user.availability_end,
    group.active_hours_start,
    group.active_hours_end
  )
  if (overlapHours >= 2) {
    pros.push(`Coinciden ${overlapHours} horas de trabajo diario`)
  }

  const sharedActivities = group.activity_focus.filter(activity =>
    user.activities?.includes(activity)
  ).length
  if (sharedActivities > 0) {
    pros.push('Coinciden en actividades clave del grupo')
  }

  // Tamaño del grupo
  if (group.members.length < 3) {
    pros.push('Grupo pequeno para mejor coordinacion')
  }

  // Espacio disponible
  const spotsLeft = group.max_size - group.members.length
  if (spotsLeft >= 2) {
    pros.push(`${spotsLeft} lugares disponibles`)
  }

  // Puntuación general
  if (score >= 70) {
    pros.push('Compatibilidad general alta')
  }

  return pros
}

function generateCons(user: User, group: Group, score: number): string[] {
  const cons: string[] = []

  // Verificar compatibilidad de zona horaria
  const hasCompatibleTimezone = group.timezone_coverage.some(tz =>
    areTimezoneCompatible(user.timezone, tz, 8)
  )
  if (!hasCompatibleTimezone) {
    cons.push('La diferencia horaria puede ser un reto')
  }

  const overlapHours = calculateScheduleOverlap(
    user.availability_start,
    user.availability_end,
    group.active_hours_start,
    group.active_hours_end
  )
  if (overlapHours < 2) {
    cons.push('Poco solape en horario diario')
  }

  if (Math.abs(user.daily_hours - group.required_daily_hours) > 2) {
    cons.push('Diferencia importante en horas disponibles al dia')
  }

  // Tamaño del grupo
  if (group.members.length >= 4) {
    cons.push('Grupo casi lleno, menos flexibilidad')
  }

  // Espacio limitado
  const spotsLeft = group.max_size - group.members.length
  if (spotsLeft === 1) {
    cons.push('Solo queda 1 lugar disponible')
  }

  // Baja puntuación
  if (score < 50) {
    cons.push('Compatibilidad baja')
  }

  return cons
}

function generateRecommendationReason(

  score: number,
  pros: string[]
): string {
  if (score >= 80) {
    return `Esta opcion es muy solida. ${pros[0] || 'Gran compatibilidad con tu perfil'}`
  } else if (score >= 60) {
    return 'Buena opcion. Se alinea bien con tus horarios y ritmo de trabajo.'
  } else if (score >= 40) {
    return 'Opcion viable con algunos desafios operativos. Revisa pros y contras antes de unirte.'
  } else {
    return 'No es la recomendacion ideal para tu disponibilidad actual.'
  }
}

function calculateScheduleOverlap(
  userStart: number,
  userEnd: number,
  groupStart: number,
  groupEnd: number
): number {
  const start = Math.max(userStart, groupStart)
  const end = Math.min(userEnd, groupEnd)
  return Math.max(0, end - start)
}

// Función para generar pros y contras adicionales basados en el contexto
export function enhanceGroupWithAIInsights(group: Group): void {
  // Aquí se podrían agregar insights más profundos usando Hugging Face en el futuro
  if (!group.pros || group.pros.length === 0) {
    group.pros = [
      'Miembros motivados',
      'Equipo dedicado',
      'Coordinacion rapida',
    ]
  }

  if (!group.cons || group.cons.length === 0) {
    group.cons = [
      'Requiere disponibilidad',
      'Proyectos demandantes',
    ]
  }
}
