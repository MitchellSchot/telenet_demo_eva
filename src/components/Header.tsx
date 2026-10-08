import type { CSSProperties } from 'react'
import { EVA_LOGO, TELENET_LOGO, type LogoAsset } from '../brand'

type Props = {
  /** Temporary review mode (key P). The toggle is only visible while it is on. */
  preview: boolean
  onPreviewChange: (on: boolean) => void
  recording: boolean
  onRecordingToggle: () => void
}

function Switch({ on, onChange, children, title }: { on: boolean; onChange: (on: boolean) => void; children: string; title?: string }) {
  return (
    <button
      type="button"
      className={`preview-toggle ${on ? 'preview-toggle--on' : ''}`}
      onClick={() => onChange(!on)}
      aria-pressed={on}
      title={title}
      tabIndex={-1}
    >
      <span className="preview-toggle__switch" aria-hidden="true" />
      {children}
    </button>
  )
}

/** Shows only the artwork of a logo file, scaled to the frame height (--logo-h), undistorted. */
function Logo({ logo, className }: { logo: LogoAsset; className: string }) {
  const { crop } = logo
  const style = {
    '--logo-ar': crop.w / crop.h,
    '--logo-iw': logo.width / crop.h,
    '--logo-ih': logo.height / crop.h,
    '--logo-x': crop.x / crop.h,
    '--logo-y': crop.y / crop.h,
  } as CSSProperties
  return (
    <span className={`logo-frame ${className}`} style={style}>
      <img src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} draggable={false} />
    </span>
  )
}

export function Header({ preview, onPreviewChange, recording, onRecordingToggle }: Props) {
  return (
    <header className="app-header">
      <div className="app-header__logo">
        <Logo logo={TELENET_LOGO} className="logo-frame--telenet" />
      </div>
      <div className="app-header__divider" aria-hidden="true" />
      <div className="app-header__titles">
        <h1>
          <Logo logo={EVA_LOGO} className="logo-frame--eva" />: the right moment to sell
        </h1>
      </div>
      <div className="app-header__tools">
        {!recording && (
          <>
            {preview && (
              <Switch on={preview} onChange={onPreviewChange} title="Temporary review mode (P)">Preview all</Switch>
            )}
            <button type="button" className="btn btn--ghost btn--small" onClick={onRecordingToggle} title="Recording mode (F)" tabIndex={-1}>
              Recording mode <kbd>F</kbd>
            </button>
          </>
        )}
        <div className="app-header__badge">Concept demo</div>
      </div>
    </header>
  )
}
