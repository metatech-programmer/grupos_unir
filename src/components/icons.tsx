import { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function TeamIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M16 7a3 3 0 1 1 0 6a3 3 0 0 1 0-6Z" />
      <path d="M8 8a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5Z" />
      <path d="M3.5 18.5a4.5 4.5 0 0 1 9 0" />
      <path d="M12 18.5a5 5 0 0 1 9 0" />
    </svg>
  )
}

export function BrainIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 2.83A3 3 0 0 0 6 14v2a4 4 0 0 0 4 4h1" />
      <path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 2.83A3 3 0 0 1 18 14v2a4 4 0 0 1-4 4h-1" />
      <path d="M12 3v18" />
      <path d="M8 10h4" />
      <path d="M12 14h4" />
    </svg>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

export function ActivityIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 12h4l2-5l4 10l2-5h6" />
    </svg>
  )
}

export function SparkIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="m12 2l1.7 4.3L18 8l-4.3 1.7L12 14l-1.7-4.3L6 8l4.3-1.7L12 2Z" />
      <path d="m18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9L18 14Z" />
    </svg>
  )
}
