"use client"

import React from 'react'

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  header?: React.ReactNode
}

export default function Card({ header, children, className = '', ...rest }: CardProps) {
  return (
    <div {...rest} className={`card ${className}`.trim()}>
      {header && <div className="mb-3">{header}</div>}
      <div>{children}</div>
    </div>
  )
}

export { Card }
