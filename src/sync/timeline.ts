// Pure function from (scenario, audio time) to what every panel shows, including the
// decision engine. Nothing here keeps state, so play, pause, seek and restart always stay consistent.
import { isCustomer, pointAt, type CustomerSegment, type DemoCall, type Window } from '../data/demoCall'
import type { ChapterId, FlowNodeId, NodeState } from '../story'

/** Seconds per decision check; the engine runs from the decision moment while the audio plays. */
export const CHECK_S = 0.5

/** Decision engine progress: `step` is the running check, equal to `total` once decided. */
export type Walkthrough = { step: number; total: number; done: boolean }

export type Bubble = {
  id: string
  speaker: 'customer' | 'eva'
  words: string[]
  /** Number of words revealed so far. */
  shown: number
  speaking: boolean
  /** Customer turns: emotion chips, once the turn's scores are in. */
  chips: { words: string; voice: [string, number][] } | null
  isCustomer: boolean
  events: { type: string; at: number }[]
  offer: boolean
  sale: boolean
}

export type ChartPoint = { id: string; t: number; text: number; eva: number }

export type EmotionNow = {
  turn: number
  id: string
  start: number
  end: number
  /** 0–1 progress through the turn; bars grow while the customer speaks. */
  progress: number
  final: boolean
  voice: [string, number][]
  words: string
}

export type OfferView = {
  state: Window | 'assessing'
  reason: string
  textOnly: Window | null
  checking: boolean
}

export type NbaStatus = 'locked' | 'checking' | 'open' | 'sold'

export type DemoView = {
  t: number
  started: boolean
  bubbles: Bubble[]
  points: ChartPoint[]
  callout: { t: number; text: number; eva: number; label: string } | null
  /** Decision engine, from the decision moment on; null before it. */
  walk: Walkthrough | null
  emotion: EmotionNow | null
  offer: OfferView
  nba: NbaStatus
  offerSpeaking: boolean
  flow: Partial<Record<FlowNodeId, NodeState>>
  saleDone: boolean
  chapters: ChapterId[]
}

type Input = {
  data: DemoCall
  t: number
  started: boolean
  ended: boolean
}

const CONTEXT: FlowNodeId[] = ['crm', 'billing', 'network', 'tnps', 'sales', 'cases', 'nba']
const SCORE_FLASH_S = 1.5

export function computeView({ data, t, started, ended }: Input): DemoView {
  const D = data.call.decisionMomentSec
  const total = data.decisionChecks.length
  const customers = data.segments.filter(isCustomer)

  // Decision engine: one check every CHECK_S from the decision moment, in parallel with the call.
  const walk: Walkthrough | null =
    started && t >= D ? { step: Math.min(total, Math.floor((t - D) / CHECK_S)), total, done: t >= D + total * CHECK_S } : null
  const walking = !!walk && !walk.done
  const decided = !!walk?.done

  const bubbles: Bubble[] = []
  if (started) {
    for (const s of data.segments) {
      const offer = !isCustomer(s) && !!s.isOffer
      const sale = !isCustomer(s) && !!s.isSale
      if (!(s.start < t || (s.start === 0 && t >= 0))) continue
      const words = s.text.split(/\s+/)
      const span = Math.max(0.001, s.end - s.start)
      const progress = Math.min(1, Math.max(0, (t - s.start) / span))
      const shown = progress >= 1 ? words.length : Math.max(1, Math.ceil(progress * words.length))
      bubbles.push({
        id: s.id,
        speaker: isCustomer(s) ? 'customer' : 'eva',
        words,
        shown,
        speaking: t < s.end,
        chips: isCustomer(s) && t >= pointAt(s) ? { words: s.textEmotion, voice: s.voiceEmotions } : null,
        isCustomer: isCustomer(s),
        events: isCustomer(s) ? s.events.filter((e) => e.at <= t) : [],
        offer: offer && decided,
        sale: sale && t >= data.sale.at,
      })
    }
  }

  const finished = started ? customers.filter((s) => pointAt(s) <= t) : []
  const points = finished.map((s) => ({ id: s.id, t: pointAt(s), text: s.textScore, eva: s.evaScore }))
  const latest = finished[finished.length - 1]
  const callout = latest?.chartCallout
    ? { t: pointAt(latest), text: latest.textScore, eva: latest.evaScore, label: latest.chartCallout }
    : null

  // Emotions panel: the latest customer turn that has started.
  let emotion: EmotionNow | null = null
  if (started) {
    const idx = customers.reduce((acc, s, i) => (s.start <= t ? i : acc), -1)
    if (idx >= 0) {
      const s = customers[idx]
      const progress = Math.min(1, Math.max(0, (t - s.start) / Math.max(0.001, pointAt(s) - s.start)))
      emotion = {
        turn: idx + 1,
        id: s.id,
        start: s.start,
        end: s.end,
        progress,
        final: t >= pointAt(s),
        voice: s.voiceEmotions,
        words: s.textEmotion,
      }
    }
  }

  // Offer window: while the checks run, hold the previous verdict.
  const ruling: CustomerSegment | undefined = (walking ? finished.filter((s) => pointAt(s) < D - 0.05) : finished).at(-1)
  const offer: OfferView = ruling
    ? { state: ruling.windowEva, reason: ruling.log, textOnly: ruling.windowTextOnly, checking: walking }
    : { state: 'assessing', reason: '', textOnly: null, checking: walking }

  const offerSeg = data.segments.find((s) => !isCustomer(s) && s.isOffer)
  const saleDone = decided && t >= data.sale.at
  const nba: NbaStatus = saleDone ? 'sold' : decided ? 'open' : walking ? 'checking' : 'locked'
  const offerSpeaking = !!offerSeg && decided && t >= offerSeg.start && t < offerSeg.end

  // Data-flow diagram
  const flow: Partial<Record<FlowNodeId, NodeState>> = {}
  if (started) {
    const live = ended ? 'done' : 'active'
    flow.audio = live
    flow.stt = live
    const inTurn = customers.some((s) => s.start <= t && t < s.end)
    const anyDone = finished.length > 0
    flow.textSentiment = flow.voiceEmotion = inTurn ? 'active' : anyDone ? 'done' : 'idle'
    const scoring = finished.some((s) => t - pointAt(s) < SCORE_FLASH_S)
    flow.score = scoring ? 'active' : anyDone ? 'done' : 'idle'
    flow.engine = walking || scoring ? 'active' : anyDone ? 'done' : 'idle'
    for (const id of CONTEXT) flow[id] = walking ? 'active' : decided ? 'done' : 'idle'
    if (decided) flow.liveOffer = saleDone ? 'done' : 'active'
  }

  let chapters: ChapterId[]
  if (!started) chapters = [1]
  else if (walking) chapters = [4, 5]
  else if (ended || decided) chapters = [6]
  else if (customers.some((s) => s.start <= t && t < s.end)) chapters = [3]
  else chapters = [2]

  return { t, started, bubbles, points, callout, walk, emotion, offer, nba, offerSpeaking, flow, saleDone, chapters }
}
