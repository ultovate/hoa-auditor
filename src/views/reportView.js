import '../styles/report.css'

// Draft message state
let _draftPropertyName = ''

// ── DRAFT MESSAGE MODAL ───────────────────────────────────────────────────────
function buildDraftTemplate(risk, recipient) {
  const label   = risk.label || 'this issue'
  const finding = risk.finding || ''
  const src     = risk.source_document
    ? `(per ${risk.source_document}${risk.source_section ? ', ' + risk.source_section : ''})`
    : ''
  const note    = risk.buyer_note || risk.agent_note || ''
  const prop    = _draftPropertyName || 'the property'

  if (recipient === 'board') return `Subject: Concern Regarding ${label} — ${prop}

Dear HOA Board of Directors,

I am writing to request clarification on a matter identified during my review of the HOA documents for ${prop}.

Issue: ${label} ${src}

${finding}
${note ? '\n' + note : ''}

I respectfully request clarification on the current status of this matter and any remediation steps planned. Please respond at your earliest convenience, as this is time-sensitive to my closing timeline.

Sincerely,
[Your Name]
[Date]`

  if (recipient === 'agent') return `Hi [Agent Name],

I wanted to flag a concern from the HOA document review for ${prop} before we proceed further.

Issue: ${label} ${src}
${finding}
${note ? '\n' + note : ''}

Can we discuss how this affects our options — whether this is negotiable, warrants a contingency, or should factor into our offer?

Thanks,
[Your Name]`

  if (recipient === 'lender') return `Subject: HOA Risk Disclosure — ${prop}

Dear [Loan Officer Name],

I wanted to bring to your attention a risk identified in the HOA document review for ${prop}.

Issue: ${label} ${src}
${finding}
${note ? '\n' + note : ''}

Please advise whether this affects my loan approval, requires additional documentation, or warrants further review by your underwriting team.

Best regards,
[Your Name]`
}

function initDraftModal() {
  if (document.getElementById('draft-modal')) return

  const modal = document.createElement('div')
  modal.id = 'draft-modal'
  modal.style.cssText = `display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;align-items:center;justify-content:center`
  modal.innerHTML = `
    <div style="background:#fff;border-radius:12px;width:min(640px,95vw);max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.3)">
      <div style="padding:1.25rem 1.5rem;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-weight:700;font-size:1rem;color:#111827">Draft Message</div>
          <div id="draft-modal-risk-label" style="font-size:.8rem;color:#6B7280;margin-top:2px"></div>
        </div>
        <button id="draft-modal-close" style="background:none;border:none;cursor:pointer;font-size:1.4rem;color:#9CA3AF;line-height:1">×</button>
      </div>
      <div style="padding:1rem 1.5rem;border-bottom:1px solid #E5E7EB;display:flex;gap:.5rem">
        <button class="draft-tab-btn" data-recipient="board"  style="padding:.4rem .9rem;border-radius:6px;border:1px solid #D1D5DB;background:#F3F4F6;font-size:.8rem;cursor:pointer;font-weight:600">HOA Board</button>
        <button class="draft-tab-btn" data-recipient="agent"  style="padding:.4rem .9rem;border-radius:6px;border:1px solid #D1D5DB;background:#fff;font-size:.8rem;cursor:pointer">My Agent</button>
        <button class="draft-tab-btn" data-recipient="lender" style="padding:.4rem .9rem;border-radius:6px;border:1px solid #D1D5DB;background:#fff;font-size:.8rem;cursor:pointer">Lender</button>
      </div>
      <textarea id="draft-modal-text" style="flex:1;min-height:300px;padding:1.25rem 1.5rem;border:none;resize:none;font-family:inherit;font-size:.85rem;line-height:1.6;color:#1F2937;outline:none;overflow-y:auto"></textarea>
      <div style="padding:1rem 1.5rem;border-top:1px solid #E5E7EB;display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:.75rem;color:#9CA3AF">Edit the draft above before sending.</span>
        <button id="draft-copy-btn" style="padding:.5rem 1.1rem;background:#1D4ED8;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:.85rem;font-weight:600">Copy to Clipboard</button>
      </div>
    </div>`
  document.body.appendChild(modal)

  let _activeRisk = null

  function setRecipient(r) {
    modal.querySelectorAll('.draft-tab-btn').forEach(b => {
      const active = b.dataset.recipient === r
      b.style.background = active ? '#1D4ED8' : '#fff'
      b.style.color = active ? '#fff' : '#374151'
      b.style.borderColor = active ? '#1D4ED8' : '#D1D5DB'
    })
    if (_activeRisk) {
      document.getElementById('draft-modal-text').value = buildDraftTemplate(_activeRisk, r)
    }
  }

  modal.querySelectorAll('.draft-tab-btn').forEach(b => {
    b.addEventListener('click', () => setRecipient(b.dataset.recipient))
  })

  document.getElementById('draft-modal-close').addEventListener('click', () => {
    modal.style.display = 'none'
  })
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none'
  })

  document.getElementById('draft-copy-btn').addEventListener('click', () => {
    const ta = document.getElementById('draft-modal-text')
    navigator.clipboard.writeText(ta.value).then(() => {
      const btn = document.getElementById('draft-copy-btn')
      btn.textContent = 'Copied!'
      setTimeout(() => { btn.textContent = 'Copy to Clipboard' }, 2000)
    })
  })

  document.addEventListener('open-draft-modal', e => {
    _activeRisk = e.detail.risk
    document.getElementById('draft-modal-risk-label').textContent = _activeRisk.label || ''
    setRecipient('board')
    modal.style.display = 'flex'
  })
}

const URGENCY_COLOR = { CRITICAL: 'red', HIGH: 'red', MEDIUM: 'amber', LOW: 'gray' }
const URGENCY_LABEL = {
  CRITICAL: 'Action Required',
  HIGH:     'Needs Attention',
  MEDIUM:   'Review Recommended',
  LOW:      'For Your Awareness'
}
const IMPACT_COLOR = { HIGH: 'red', MEDIUM: 'amber', LOW: 'gray' }

