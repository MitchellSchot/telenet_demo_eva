import { useCallback, useEffect, useRef, useState } from 'react'

export type LoadedFile = { name: string; type: string; size: number; url: string }

const ACCEPTED_EXT = ['.mp3', '.mp4']
const ACCEPTED_MIME = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'video/mp4']
export const ACCEPT_ATTR = '.mp3,.mp4,audio/mpeg,audio/mp4,video/mp4'

function isAccepted(file: File) {
  const name = file.name.toLowerCase()
  return ACCEPTED_EXT.some((ext) => name.endsWith(ext)) || ACCEPTED_MIME.includes(file.type)
}

/**
 * Owns the single audio element used for the call recording. An .mp4 is loaded into
 * an <audio> element, so only its audio track plays. `currentTime` is updated every
 * animation frame while playing, so later prompts can sync the story to it.
 */
export function useCallAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const urlRef = useRef<string | null>(null)
  const [file, setFile] = useState<LoadedFile | null>(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasEnded, setHasEnded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audioRef.current = audio

    const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    const onPlay = () => {
      setIsPlaying(true)
      setHasEnded(false)
    }
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      setIsPlaying(false)
      setHasEnded(true)
      setCurrentTime(audio.duration || audio.currentTime)
    }
    const onTime = () => setCurrentTime(audio.currentTime)
    const onError = () => {
      if (audio.getAttribute('src')) setError('This file could not be played. Try another .mp3 or .mp4.')
    }

    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('durationchange', onMeta)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('seeked', onTime)
    audio.addEventListener('error', onError)

    return () => {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('durationchange', onMeta)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('seeked', onTime)
      audio.removeEventListener('error', onError)
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [])

  // Smooth time updates while playing (timeupdate only fires ~4x per second).
  useEffect(() => {
    if (!isPlaying) return
    let raf = 0
    const tick = () => {
      if (audioRef.current) setCurrentTime(audioRef.current.currentTime)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isPlaying])

  const load = useCallback((next: File) => {
    const audio = audioRef.current
    if (!audio) return
    if (!isAccepted(next)) {
      setError('Please choose an .mp3 or .mp4 file.')
      return
    }
    audio.pause()
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    const url = URL.createObjectURL(next)
    urlRef.current = url
    setError(null)
    setDuration(0)
    setCurrentTime(0)
    setHasEnded(false)
    setFile({ name: next.name, type: next.type, size: next.size, url })
    audio.src = url
    audio.load()
  }, [])

  const clear = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = null
    setFile(null)
    setDuration(0)
    setCurrentTime(0)
    setHasEnded(false)
    setError(null)
  }, [])

  const play = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !audio.getAttribute('src')) return
    audio.play().catch(() => setError('Playback was blocked by the browser. Click play again.'))
  }, [])

  const pause = useCallback(() => audioRef.current?.pause(), [])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !audio.getAttribute('src')) return
    if (audio.paused) play()
    else audio.pause()
  }, [play])

  const restart = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !audio.getAttribute('src')) return
    audio.currentTime = 0
    setCurrentTime(0)
    play()
  }, [play])

  const seek = useCallback((t: number) => {
    const audio = audioRef.current
    if (!audio || !audio.getAttribute('src')) return
    audio.currentTime = t
    setCurrentTime(t)
  }, [])

  return { file, duration, currentTime, isPlaying, hasEnded, error, load, clear, play, pause, toggle, restart, seek }
}

export type CallAudio = ReturnType<typeof useCallAudio>

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
