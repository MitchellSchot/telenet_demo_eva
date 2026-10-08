import { useEffect, useRef, type ReactNode } from 'react'
import type { Bubble } from '../sync/timeline'
import { formatTime } from '../hooks/useCallAudio'
import { EmptyState, Panel } from './Panel'
import { EmotionChips } from './EmotionChips'

type Props = {
  bubbles?: Bubble[]
  /** Shown instead of the empty state before the call starts (processing, ready). */
  status?: ReactNode
  focus?: boolean
}

export function LiveTranscript({ bubbles = [], status, focus }: Props) {
  const endRef = useRef<HTMLDivElement>(null)
  const chipCount = bubbles.filter((b) => b.chips).length
  const eventCount = bubbles.reduce((n, b) => n + b.events.length, 0)

  // Keep the newest bubble in view. Bubbles reserve their full size on arrival,
  // so this only needs to run when a bubble or a chip row appears.
  useEffect(() => {
    const box = endRef.current?.closest('.scroll')
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' })
  }, [bubbles.length, chipCount, eventCount])

  return (
    <Panel
      title="Live transcript"
      step={2}
      className="panel--transcript"
      bodyClassName="scroll"
      focus={focus}
      aside={
        <div className="legend">
          <span className="legend__item"><i className="dot dot--customer" />Customer</span>
          <span className="legend__item"><i className="dot dot--eva" />EVA</span>
        </div>
      }
    >
      {bubbles.length === 0 ? (
        status ?? <EmptyState>The conversation appears here as the call plays.</EmptyState>
      ) : (
        <ul className="chat">
          {bubbles.map((b) => (
            <li
              key={b.id}
              className={`bubble bubble--${b.speaker} ${b.speaking ? 'bubble--speaking' : ''} ${b.offer ? 'bubble--offer' : ''}`}
            >
              <span className="bubble__head">
                <span className="bubble__who">{b.speaker === 'eva' ? 'EVA' : 'Customer'}</span>
                {b.events.map((e) => (
                  <span key={`${e.type}${e.at}`} className="tag tag--event">
                    {e.type} detected · {formatTime(e.at)}
                  </span>
                ))}
                {b.offer && (
                  <span className="tag tag--offer">
                    Offer <span className="tag__link">from Next best action <i className="panel__step">6</i></span>
                  </span>
                )}
                {b.sale && <span className="tag tag--sale">Sale ✓</span>}
              </span>
              <p>
                {b.words.map((w, i) => (
                  <span key={i} className={i < b.shown ? 'w' : 'w w--pending'}>{w} </span>
                ))}
              </p>
              {b.isCustomer && (
                <div className={`bubble__chips ${b.chips ? 'bubble__chips--on' : ''}`}>
                  {b.chips && <EmotionChips words={b.chips.words} voice={b.chips.voice} />}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <div ref={endRef} />
    </Panel>
  )
}
