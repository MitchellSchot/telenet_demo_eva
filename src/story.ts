// Static structure of the guided story. Content (transcript, scores, customer data)
// lives in data/demoCall.json; this file only describes the shape of the demo.
import { demoCall } from './data/demoCall'

export type ChapterId = 1 | 2 | 3 | 4 | 5 | 6

export const CHAPTERS: { id: ChapterId; label: string }[] = [
  { id: 1, label: 'Upload' },
  { id: 2, label: 'Listen & transcribe' },
  { id: 3, label: 'Read the emotion' },
  { id: 4, label: 'Know the customer' },
  { id: 5, label: 'Decide' },
  { id: 6, label: 'Act' },
]

export type NodeState = 'idle' | 'active' | 'done'

export type FlowNodeId =
  | 'audio'
  | 'stt'
  | 'textSentiment'
  | 'voiceEmotion'
  | 'score'
  | 'engine'
  | 'liveOffer'
  | 'deferredOffer'
  | 'handover'
  | 'crm'
  | 'billing'
  | 'network'
  | 'tnps'
  | 'sales'
  | 'cases'
  | 'nba'

export const FLOW_LABELS: Record<FlowNodeId, string> = {
  audio: 'Call audio',
  stt: 'Speech-to-text',
  textSentiment: 'Text sentiment',
  voiceEmotion: 'Voice emotion',
  score: 'EVA score',
  engine: 'Right-moment decision engine',
  liveOffer: 'Live offer',
  deferredOffer: 'Deferred digital offer',
  handover: 'Handover',
  crm: 'CRM',
  billing: 'Billing',
  network: 'Network usage',
  tnps: 'tNPS',
  sales: 'Sales history',
  cases: 'Case history',
  nba: 'Next-best-action engine',
}

export const CONTEXT_INPUTS: FlowNodeId[] = ['crm', 'billing', 'network', 'tnps', 'sales', 'cases', 'nba']

export type OfferState = 'assessing' | 'red' | 'amber' | 'green'

export const DEMO_DURATION_S = demoCall.call.durationSec