function sl(colorClass, text) {
  return `<span class="sl sl-${colorClass}">${text}</span>`
}

function fmt$(n) {
  if (n == null || n === '') return null
  return '$' + Number(n).toLocaleString()
}

// ── TAB: OVERVIEW ────────────────────────────────────────────────────────────
function renderOverview(a, role) {
  const risks      = a.risks?.findings       || []
  const absences   = a.risks?.notable_absences || []
  const actionItems = Array.isArray(a.action_items)
    ? a.action_items
    : (a.action_items?.items || [])
  const md         = a.missing_documents || {}
  const ov         = a.overall_verdict   || {}
  const fo         = a.financial_outlook || {}
  let html = ''

  if (role === 'buyer') {
    // Headline from overall verdict
    if (ov.verdict_reason) {
      const vc = ov.verdict === 'CRITICAL' ? 'red' : ov.verdict === 'SAFE' ? 'green' : 'amber'
      html += `<div class="ov-headline">${sl(vc, ov.verdict || 'CAUTION')} ${ov.verdict_reason}</div>`
    }

    // Top concerns — CRITICAL + HIGH risks with buyer notes
    const topRisks = risks.filter(r => r.urgency === 'CRITICAL' || r.urgency === 'HIGH')
    if (topRisks.length) {
      html += `<div class="sec-card sec-card-err"><div class="sec-title">⚠ Top Concerns (${topRisks.length})</div>`
      topRisks.forEach(r => {
        html += `
          <div class="det-row dr-red">
            <div class="det-row-badges">${sl('red', URGENCY_LABEL[r.urgency])}</div>
            <div class="det-row-title">${r.label}</div>
            ${r.buyer_note ? `<div class="det-row-meta">${r.buyer_note}</div>` : r.finding ? `<div class="det-row-meta">${r.finding}</div>` : ''}
            ${r.source_document ? `<div class="det-row-src">📄 ${r.source_document}${r.source_section ? ' · ' + r.source_section : ''}</div>` : ''}
          </div>`
      })
      html += `</div>`
    }

    // Monthly fees snapshot
    const mf = fo.monthly_fees
    if (mf?.current_monthly_fee) {
      html += `<div class="sec-card"><div class="sec-title">💰 Monthly Cost Snapshot</div>
        <div class="det-row-meta">Current monthly fee: <strong>${fmt$(mf.current_monthly_fee)}</strong></div>
        ${mf.upcoming_fee ? `<div class="det-row-meta" style="color:#B45309">Upcoming fee: <strong>${fmt$(mf.upcoming_fee)}</strong>${mf.upcoming_fee_date ? ` effective ${mf.upcoming_fee_date}` : ''}${mf.upcoming_fee_percent_change ? ` (+${mf.upcoming_fee_percent_change}%)` : ''}</div>` : ''}
        ${mf.transfer_fees_due_at_closing ? `<div class="det-row-meta">Transfer fees at closing: <strong>${fmt$(mf.transfer_fees_due_at_closing)}</strong></div>` : ''}
      </div>`
    }

    // Green lights from notable absences
    if (absences.length) {
      html += `<div class="sec-card ov-green-card"><div class="sec-title">✅ What Looks Good</div><ul class="ov-list">`
      absences.forEach(ab => { html += `<li>${ab.label}${ab.evidence ? ` — <span style="color:#6B7280">${ab.evidence}</span>` : ''}</li>` })
      html += `</ul></div>`
    }

    // Buyer action items
    const buyerActions = actionItems.filter(i => i.roles?.includes('buyer') || i.roles?.includes('all'))
    if (buyerActions.length) {
      html += `<div class="sec-card"><div class="sec-title">✅ Your Action Items</div><ol class="ov-list">`
      buyerActions.forEach(i => { html += `<li><strong>${i.action}</strong>${i.why ? `<br><span style="font-size:.8rem;color:#6B7280">${i.why}</span>` : ''}</li>` })
      html += `</ol></div>`
    }

  } else if (role === 'agent') {
    const verdict   = ov.verdict || 'CAUTION'
    const badgeColor = verdict === 'CRITICAL' ? 'red' : verdict === 'SAFE' ? 'green' : 'amber'
    const lenderRisks = risks.filter(r => r.lender_flag)
    html += `<div class="ov-verdict-row">${sl(badgeColor, verdict)}${lenderRisks.length ? `<span style="font-size:.83rem;color:#6B7280;margin-left:.75rem">⚠ ${lenderRisks.length} lender flag${lenderRisks.length > 1 ? 's' : ''}</span>` : ''}</div>`

    // Agent action items
    const agentActions = actionItems.filter(i => i.roles?.includes('agent') || i.roles?.includes('all'))
    if (agentActions.length) {
      html += `<div class="sec-card"><div class="sec-title">✅ Recommended Next Steps</div><ol class="ov-list">`
      agentActions.forEach(i => { html += `<li>${i.action}${i.why ? `<br><span style="font-size:.8rem;color:#6B7280">${i.why}</span>` : ''}</li>` })
      html += `</ol></div>`
    }

    // Transaction considerations — risks where negotiation_lever is Yes/Maybe
    const negotiable = risks.filter(r => r.negotiation_lever === 'Yes' || r.negotiation_lever === 'Maybe')
    if (negotiable.length) {
      html += `<div class="sec-card"><div class="sec-title">🤝 Transaction Considerations</div><ul class="ov-list">`
      negotiable.forEach(r => {
        html += `<li>${r.label}${r.negotiation_lever === 'Yes' ? ' <span style="color:#059669;font-size:.78rem">(negotiable)</span>' : ' <span style="color:#9CA3AF;font-size:.78rem">(possibly)</span>'}</li>`
      })
      html += `</ul></div>`
    }

    // Lender flags
    if (lenderRisks.length) {
      html += `<div class="sec-card ov-red-card"><div class="sec-title">🏦 Lender Flags</div><ul class="ov-list">`
      lenderRisks.forEach(r => { html += `<li>${r.label}${r.agent_note ? ` — ${r.agent_note}` : ''}</li>` })
      html += `</ul></div>`
    }

  } else if (role === 'lender') {
    const totalExposure = ov.total_financial_exposure
    const lenderRisks   = risks.filter(r => r.lender_flag)
    if (totalExposure) {
      html += `<div class="sec-card ov-red-card">
        <div class="sec-title">💰 Financial Risk Summary</div>
        <div class="ov-exposure">Total identified exposure: <strong>${fmt$(totalExposure)}</strong></div>
      </div>`
    }
    if (lenderRisks.length) {
      html += `<div class="sec-card"><div class="sec-title">🏦 Lender Impact Items (${lenderRisks.length})</div>`
      lenderRisks.forEach(r => {
        const color = URGENCY_COLOR[r.urgency] || 'amber'
        html += `
          <div class="det-row dr-${color}">
            <div class="det-row-badges">${sl(color, URGENCY_LABEL[r.urgency] || 'Review Recommended')}</div>
            <div class="det-row-title">${r.label}</div>
            ${r.agent_note || r.buyer_note ? `<div class="det-row-meta">${r.agent_note || r.buyer_note}</div>` : ''}
            ${r.source_document ? `<div class="det-row-src">📄 ${r.source_document}${r.source_section ? ' · ' + r.source_section : ''}</div>` : ''}
          </div>`
      })
      html += `</div>`
    }
  }

  // Analysis completeness (all roles)
  const critMissing  = md.critical_missing   || []
  const completeness = md.analysis_completeness
  if (critMissing.length || (completeness && completeness !== 'FULL')) {
    const compColor = completeness === 'MINIMAL' ? 'red' : 'amber'
    html += `<div class="sec-card">
      <div class="sec-title">📁 Analysis Completeness</div>
      ${completeness ? `<div style="margin-bottom:.75rem">${sl(compColor, completeness + ' ANALYSIS')}</div>` : ''}
      <div style="font-size:.78rem;color:#6B7280;margin-bottom:.75rem;line-height:1.6;border-left:3px solid #E5E7EB;padding-left:.75rem">
        <div><strong style="color:#374151">FULL</strong> — all expected documents were present (Resale Cert, CC&Rs, Reserve Study, etc.)</div>
        <div><strong style="color:#374151">PARTIAL</strong> — some key documents were missing but enough to do meaningful analysis</div>
        <div><strong style="color:#374151">MINIMAL</strong> — very few documents found, analysis is limited and conclusions may not be reliable</div>
      </div>
      ${critMissing.length ? `
        <div class="det-group-label" style="color:#B91C1C;border-top:none;margin-top:0;padding-top:0">❌ Critical Missing Documents</div>
        ${critMissing.map(d => `
          <div class="det-row dr-red">
            <div class="det-row-title">${d.label}</div>
            ${d.why_critical   ? `<div class="det-row-meta">${d.why_critical}</div>`   : ''}
            ${d.how_to_obtain  ? `<div class="det-row-action">→ ${d.how_to_obtain}</div>` : ''}
          </div>`).join('')}` : ''}
    </div>`
  }

  return html || '<p class="ov-body" style="text-align:center;padding:2rem;color:#9CA3AF">No overview data available.</p>'
}

