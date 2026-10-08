// Typed access to the scenario. All texts, scores and timings live in demoCall.json;
// edit that file, not this one. This module only adds types and derived views.
import raw from './demoCall.json'

export type Window = 'red' | 'amber' | 'green'

export type EvaSegment = {
  id: string
  speaker: 'EVA'
  start: number
  end: number
  text: string
  isOffer?: boolean
  isSale?: boolean
}

export type CustomerSegment = {
  id: string
  speaker: 'Customer'
  start: number
  end: number
  /** When this turn's scores land: graph points, emotion chips/bars, offer window, callout. Defaults to `end`. */
  graphPointSec?: number
  text: string
  textEmotion: string
  voiceEmotions: [string, number][]
  events: { type: string; at: number }[]
  textScore: number
  voiceScore: number
  evaScore: number
  windowTextOnly: Window
  windowEva: Window
  problemSolved?: boolean
  /** Optional chart callout shown while this turn is the latest point. */
  chartCallout?: string
  log: string
}

export type Segment = EvaSegment | CustomerSegment

export type CustomerDataRow = { source: string; field: string; value: string; usedFor: string; key?: boolean }

export type Action = { name: string; propensity: number; type: string; reasons?: string[] }

export type DemoCall = {
  call: { customer: string; durationSec: number; decisionMomentSec: number }
  segments: Segment[]
  emotionList: string[]
  customerData: CustomerDataRow[]
  nextBestAction: { top: Action & { reasons: string[] }; other: Action[] }
  sale: { at: number; product: string; status: string; confirmation: string; channel: string }
  outcome: { withoutEva: string; withEva: string }
  decisionChecks: { label: string; detail: string }[]
  rules: string
}

export const demoCall = raw as DemoCall

export const isCustomer = (s: Segment): s is CustomerSegment => s.speaker === 'Customer'

/** When a customer turn's scores update the dashboard. */
export const pointAt = (s: CustomerSegment) => s.graphPointSec ?? s.end

export const customerSegments = demoCall.segments.filter(isCustomer)

/** Customer data grouped by source system, in the order the sources first appear. */
export const groupBySource = (rows: CustomerDataRow[]) =>
  rows.reduce<{ source: string; rows: CustomerDataRow[] }[]>((groups, row) => {
    const group = groups.find((g) => g.source === row.source)
    if (group) group.rows.push(row)
    else groups.push({ source: row.source, rows: [row] })
    return groups
  }, [])

export const customerDataBySource = groupBySource(demoCall.customerData)
