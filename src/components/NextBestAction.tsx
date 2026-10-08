import type { Action, DemoCall } from '../data/demoCall'
import type { NbaStatus, Walkthrough } from '../sync/timeline'
import { EmptyState, Panel } from './Panel'
import { CheckIcon, LockIcon, UnlockIcon } from './Icons'

type Props = {
  top?: Action & { reasons: string[] }
  other?: Action[]
  status?: NbaStatus
  sale?: DemoCall['sale']
  /** EVA is saying the offer right now (links the card to the "Offer" bubble). */
  speaking?: boolean
  /** Decision checks, run in this panel from the decision moment. */
  checks?: DemoCall['decisionChecks']
  walk?: Walkthrough | null
}

function Propensity({ value }: { value: number }) {
  return (
    <div className="propensity" role="img" aria-label={`Propensity ${value.toFixed(2)}`}>
      <span className="propensity__track">
        <span className="propensity__fill" style={{ width: `${value * 100}%` }} />
      </span>
      <span className="propensity__value">{value.toFixed(2)}</span>
    </div>
  )
}

/** Right-moment decision engine: the checks appear one by one; compact once decided. */
function Engine({ checks, step, compact }: { checks: DemoCall['decisionChecks']; step: number; compact: boolean }) {
  return (
    <section className={`engine ${compact ? 'engine--compact' : ''}`} aria-label="Right-moment decision engine" aria-live="polite">
      <span className="engine__title">Right-moment decision engine</span>
      <ol className="engine__checks">
        {checks.map((c, i) => {
          const state = i < step ? 'done' : i === step ? 'running' : 'todo'
          return (
            <li key={c.label} className={`engine__check engine__check--${state}`}>
              <span className="engine__mark">{state === 'done' && <CheckIcon size={compact ? 10 : 13} />}</span>
              <span className="engine__text">
                <strong>{c.label}</strong>
                {!compact && <span>{c.detail}</span>}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export function NextBestAction({ top, other = [], status = 'locked', sale, speaking, checks = [], walk = null }: Props) {
  const locked = status === 'locked' || status === 'checking'
  return (
    <Panel
      title="Next best action"
      step={6}
      className={`panel--nba ${speaking ? 'panel--speaking' : ''}`}
      aside={
        top && (
          <span className={`lock-tag lock-tag--${status}`}>
            {locked ? <LockIcon size={13} /> : status === 'open' ? <UnlockIcon size={13} /> : <CheckIcon size={13} />}
            {status === 'locked'
              ? 'Locked'
              : status === 'checking'
                ? 'Checking…'
                : status === 'open'
                  ? speaking ? 'Being offered now' : 'Unlocked'
                  : 'Sold'}
          </span>
        )
      }
    >
      {!top ? (
        <div className="nba">
          <EmptyState>No action yet. EVA recommends one when the offer window opens.</EmptyState>
        </div>
      ) : status === 'sold' && sale ? (
        <div className="nba nba--sold">
          <div className="nba__banner nba__banner--sold">
            <CheckIcon size={16} />
            Sale completed ✓
          </div>
          <dl className="sale">
            <div><dt>Product</dt><dd>{sale.product}</dd></div>
            <div><dt>Status</dt><dd>{sale.status}</dd></div>
            <div><dt>Confirmation</dt><dd>{sale.confirmation}</dd></div>
            <div><dt>Channel</dt><dd>{sale.channel}</dd></div>
          </dl>
        </div>
      ) : status === 'checking' && walk ? (
        <div className="nba nba--checking">
          <Engine checks={checks} step={walk.step} compact={false} />
        </div>
      ) : (
        <div className={`nba nba--${status}`}>
          {status === 'open' && walk && <Engine checks={checks} step={walk.step} compact />}
          <div className={`nba__banner nba__banner--${status}`}>
            {locked ? <LockIcon size={15} /> : <UnlockIcon size={15} />}
            {locked ? 'Held back by EVA until the right moment' : 'Right moment: offer now'}
          </div>
          <div className="nba__card">
            <div className="nba__top">
              <span className="nba__rank">1</span>
              <strong className="nba__name">{top.name}</strong>
              <span className="nba__type">{top.type}</span>
            </div>
            <Propensity value={top.propensity} />
            <ul className="nba__reasons">
              {top.reasons.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>
          {other.map((a, i) => (
            <div key={a.name} className="nba__other">
              <span className="nba__rank">{i + 2}</span>
              <span className="nba__other-name">{a.name}</span>
              <span className="nba__type">{a.type}</span>
              <Propensity value={a.propensity} />
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}
