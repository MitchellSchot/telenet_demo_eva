import { useCallback, useEffect, useMemo, useState } from 'react'
import { Header } from './components/Header'
import { StoryBar } from './components/StoryBar'
import { CallRecording } from './components/CallRecording'
import { LiveTranscript } from './components/LiveTranscript'
import { SentimentChart } from './components/SentimentChart'
import { EmotionsPanel } from './components/EmotionsPanel'
import { OfferWindow } from './components/OfferWindow'
import { CustomerData } from './components/CustomerData'
import { NextBestAction } from './components/NextBestAction'
import { DecisionFlow } from './components/DecisionFlow'
import { Processing } from './components/Processing'
import { Outcome } from './components/Outcome'
import { Calibration } from './components/Calibration'
import { useCallAudio } from './hooks/useCallAudio'
import { useDemo } from './hooks/useDemo'
import { demoCall, groupBySource, type DemoCall } from './data/demoCall'
import { computeView } from './sync/timeline'
import { stamp } from './sync/calibrate'

/** In recording mode, hide the mouse cursor after 2 s without movement. */
function useIdleCursor(active: boolean) {
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    if (!active) {
      setIdle(false)
      return
    }
    let id = 0
    const move = () => {
      setIdle(false)
      window.clearTimeout(id)
      id = window.setTimeout(() => setIdle(true), 2000)
    }
    move()
    window.addEventListener('mousemove', move)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('mousemove', move)
    }
  }, [active])
  return idle
}

export default function App() {
  const audio = useCallAudio()
  // The live scenario. Starts as demoCall.json; the calibration panel can replace it.
  const [scenario, setScenario] = useState<DemoCall>(demoCall)
  const [draft, setDraft] = useState<DemoCall>(demoCall)
  const [stampIndex, setStampIndex] = useState(0)
  const [calOpen, setCalOpen] = useState(false)
  // Temporary review mode (key P): show the whole scenario at once.
  const [preview, setPreview] = useState(false)
  const [recording, setRecording] = useState(false)
  const cursorHidden = useIdleCursor(recording)

  const demo = useDemo(audio)
  const { toggle, restart } = demo

  const view = computeView({
    data: scenario,
    t: preview ? scenario.call.durationSec : demo.time,
    started: preview || demo.started,
    ended: !preview && demo.ended,
  })
  const groups = useMemo(() => groupBySource(scenario.customerData), [scenario.customerData])

  // What the running decision check looks at; the audio keeps playing meanwhile.
  const walk = view.walk
  const check = walk && !walk.done ? scenario.decisionChecks[walk.step].label.toLowerCase() : ''
  const focus = {
    transcript: check.includes('problem'),
    chart: check.includes('sentiment'),
    emotions: check.includes('emotion'),
    customer: check.includes('guardrail') || check.includes('next best'),
    offer: check.includes('decision'),
  }

  const toggleRecording = useCallback(() => {
    setRecording((on) => {
      if (on) {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
        return false
      }
      document.documentElement.requestFullscreen?.().catch(() => {})
      return true
    })
  }, [])

  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) setRecording(false)
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const doStamp = useCallback(() => {
    const next = stamp(draft, stampIndex, audio.currentTime)
    setDraft(next.data)
    setStampIndex(next.index)
  }, [draft, stampIndex, audio.currentTime])

  // Keyboard: Space play/pause, R restart, P preview, T calibration, M stamp, F recording mode.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) && (t as HTMLInputElement).type !== 'range') return
      if (e.repeat) return
      const key = e.key.toLowerCase()
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        ;(document.activeElement as HTMLElement | null)?.blur?.()
        toggle()
      } else if (key === 'r') {
        e.preventDefault()
        restart()
      } else if (key === 'p') {
        setPreview((p) => !p)
      } else if (key === 't') {
        if (!recording) setCalOpen((o) => !o)
      } else if (key === 'm') {
        if (calOpen && !recording) doStamp()
      } else if (key === 'f') {
        toggleRecording()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle, restart, recording, calOpen, doStamp, toggleRecording])

  const showStatus = !preview && (demo.phase === 'processing' || (demo.ready && !demo.started))

  return (
    <div
      className={`app ${recording ? 'app--recording' : ''} ${cursorHidden ? 'app--cursor-hidden' : ''}`}
    >
      <Header
        preview={preview}
        onPreviewChange={setPreview}
        recording={recording}
        onRecordingToggle={toggleRecording}
      />
      <p className="app-quote">
        EVA knows <mark>what to offer</mark> from data, and <mark>when to offer it</mark> from emotion.
      </p>
      <StoryBar
        active={preview ? [6] : view.chapters}
        ready={demo.ready}
        isPlaying={audio.isPlaying}
        onToggle={toggle}
        onRestart={restart}
      />

      <main className="stage">
        <div className="col col--left">
          <CallRecording audio={audio} onToggle={toggle} onRestart={restart} onSeek={demo.seek} ready={demo.ready} />
          <LiveTranscript
            bubbles={view.bubbles}
            status={showStatus ? <Processing step={demo.procStep} /> : undefined}
            focus={focus.transcript}
          />
        </div>
        <div className="col col--middle">
          <SentimentChart
            points={view.points}
            cursor={preview || !view.started ? null : view.t}
            callout={view.callout}
            duration={scenario.call.durationSec}
            focus={focus.chart}
          />
          <EmotionsPanel list={scenario.emotionList} current={view.emotion} focus={focus.emotions} />
          <OfferWindow offer={view.offer} focus={focus.offer} />
        </div>
        <div className="col col--right">
          <CustomerData customer={scenario.call.customer} groups={groups} highlightKey={focus.customer} focus={focus.customer} />
          <NextBestAction
            top={scenario.nextBestAction.top}
            other={scenario.nextBestAction.other}
            status={view.nba}
            sale={scenario.sale}
            speaking={view.offerSpeaking}
            checks={scenario.decisionChecks}
            walk={walk}
          />
        </div>
        {demo.ended && !preview && <Outcome outcome={scenario.outcome} onRestart={restart} />}
      </main>

      <DecisionFlow
        states={view.flow}
        labels={view.saleDone ? { liveOffer: 'Live offer → Sale completed' } : {}}
        rules={scenario.rules}
        rulesForced={focus.customer}
        ruleHighlight="GREEN"
      />

      {calOpen && !recording && (
        <Calibration
          draft={draft}
          onDraft={setDraft}
          stampIndex={stampIndex}
          onStampIndex={setStampIndex}
          time={audio.currentTime}
          dirty={draft !== scenario}
          onApply={() => setScenario(draft)}
          onImport={(d) => {
            setDraft(d)
            setScenario(d)
          }}
          onClose={() => setCalOpen(false)}
        />
      )}

      <footer className="app-footer">
        Concept demo with fictional customer data and simulated AI processing. Student project (Vlerick Business
        School), not an official Telenet product.
      </footer>
    </div>
  )
}
