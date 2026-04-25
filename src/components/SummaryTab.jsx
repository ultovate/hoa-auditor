import { useState } from 'react'
import { AlertCircle, Shield, DollarSign, CheckSquare } from 'lucide-react'

const MOCK_REPORT = {
  risks: {
    findings: [
      // HIGH (10) ──────────────────────────────────────────────────────────────
      { urgency: 'HIGH', category: 'Reserve Fund',      label: 'Reserve fund critically underfunded',         agent_note: 'Reserve study shows 22% funded — well below the 70% threshold. Projected shortfall of $1.2M by 2027.',                          source_document: 'ReserveStudy2024.pdf',      source_section: 'Section 4.2'   },
      { urgency: 'HIGH', category: 'Special Assessment', label: 'Unvoted special assessment proposed',         agent_note: 'Board minutes from March 2026 reference a $4,800/unit assessment for roof replacement. No member vote recorded.',             source_document: 'BoardMinutes_Mar2026.pdf',  source_section: 'Agenda Item 3' },
      { urgency: 'HIGH', category: 'Litigation',         label: 'Active lawsuit filed against association',    agent_note: 'Unit owner filed suit in February 2026 alleging failure to maintain common area. Trial date set for October 2026.',            source_document: 'LitigationDisclosure.pdf',  source_section: null            },
      { urgency: 'HIGH', category: 'Governance',         label: 'Quorum not met for last two annual meetings', agent_note: 'Minutes confirm quorum failed in 2024 and 2025. Board has been operating without valid election for two consecutive years.', source_document: 'AnnualMeeting_2025.pdf',    source_section: 'Attendance'    },
      { urgency: 'HIGH', category: 'Deferred Maintenance', label: 'Parking structure requires immediate repair', agent_note: 'Engineering report from Jan 2026 flagged Level 2 post-tension cables as compromised. Estimated repair cost $380,000.',      source_document: 'StructuralReport2026.pdf',  source_section: 'Finding 3.1'   },
      { urgency: 'HIGH', category: 'Financial',          label: 'Operating account overdrawn in Q1 2026',      agent_note: 'March 2026 bank statement shows negative balance of $14,200. Board approved emergency transfer from reserve fund.',            source_document: 'BankStatement_Mar2026.pdf', source_section: null            },
      { urgency: 'HIGH', category: 'Insurance',          label: 'No earthquake coverage in high-risk zone',    agent_note: 'Property is in USGS Zone 3. Master policy explicitly excludes seismic events. No supplemental policy on file.',             source_document: 'MasterPolicy2026.pdf',      source_section: 'Exclusions'    },
      { urgency: 'HIGH', category: 'Reserve Fund',       label: 'No board-approved reserve funding plan',      agent_note: 'Reserve study recommends 8% annual contribution increase. Board has not adopted or discussed a funding plan.',                source_document: 'ReserveStudy2024.pdf',      source_section: 'Section 7'     },
      { urgency: 'HIGH', category: 'Special Assessment', label: 'Second assessment within 12 months proposed', agent_note: 'Agenda for May 2026 meeting includes a second proposed assessment of $2,100/unit for elevator modernization.',               source_document: 'BoardAgenda_May2026.pdf',   source_section: 'Item 5'        },
      { urgency: 'HIGH', category: 'Compliance',         label: 'WUCIOA resale package never prepared',        agent_note: 'No resale disclosure package exists. Required by RCW 64.90.640(2) effective Jan 1 2026. Association is non-compliant.',     source_document: null,                        source_section: null            },
      // MEDIUM (12) ─────────────────────────────────────────────────────────────
      { urgency: 'MEDIUM', category: 'Insurance',     label: 'Master policy expires in 45 days',              agent_note: 'Current master policy expires June 15, 2026. No renewal documentation on file.',                          source_document: 'InsuranceCert.pdf',       source_section: null          },
      { urgency: 'MEDIUM', category: 'Restrictions',  label: 'Pet restrictions ambiguous in CC&Rs',           agent_note: 'Section 4.3 limits pets to "reasonable size" without defining a weight or breed threshold.',            source_document: 'CCRs_2018.pdf',           source_section: 'Section 4.3' },
      { urgency: 'MEDIUM', category: 'Restrictions',  label: 'Rental cap at 20% — currently at 18%',          agent_note: 'Two additional rental applications are pending. Approval would push rentals to 20%, triggering FHA cap.', source_document: 'RentalRegister.pdf',      source_section: null          },
      { urgency: 'MEDIUM', category: 'Governance',    label: 'Common area renovation not publicly bid',        agent_note: 'Pool deck contract awarded without competitive bid process per bylaws Section 8.2.',                    source_document: 'BoardMinutes_Jan2026.pdf', source_section: 'Item 4'      },
      { urgency: 'MEDIUM', category: 'Financial',     label: 'Transfer fee not disclosed in listing',          agent_note: '$500 transfer fee and $250 move-in fee are not referenced in the current listing disclosures.',         source_document: 'FeeSchedule2025.pdf',     source_section: null          },
      { urgency: 'MEDIUM', category: 'Governance',    label: 'Annual meeting missed notification window',      agent_note: '2025 annual meeting notice was sent 14 days prior; bylaws require 21 days.',                          source_document: 'AnnualMeeting_2025.pdf',  source_section: 'Notice'      },
      { urgency: 'MEDIUM', category: 'Governance',    label: 'Proxy voting rules not updated for 2026',        agent_note: 'SB 5129 requires electronic proxy acceptance. Current bylaws only permit paper proxy.',                source_document: 'Bylaws_2019.pdf',         source_section: 'Article VI'  },
      { urgency: 'MEDIUM', category: 'Maintenance',   label: 'Landscaping contract expired',                   agent_note: 'Three-year contract with Greenscape LLC expired March 31, 2026. No renewal or rebid in progress.',     source_document: 'VendorContracts.pdf',     source_section: null          },
      { urgency: 'MEDIUM', category: 'Maintenance',   label: 'Pool permit not renewed for 2026',               agent_note: 'King County health permit for the community pool expired April 1, 2026. Pool is currently closed.',    source_document: 'PoolPermit2025.pdf',      source_section: null          },
      { urgency: 'MEDIUM', category: 'Maintenance',   label: 'Elevator inspection overdue by 6 months',        agent_note: 'State elevator inspection certificate expired October 2025. No inspection has been scheduled.',         source_document: 'ElevatorCert2024.pdf',    source_section: null          },
      { urgency: 'MEDIUM', category: 'Governance',    label: 'EV charging policy not adopted',                 agent_note: 'Six units have requested EV charger installations. No board policy exists. Two requests are stalled.', source_document: 'BoardAgenda_Apr2026.pdf',  source_section: 'Item 7'      },
      { urgency: 'MEDIUM', category: 'Financial',     label: 'Audit not completed for fiscal year 2024',       agent_note: 'Bylaws require annual independent audit. No audit report for FY2024 was provided in the document set.',  source_document: null,                       source_section: null          },
      // LOW (16) ────────────────────────────────────────────────────────────────
      { urgency: 'LOW', category: 'Restrictions',  label: 'Guest parking limit not consistently enforced',  agent_note: 'Rules limit guest parking to 72 hours. No tow log or enforcement record on file.',                   source_document: 'ParkingRules.pdf',       source_section: null },
      { urgency: 'LOW', category: 'Governance',    label: 'Holiday decoration policy outdated',             agent_note: 'Current policy references incandescent lights only. LED and projection displays not addressed.',       source_document: 'HouseRules_2016.pdf',    source_section: null },
      { urgency: 'LOW', category: 'Financial',     label: 'Move-in/out fee schedule not in disclosures',   agent_note: 'Fee schedule exists but is not referenced in the resale disclosure checklist.',                       source_document: 'FeeSchedule2025.pdf',    source_section: null },
      { urgency: 'LOW', category: 'Governance',    label: 'Noise complaint procedure informal only',        agent_note: 'No written complaint procedure exists. Noise complaints are handled ad hoc by board members.',         source_document: null,                     source_section: null },
      { urgency: 'LOW', category: 'Governance',    label: 'Board contact info absent from website',         agent_note: 'Association website last updated 2022. Board member names and contact info are not listed.',           source_document: null,                     source_section: null },
      { urgency: 'LOW', category: 'Governance',    label: 'Meeting minutes not posted within 30 days',      agent_note: 'Bylaws require posting within 30 days of approval. Q4 2025 minutes were posted 61 days after meeting.', source_document: 'BoardMinutes_Oct2025.pdf', source_section: null },
      { urgency: 'LOW', category: 'Restrictions',  label: 'Window replacement guidelines not published',    agent_note: 'CC&Rs require board approval for window replacements but no style guide has been published.',           source_document: 'CCRs_2018.pdf',          source_section: 'Section 6.1' },
      { urgency: 'LOW', category: 'Governance',    label: 'Vendor COI tracking done manually',              agent_note: 'No system for tracking vendor certificate of insurance renewals. Two vendors have lapsed COIs.',        source_document: 'VendorContracts.pdf',    source_section: null },
      { urgency: 'LOW', category: 'Maintenance',   label: 'Common area furniture replacement unknown',      agent_note: 'No replacement schedule or budget line item exists for lobby and pool deck furniture.',                source_document: null,                     source_section: null },
      { urgency: 'LOW', category: 'Governance',    label: 'Committee charters not current',                 agent_note: 'Architectural and social committee charters reference 2017 rules. Neither has been updated.',           source_document: 'CommitteeCharters.pdf',  source_section: null },
      { urgency: 'LOW', category: 'Governance',    label: 'Social media policy absent',                     agent_note: 'No policy governs board or management use of social media on behalf of the association.',              source_document: null,                     source_section: null },
      { urgency: 'LOW', category: 'Restrictions',  label: 'Storage unit assignment process undocumented',  agent_note: 'Storage assignments are managed informally. No written policy or assignment register exists.',           source_document: null,                     source_section: null },
      { urgency: 'LOW', category: 'Governance',    label: 'Resident directory not updated since 2023',      agent_note: 'Printed directory distributed in 2023. At least 14 units have changed ownership since.',                source_document: null,                     source_section: null },
      { urgency: 'LOW', category: 'Governance',    label: 'New owner orientation packet absent',            agent_note: 'No formal welcome or orientation materials are provided to incoming owners or tenants.',                source_document: null,                     source_section: null },
      { urgency: 'LOW', category: 'Maintenance',   label: 'Roof warranty documentation missing',            agent_note: 'Roof replaced in 2021. No warranty certificate or contractor contact was provided in the document set.', source_document: null,                     source_section: null },
      { urgency: 'LOW', category: 'Financial',     label: 'Budget variance report not shared with owners',  agent_note: 'Bylaws require quarterly budget-to-actual reports. No report has been distributed in 2025 or 2026.',   source_document: null,                     source_section: null },
    ],
  },
  property: {
    associationName: 'Chiavari Owners Association',
    propertyAddress: '10398 NE 17th St. #302, Bellevue WA 98004',
    auditDate: 'April 8, 2026',
  },
  financial_outlook: {
    monthly_fees: { current_monthly_fee: 531 },
    reserve_fund: { current_percent_funded: 76.3, shortfall_amount: 530846.79 },
    special_assessments: [
      { description: 'Roof replacement', estimated_amount_per_unit: 4800 },
    ],
    deferred_maintenance: [],
    litigation_costs: [],
  },
  investigation: {
    agentTasks: [
      { id: 'a1', label: 'Request full WUCIOA resale package from listing agent' },
      { id: 'a2', label: 'Confirm reserve study is dated within 3 years' },
    ],
    lenderChecks: [
      { id: 'l1', label: 'Verify FHA/VA project approval status' },
      { id: 'l2', label: 'Confirm rental ratio is within lending guidelines' },
    ],
    yourInvestigation: [
      { id: 'y1', label: 'Attend a board meeting or review recent minutes' },
      { id: 'y2', label: 'Walk common areas and note deferred maintenance' },
    ],
  },
  compliance_check: {
    items: [
      // FOUND (10) ──────────────────────────────────────────────────────────────
      { title: 'Reserve study on file',               status: 'FOUND', rcw: '64.90.640(1)(a)', new_2026: false },
      { title: 'Annual budget distributed',            status: 'FOUND', rcw: '64.90.640(1)(b)', new_2026: false },
      { title: 'Board meeting minutes (3 yr)',         status: 'FOUND', rcw: '64.90.640(1)(d)', new_2026: false },
      { title: 'CC&Rs recorded',                      status: 'FOUND', rcw: '64.90.640(1)(e)', new_2026: false },
      { title: 'Bylaws current',                      status: 'FOUND', rcw: '64.90.640(1)(f)', new_2026: false },
      { title: 'HOA name & registration on file',     status: 'FOUND', rcw: '64.90.640(1)(h)', new_2026: false },
      { title: 'Articles of incorporation on file',   status: 'FOUND', rcw: '64.90.640(1)(i)', new_2026: false },
      { title: 'Current fiscal year budget summary',  status: 'FOUND', rcw: '64.90.640(1)(j)', new_2026: false },
      { title: 'Emergency contact information',       status: 'FOUND', rcw: '64.90.640(1)(k)', new_2026: false },
      { title: 'Governing document amendment history', status: 'FOUND', rcw: '64.90.640(1)(l)', new_2026: false },
      // NOT_FOUND / UNCLEAR (16) ────────────────────────────────────────────────
      { title: 'Insurance certificate current',       status: 'UNCLEAR',   rcw: '64.90.640(1)(c)', new_2026: false },
      { title: 'Resale certificate available',        status: 'NOT_FOUND', rcw: '64.90.640(2)',     new_2026: true  },
      { title: 'Rules & regulations on file',         status: 'NOT_FOUND', rcw: '64.90.640(1)(g)', new_2026: false },
      { title: 'Pending litigation disclosed',        status: 'UNCLEAR',   rcw: '64.90.640(3)',     new_2026: true  },
      { title: 'Parking rules & enforcement policy',  status: 'NOT_FOUND', rcw: '64.90.640(4)(a)', new_2026: false },
      { title: 'Pet policy written and current',      status: 'UNCLEAR',   rcw: '64.90.640(4)(b)', new_2026: false },
      { title: 'Short-term rental policy adopted',    status: 'NOT_FOUND', rcw: '64.90.640(4)(c)', new_2026: true  },
      { title: 'Electronic voting procedures',        status: 'NOT_FOUND', rcw: '64.90.640(5)(a)', new_2026: true  },
      { title: 'Accessibility accommodation policy',  status: 'UNCLEAR',   rcw: '64.90.640(5)(b)', new_2026: false },
      { title: 'Delinquency collection policy',       status: 'NOT_FOUND', rcw: '64.90.640(6)(a)', new_2026: false },
      { title: 'Fining schedule published',           status: 'UNCLEAR',   rcw: '64.90.640(6)(b)', new_2026: false },
      { title: 'Conflict of interest policy',         status: 'NOT_FOUND', rcw: '64.90.640(7)(a)', new_2026: false },
      { title: 'Board compensation disclosure',       status: 'UNCLEAR',   rcw: '64.90.640(7)(b)', new_2026: false },
      { title: 'Reserve study update schedule',       status: 'NOT_FOUND', rcw: '64.90.640(8)',     new_2026: false },
      { title: 'Independent financial audit/review',  status: 'UNCLEAR',   rcw: '64.90.640(9)',     new_2026: false },
      { title: 'Developer transition documents',      status: 'NOT_FOUND', rcw: '64.90.640(10)',    new_2026: false },
    ],
  },
}

