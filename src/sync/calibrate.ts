// Helpers for the timing calibration panel (key T). They never mutate their input.
import { isCustomer, type DemoCall } from '../data/demoCall'

const r1 = (t: number) => Math.round(t * 10) / 10
export const clone = (d: DemoCall): DemoCall => JSON.parse(JSON.stringify(d))

/** Keep sale.at on the start of the sale segment. */
function syncSale(d: DemoCall) {
  const sale = d.segments.find((s) => !isCustomer(s) && s.isSale)
  if (sale) d.sale.at = sale.start
}

/**
 * Press M: stamp `t` as the start of segment `index` (and the end of the one before).
 * Once every start is stamped, M sets the end of the last segment.
 */
export function stamp(data: DemoCall, index: number, t: number): { data: DemoCall; index: number } {
  const d = clone(data)
  const n = d.segments.length
  const at = r1(t)
  if (index < n) {
    d.segments[index].start = at
    if (index > 0) d.segments[index - 1].end = at
    syncSale(d)
    return { data: d, index: index + 1 }
  }
  d.segments[n - 1].end = at
  d.call.durationSec = Math.max(d.call.durationSec, Math.ceil(at))
  return { data: d, index }
}

export function setTime(data: DemoCall, i: number, key: 'start' | 'end', t: number) {
  const d = clone(data)
  d.segments[i][key] = r1(t)
  syncSale(d)
  return d
}

export function setEventTime(data: DemoCall, i: number, e: number, t: number) {
  const d = clone(data)
  const s = d.segments[i]
  if (isCustomer(s)) s.events[e].at = r1(t)
  return d
}

export function setCall(data: DemoCall, key: 'decisionMomentSec' | 'durationSec', t: number) {
  const d = clone(data)
  d.call[key] = r1(t)
  return d
}

/** Problems worth fixing before recording. */
export function warnings(d: DemoCall): string[] {
  const out: string[] = []
  d.segments.forEach((s, i) => {
    if (s.end <= s.start) out.push(`${s.id}: end must be after start.`)
    const next = d.segments[i + 1]
    if (next && next.start < s.end - 0.05) out.push(`${s.id} overlaps ${next.id}.`)
    if (isCustomer(s)) s.events.forEach((e) => (e.at < s.start || e.at > s.end) && out.push(`${s.id}: ${e.type} at ${e.at}s is outside the turn.`))
  })
  const offer = d.segments.find((s) => !isCustomer(s) && s.isOffer)
  if (offer && offer.start < d.call.decisionMomentSec)
    out.push(`Decision moment (${d.call.decisionMomentSec}s) is after the offer starts (${offer.id} at ${offer.start}s).`)
  return out
}

export function downloadJson(d: DemoCall) {
  const blob = new Blob([JSON.stringify(d, null, 2) + '\n'], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'demoCall.json'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function parseScenario(text: string): DemoCall {
  const d = JSON.parse(text)
  if (!d || !Array.isArray(d.segments) || !d.call || !Array.isArray(d.decisionChecks) || !d.sale || !d.nextBestAction)
    throw new Error('This file does not look like a demoCall.json.')
  return d as DemoCall
}
