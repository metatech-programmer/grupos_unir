export const WORK_STATUS = [
  { value: 'full_time', label: 'Trabajo tiempo completo' },
  { value: 'part_time', label: 'Trabajo medio tiempo' },
  { value: 'student', label: 'Solo estudio' },
  { value: 'freelance', label: 'Freelance / independiente' },
  { value: 'internship', label: 'Practicas / internship' },
  { value: 'entrepreneur', label: 'Emprendimiento propio' },
  { value: 'mixed', label: 'Trabajo y estudio' },
  { value: 'job_seeking', label: 'Buscando empleo' },
]

export const ACTIVITIES = [
  'Backend',
  'Frontend',
  'Diseno UX/UI',
  'Investigacion',
  'Documentacion',
  'Presentaciones',
  'Analitica de datos',
  'QA y testing',
  'Arquitectura de software',
  'Integraciones API',
  'DevOps y despliegue',
  'Seguridad aplicativa',
  'Product management',
  'Scrum y coordinacion',
  'Soporte al cliente',
  'Growth y marketing',
  'Mobile apps',
  'Automatizacion',
  'Machine learning',
  'Business intelligence',
  'Accesibilidad web',
  'Testing automatizado',
  'Monitoreo y observabilidad',
  'Gestor de contenidos',
]

export const DAILY_HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

export const SCHEDULE_SLOTS = Array.from({ length: 24 }, (_, h) => ({
  value: h,
  label: `${String(h).padStart(2, '0')}:00`,
}))