// ── Color tokens ──────────────────────────────────────────────────────────────
const C = {
  pageBg:   '#F8F9FB',
  card:     '#FFFFFF',
  border:   'rgba(31,18,36,0.08)',
  text:     '#1F1224',
  muted:    '#64748B',
  accent:   '#9333EA',
  danger:   '#EF4444',
  warning:  '#F59E0B',
  success:  '#10B981',
}

const SEV_COLOR = {
  HIGH:     C.danger,
  CRITICAL: C.danger,
  MEDIUM:   C.warning,
  LOW:      C.muted,
}

const STATUS_COLOR = {
  FOUND:     C.success,
  'N/A':     C.success,
  UNCLEAR:   C.warning,
  NOT_FOUND: C.danger,
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '20px 24px', flex: 1 }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, margin: '0 0 8px' }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 600, color: C.text, margin: '0 0 4px', lineHeight: 1.1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{sub}</p>}
    </div>
  )
}

function FindingCard({ finding }) {
  const sev = finding.urgency === 'CRITICAL' ? 'HIGH' : finding.urgency
  const color = SEV_COLOR[sev] ?? C.muted
  const source = [finding.source_document, finding.source_section].filter(Boolean).join(' · ')

  return (
    <div style={{ borderLeft: `4px solid ${color}`, background: C.card, borderRadius: '0 4px 4px 0', padding: '14px 18px', marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, margin: 0 }}>{finding.category}</p>
        <span style={{ color, border: `1px solid ${color}`, background: 'transparent', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500, flexShrink: 0 }}>
          {sev}
        </span>
      </div>
      <p style={{ fontSize: 14, fontWeight: 500, color: C.text, margin: '0 0 4px' }}>{finding.label}</p>
      <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 6px', lineHeight: 1.6 }}>{finding.agent_note}</p>
      {source && <p style={{ fontSize: 11, fontFamily: 'monospace', color: C.muted, margin: 0 }}>Source: {source}</p>}
    </div>
  )
}

