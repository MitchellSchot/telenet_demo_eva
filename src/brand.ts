// Brand assets. The files in /public/brand are the official logos, used untouched.
// Each logo file has blank space around the artwork; `crop` is the artwork's
// bounding box in the file's own pixels, so CSS can show the logo at the right
// size without editing the file (see .logo-frame in styles.css).
export type LogoAsset = {
  src: string
  alt: string
  width: number
  height: number
  crop: { x: number; y: number; w: number; h: number }
}

export const TELENET_LOGO: LogoAsset = {
  src: '/brand/telenet-logo.png',
  alt: 'Telenet',
  width: 600,
  height: 600,
  crop: { x: 30, y: 231, w: 540, h: 138 },
}

export const EVA_LOGO: LogoAsset = {
  src: '/brand/eva-logo.png',
  alt: 'EVA',
  width: 1774,
  height: 887,
  crop: { x: 209, y: 225, w: 1377, h: 486 },
}
