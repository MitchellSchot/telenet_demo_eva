import { useRef, useState } from 'react'
import { isCustomer, type DemoCall } from '../data/demoCall'
import { downloadJson, parseScenario, setCall, setEventTime, setTime, warnings } from '../sync/calibrate'
import { CloseIcon } from './Icons'

type Props = {
  draft: DemoCall
  onDraft: (d: DemoCall) => void
  /** Next segment that M stamps. */
  stampIndex: number
  onStampIndex: (i: number) => void
  time: number
  dirty: boolean
  onApply: () => void
  onImport: (d: DemoCall) => void
  onClose: () => void
}

const preview = (text: string) => {
  const words = text.split(/\s+/)
  return words.slice(0, 6).join(' ') + (words.length > 6 ? '…' : '')
}

function Num({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <input
      type="number"
      className="cal__num"
      step={0.1}
      min={0}
      value={value}
      aria-label={label}
      onChange={(e) => {
        const n = e.target.valueAsNumber
        if (Number.isFinite(n)) onChange(n)
      }}
    />
  )
}

/** Timing calibration (key T): stamp segment starts with M while the audio plays. */
export function Calibration({ draft, onDraft, stampIndex, onStampIndex, time, dirty, onApply, onImport, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const issues = warnings(draft)
  const n = draft.segments.length

  const importFile = async (file: File | undefined) => {
    if (!file) return
    try {
      onImport(parseScenario(await file.text()))
      setMessage(`Loaded ${file.name} and applied it.`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not read this file.')
    }
  }

  return (
    <aside className="cal" aria-label="Timing calibration">
      <header className="cal__head">
        <div>
          <h2>Timing calibration</h2>
          <p className="muted small">
            Press <kbd>M</kbd> while playing to stamp the start of{' '}
            <strong>{stampIndex < n ? draft.segments[stampIndex].id : `the end of ${draft.segments[n - 1].id}`}</strong>.{' '}
            <kbd>T</kbd> closes.
          </p>
        </div>
        <span className="cal__time">{time.toFixed(1)} s</span>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close calibration"><CloseIcon /></button>
      </header>

      <div className="cal__call">
        <label>Decision moment <Num label="Decision moment" value={draft.call.decisionMomentSec} onChange={(v) => onDraft(setCall(draft, 'decisionMomentSec', v))} /> s</label>
        <button type="button" className="btn btn--ghost" onClick={() => onDraft(setCall(draft, 'decisionMomentSec', time))}>
          Set decision moment here
        </button>
        <label>Duration <Num label="Duration" value={draft.call.durationSec} onChange={(v) => onDraft(setCall(draft, 'durationSec', v))} /> s</label>
        <span className="muted small">Sale at {draft.sale.at} s (follows the sale segment)</span>
      </div>

      <div className="cal__table scroll">
        <table>
          <thead>
            <tr><th>ID</th><th>Speaker</th><th>Start</th><th>End</th><th>Text</th><th>Events</th></tr>
          </thead>
          <tbody>
            {draft.segments.map((s, i) => (
              <tr key={s.id} className={i === stampIndex ? 'cal__row--next' : ''} onClick={() => onStampIndex(i)}>
                <td><strong>{s.id}</strong></td>
                <td>{s.speaker}</td>
                <td><Num label={`${s.id} start`} value={s.start} onChange={(v) => onDraft(setTime(draft, i, 'start', v))} /></td>
                <td><Num label={`${s.id} end`} value={s.end} onChange={(v) => onDraft(setTime(draft, i, 'end', v))} /></td>
                <td className="cal__text" title={s.text}>{preview(s.text)}</td>
                <td>
                  {isCustomer(s) &&
                    s.events.map((e, k) => (
                      <label key={k} className="cal__event">
                        {e.type} <Num label={`${s.id} ${e.type}`} value={e.at} onChange={(v) => onDraft(setEventTime(draft, i, k, v))} />
                      </label>
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {issues.length > 0 && (
        <ul className="cal__issues">
          {issues.map((w) => <li key={w}>{w}</li>)}
        </ul>
      )}
      {message && <p className="cal__msg">{message}</p>}

      <footer className="cal__foot">
        <button type="button" className="btn btn--primary" onClick={onApply} disabled={!dirty}>Apply</button>
        <button type="button" className="btn btn--ghost" onClick={() => downloadJson(draft)}>Export JSON</button>
        <button type="button" className="btn btn--ghost" onClick={() => fileRef.current?.click()}>Import JSON</button>
        <button type="button" className="btn btn--text" onClick={() => onStampIndex(0)}>Restart stamping</button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            importFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <span className="muted small">{dirty ? 'Unapplied changes' : 'In sync with the demo'}</span>
      </footer>
    </aside>
  )
}
