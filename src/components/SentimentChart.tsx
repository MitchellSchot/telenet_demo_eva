import { useLayoutEffect, useRef, useState } from 'react'
import { useElementSize } from '../hooks/useElementSize'
import type { ChartPoint, DemoView } from '../sync/timeline'
import { EmptyState, Panel } from './Panel'

const SERIES = [
  { key: 'text', cls: 'series--text', label: 'Text only' },
  { key: 'eva', cls: 'series--eva', label: 'EVA: text + voice' },
] as const

const ZONES = [
  { from: 0, to: 30, cls: 'red', label: 'Negative' },
  { from: 30, to: 70, cls: 'amber', label: 'Neutral' },
  { from: 70, to: 100, cls: 'green', label: 'Positive' },
] as const

const Y_TICKS = [0, 30, 70, 100]
const M = { top: 12, right: 84, bottom: 28, left: 44 }
const GROW_MS = 600

const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2)

/** 0→1 over GROW_MS whenever exactly one point is added; 1 otherwise (seek, restart). */
function useGrowth(n: number) {
  const [f, setF] = useState(1)
  const prev = useRef(n)
  useLayoutEffect(() => {
    const grew = n === prev.current + 1
    prev.current = n
    if (!grew) {
      setF(1)
      return
    }
    setF(0)
    const t0 = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const x = Math.min(1, (now - t0) / GROW_MS)
      setF(ease(x))
      if (x < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [n])
  return f
}

type Props = {
  points?: ChartPoint[]
  /** Current audio time; draws the vertical cursor. */
  cursor?: number | null
  callout?: DemoView['callout']
  duration: number
  focus?: boolean
}

export function SentimentChart({ points = [], cursor = null, callout = null, duration, focus }: Props) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>()
  const w = Math.max(0, width - M.left - M.right)
  const h = Math.max(0, height - M.top - M.bottom)
  const x = (t: number) => M.left + (Math.min(t, duration) / duration) * w
  const y = (v: number) => M.top + (1 - v / 100) * h
  const f = useGrowth(points.length)
  const xTicks = Array.from({ length: Math.floor(duration / 10) + 1 }, (_, i) => i * 10)

  const path = (key: 'text' | 'eva') => {
    if (points.length < 2) return ''
    const pts = points.map((p) => [x(p.t), y(p[key])])
    const [ax, ay] = pts[pts.length - 2]
    const [bx, by] = pts[pts.length - 1]
    pts[pts.length - 1] = [ax + (bx - ax) * f, ay + (by - ay) * f]
    return pts.map((p) => p.join(',')).join(' ')
  }
  const last = points[points.length - 1]

  return (
    <Panel
      title="Customer sentiment over time"
      step={3}
      className="panel--chart"
      focus={focus}
      aside={
        <div className="legend">
          {SERIES.map((sr) => (
            <span key={sr.key} className="legend__item">
              <i className={`legend__line legend__line--${sr.key}`} />
              {sr.label}
            </span>
          ))}
        </div>
      }
    >
      <div className="chart" ref={ref}>
        {width > 0 && height > 0 && (
          <svg width={width} height={height} role="img" aria-label={`Customer sentiment from 0 to 100 percent over ${duration} seconds`}>
            {ZONES.map((z) => (
              <g key={z.cls}>
                <rect className={`zone zone--${z.cls}`} x={M.left} y={y(z.to)} width={w} height={y(z.from) - y(z.to)} />
                <text className={`zone-label zone-label--${z.cls}`} x={M.left + w + 10} y={(y(z.from) + y(z.to)) / 2} dominantBaseline="middle">
                  {z.label}
                </text>
              </g>
            ))}

            {xTicks.map((t) => (
              <g key={`x${t}`}>
                <line className="grid" x1={x(t)} x2={x(t)} y1={M.top} y2={M.top + h} />
                <text className="tick" x={x(t)} y={M.top + h + 19} textAnchor="middle">{t}s</text>
              </g>
            ))}
            {Y_TICKS.map((v) => (
              <g key={`y${v}`}>
                {v > 0 && v < 100 && <line className="threshold" x1={M.left} x2={M.left + w} y1={y(v)} y2={y(v)} />}
                <text className="tick" x={M.left - 8} y={y(v)} textAnchor="end" dominantBaseline="middle">{v}%</text>
              </g>
            ))}
            <line className="axis" x1={M.left} x2={M.left + w} y1={M.top + h} y2={M.top + h} />

            {cursor !== null && cursor > 0 && (
              <line className="cursor" x1={x(cursor)} x2={x(cursor)} y1={M.top} y2={M.top + h} />
            )}

            {callout && (
              <line className="callout-bracket" x1={x(callout.t) + 9} x2={x(callout.t) + 9} y1={y(callout.eva)} y2={y(callout.text)} style={{ opacity: f }} />
            )}

            {SERIES.map((sr) => (
              <g key={sr.key} className={`series ${sr.cls}`}>
                {sr.key === 'eva' && points.length > 1 && <polyline className="series__halo" points={path(sr.key)} />}
                {points.length > 1 && <polyline className="series__line" points={path(sr.key)} />}
                {points.map((p, i) => (
                  <circle
                    key={p.id}
                    className="series__dot"
                    cx={x(p.t)}
                    cy={y(p[sr.key])}
                    r={4.5}
                    style={{ opacity: i === points.length - 1 ? f : 1 }}
                  >
                    <title>{`${sr.label}: ${p[sr.key]}% at ${p.t}s`}</title>
                  </circle>
                ))}
              </g>
            ))}

            {last && (
              <text className="series__value" x={x(last.t) + 9} y={y(last.eva) - 9} textAnchor="start" style={{ opacity: f }}>
                {last.eva}%
              </text>
            )}
          </svg>
        )}
        {callout && width > 0 && (
          <div
            className="chart__callout"
            style={{
              left: x(callout.t) + 18,
              top: (y(callout.eva) + y(callout.text)) / 2,
              maxWidth: Math.max(120, width - x(callout.t) - 22),
              opacity: f,
            }}
          >
            {callout.label.split(' · ').map((part) => <span key={part}>{part}</span>)}
          </div>
        )}
        {points.length === 0 && (cursor === null || cursor <= 0) && (
          <div className="chart__empty" style={{ left: M.left, right: M.right, top: M.top, bottom: M.bottom }}>
            <EmptyState>Sentiment is plotted after each customer turn.</EmptyState>
          </div>
        )}
      </div>
    </Panel>
  )
}
