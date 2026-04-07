import '../styles/buyer.css'
import sampleImage from '../assets/sample_image.jpg';

const toArr = v => Array.isArray(v) ? v : (v?.items || [])

// ── LIFESTYLE PERSONA CONFIG ──────────────────────────────────────────────────
const PERSONAS = [
  { id: 'PET_OWNER_LARGE_DOG', label: 'Pet Owner'         },
  { id: 'AIRBNB_INVESTOR',     label: 'Airbnb / STR'      },
  { id: 'LONG_TERM_INVESTOR',  label: 'Long-Term Rental'  },
  { id: 'CONTRACTOR',          label: 'Work Vehicle'       },
  { id: 'HOME_BUSINESS',       label: 'Home Business'      },
  { id: 'RENOVATOR',           label: 'Renovator'          },
  { id: 'RETIREE',             label: 'Retiree'            },
]

// ── RENDER ────────────────────────────────────────────────────────────────────
export function renderBuyerView(a) {
  const el = document.getElementById('buyer-content')
  if (!el) return

  const meta         = a.metadata            || {}
  const fo           = a.financial_outlook   || {}
  const actionItems  = toArr(a.action_items)
  const profiles     = a.buyer_profile_verdicts?.verdicts || []
  const verdictData  = a.overall_verdict     || {}
  const allFindings  = a.risks?.findings     || []

  const address = meta.property_address || ''
  const hoaName = meta.hoa_name         || ''

  const monthly        = fo.monthly_fees || {}
  const currentFee     = monthly.current_monthly_fee
  const upcomingFee    = monthly.upcoming_fee
  const closingFees    = monthly.transfer_fees_due_at_closing

  const assessments    = toArr(fo.special_assessments)
  const levied         = assessments.filter(s => ['LEVIED','APPROVED','VOTED'].includes(s.status))
  const proposed       = assessments.filter(s => !['LEVIED','APPROVED','VOTED'].includes(s.status))
  const deferred       = toArr(fo.deferred_maintenance)
  const deferredTotal  = deferred.reduce((n, d) => n + (Number(d.estimated_cost) || 0), 0)
  const litigation     = toArr(fo.litigation_costs)
  const litigTotal     = litigation.reduce((n, l) => n + (Number(l.estimated_total_exposure) || 0), 0)

  // document_inventory arrives as an array — convert to map for staleness lookups
  const docInventory = (Array.isArray(a.document_inventory) ? a.document_inventory : [])
    .reduce((map, doc) => { if (doc.document_type_id) map[doc.document_type_id] = doc; return map }, {})
  const reserveFund    = fo.reserve_fund || {}

  const insurance      = fo.insurance || {}
  const insCovStatus   = insurance.coverage_status || 'UNKNOWN'
  const insGaps        = insurance.coverage_gaps    || []

  const buyerActions   = actionItems.filter(i =>
    Array.isArray(i.roles) ? i.roles.includes('buyer') || i.roles.includes('all') : true
  )

  el.innerHTML = renderHeader(address, hoaName, verdictData, allFindings)
    + renderDisclaimer()
    + renderFinancialSnapshot(currentFee, upcomingFee, closingFees, levied, proposed, deferredTotal, litigTotal, reserveFund, docInventory, allFindings)
    + renderInsurance(insCovStatus, insurance, insGaps)
    + renderChecklist(buyerActions)
    + renderLifestyle(profiles)

  initLifestyleChips()
}

// ── HEADER — property photo + address overlay + traffic light verdict ─────────
function renderHeader(address, hoaName, verdict, findings) {
  const auditDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  // Traffic light counts
  const critCount = findings.filter(f => f.urgency === 'CRITICAL').length
  const highCount  = findings.filter(f => f.urgency === 'HIGH').length
  const medCount   = findings.filter(f => f.urgency === 'MEDIUM').length
  const clearCount = findings.filter(f => f.urgency === 'LOW').length
    + (verdict.notable_absences?.length || 0)

  //const photoUrl = '/src/assets/sample_image.jpg'
  const photoUrl = sampleImage
 

  return `
    <div class="property-hero">
      <div class="property-hero-header">
        <div class="property-hero-text" style="background:#2B192E;position:relative;z-index:1;">
          <p class="ph-eyebrow">HOA Audit Report</p>
          <p class="ph-address">${address || 'Property Address'}</p>
          <p class="ph-meta">${hoaName ? hoaName + ' · ' : ''}Audited ${auditDate}</p>
        </div>
        <div class="property-hero-image">
          <img src="${photoUrl}" alt="Property photo" style="width:100%;height:100%;object-fit:cover;display:block;opacity:1;filter:none;" />
        </div>
      </div>
      <div class="property-hero-verdict">
        <div class="verdict-card critical">
          <p class="vc-label">Critical</p>
          <p class="vc-count">${critCount}</p>
          <p class="vc-sub">${critCount ? 'Issues found' : 'None found'}</p>
        </div>
        <div class="verdict-card review">
          <p class="vc-label">Review needed</p>
          <p class="vc-count">${highCount + medCount}</p>
          <p class="vc-sub">${(highCount + medCount) ? 'Items flagged' : 'None flagged'}</p>
        </div>
        <div class="verdict-card clear">
          <p class="vc-label">Verified clear</p>
          <p class="vc-count">${clearCount}</p>
          <p class="vc-sub">${clearCount ? 'Items confirmed' : 'Not assessed'}</p>
        </div>
      </div>
    </div>`
}