// ── TAB: RISKS ───────────────────────────────────────────────────────────────
function renderRisks(a, role) {
  let risks = a.risks?.findings || []

  if (role === 'lender') {
    risks = risks.filter(r => r.lender_flag)
  }

  if (!risks.length) {
    return '<p class="ov-body" style="text-align:center;padding:2rem;color:#9CA3AF">No risk findings available.</p>'
  }

  let html = ''
  ;['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].forEach(urgency => {
    const items = risks.filter(r => r.urgency === urgency)
    if (!items.length) return
    const color = URGENCY_COLOR[urgency]
    const icon  = urgency === 'CRITICAL' || urgency === 'HIGH' ? '🚨' : urgency === 'MEDIUM' ? '⚠️' : 'ℹ️'

    html += `<div class="sec-card${urgency === 'CRITICAL' ? ' sec-card-err' : urgency === 'HIGH' ? ' sec-card-warn' : ''}">
      <div class="sec-title">${icon} ${URGENCY_LABEL[urgency]} (${items.length})</div>`
    items.forEach(r => {
      const note = role === 'buyer' ? r.buyer_note : (r.agent_note || r.buyer_note)
      const showDraft = (urgency === 'CRITICAL' || urgency === 'HIGH') && role !== 'lender'
      const riskKey = encodeURIComponent(JSON.stringify(r))
      html += `
        <div class="det-row dr-${color}">
          <div class="det-row-badges">
            ${sl(color, urgency)}
            ${r.lender_flag ? sl('red', '⚠ Lender Risk') : ''}
            ${r.negotiation_lever === 'Yes' ? sl('blue', '✓ Negotiable') : r.negotiation_lever === 'Maybe' ? sl('gray', '~ Maybe') : ''}
          </div>
          <div class="det-row-title">${r.label || r.verdict_label || ''}</div>
          ${r.finding ? `<div class="det-row-meta">${r.finding}</div>` : ''}
          ${note && note !== r.finding ? `<div class="det-row-meta" style="color:#4B5563;font-style:italic">${note}</div>` : ''}
          ${r.source_document ? `<div class="det-row-src">📄 ${r.source_document}${r.source_section ? ' · ' + r.source_section : ''}</div>` : ''}
          ${showDraft ? `<div style="margin-top:.6rem"><button class="draft-msg-btn" data-risk="${riskKey}" style="padding:.3rem .8rem;font-size:.75rem;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;border-radius:6px;cursor:pointer;font-weight:600">✉ Draft Message</button></div>` : ''}
        </div>`
    })
    html += `</div>`
  })

  // Notable absences
  const absences = a.risks?.notable_absences || []
  if (absences.length) {
    html += `<div class="sec-card"><div class="sec-title">✅ Notable Absences</div>`
    absences.forEach(ab => {
      html += `
        <div class="det-row dr-green">
          <div class="det-row-title">${ab.label}</div>
          ${ab.evidence ? `<div class="det-row-meta">${ab.evidence}</div>` : ''}
        </div>`
    })
    html += `</div>`
  }

  return html
}

