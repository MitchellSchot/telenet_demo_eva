import type { DemoCall } from '../data/demoCall'
import { CheckIcon, CloseIcon, RestartIcon } from './Icons'

/** End-of-call comparison, with a restart button. */
export function Outcome({ outcome, onRestart }: { outcome: DemoCall['outcome']; onRestart: () => void }) {
  return (
    <div className="outcome" role="dialog" aria-label="Call outcome">
      <div className="outcome__card">
        <h2>Call outcome</h2>
        <p className="outcome__row outcome__row--without">
          <span className="outcome__icon"><CloseIcon size={14} /></span>
          {outcome.withoutEva}
        </p>
        <p className="outcome__row outcome__row--with">
          <span className="outcome__icon"><CheckIcon size={14} /></span>
          {outcome.withEva}
        </p>
        <button type="button" className="btn btn--primary btn--icon" onClick={onRestart} tabIndex={-1}>
          <RestartIcon />
          Restart demo
        </button>
      </div>
    </div>
  )
}
