import { PROCESSING_STEPS } from '../hooks/useDemo'
import { CheckIcon } from './Icons'

/** Simulated analysis after upload, then "Ready, press Play". Shown in the empty transcript. */
export function Processing({ step }: { step: number }) {
  const done = step >= PROCESSING_STEPS.length
  return (
    <div className="processing">
      <span className="processing__label">Simulated processing (demo)</span>
      <ol className="processing__steps">
        {PROCESSING_STEPS.map((s, i) => {
          const state = i < step ? 'done' : i === step ? 'running' : 'todo'
          return (
            <li key={s} className={`processing__step processing__step--${state}`}>
              <span className="processing__mark">{state === 'done' ? <CheckIcon size={12} /> : null}</span>
              {s}
            </li>
          )
        })}
      </ol>
      <p className={`processing__ready ${done ? 'processing__ready--on' : ''}`}>
        Ready, press Play <kbd>Space</kbd>
      </p>
    </div>
  )
}