// ── TAB: RESTRICTIONS ────────────────────────────────────────────────────────
function renderRestrictions(a, role) {
  const r        = a.restrictions || {}
  const found    = r.restrictions_found  || []
  const absences = r.notable_absences    || []
  const amendments = r.amendment_tracker || []
  const summary  = r.restriction_summary || {}
  const profileVerdicts = a.buyer_profile_verdicts?.verdicts || []

  if (!found.length) {
    return '<p class="ov-body" style="text-align:center;padding:2rem;color:#9CA3AF">No restrictions data available.</p>'
  }

  // Compute counts from actual data (not AI self-reported summary)
  const highCount    = found.filter(i => i.buyer_impact === 'HIGH').length
  const mediumCount  = found.filter(i => i.buyer_impact === 'MEDIUM').length
  const amendedCount = found.filter(i => i.was_amended).length

  const VERDICT_LABEL = {
    'DO NOT BUY': '⚠️ Restrictions Apply',
    'CAUTION':    'Review Recommended',
  }

  let html = ''

  // Buyer profile verdicts — with verdict-type aggregation counts
  if (profileVerdicts.length) {
    const restrictApplyCount  = profileVerdicts.filter(v => v.verdict === 'DO NOT BUY').length
    const reviewRecommCount   = profileVerdicts.filter(v => v.verdict === 'CAUTION').length
    const noMajorCount        = profileVerdicts.filter(v => v.verdict !== 'DO NOT BUY' && v.verdict !== 'CAUTION').length

    html += `<div class="sec-card"><div class="sec-title">👤 Buyer Profile Verdicts</div>
      <div class="rest-summary-bar" style="margin-bottom:1rem">
        ${restrictApplyCount ? `<div class="rest-stat rs-red"><strong>${restrictApplyCount}</strong> Restrictions Apply</div>`   : ''}
        ${reviewRecommCount  ? `<div class="rest-stat rs-amber"><strong>${reviewRecommCount}</strong> Review Recommended</div>` : ''}
        ${noMajorCount       ? `<div class="rest-stat rs-green"><strong>${noMajorCount}</strong> No Major Restrictions</div>`   : ''}
      </div>
      <div class="profile-grid">`
    profileVerdicts.forEach(v => {
      const vc    = v.verdict === 'DO NOT BUY' ? 'red' : v.verdict === 'CAUTION' ? 'amber' : 'green'
      const label = VERDICT_LABEL[v.verdict] || 'No Major Restrictions'
      html += `
        <div class="profile-card pc-${vc}">
          <div class="profile-type">${v.buyer_type_label}</div>
          <div class="profile-verdict">${sl(vc, label)}</div>
          ${v.verdict_reason ? `<div class="profile-reason">${v.verdict_reason}</div>` : ''}
        </div>`
    })
    html += `</div></div>`
  }

  // Restriction counts summary bar — below Buyer Profile Verdicts
  html += `<div class="rest-summary-bar">
    <div class="rest-stat"><strong>${found.length}</strong> restrictions found</div>
    ${highCount    ? `<div class="rest-stat rs-red"><strong>${highCount}</strong> high impact</div>`       : ''}
    ${mediumCount  ? `<div class="rest-stat rs-amber"><strong>${mediumCount}</strong> medium impact</div>` : ''}
    ${amendedCount ? `<div class="rest-stat rs-blue"><strong>${amendedCount}</strong> amended</div>`       : ''}
  </div>`

  // Group by category, sort by highest impact first
  const byCategory = {}
  found.forEach(res => {
    const cat = res.category_label || res.category_id || 'Other'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(res)
  })
  const sortedCats = Object.entries(byCategory).sort((a, b) =>
    b[1].filter(i => i.buyer_impact === 'HIGH').length - a[1].filter(i => i.buyer_impact === 'HIGH').length
  )

  sortedCats.forEach(([cat, items]) => {
    const hasHigh = items.some(res => res.buyer_impact === 'HIGH')
    html += `<div class="sec-card ${hasHigh ? 'sec-card-warn' : ''}">
      <div class="sec-title">${cat}</div>`
    items.forEach(res => {
      const color = IMPACT_COLOR[res.buyer_impact] || 'gray'
      html += `
        <div class="det-row dr-${color}">
          <div class="det-row-badges">
            ${sl(color, res.buyer_impact || 'LOW')}
            ${res.was_amended ? sl('blue', 'Amended') : ''}
            ${res.dealbreaker_for ? `<span style="font-size:.72rem;color:#B91C1C;font-weight:700">⛔ Dealbreaker: ${res.dealbreaker_for}</span>` : ''}
          </div>
          <div class="det-row-title">${res.rule}</div>
          ${res.original_rule && res.was_amended ? `<div class="det-row-meta" style="text-decoration:line-through;color:#9CA3AF">Was: ${res.original_rule}</div>` : ''}
          ${res.amendment_details ? `<div class="det-row-meta" style="color:#3730A3;font-size:.76rem">${res.amendment_details}</div>` : ''}
          ${res.source_document ? `<div class="det-row-src">📄 ${res.source_document}${res.source_section ? ' · ' + res.source_section : ''}</div>` : ''}
        </div>`
    })
    html += `</div>`
  })

  // Notable absences
  if (absences.length) {
    html += `<div class="sec-card"><div class="sec-title">✅ Categories With No Restrictions Found</div>`
    absences.forEach(ab => {
      html += `<div class="det-row dr-green"><div class="det-row-title">${ab.category_label || ab.category_id}</div>${ab.evidence ? `<div class="det-row-meta">${ab.evidence}</div>` : ''}</div>`
    })
    html += `</div>`
  }

  // Amendment tracker
  if (amendments.length) {
    html += `<div class="sec-card"><div class="sec-title">📝 Amendment Tracker</div>`
    amendments.forEach(am => {
      html += `
        <div class="det-row dr-blue">
          <div class="det-row-title">${am.amendment_name}${am.date ? ` — ${am.date}` : ''}</div>
          ${am.recording_number ? `<div class="det-row-meta">Recording #: ${am.recording_number}</div>` : ''}
          ${am.rules_changed    ? `<div class="det-row-meta">${Array.isArray(am.rules_changed) ? am.rules_changed.join('; ') : am.rules_changed}</div>` : ''}
        </div>`
    })
    html += `</div>`
  }

  return html
}

// ── TAB: DOCUMENTS ───────────────────────────────────────────────────────────
function renderDocuments(a, role) {
  const docs = a.document_inventory || []
  const md   = a.missing_documents  || {}
  const critMissing = md.critical_missing   || []
  const recMissing  = md.recommended_missing || []
  let html = ''

  if (docs.length) {
    const staleDocs   = docs.filter(d =>  d.is_stale)
    const currentDocs = docs.filter(d => !d.is_stale)
    const sorted      = [...staleDocs, ...currentDocs]

    html += `<div class="sec-card">
      <div class="sec-title">📋 Documents Analyzed (${docs.length})</div>
      <div class="doc-table">
        <div class="doc-table-head"><span>Document</span><span>Date</span><span>Pages</span><span>Status</span></div>`
    sorted.forEach(d => {
      const dateStr = d.date
        ? new Date(d.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : '—'
      html += `
        <div class="doc-table-row">
          <span class="doc-table-name">${d.document_label}${d.filename ? `<span class="doc-filename">${d.filename}</span>` : ''}</span>
          <span class="doc-table-date">${dateStr}</span>
          <span class="doc-table-pages">${d.page_count || '—'}</span>
          <span>${d.is_stale ? sl('amber', 'Needs Verification') : sl('green', 'Current')}</span>
        </div>
        ${d.notes ? `<div class="doc-table-note">${d.notes}</div>` : ''}`
    })
    html += `</div></div>`
  }

  if (critMissing.length) {
    html += `<div class="sec-card sec-card-err"><div class="sec-title">❌ Critical Missing Documents (${critMissing.length})</div>`
    critMissing.forEach(d => {
      html += `
        <div class="det-row dr-red">
          <div class="det-row-badges">${sl('red', 'Missing')}</div>
          <div class="det-row-title">${d.label}</div>
          ${d.why_critical  ? `<div class="det-row-meta">${d.why_critical}</div>`      : ''}
          ${d.how_to_obtain ? `<div class="det-row-action">→ ${d.how_to_obtain}</div>` : ''}
        </div>`
    })
    html += `</div>`
  }

  if (recMissing.length) {
    html += `<div class="sec-card"><div class="sec-title">⚠ Recommended Documents to Request (${recMissing.length})</div>`
    recMissing.forEach(d => {
      html += `
        <div class="det-row dr-amber">
          <div class="det-row-badges">${sl('amber', 'Recommended')}</div>
          <div class="det-row-title">${d.label}</div>
          ${d.why_recommended ? `<div class="det-row-meta">${d.why_recommended}</div>` : ''}
        </div>`
    })
    html += `</div>`
  }

  return html || '<p class="ov-body" style="text-align:center;padding:2rem;color:#9CA3AF">No document data available.</p>'
}

// ── TAB: FINANCIAL OUTLOOK ───────────────────────────────────────────────────
function renderHiddenCosts(a, role) {
  const fo       = a.financial_outlook || {}
  const mf       = fo.monthly_fees     || null
  const reserve  = fo.reserve_fund     || null

  // special_assessments / deferred_maintenance / litigation_costs may be {items:[]} or []
  const toArr = v => Array.isArray(v) ? v : (v?.items || [])
  const specAssess = toArr(fo.special_assessments)
  const deferred   = toArr(fo.deferred_maintenance)
  const litigation = toArr(fo.litigation_costs)
  const insurance  = fo.insurance || null

  const ov = a.overall_verdict || {}
  let html = ''

  // Verified cost summary — only items with actual dollar amounts
  const verifiedItems = []
  if (reserve?.shortfall_amount)
    verifiedItems.push({ label: 'Reserve fund shortfall', amount: reserve.shortfall_amount, color: 'red' })
  specAssess.forEach(s => {
    if (s.estimated_amount_per_unit)
      verifiedItems.push({ label: `Special assessment: ${s.description}`, amount: s.estimated_amount_per_unit, color: ['APPROVED','VOTED','LEVIED'].includes(s.status) ? 'red' : 'amber', note: 'per unit' })
  })
  deferred.forEach(d => {
    if (d.estimated_cost)
      verifiedItems.push({ label: d.item, amount: d.estimated_cost, color: 'amber' })
  })
  litigation.forEach(l => {
    if (l.estimated_total_exposure)
      verifiedItems.push({ label: `Legal: ${l.description}`, amount: l.estimated_total_exposure, color: 'red' })
    else if (l.costs_to_date)
      verifiedItems.push({ label: `Legal (costs to date): ${l.description}`, amount: l.costs_to_date, color: 'amber' })
  })

  if (verifiedItems.length) {
    const total = verifiedItems.reduce((sum, i) => sum + Number(i.amount), 0)
    html += `<div class="sec-card-dark">
      <div class="sec-title">💰 Verified Financial Exposure</div>
      ${verifiedItems.map(i => `
        <div style="display:flex;justify-content:space-between;align-items:baseline;padding:.3rem 0;border-bottom:1px solid rgba(255,255,255,.08)">
          <span style="font-size:.85rem;color:rgba(255,255,255,.7)">${i.label}${i.note ? ` <span style="font-size:.75rem;color:rgba(255,255,255,.4)">(${i.note})</span>` : ''}</span>
          <strong style="color:#F87171">${fmt$(i.amount)}</strong>
        </div>`).join('')}
      <div style="display:flex;justify-content:space-between;margin-top:.75rem;padding-top:.5rem;border-top:1px solid rgba(255,255,255,.2)">
        <span style="font-size:.85rem;color:rgba(255,255,255,.5)">Total (verified line items only)</span>
        <strong style="font-size:1.1rem;color:#F9FAFB">${fmt$(total)}</strong>
      </div>
    </div>`
  }

  // Monthly Fees
  if (mf?.current_monthly_fee) {
    const hasIncrease = !!(mf.upcoming_fee || mf.upcoming_fee_percent_change)
    html += `<div class="sec-card ${hasIncrease ? 'sec-card-warn' : ''}">
      <div class="sec-title">📅 Monthly Fees</div>
      <div class="det-row-meta">Current monthly fee: <strong>${fmt$(mf.current_monthly_fee)}</strong></div>
      ${mf.upcoming_fee ? `<div class="det-row-meta" style="color:#B45309">Upcoming: <strong>${fmt$(mf.upcoming_fee)}</strong>${mf.upcoming_fee_date ? ` effective ${mf.upcoming_fee_date}` : ''}${mf.upcoming_fee_percent_change ? ` (+${mf.upcoming_fee_percent_change}%)` : ''}</div>` : ''}
      ${mf.transfer_fees_due_at_closing ? `<div class="det-row-meta">Transfer fees at closing: <strong>${fmt$(mf.transfer_fees_due_at_closing)}</strong></div>` : ''}
    </div>`
  }

  // Reserve Fund
  if (reserve) {
    const pct = reserve.current_percent_funded
    const rfColor     = pct == null ? '' : pct < 50 ? 'rf-low' : pct < 70 ? 'rf-mid' : 'rf-high'
    const rfTextColor = pct == null ? '#9CA3AF' : pct < 50 ? '#B91C1C' : pct < 70 ? '#92400E' : '#065F46'
    html += `<div class="sec-card ${pct != null && pct < 70 ? 'sec-card-warn' : ''}">
      <div class="sec-title">🏦 Reserve Fund</div>
      ${!reserve.has_reserve_study ? `<div class="det-row-meta" style="color:#B91C1C;font-weight:700">⚠ No reserve study found</div>` : ''}
      ${pct != null ? `
        <div class="reserve-row" style="margin-bottom:1rem">
          <div class="reserve-labels">
            <span>${pct}% funded</span>
            <span style="color:${rfTextColor};font-weight:700">${pct < 50 ? 'Underfunded' : pct < 70 ? 'Below threshold' : 'Adequate'}</span>
          </div>
          <div class="reserve-track"><div class="reserve-fill ${rfColor}" style="width:${Math.min(pct,100)}%"></div></div>
        </div>` : ''}
      ${reserve.shortfall_amount       ? `<div class="det-row-meta">Shortfall: <strong>${fmt$(reserve.shortfall_amount)}</strong></div>` : ''}
      ${reserve.projected_funding_year ? `<div class="det-row-meta">Projected fully funded: ${reserve.projected_funding_year}</div>`     : ''}
      ${reserve.board_action_discussed ? `<div class="det-row-meta">Board action: ${reserve.board_action_discussed}</div>`               : ''}
    </div>`
  }

  // Special Assessments
  if (specAssess.length) {
    const hasApproved = specAssess.some(s => ['APPROVED','VOTED','LEVIED'].includes(s.status))
    html += `<div class="sec-card ${hasApproved ? 'sec-card-err' : 'sec-card-warn'}">
      <div class="sec-title">⚡ Special Assessments (${specAssess.length})</div>`
    specAssess.forEach(s => {
      const color = ['APPROVED','VOTED','LEVIED'].includes(s.status) ? 'red' : 'amber'
      html += `
        <div class="det-row dr-${color}">
          <div class="det-row-badges">${sl(color, s.status || 'DISCUSSED')}</div>
          <div class="det-row-title">${s.description}</div>
          ${s.estimated_amount_per_unit ? `<div class="det-row-meta">Est. per unit: <strong>${fmt$(s.estimated_amount_per_unit)}</strong></div>` : ''}
          ${s.likely_timeline           ? `<div class="det-row-meta">Timeline: ${s.likely_timeline}</div>`                                       : ''}
          ${s.source_meeting            ? `<div class="det-row-src">📅 ${s.source_meeting}</div>`                                                 : ''}
        </div>`
    })
    html += `</div>`
  }

  // Deferred Maintenance
  if (deferred.length) {
    html += `<div class="sec-card ${deferred.length > 2 ? 'sec-card-warn' : ''}">
      <div class="sec-title">🔧 Deferred Maintenance (${deferred.length})</div>`
    deferred.forEach(d => {
      html += `
        <div class="det-row dr-amber">
          <div class="det-row-title">${d.item}</div>
          ${d.estimated_cost ? `<div class="det-row-meta">Est. cost: <strong>${fmt$(d.estimated_cost)}</strong></div>` : ''}
          ${d.timeline       ? `<div class="det-row-meta">Timeline: ${d.timeline}</div>` : ''}
          ${d.source_meeting ? `<div class="det-row-src">📅 ${d.source_meeting}</div>` : d.source_document ? `<div class="det-row-src">📄 ${d.source_document}</div>` : ''}
        </div>`
    })
    html += `</div>`
  }

  // Insurance
  if (insurance) {
    const insColor = insurance.coverage_status === 'CURRENT' ? '' : 'sec-card-err'
    html += `<div class="sec-card ${insColor}">
      <div class="sec-title">🛡️ Insurance</div>
      <div class="det-row-meta">Status: ${sl(
        insurance.coverage_status === 'CURRENT' ? 'green' : 'red',
        insurance.coverage_status || 'UNKNOWN'
      )}</div>
      ${insurance.policy_expiration_date ? `<div class="det-row-meta">Policy expires: ${insurance.policy_expiration_date}</div>` : ''}
      ${(insurance.coverage_gaps || []).map(g => `<div class="det-row-meta" style="color:#B91C1C">⚠ ${g}</div>`).join('')}
      ${insurance.deductible_owner_responsibility ? `<div class="det-row-meta">Owner deductible: ${insurance.deductible_owner_responsibility}</div>` : ''}
    </div>`
  }

  // Litigation
  if (litigation.length) {
    html += `<div class="sec-card sec-card-err">
      <div class="sec-title">⚖️ Litigation (${litigation.length})</div>`
    litigation.forEach(l => {
      const color = l.resolution_status === 'SETTLED' ? 'green' : 'red'
      html += `
        <div class="det-row dr-${color}">
          <div class="det-row-badges">${sl(color, l.resolution_status || 'ONGOING')}</div>
          <div class="det-row-title">${l.description}</div>
          ${l.costs_to_date            ? `<div class="det-row-meta">Costs to date: ${fmt$(l.costs_to_date)}</div>`                          : ''}
          ${l.estimated_total_exposure ? `<div class="det-row-meta">Total exposure: <strong>${fmt$(l.estimated_total_exposure)}</strong></div>` : ''}
          ${l.source_meeting           ? `<div class="det-row-src">📅 ${l.source_meeting}</div>` : l.source_document ? `<div class="det-row-src">📄 ${l.source_document}</div>` : ''}
        </div>`
    })
    html += `</div>`
  }

  return html || '<p class="ov-body" style="text-align:center;padding:2rem;color:#9CA3AF">No financial data available.</p>'
}

// ── TAB: COMPLIANCE ──────────────────────────────────────────────────────────
function renderCompliance(a, role) {
  const cc = a.compliance_check
  if (!cc?.items?.length) {
    return '<p class="ov-body" style="text-align:center;padding:2rem;color:#9CA3AF">No compliance data available.</p>'
  }

  const items   = cc.items
  const summary = cc.summary || {}
  const found    = items.filter(i => ['FOUND', 'N/A'].includes(i.status))
  const notFound = items.filter(i => i.status === 'NOT_FOUND')
  const unclear  = items.filter(i => i.status === 'UNCLEAR')

  let html = `
    <div class="comp-summary-bar">
      <div class="comp-sum-col"><div class="comp-sum-label">State</div><div class="comp-sum-value">${cc.state || '—'}</div></div>
      <div class="comp-sum-col"><div class="comp-sum-label">Law</div><div class="comp-sum-value comp-law">${cc.law || '—'}</div></div>
      <div class="comp-sum-col"><div class="comp-sum-label">Overall</div><div class="comp-sum-value">${sl(
        cc.overall_status === 'COMPLIANT' ? 'green' : cc.overall_status === 'PARTIAL' ? 'amber' : 'red',
        cc.overall_status || '—'
      )}</div></div>
      <div class="comp-sum-col"><div class="comp-sum-label">Found / Total</div><div class="comp-sum-value">${found.length} / ${items.length}</div></div>
      ${summary.high_severity_missing ? `<div class="comp-sum-col"><div class="comp-sum-label">High Severity Missing</div><div class="comp-sum-value" style="color:#F87171;font-weight:700">${summary.high_severity_missing}</div></div>` : ''}
      ${summary.new_2026_missing      ? `<div class="comp-sum-col"><div class="comp-sum-label">2026 Req. Missing</div><div class="comp-sum-value" style="color:#F87171;font-weight:700">${summary.new_2026_missing}</div></div>` : ''}
    </div>`

  function compGroup(title, list, statusColor) {
    if (!list.length) return ''
    let h = `<div class="sec-card"><div class="sec-title">${title} (${list.length})</div>`
    list.forEach(item => {
      h += `
        <div class="comp-item ci-${statusColor}">
          <div class="comp-item-head">
            <div class="comp-item-title">${item.title}</div>
            <div class="comp-item-badges">
              ${sl(statusColor, item.status)}
              ${item.severity === 'HIGH' ? sl('red', 'HIGH') : sl('gray', 'MEDIUM')}
              ${item.new_2026 ? sl('blue', 'NEW 2026') : ''}
            </div>
          </div>
          ${item.rcw            ? `<div class="comp-item-rcw">RCW ${item.rcw}</div>`         : ''}
          ${item.notes          ? `<div class="comp-item-notes">${item.notes}</div>`         : ''}
          ${item.action_required ? `<div class="comp-item-action">→ ${item.action_required}</div>` : ''}
          ${item.source         ? `<div class="det-row-src">📄 ${item.source}</div>`         : ''}
        </div>`
    })
    return h + `</div>`
  }

  html += compGroup('❌ Not Found', notFound, 'red')
  html += compGroup('⚠ Unclear',   unclear,  'amber')
  html += compGroup('✅ Found / N/A', found,  'green')

  return html
}

// ── TAB: TIMELINE ────────────────────────────────────────────────────────────
function renderTimeline(a, role) {
  const tl = a.timeline
  if (!tl) {
    return '<p class="ov-body" style="text-align:center;padding:2rem;color:#9CA3AF">No timeline data available.</p>'
  }

  const summary   = tl.timeline_summary || {}
  const allEvents = [
    ...(tl.critical_events   || []).map(e => ({ ...e, _group: 'Critical' })),
    ...(tl.financial_events  || []).map(e => ({ ...e, _group: 'Financial' })),
    ...(tl.document_events   || []).map(e => ({ ...e, _group: 'Document' })),
    ...(tl.governance_events || []).map(e => ({ ...e, _group: 'Governance' }))
  ].sort((a, b) => {
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(b.date) - new Date(a.date)
  })

  if (!allEvents.length) {
    return '<p class="ov-body" style="text-align:center;padding:2rem;color:#9CA3AF">No timeline events found.</p>'
  }

  let html = ''

  if (summary.total_events_found) {
    html += `<div class="tl-summary">
      <div class="tl-sum-stat"><strong>${summary.total_events_found}</strong> total events</div>
      ${summary.critical_events_count   ? `<div class="tl-sum-stat ts-red"><strong>${summary.critical_events_count}</strong> critical</div>` : ''}
      ${summary.overdue_events_count    ? `<div class="tl-sum-stat ts-red"><strong>${summary.overdue_events_count}</strong> overdue</div>` : ''}
      ${summary.events_within_90_days   ? `<div class="tl-sum-stat ts-amber"><strong>${summary.events_within_90_days}</strong> within 90 days</div>` : ''}
      ${summary.total_financial_exposure ? `<div class="tl-sum-stat ts-red"><strong>${fmt$(summary.total_financial_exposure)}</strong> exposure</div>` : ''}
    </div>`
  }

  if (tl.certificate_is_stale) {
    html += `<div class="sec-card sec-card-err">
      <div style="font-weight:700;color:#B91C1C;margin-bottom:.3rem">⚠ Stale Resale Certificate</div>
      <div style="font-size:.84rem;color:#6B7280">Certificate is ${tl.certificate_age_days} days old. Data in this timeline may be outdated.</div>
    </div>`
  }

  html += `<div class="sec-card"><div class="sec-title">📅 All Events (${allEvents.length})</div>`
  allEvents.forEach(ev => {
    const color   = URGENCY_COLOR[ev.urgency] || 'gray'
    const dateStr = ev.date
      ? new Date(ev.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : 'Date unknown'
    // Only mark overdue for unresolved forward-looking deadlines
    // Completed events are historical records — never overdue regardless of date
    const overdue = ev.days_until_event != null
      && ev.days_until_event < 0
      && ev.status !== 'Completed'
      && (ev._group === 'Critical' || ev._group === 'Financial')

    html += `
      <div class="det-row dr-${color}">
        <div class="tl-row-head">
          <div class="tl-date">${dateStr}${overdue ? ` <span class="tl-overdue">Overdue</span>` : ''}</div>
          <div class="det-row-badges">
            ${sl(color, URGENCY_LABEL[ev.urgency] || 'For Your Awareness')}
            ${sl('gray', ev._group)}
          </div>
        </div>
        <div class="det-row-title">${ev.label || ev.event_type_id || 'Event'}</div>
        ${ev.amount       ? `<div class="det-row-meta">Amount: <strong>${fmt$(ev.amount)}</strong></div>` : ''}
        ${ev.buyer_impact ? `<div class="det-row-meta">${ev.buyer_impact}</div>` : ''}
        ${ev.status       ? `<div class="det-row-meta">Status: ${ev.status}</div>` : ''}
        ${ev.source_section ? `<div class="det-row-src">📄 ${ev.source_section}</div>` : ''}
      </div>`
  })
  html += `</div>`

  const missingEvents = tl.missing_events || []
  if (missingEvents.length) {
    html += `<div class="sec-card"><div class="sec-title">❓ Expected But Not Found</div>`
    missingEvents.forEach(me => {
      html += `<div class="det-row dr-amber">
        <div class="det-row-title">${me.label}</div>
        ${me.note ? `<div class="det-row-meta">${me.note}</div>` : ''}
      </div>`
    })
    html += `</div>`
  }

  return html
}

// ── MAIN EXPORT ──────────────────────────────────────────────────────────────
export function renderFullReport(a, role) {
  const allRisks = a.risks?.findings || []

  const riskCount = role === 'lender'
    ? allRisks.filter(r => r.lender_flag).length
    : allRisks.length

  const restrictionsFound = a.restrictions?.restrictions_found || []
  const fo = a.financial_outlook || {}
  const toArr = v => Array.isArray(v) ? v : (v?.items || [])

  const hasFinancial = !!(
    fo.monthly_fees?.current_monthly_fee != null ||
    fo.reserve_fund != null ||
    toArr(fo.special_assessments).length ||
    toArr(fo.deferred_maintenance).length ||
    toArr(fo.litigation_costs).length ||
    fo.insurance != null
  )

  const hasTimeline = !!(a.timeline && (
    (a.timeline.critical_events   || []).length ||
    (a.timeline.financial_events  || []).length ||
    (a.timeline.document_events   || []).length ||
    (a.timeline.governance_events || []).length
  ))

  const tabs = [
    { id: 'overview',     label: 'Overview',          show: true },
    { id: 'risks',        label: 'Risks',             show: riskCount > 0 },
    { id: 'hidden-costs', label: 'Financial Outlook', show: hasFinancial },
    { id: 'timeline',     label: 'Timeline',          show: hasTimeline },
    { id: 'restrictions', label: 'Restrictions',      show: restrictionsFound.length > 0 },
    { id: 'documents',    label: 'Documents',         show: true },
    { id: 'compliance',   label: 'Compliance',        show: !!(a.compliance_check?.items?.length) }
  ].filter(t => t.show)

  // Tab bar
  let tabBarHtml = '<div class="tab-bar">'
  tabs.forEach((tab, i) => {
    tabBarHtml += `<button class="tab-btn${i === 0 ? ' active' : ''}" data-tab="${tab.id}">${tab.label}</button>`
  })
  tabBarHtml += '</div>'

  // Tab panels
  let panelsHtml = ''
  const renderers = {
    'overview':     () => renderOverview(a, role),
    'risks':        () => renderRisks(a, role),
    'restrictions': () => renderRestrictions(a, role),
    'documents':    () => renderDocuments(a, role),
    'hidden-costs': () => renderHiddenCosts(a, role),
    'compliance':   () => renderCompliance(a, role),
    'timeline':     () => renderTimeline(a, role)
  }
  tabs.forEach((tab, i) => {
    const content = renderers[tab.id] ? renderers[tab.id]() : ''
    panelsHtml += `<div class="tab-panel${i === 0 ? ' active' : ''}" data-panel="${tab.id}">${content}</div>`
  })

  _draftPropertyName = a.metadata?.property_address || a.metadata?.hoa_name || ''

  document.getElementById('report-content').innerHTML = tabBarHtml + panelsHtml

  initDraftModal()

  // Draft message button clicks
  document.getElementById('report-content').addEventListener('click', e => {
    const btn = e.target.closest('.draft-msg-btn')
    if (!btn) return
    const risk = JSON.parse(decodeURIComponent(btn.dataset.risk))
    document.dispatchEvent(new CustomEvent('open-draft-modal', { detail: { risk } }))
  })

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'))
      btn.classList.add('active')
      document.querySelector(`[data-panel="${tabId}"]`).classList.add('active')
      window.scrollTo({ top: document.getElementById('report-content').offsetTop - 80, behavior: 'smooth' })
    })
  })
}
