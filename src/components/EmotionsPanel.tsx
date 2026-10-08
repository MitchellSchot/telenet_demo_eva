import type { EmotionNow } from '../sync/timeline'
import { formatTime } from '../hooks/useCallAudio'
import { Panel } from './Panel'

type Props = {
  /** The closed list of emotions the voice model can report. */
  list: string[]
  current?: EmotionNow | null
  focus?: boolean
}

export function EmotionsPanel({ list, current = null, focus }: Props) {
  const value = (name: string) => {
    const hit = current?.voice.find(([label]) => label === name)
    return hit ? Math.round(hit[1] * current!.progress) : 0
  }
  const half = Math.ceil(list.length / 2)
  const cols = [list.slice(0, half), list.slice(half)]

  return (
    <Panel
      title="Emotions detected"
      className="panel--emotions"
      focus={focus}
      aside={
        <span className="muted">
          {current
            ? `Turn ${current.turn} · ${formatTime(current.start)}–${formatTime(current.end)} · ${current.final ? 'final' : 'listening…'}`
            : 'Waiting for the customer'}
        </span>
      }
    >
      <div className={`emo ${current ? '' : 'emo--idle'}`}>
        <div className="emo__voice">
          <span className="emo__label">Voice <span className="emo__hint">confidence</span></span>
          <div className="emo__cols">
            {cols.map((col, i) => (
              <ul key={i} className="emo__bars">
                {col.map((name) => {
                  const v = value(name)
                  return (
                    <li key={name} className={v > 0 ? 'emo__bar emo__bar--on' : 'emo__bar'}>
                      <span className="emo__name">{name}</span>
                      <span className="emo__track"><span className="emo__fill" style={{ width: `${v}%` }} /></span>
                      <span className="emo__pct">{v > 0 ? `${v}%` : ''}</span>
                    </li>
                  )
                })}
              </ul>
            ))}
          </div>
        </div>
        <div className="emo__words">
          <span className="emo__label">Words</span>
          <strong className={current?.final ? 'emo__words-value emo__words-value--on' : 'emo__words-value'}>
            {current?.final ? current.words : current ? 'Listening…' : '–'}
          </strong>
          <span className="emo__hint">text-based emotion, for comparison</span>
        </div>
      </div>
    </Panel>
  )
}