function FinancialStat({ label, value, valueColor }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 500, color: valueColor ?? C.text, margin: 0 }}>{value}</p>
    </div>
  )
}

// ── SummaryTab ────────────────────────────────────────────────────────────────

export default function SummaryTab({ report = MOCK_REPORT }) {
  const findings    = report.risks?.findings ?? []
  const high        = findings.filter(f => f.urgency === 'CRITICAL' || f.urgency === 'HIGH')
  const fo          = report.financial_outlook ?? {}
  const mf          = fo.monthly_fees ?? {}
  const reserve     = fo.reserve_fund ?? {}
  const toArr       = v => Array.isArray(v) ? v : (v?.items ?? [])
  const specAssess  = toArr(fo.special_assessments)
  const deferred    = toArr(fo.deferred_maintenance)
  const litigation  = toArr(fo.litigation_costs)
  const ccItems     = report.compliance_check?.items ?? []
  const verified    = ccItems.filter(i => i.status === 'FOUND' || i.status === 'N/A').length

  const inv         = report.investigation ?? {}
  const agentItems  = inv.agentTasks        ?? []
  const lenderItems = inv.lenderChecks      ?? []
  const yourItems   = inv.yourInvestigation ?? []

  const [agentChecked,  setAgentChecked]  = useState(() => agentItems.map(() => false))
  const [lenderChecked, setLenderChecked] = useState(() => lenderItems.map(() => false))
  const [yourChecked,   setYourChecked]   = useState(() => yourItems.map(() => false))

  const fmt$ = n => n != null ? '$' + Number(n).toLocaleString() : '—'

  const exposure = (() => {
    const nums = []
    if (reserve.shortfall_amount) nums.push(Number(reserve.shortfall_amount))
    specAssess.forEach(s => s.estimated_amount_per_unit && nums.push(Number(s.estimated_amount_per_unit)))
    deferred.forEach(d => d.estimated_cost && nums.push(Number(d.estimated_cost)))
    litigation.forEach(l => (l.estimated_total_exposure || l.costs_to_date) && nums.push(Number(l.estimated_total_exposure ?? l.costs_to_date)))
    return nums.reduce((s, n) => s + n, 0)
  })()

  const reservePct   = reserve.current_percent_funded
  const reserveColor = reservePct == null ? C.muted : reservePct < 50 ? C.danger : reservePct < 70 ? C.warning : C.success

  const CARD  = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '20px 24px', marginBottom: 16 }
  const LABEL = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, margin: '0 0 12px' }

  return (
    <div style={{ background: C.pageBg, minHeight: '100%' }}>
      <div style={{ padding: 24 }}>

      {/* ── Section 1: Stat cards ── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <StatCard
          label="Total Findings"
          value={findings.length}
          sub={high.length > 0 ? `${high.length} need attention` : 'No critical issues'}
        />
        <StatCard
          label="High Severity"
          value={high.length}
          sub={high.length > 0 ? 'Review before closing' : 'None identified'}
        />
        <StatCard
          label="WUCIOA Compliance"
          value={ccItems.length ? `${verified} / ${ccItems.length}` : '—'}
          sub={ccItems.length ? 'items verified' : 'Not applicable'}
        />
      </div>

      {/* ── Section 2: HIGH findings ── */}
      {high.length > 0 && (
        <div style={CARD}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} color='#EF4444' />
              <p style={{ ...LABEL, margin: 0 }}>Top Critical Findings</p>
            </div>
            <button style={{ background: 'none', border: 'none', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.accent, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
              View all →
            </button>
          </div>
          {high.slice(0, 3).map((f, i) => <FindingCard key={i} finding={f} />)}
        </div>
      )}

      {/* ── Section 2b: Common Restrictions ── */}
      <div style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Shield size={16} color='#9333EA' />
          <p style={{ ...LABEL, margin: 0 }}>Common Restrictions</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { title: 'Pets',          body: 'Your pet may not be allowed — 40 lb weight limit applies',   badge: 'Restricted', badgeColor: '#92400E', badgeBg: '#FEF3C7', source: 'CC&Rs §4.3 — Pet Restrictions'        },
            { title: 'Airbnb / VRBO', body: 'Short-term rentals are banned — no Airbnb or VRBO',          badge: 'Banned',     badgeColor: '#B91C1C', badgeBg: '#FEE2E2', source: 'House Rules §2.1 — Short-Term Rentals' },
            { title: 'Rental Cap',    body: 'Only 20% of units can be rented — affects resale liquidity', badge: 'Restricted', badgeColor: '#92400E', badgeBg: '#FEF3C7', source: 'Bylaws §8.4 — Rental Cap Policy'       },
          ].map(({ title, body, badge, badgeColor, badgeBg, source }) => (
            <div key={title}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', margin: '0 0 6px' }}>{title}</p>
              <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: badgeColor, background: badgeBg, padding: '3px 10px', borderRadius: 20, marginBottom: 8 }}>{badge}</span>
              <p style={{ fontSize: 14, color: '#1F1224', lineHeight: 1.6, margin: '0 0 6px' }}>{body}</p>
              <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748B', margin: 0 }}>{source}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 3: Financial snapshot ── */}
      <div style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <DollarSign size={16} color='#10B981' />
          <p style={{ ...LABEL, margin: 0 }}>Financial Snapshot</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <FinancialStat
            label="Monthly Fee"
            value={mf.current_monthly_fee ? fmt$(mf.current_monthly_fee) : '—'}
          />
          <FinancialStat
            label="Reserve Fund"
            value={reservePct != null ? `${reservePct}%` : '—'}
            valueColor={reserveColor}
          />
          <FinancialStat
            label="Assessments"
            value={specAssess.length || 'None'}
            valueColor={specAssess.length ? C.warning : C.success}
          />
          <FinancialStat
            label="Total Exposure"
            value={exposure > 0 ? fmt$(exposure) : 'None'}
            valueColor={exposure > 0 ? C.danger : C.success}
          />
        </div>
      </div>

      {/* ── Section 4: Buyer Investigation Checklist ── */}
      <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <div style={{ background: '#1F1224', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <CheckSquare size={16} color='#FFFFFF' />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Buyer's Investigation Checklist</p>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0 }}>Collaborate with your team before closing</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: C.card }}>
          {[
            { title: 'Tasks for Agent',    items: agentItems,  checked: agentChecked,  setChecked: setAgentChecked  },
            { title: 'Lender Check',       items: lenderItems, checked: lenderChecked, setChecked: setLenderChecked },
            { title: 'Your Investigation', items: yourItems,   checked: yourChecked,   setChecked: setYourChecked   },
          ].map((col, ci) => (
            <div key={ci} style={{ padding: 20, borderRight: ci < 2 ? `1px solid rgba(31,18,36,0.08)` : 'none' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, margin: '0 0 14px' }}>{col.title}</p>
              {col.items.map((item, ii) => (
                <label key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={col.checked[ii] ?? false}
                    onChange={() => col.setChecked(prev => prev.map((v, idx) => idx === ii ? !v : v))}
                    style={{ marginTop: 2, accentColor: C.accent, width: 15, height: 15, flexShrink: 0, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 13, color: col.checked[ii] ? C.muted : C.text, lineHeight: 1.5, textDecoration: col.checked[ii] ? 'line-through' : 'none' }}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>

      </div>
    </div>
  )
}