// ── DISCLAIMER ────────────────────────────────────────────────────────────────
function renderDisclaimer() {
  return `
    <div class="buyer-disclaimer">
      <span style="font-size:.9rem;flex-shrink:0;margin-top:.1rem">⚠</span>
      <p><strong style="color:#475569">For awareness only — not legal or financial advice.</strong>
      This AI-generated summary highlights areas that may need attention. Always verify with
      a licensed attorney or real estate professional before making decisions.</p>
    </div>`
}

// ── FINANCIAL SNAPSHOT ────────────────────────────────────────────────────────
// Layout: 4 equal stat cards (top) + risk cards in 2-col grid (bottom)
function renderFinancialSnapshot(currentFee, upcomingFee, closingFees, levied, proposed, deferredTotal, litigTotal, reserveFund, docInventory, allFindings) {

  // Look up urgency from risks.findings[] by risk_id
  const findUrgency = (riskId) => {
    if (!riskId) return null
    return allFindings.find(f => f.risk_id === riskId)?.urgency || null
  }

  const urgencyBadge = (urgency) => {
    if (!urgency) return ''
    const cls = { CRITICAL: 'ub-critical', HIGH: 'ub-high', MEDIUM: 'ub-medium', LOW: 'ub-low' }
    return `<span class="urgency-badge ${cls[urgency] || 'ub-medium'}">${urgency}</span>`
  }

  // ── Stat card 1: Monthly Dues ──────────────────────────────────────────────
  const feesStable = !upcomingFee
  const statDues = `
    <div class="fstat">
      <div class="fstat-label">Monthly Dues</div>
      <div class="fstat-value${!currentFee ? ' fstat-muted' : ''}">${currentFee ? '$' + Number(currentFee).toLocaleString() : '—'}</div>
      ${feesStable
        ? `<span class="fstat-badge fstat-badge-green">Stable</span>`
        : `<span class="fstat-badge fstat-badge-amber">↑ Increasing</span>`}
    </div>`

  // ── Stat card 2: Due at Closing ────────────────────────────────────────────
  const statClosing = `
    <div class="fstat">
      <div class="fstat-label">Due at Closing</div>
      <div class="fstat-value${!closingFees ? ' fstat-muted' : ' fstat-value-amber'}">${closingFees ? '$' + Number(closingFees).toLocaleString() : '—'}</div>
      ${closingFees
        ? `<span class="fstat-badge fstat-badge-amber">One-time</span>`
        : `<span class="fstat-badge fstat-badge-neutral">Not on file</span>`}
    </div>`

  // ── Stat card 3: Reserve Fund ──────────────────────────────────────────────
  const reservePct = reserveFund.current_percent_funded
  let statReserve
  if (reservePct != null) {
    const pct = Math.min(Math.round(reservePct), 100)
    let rfValueCls, rfBarCls, rfThreshold
    if (pct >= 70)      { rfValueCls = 'fstat-value-green'; rfBarCls = 'fsnap-rf-bar-green'; rfThreshold = 'Above 70% threshold' }
    else if (pct >= 40) { rfValueCls = 'fstat-value-amber'; rfBarCls = 'fsnap-rf-bar-amber'; rfThreshold = 'Below recommended' }
    else                { rfValueCls = 'fstat-value-red';   rfBarCls = 'fsnap-rf-bar-red';   rfThreshold = 'Critically underfunded' }
    statReserve = `
      <div class="fstat">
        <div class="fstat-label">Reserve Fund</div>
        <div class="fstat-value ${rfValueCls}">${pct}%</div>
        <div class="fstat-rf-bar-wrap">
          <div class="fstat-rf-track"><div class="${rfBarCls}" style="width:${pct}%"></div></div>
        </div>
        <div class="fstat-sub">${rfThreshold}</div>
      </div>`
  } else {
    statReserve = `
      <div class="fstat">
        <div class="fstat-label">Reserve Fund</div>
        <div class="fstat-value fstat-muted">—</div>
        <span class="fstat-badge fstat-badge-neutral">Not on file</span>
      </div>`
  }

  // ── Stat card 4: Data as of (staleness card) ───────────────────────────────
  // Find the most recent stale financial document date
  const financialDocKeys = ['BUDGET','FINANCIAL_STATEMENT','RESERVE_STUDY','RESALE_CERT']
  const staleDocs = financialDocKeys
    .map(k => docInventory[k])
    .filter(d => d && d.is_stale && d.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  const freshDocs = financialDocKeys
    .map(k => docInventory[k])
    .filter(d => d && !d.is_stale && d.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const dataDoc    = staleDocs[0] || freshDocs[0]
  const isOutdated = !!staleDocs[0]
  const dataDate   = dataDoc?.date
    ? new Date(dataDoc.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Unknown'

  const statData = `
    <div class="fstat">
      <div class="fstat-label">Data as of</div>
      <div class="fstat-value fstat-value-date">${dataDate}</div>
      ${isOutdated
        ? `<span class="fstat-badge fstat-badge-red">Outdated</span>`
        : `<span class="fstat-badge fstat-badge-green">Current</span>`}
    </div>`

  // ── Risk cards (bottom row) ────────────────────────────────────────────────
  const riskItems = []

  // Proposed / unconfirmed assessments
  proposed.forEach(s => {
    const urgency  = findUrgency(s.risk_id) || 'MEDIUM'
    const amount   = s.estimated_amount_per_unit ? '$' + Number(s.estimated_amount_per_unit).toLocaleString() + ' / unit' : 'TBD'
    const desc     = s.likely_timeline ? `Unconfirmed — ${s.likely_timeline}.` : 'Unconfirmed — current status unknown.'
    const source   = s.source_document ? `${s.source_document}${s.source_section ? ' · ' + s.source_section : ''}` : ''
    riskItems.push({ urgency, title: s.description || 'Special Assessment', amount, desc, source })
  })

  // Levied assessments (confirmed — also surface here as HIGH)
  levied.forEach(s => {
    const urgency = findUrgency(s.risk_id) || 'HIGH'
    const amount  = s.estimated_amount_per_unit ? '$' + Number(s.estimated_amount_per_unit).toLocaleString() + ' / unit' : 'TBD'
    const source  = s.source_document ? `${s.source_document}${s.source_section ? ' · ' + s.source_section : ''}` : ''
    riskItems.push({ urgency, title: s.description || 'Special Assessment (Confirmed)', amount, desc: 'Levied or approved — payment required.', source })
  })

  // Deferred maintenance
  if (deferredTotal > 0) {
    const f = allFindings.find(f => f.risk_category_id === 'DEFERRED_MAINTENANCE' || f.risk_id?.startsWith('DEFERRED'))
    const urgency = f?.urgency || 'MEDIUM'
    const source  = f?.source_document ? `${f.source_document}${f.source_section ? ' · ' + f.source_section : ''}` : ''
    riskItems.push({ urgency, title: 'Deferred maintenance', amount: '~$' + Number(deferredTotal).toLocaleString(), desc: 'Potential future special assessment if unresolved.', source })
  }

  // Litigation
  if (litigTotal > 0) {
    const f = allFindings.find(f => f.risk_category_id === 'LITIGATION' || f.risk_id?.startsWith('LITIGATION'))
    const urgency = f?.urgency || 'CRITICAL'
    const source  = f?.source_document ? `${f.source_document}${f.source_section ? ' · ' + f.source_section : ''}` : ''
    riskItems.push({ urgency, title: 'Active litigation', amount: '~$' + Number(litigTotal).toLocaleString(), desc: 'Could result in special assessment for all owners.', source })
  }

  const borderCls = u => ({ CRITICAL: 'fri-critical', HIGH: 'fri-high', MEDIUM: 'fri-medium', LOW: 'fri-low' }[u] || 'fri-medium')
  const dotCls    = u => ({ CRITICAL: 'fri-dot-critical', HIGH: 'fri-dot-high', MEDIUM: 'fri-dot-medium', LOW: 'fri-dot-low' }[u] || 'fri-dot-medium')

  const riskHtml = riskItems.map(item => `
    <div class="fri ${borderCls(item.urgency)}">
      <div class="fri-header">
        <span class="fri-dot ${dotCls(item.urgency)}"></span>
        <span class="fri-title">${item.title}</span>
        ${urgencyBadge(item.urgency)}
      </div>
      <div class="fri-amount">${item.amount}</div>
      <div class="fri-desc">${item.desc}</div>
      ${item.source ? `<div class="fri-source">${item.source}</div>` : ''}
    </div>`).join('')

  return `
    <div class="bs">
      <div class="bs-title">📊 Financial Snapshot</div>
      <div class="fstat-grid">${statDues}${statClosing}${statReserve}${statData}</div>
      ${riskItems.length ? `<div class="fri-grid">${riskHtml}</div>` : '<div class="fsnap-empty" style="margin-top:.75rem">No known financial risks identified</div>'}
    </div>`
}

// ── INSURANCE SECTION ─────────────────────────────────────────────────────────
function renderInsurance(status, insurance, gaps) {
  const statusMap = {
    CURRENT:        { cls: 'is-current', label: '✓ Policy Current' },
    LAPSED:         { cls: 'is-lapsed',  label: '✗ Policy Lapsed'  },
    EXPIRING_SOON:  { cls: 'is-warn',    label: '⚠ Expiring Soon'  },
    GAPS_IDENTIFIED:{ cls: 'is-warn',    label: '⚠ Gaps Found'     },
    UNKNOWN:        { cls: 'is-unknown', label: '? Status Unknown'  },
  }
  const s = statusMap[status] || statusMap.UNKNOWN

  let html = `
    <div class="bs">
      <div class="bs-title">🛡 What insurance am I still responsible for?</div>
      <div class="ins-status ${s.cls}">${s.label}</div>`

  html += `
    <div class="ins-row">
      <div class="ins-row-q">What the HOA's policy covers</div>
      <div class="ins-row-a">Common areas, building structure, shared systems (roof, hallways, elevators). This is the master policy — you don't pay for it separately.</div>
    </div>
    <div class="ins-row">
      <div class="ins-row-q">What you need to insure yourself (HO-6 policy)</div>
      <div class="ins-row-a">Your personal belongings, interior fixtures, and any improvements you make to the unit. Ask your insurance agent about an HO-6 policy.</div>
    </div>`

  if (insurance.deductible_owner_responsibility) {
    const isHigh = insurance.deductible_owner_responsibility.match(/\d[\d,]+/) &&
                   parseInt(insurance.deductible_owner_responsibility.replace(/,/g,'')) > 5000
    html += `
      <div class="ins-row">
        <div class="ins-row-q">Your deductible responsibility</div>
        <div class="ins-row-a ${isHigh ? 'ira-warn' : ''}">${insurance.deductible_owner_responsibility}</div>
      </div>`
  }

  if (gaps.length) {
    html += `
      <div class="ins-row">
        <div class="ins-row-q">Coverage gaps to know about</div>
        <div class="ins-row-a ira-warn">
          <ul style="margin:.35rem 0 0 1.1rem;padding:0">
            ${gaps.map(g => `<li style="font-size:.8rem;line-height:1.55;margin-bottom:.2rem">${g}</li>`).join('')}
          </ul>
        </div>
      </div>`
  }

  if (status === 'LAPSED') {
    html += `
      <div class="exp-item ei-red" style="margin-top:1rem">
        <div class="exp-item-label">No active HOA insurance — this is a serious issue</div>
        <div class="exp-item-desc">An uninsured HOA means you could be personally liable for major damage or accidents in common areas. Raise this with your agent immediately.</div>
      </div>`
  }

  html += `</div>`
  return html
}

// ── CHECKLIST SECTION ─────────────────────────────────────────────────────────
function renderChecklist(actions) {
  if (!actions.length) return ''

  const order = ['IMMEDIATE', 'BEFORE_CLOSING', 'AFTER_CLOSING', 'ONGOING']
  const sorted = [...actions].sort((a, b) =>
    order.indexOf(a.priority) - order.indexOf(b.priority)
  )

  const immediate = sorted.filter(i => i.priority === 'IMMEDIATE')
  const rest      = sorted.filter(i => i.priority !== 'IMMEDIATE')

  const timingMap = {
    BEFORE_CLOSING: { cls: 'ct-before', label: 'Before closing'    },
    AFTER_CLOSING:  { cls: 'ct-after',  label: 'After you move in' },
    ONGOING:        { cls: 'ct-after',  label: 'Ongoing'           },
  }

  // IMMEDIATE: always expanded, red callout
  const urgentHtml = immediate.map(item => {
    const source = item.source_document
      ? `<div class="cl-source">Source: ${item.source_document}</div>` : ''
    return `
      <div class="cl-urgent">
        <div class="cl-urgent-header">
          <span class="cl-badge ct-now">Do this now</span>
          <span class="urgency-badge ub-critical">CRITICAL</span>
        </div>
        <div class="cl-action">${item.action}</div>
        ${item.why ? `<div class="cl-why">${item.why}</div>` : ''}
        ${source}
      </div>`
  }).join('')

  // Non-urgent: collapsed by default behind <details>
  const restHtml = rest.map(item => {
    const t = timingMap[item.priority] || timingMap.BEFORE_CLOSING
    const source = item.source_document
      ? `<div class="cl-source">Source: ${item.source_document}</div>` : ''
    return `
      <li>
        <details class="cl-details">
          <summary class="cl-summary">
            <span class="cl-badge ${t.cls}">${t.label}</span>
            <span class="cl-action-text">${item.action}</span>
            <span class="cl-chevron">›</span>
          </summary>
          <div class="cl-detail-body">
            ${item.why ? `<div class="cl-why">${item.why}</div>` : ''}
            ${source}
          </div>
        </details>
      </li>`
  }).join('')

  return `
    <div class="bs">
      <div class="bs-title">✅ Before you sign — your checklist</div>
      ${urgentHtml}
      ${restHtml ? `<ol class="checklist">${restHtml}</ol>` : ''}
    </div>`
}

// ── LIFESTYLE SECTION — moved to bottom as optional personalisation ────────────
function renderLifestyle(_profiles) {
  const chips = PERSONAS.map(p => `
    <button class="life-chip" data-id="${p.id}">${p.label}</button>
  `).join('')

  return `
    <div class="bs">
      <div class="bs-title">🏡 Does this HOA fit your life?</div>
      <p class="life-label">Select what applies to you to see if any HOA rules could affect you.</p>
      <div class="life-chips">${chips}</div>
      <div class="life-results" id="life-results">
        <div class="life-placeholder">Select what applies to you above to see how this HOA fits your lifestyle.</div>
      </div>
    </div>`
}

function initLifestyleChips() {
  const chips     = document.querySelectorAll('.life-chip')
  const resultsEl = document.getElementById('life-results')
  if (!chips.length || !resultsEl) return

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active')
      updateLifestyleResults(resultsEl)
    })
  })
}

