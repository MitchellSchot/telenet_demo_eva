import { useCallback, useEffect, useState } from 'react'
import type { CallAudio } from './useCallAudio'

export const PROCESSING_STEPS = [
  'Speech-to-text',
  'Speaker separation (customer / EVA)',
  'Text sentiment',
  'Voice emotion analysis (tone, pitch, laughter)',
  'Connecting customer data',
]
const PROCESSING_STEP_MS = 800

export type Phase = 'empty' | 'processing' | 'live'

/**
 * Drives the story around the audio element: simulated processing after upload,
 * then play/pause, restart and seek. The audio never stops by itself; the decision
 * engine is derived from the audio time in computeView.
 */
export function useDemo(audio: CallAudio) {
  const [phase, setPhase] = useState<Phase>('empty')
  const [procStep, setProcStep] = useState(0)
  const { pause, seek: audioSeek, currentTime, isPlaying, file } = audio

  // New file: run the simulated processing sequence.
  const fileUrl = file?.url
  useEffect(() => {
    if (!fileUrl) {
      setPhase('empty')
      return
    }
    setPhase('processing')
    setProcStep(0)
    let n = 0
    const id = window.setInterval(() => {
      n += 1
      setProcStep(n)
      if (n >= PROCESSING_STEPS.length) {
        window.clearInterval(id)
        setPhase('live')
      }
    }, PROCESSING_STEP_MS)
    return () => window.clearInterval(id)
  }, [fileUrl])

  const toggle = useCallback(() => {
    if (phase !== 'live') return
    audio.toggle()
  }, [phase, audio])

  const restart = useCallback(() => {
    if (!file) return
    pause()
    audioSeek(0)
  }, [file, pause, audioSeek])

  const seek = useCallback((t: number) => audioSeek(t), [audioSeek])

  const started = isPlaying || currentTime > 0
  const ended = phase === 'live' && audio.hasEnded && audio.duration > 0 && currentTime >= audio.duration - 0.25

  return {
    phase,
    procStep,
    ready: phase === 'live',
    time: currentTime,
    started,
    ended,
    toggle,
    restart,
    seek,
  }
}

export type Demo = ReturnType<typeof useDemo>
