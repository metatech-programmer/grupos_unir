"use client"

import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline'
}

export default function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  const variantClass =
    variant === 'ghost' ? 'btn-ghost' : variant === 'outline' ? 'btn-outline' : 'btn-primary'

  return (
    <button {...rest} className={`${variantClass} ${className}`.trim()}>
      {children}
    </button>
  )
}

export { Button }
