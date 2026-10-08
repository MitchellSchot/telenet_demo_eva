import type { OfferView } from '../sync/timeline'
import { Panel } from './Panel'

const TITLE = { assessing: 'Assessing…', red: 'Closed', amber: 'Not yet', green: 'Open' } as const
const TEXT_ONLY = { red: 'Red, no offer', amber: 'Amber, no live offer', green: 'Green, offer' } as const

type Props = { offer: OfferView; focus?: boolean }

export function OfferWindow({ offer, focus }: Props) {
  const { state, checking } = offer
  const title = checking ? 'Checking…' : TITLE[state]
  const reason = checking
    ? 'EVA runs the decision checks before it says anything.'
    : offer.reason || 'EVA waits until the problem is solved and the mood is right.'

  return (
    <Panel title="Offer window" step={5} className="panel--offer" focus={focus}>
      <div className={`offer offer--${checking ? 'checking' : state}`}>
        <div className="traffic" role="img" aria-label={`Offer window: ${title}`}>
          {(['red', 'amber', 'green'] as const).map((lamp) => (
            <span key={lamp} className={`lamp lamp--${lamp} ${state === lamp ? 'lamp--on' : ''}`} />
          ))}
        </div>
        <div className="offer__text">
          <strong key={title}>{title}</strong>
          <span className="offer__reason">{reason}</span>
          <span className="offer__textonly">
            {offer.textOnly ? `Text-only bot would decide: ${TEXT_ONLY[offer.textOnly]}` : ' '}
          </span>
        </div>
      </div>
    </Panel>
  )
}
