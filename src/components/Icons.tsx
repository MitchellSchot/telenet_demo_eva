type P = { size?: number }

export const PlayIcon = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" fill="currentColor" /></svg>
)
export const PauseIcon = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4.2" height="14" rx="1.4" fill="currentColor" /><rect x="13.8" y="5" width="4.2" height="14" rx="1.4" fill="currentColor" /></svg>
)
export const RestartIcon = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" /><path d="M3.5 4v4.5H8" /></svg>
)
export const UploadIcon = ({ size = 22 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 15V4" /><path d="m7 8.5 5-5 5 5" /><path d="M4 15v3a2.5 2.5 0 0 0 2.5 2.5h11A2.5 2.5 0 0 0 20 18v-3" /></svg>
)
export const FileAudioIcon = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5" /><path d="M9 17v-4l5-1.2v4" /><circle cx="8" cy="17" r="1.2" /><circle cx="13" cy="16" r="1.2" /></svg>
)
export const CloseIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
)
export const LockIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></svg>
)

/* Source-system badges for the customer data dashboard */
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
export const CrmIcon = ({ size = 14 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S} aria-hidden="true"><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
)
export const BillingIcon = ({ size = 14 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S} aria-hidden="true"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z" /><path d="M9.5 8h5M9.5 12h5" /></svg>
)
export const NetworkIcon = ({ size = 14 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S} aria-hidden="true"><path d="M5 19v-3M10 19v-7M15 19V8M20 19V4" /></svg>
)
export const NpsIcon = ({ size = 14 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S} aria-hidden="true"><path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6Z" /></svg>
)
export const SalesIcon = ({ size = 14 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S} aria-hidden="true"><path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9Z" /><circle cx="8.5" cy="8.5" r="1.3" /></svg>
)
export const CaseIcon = ({ size = 14 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S} aria-hidden="true"><path d="M4 5h16v11H9l-5 4Z" /><path d="M8.5 9.5h7M8.5 12.5h4" /></svg>
)
export const UnlockIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.2" /><path d="M8 10.5V7.5a4 4 0 0 1 7.6-1.7" /></svg>
)
export const CheckIcon = ({ size = 14 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
)
