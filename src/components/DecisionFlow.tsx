import { useEffect, useState } from 'react'
import { CONTEXT_INPUTS, FLOW_LABELS, type FlowNodeId, type NodeState } from '../story'
import { CloseIcon } from './Icons'

type States = Partial<Record<FlowNodeId, NodeState>>
type Labels = Partial<Record<FlowNodeId, string>>

function Box({ id, states, labels, variant = '' }: { id: FlowNodeId; states: States; labels: Labels; variant?: string }) {
  const state = states[id] ?? 'idle'
  return (
    <div className={`flow-box flow-box--${state} ${variant}`} data-node={id}>
      {labels[id] ?? FLOW_LABELS[id]}
    </div>
  )
}

const Arrow = () => <div className="flow-arrow" aria-hidden="true" />

/** Rules text with GREEN / AMBER / RED in their status colours; one line can be highlighted. */
function RulesText({ text, highlight }: { text: string; highlight?: string }) {
  return (
    <pre className="rules__text">
      {text.split('\n').map((line, n) => (
        <span key={n} className={`rules__line ${highlight && line.startsWith(highlight) ? 'rules__line--hl' : ''}`}>
          {line.split(/\b(GREEN|AMBER|RED)\b/).map((p, i) =>
            i % 2 === 1 ? <span key={i} className={`rules__kw rules__kw--${p.toLowerCase()}`}>{p}</span> : p,
          )}
        </span>
      ))}
    </pre>
  )
}

type Props = {
  states?: States
  labels?: Labels
  rules?: string
  /** Keep the rules panel open (guardrail and next-best-action checks). */
  rulesForced?: boolean
  /** Rules line to highlight, by its first word (e.g. "GREEN"). */
  ruleHighlight?: string
}

/** "How EVA decides": data-flow diagram; boxes light up through `states`. */
export function DecisionFlow({ states = {}, labels = {}, rules, rulesForced = false, ruleHighlight }: Props) {
  const [rulesOpen, setRulesOpen] = useState(false)
  const open = rulesOpen || rulesForced

  useEffect(() => {
    if (!rulesOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setRulesOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [rulesOpen])

  const engineState = states.engine ?? 'idle'

  return (
    <section className="flow" aria-label="How EVA decides">
      {rules && (
        <div className={`rules ${open ? 'rules--open' : ''}`} id="decision-rules" role="region" aria-label="Decision rules" aria-hidden={!open}>
          <header className="rules__head">
            <h2>Decision rules</h2>
            <span className="muted small">Right-moment decision engine</span>
            {!rulesForced && (
              <button type="button" className="icon-btn" onClick={() => setRulesOpen(false)} aria-label="Close decision rules" tabIndex={open ? 0 : -1}>
                <CloseIcon />
              </button>
            )}
          </header>
          <RulesText text={rules} highlight={rulesForced ? ruleHighlight : undefined} />
        </div>
      )}

      <div className="flow__intro">
        <h2>How EVA decides</h2>
        <p>Voice and words are scored together, then checked against what Telenet knows about the customer.</p>
      </div>

      <div className="flow__grid">
        <Box id="audio" states={states} labels={labels} />
        <Arrow />
        <Box id="stt" states={states} labels={labels} />
        <Arrow />
        <div className="flow-stack flow-stack--pair">
          <Box id="textSentiment" states={states} labels={labels} variant="flow-box--sm" />
          <span className="flow-plus" aria-hidden="true">+</span>
          <Box id="voiceEmotion" states={states} labels={labels} variant="flow-box--sm" />
        </div>
        <Arrow />
        <Box id="score" states={states} labels={labels} variant="flow-box--score" />
        <Arrow />
        {rules ? (
          <button
            type="button"
            className={`flow-box flow-box--${engineState} flow-box--engine flow-box--button ${open ? 'flow-box--open' : ''}`}
            data-node="engine"
            onClick={() => setRulesOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="decision-rules"
            tabIndex={-1}
          >
            {FLOW_LABELS.engine}
            <span className="flow-box__hint">{rulesOpen ? 'Hide rules' : 'View rules'}</span>
          </button>
        ) : (
          <Box id="engine" states={states} labels={labels} variant="flow-box--engine" />
        )}
        <Arrow />
        <div className="flow-stack flow-stack--actions">
          <span className="flow-stack__label">Action</span>
          <Box id="liveOffer" states={states} labels={labels} variant="flow-box--sm" />
          <Box id="deferredOffer" states={states} labels={labels} variant="flow-box--sm" />
          <Box id="handover" states={states} labels={labels} variant="flow-box--sm" />
        </div>

        <div className="flow-context">
          <span className="flow-context__label">Customer context</span>
          {CONTEXT_INPUTS.map((id, i) => (
            <span key={id} className="flow-context__item">
              {i > 0 && <span className="flow-context__sep" aria-hidden="true">·</span>}
              <Box id={id} states={states} labels={labels} variant="flow-box--chip" />
            </span>
          ))}
        </div>
        <div className="flow-elbow" aria-hidden="true" />
      </div>
    </section>
  )
}
