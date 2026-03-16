export const TIMEZONES = [
  { label: 'UTC-5 (Colombia, Perú)', value: 'America/Bogota' },
  { label: 'UTC-5 (Ecualdo)', value: 'America/Guayaquil' },
  { label: 'UTC-4 (Argentina)', value: 'America/Argentina/Buenos_Aires' },
  { label: 'UTC-3 (Brasil)', value: 'America/Sao_Paulo' },
  { label: 'UTC+1 (España, Portugal)', value: 'Europe/Madrid' },
  { label: 'UTC+0 (Reino Unido)', value: 'Europe/London' },
  { label: 'UTC+2 (Centro Europa)', value: 'Europe/Paris' },
  { label: 'UTC-6 (México)', value: 'America/Mexico_City' },
  { label: 'UTC-3 (Uruguay)', value: 'America/Montevideo' },
  { label: 'UTC-4 (República Dominicana)', value: 'America/Santo_Domingo' },
  { label: 'UTC-5 (Venezuela)', value: 'America/Caracas' },
  { label: 'UTC+5:30 (India)', value: 'Asia/Kolkata' },
]

export const COUNTRIES = [
  { label: 'España', value: 'es' },
  { label: 'Colombia', value: 'co' },
  { label: 'Perú', value: 'pe' },
  { label: 'Argentina', value: 'ar' },
  { label: 'Brasil', value: 'br' },
  { label: 'México', value: 'mx' },
  { label: 'Chile', value: 'cl' },
  { label: 'Uruguay', value: 'uy' },
  { label: 'Venezuela', value: 've' },
  { label: 'Ecuador', value: 'ec' },
  { label: 'República Dominicana', value: 'do' },
  { label: 'Reino Unido', value: 'uk' },
  { label: 'Francia', value: 'fr' },
  { label: 'Alemania', value: 'de' },
  { label: 'India', value: 'in' },
  { label: 'Otro', value: 'other' },
]

export function getTimezoneOffset(timezone: string): number {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    })
    const parts = formatter.formatToParts(now)
    
    // Extraer hora y minuto de forma segura
    const hour = parts.find(p => p.type === 'hour')?.value || '00'
    const minute = parts.find(p => p.type === 'minute')?.value || '00'
    
    const tzTime = new Date(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${hour}:${minute}:00`
    )
    return (now.getTime() - tzTime.getTime()) / (1000 * 60 * 60)
  } catch (error) {
    console.warn(`Error getting timezone offset for ${timezone}:`, error)
    return 0 // Retorna 0 como valor por defecto
  }
}

export function areTimezoneCompatible(tz1: string, tz2: string, hoursThreshold = 8): boolean {
  const offset1 = getTimezoneOffset(tz1)
  const offset2 = getTimezoneOffset(tz2)
  return Math.abs(offset1 - offset2) <= hoursThreshold
}

export function getCommonWorkingHours(timezones: string[]): { start: number; end: number } | null {
  if (timezones.length === 0) return null
  if (timezones.length === 1) return { start: 9, end: 17 }

  // Calcular horario común (idealmente 9 AM a 5 PM en la zona más tarde)
  const offsets = timezones.map(tz => getTimezoneOffset(tz))
  const minOffset = Math.min(...offsets)
  const maxOffset = Math.max(...offsets)

  if (maxOffset - minOffset > 12) {
    return null // No hay horario común viable
  }

  const adjustment = maxOffset - minOffset
  return {
    start: 9 + adjustment,
    end: Math.min(21, 17 + adjustment),
  }
}
