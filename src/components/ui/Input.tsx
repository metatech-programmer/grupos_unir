"use client"

import React from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  id?: string
}

export default function Input({ label, id, className = '', ...rest }: InputProps) {
  const inputId = id || rest.name || undefined

  return (
    <div className={`flex flex-col ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="text-sm text-slate-700 mb-2">
          {label}
        </label>
      )}
      <input id={inputId} className={`input-modern ${className}`.trim()} {...rest} />
    </div>
  )
}

export { Input }
