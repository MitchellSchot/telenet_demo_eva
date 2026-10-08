import type { ReactNode } from 'react'

type Props = {
  title: string
  step?: number
  aside?: ReactNode
  className?: string
  bodyClassName?: string
  /** Highlighted while a decision check looks at this panel. */
  focus?: boolean
  children: ReactNode
}

export function Panel({ title, step, aside, className = '', bodyClassName = '', focus, children }: Props) {
  return (
    <section className={`panel ${className} ${focus ? 'panel--focus' : ''}`}>
      <header className="panel__head">
        <h2 className="panel__title">
          {step !== undefined && <span className="panel__step">{step}</span>}
          {title}
        </h2>
        {aside && <div className="panel__aside">{aside}</div>}
      </header>
      <div className={`panel__body ${bodyClassName}`}>{children}</div>
    </section>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>
}
