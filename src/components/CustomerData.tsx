import type { ReactNode } from 'react'
import type { CustomerDataRow } from '../data/demoCall'
import { Panel } from './Panel'
import { BillingIcon, CaseIcon, CrmIcon, NetworkIcon, NpsIcon, SalesIcon } from './Icons'

type Group = { source: string; rows: CustomerDataRow[] }

const SOURCE_ICONS: Record<string, ReactNode> = {
  CRM: <CrmIcon />,
  Billing: <BillingIcon />,
  'Network usage': <NetworkIcon />,
  tNPS: <NpsIcon />,
  'Sales history': <SalesIcon />,
  'Case history': <CaseIcon />,
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

type Props = {
  customer?: string
  groups?: Group[]
  /** Highlight rows marked `key` (used at the decision moment). */
  highlightKey?: boolean
  focus?: boolean
}

export function CustomerData({ customer, groups = [], highlightKey = false, focus }: Props) {
  return (
    <Panel
      title="Customer data"
      step={4}
      className="panel--customer"
      bodyClassName="scroll"
      focus={focus}
      aside={groups.length > 0 && <span className="muted">{groups.length} Telenet systems</span>}
    >
      {customer && (
        <div className="profile">
          <span className="profile__avatar" aria-hidden="true">{initials(customer)}</span>
          <div className="profile__text">
            <strong>{customer}</strong>
            <span>Telenet customer since 2014</span>
          </div>
        </div>
      )}

      <div className={`sources ${highlightKey ? 'sources--highlight' : ''}`}>
        {groups.map((g) => (
          <section key={g.source} className="source">
            <header className="source__head">
              <span className="source__badge" aria-hidden="true">{SOURCE_ICONS[g.source]}</span>
              <span className="source__name">{g.source}</span>
              <span className="source__live" title="Connected" />
            </header>
            <dl className="source__rows">
              {g.rows.map((r) => (
                <div key={r.field} className={`row ${r.key ? 'row--key' : ''}`}>
                  <dt>{r.field}</dt>
                  <dd>{r.value}</dd>
                  <dd className="row__used">{r.usedFor}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Panel>
  )
}
