import { useRef, useState, type CSSProperties, type DragEvent } from 'react'
import { ACCEPT_ATTR, formatTime, type CallAudio } from '../hooks/useCallAudio'
import { Panel } from './Panel'
import { CloseIcon, FileAudioIcon, PauseIcon, PlayIcon, RestartIcon, UploadIcon } from './Icons'

type Props = {
  audio: CallAudio
  /** Wrapped by the demo controller so the story stays in sync. */
  onToggle: () => void
  onRestart: () => void
  onSeek: (t: number) => void
  ready: boolean
}

export function CallRecording({ audio, onToggle, onRestart, onSeek, ready }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const pick = () => inputRef.current?.click()
  const onFiles = (files: FileList | null) => {
    const f = files?.[0]
    if (f) audio.load(f)
  }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    onFiles(e.dataTransfer.files)
  }
  const onDragOver = (e: DragEvent) => {
    e.preventDefault()
    if (!dragging) setDragging(true)
  }

  const { file, duration, currentTime } = audio
  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0
  const ext = file?.name.split('.').pop()?.toUpperCase()

  return (
    <Panel title="Call recording" step={1} className="panel--recording">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        hidden
        onChange={(e) => {
          onFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {!file ? (
        <div
          className={`dropzone ${dragging ? 'dropzone--over' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={pick}
          role="button"
          tabIndex={-1}
        >
          <span className="dropzone__icon"><UploadIcon /></span>
          <div className="dropzone__text">
            <strong>Drop the call recording here</strong>
            <span>.mp3 or .mp4 · audio only</span>
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={(e) => {
              e.stopPropagation()
              pick()
            }}
          >
            Choose file
          </button>
        </div>
      ) : (
        <div className="player" onDragOver={onDragOver} onDrop={onDrop}>
          <div className="player__file">
            <span className="player__file-icon"><FileAudioIcon /></span>
            <div className="player__meta">
              <strong title={file.name}>{file.name}</strong>
              <span>
                {ext} · {duration > 0 ? formatTime(duration) : 'Reading duration…'}
              </span>
            </div>
            <button type="button" className="btn btn--text" onClick={pick}>Replace</button>
            <button type="button" className="icon-btn" onClick={audio.clear} aria-label="Remove file">
              <CloseIcon />
            </button>
          </div>

          <div className="player__controls">
            <button
              type="button"
              className="round-btn round-btn--primary"
              onClick={onToggle}
              disabled={!ready}
              aria-label={audio.isPlaying ? 'Pause' : 'Play'}
            >
              {audio.isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
            </button>
            <div className="player__track">
              <input
                type="range"
                className="progress"
                min={0}
                max={duration || 1}
                step={0.01}
                value={Math.min(currentTime, duration || 1)}
                onChange={(e) => onSeek(Number(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key.toLowerCase() === 'r') e.preventDefault()
                }}
                style={{ '--pct': `${pct}%` } as CSSProperties}
                aria-label="Playback position"
                tabIndex={-1}
              />
              <div className="player__times">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            <button type="button" className="round-btn" onClick={onRestart} disabled={!ready} aria-label="Restart">
              <RestartIcon />
            </button>
          </div>
        </div>
      )}

      {audio.error && <p className="form-error" role="alert">{audio.error}</p>}
    </Panel>
  )
}
