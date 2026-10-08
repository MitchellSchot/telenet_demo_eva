export type EmotionReading = {
  /** Emotion read from the words, e.g. "Hesitation". */
  words?: string
  /** Emotions read from the voice, with confidence in %. */
  voice?: [string, number][]
  /** Paralinguistic events such as laughter, with time in seconds. */
  events?: { type: string; at: number }[]
}

/** "Words: …" (grey) and "Voice: … %" (yellow) chips for one customer turn. */
export function EmotionChips({ words, voice = [], events = [] }: EmotionReading) {
  return (
    <>
      {words && <span className="chip chip--words">Words: {words}</span>}
      {voice.map(([label, pct]) => (
        <span key={label} className="chip chip--voice">Voice: {label} {pct}%</span>
      ))}
      {events.map((e) => (
        <span key={`${e.type}${e.at}`} className="chip chip--event">{e.type} · {e.at}s</span>
      ))}
    </>
  )
}
