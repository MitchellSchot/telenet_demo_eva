import { CHAPTERS, type ChapterId } from '../story'
import { PauseIcon, PlayIcon, RestartIcon } from './Icons'

type Props = {
  active: ChapterId[]
  ready: boolean
  isPlaying: boolean
  onToggle: () => void
  onRestart: () => void
}

export function StoryBar({ active, ready, isPlaying, onToggle, onRestart }: Props) {
  const current = Math.max(...active)
  return (
    <nav className="story" aria-label="Story chapters">
      <ol className="story__chapters">
        {CHAPTERS.map((c) => {
          const state = active.includes(c.id) ? 'active' : c.id < current ? 'done' : 'todo'
          return (
            <li key={c.id} className={`chapter chapter--${state}`} aria-current={state === 'active' ? 'step' : undefined}>
              <span className="chapter__num">{c.id}</span>
              <span className="chapter__label">{c.label}</span>
            </li>
          )
        })}
      </ol>
      <div className="story__controls">
        <button
          type="button"
          className="btn btn--primary btn--icon"
          onClick={onToggle}
          disabled={!ready}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>
        <button type="button" className="btn btn--ghost btn--icon" onClick={onRestart} disabled={!ready} aria-label="Restart">
          <RestartIcon />
          <span>Restart</span>
        </button>
        <span className="story__keys" aria-hidden="true">
          <kbd>Space</kbd> play/pause · <kbd>R</kbd> restart
        </span>
      </div>
    </nav>
  )
}