window._buyerProfiles = []

function updateLifestyleResults(resultsEl) {
  const active = [...document.querySelectorAll('.life-chip.active')].map(c => c.dataset.id)

  if (!active.length) {
    resultsEl.innerHTML = `<div class="life-placeholder">Select what applies to you above to see how this HOA fits your lifestyle.</div>`
    return
  }

  const profiles = window._buyerProfiles || []
  let html = ''

  active.forEach(id => {
    const persona = PERSONAS.find(p => p.id === id)
    const profile = profiles.find(p => p.buyer_type_id === id)

    if (!profile) {
      html += `
        <div class="life-verdict lv-caution">
          <div class="lv-header">
            <span class="lv-badge">NO DATA</span>
            <span class="lv-type">${persona?.label || id}</span>
          </div>
          <div class="lv-reason">No specific rules found for this profile in the documents reviewed. Ask your agent to confirm.</div>
        </div>`
      return
    }

    const verdictClass = { 'DO NOT BUY': 'lv-no', 'CAUTION': 'lv-caution', 'OK': 'lv-ok' }[profile.verdict] || 'lv-caution'
    const verdictBadge = { 'DO NOT BUY': 'DEAL BREAKER', 'CAUTION': 'HEADS UP', 'OK': 'LOOKS GOOD' }[profile.verdict] || profile.verdict

    const dealbreakers = profile.dealbreakers || []
    const concerns     = profile.concerns     || []

    html += `
      <div class="life-verdict ${verdictClass}">
        <div class="lv-header">
          <span class="lv-badge">${verdictBadge}</span>
          <span class="lv-type">${profile.buyer_type_label || persona?.label}</span>
        </div>
        <div class="lv-reason">${profile.verdict_reason || ''}</div>
        ${dealbreakers.length ? `
          <ul class="lv-list">
            ${dealbreakers.map(d => `<li>${d}</li>`).join('')}
          </ul>` : ''}
        ${concerns.length && profile.verdict !== 'DO NOT BUY' ? `
          <ul class="lv-list" style="margin-top:.4rem;opacity:.8">
            ${concerns.map(c => `<li>${c}</li>`).join('')}
          </ul>` : ''}
      </div>`
  })

  resultsEl.innerHTML = html
}

// ── PUBLIC INIT ───────────────────────────────────────────────────────────────
export function initBuyerProfiles(profiles) {
  window._buyerProfiles = profiles || []
}
