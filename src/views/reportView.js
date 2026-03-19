import '../styles/report.css'

const URGENCY_COLOR = { CRITICAL: 'red', HIGH: 'red', MEDIUM: 'amber', LOW: 'gray' }
const URGENCY_LABEL = {
  CRITICAL: 'Restrictions Apply',
  HIGH:     'Restrictions Apply',
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
  const bs = a.buyer_summary  || {}
  const as = a.agent_summary  || {}
  const md = a.missing_documents || {}
  let html = ''

  if (role === 'buyer') {
    if (bs.headline) {
      html += `<div class="ov-headline">${bs.headline}</div>`
    }
    if (bs.what_we_found) {
      html += `<div class="sec-card"><div class="sec-title">What We Found</div><p class="ov-body">${bs.what_we_found}</p></div>`
    }
    if (bs.green_lights || bs.lifestyle_flags) {
      html += `<div class="ov-two">`
      if (bs.green_lights)    html += `<div class="sec-card ov-green-card"><div class="sec-title">✅ What Looks Good</div><p class="ov-body">${bs.green_lights}</p></div>`
      if (bs.lifestyle_flags) html += `<div class="sec-card ov-amber-card"><div class="sec-title">🏠 Lifestyle Flags</div><p class="ov-body">${bs.lifestyle_flags}</p></div>`
      html += `</div>`
    }

  } else if (role === 'agent') {
    const badge = as.verdict_badge || 'CAUTION'
    const badgeColor = badge === 'CRITICAL' ? 'red' : badge === 'SAFE' ? 'green' : 'amber'
    html += `<div class="ov-verdict-row">${sl(badgeColor, badge)}${as.lender_flags ? `<span style="font-size:.83rem;color:#6B7280;margin-left:.75rem">⚠ Lender flags present</span>` : ''}</div>`

    if (as.recommended_next_steps?.length) {
      html += `<div class="sec-card"><div class="sec-title">✅ Recommended Next Steps</div><ol class="ov-list">`
      as.recommended_next_steps.forEach(s => { html += `<li>${s}</li>` })
      html += `</ol></div>`
    }
    if (as.seller_negotiation_points?.length) {
      html += `<div class="sec-card"><div class="sec-title">🤝 Transaction Considerations</div><ul class="ov-list">`
      as.seller_negotiation_points.forEach(s => { html += `<li>${s}</li>` })
      html += `</ul></div>`
    }
    if (as.lender_flags) {
      const flags = Array.isArray(as.lender_flags)
        ? as.lender_flags
        : as.lender_flags.split(/\n|;\s*/).map(s => s.trim()).filter(Boolean)
      html += `<div class="sec-card ov-red-card"><div class="sec-title">🏦 Lender Flags</div><ul class="ov-list">`
      flags.forEach(f => { html += `<li>${f}</li>` })
      html += `</ul></div>`
    }

  } else if (role === 'lender') {
    const fp = a.financial_projections || {}
    const totalExposure = fp.projections_summary?.total_identified_exposure
                       || a.overall_verdict?.total_financial_exposure
    if (fp.projections_summary?.buyer_headline || totalExposure) {
      html += `<div class="sec-card ov-red-card">
        <div class="sec-title">💰 Financial Risk Summary</div>
        ${fp.projections_summary?.buyer_headline ? `<p class="ov-body">${fp.projections_summary.buyer_headline}</p>` : ''}
        ${totalExposure ? `<div class="ov-exposure">Total identified exposure: <strong>${fmt$(totalExposure)}</strong></div>` : ''}
      </div>`
    }
    const lenderRisks = (as.transaction_risks || []).filter(r => r.lender_impact)
    if (lenderRisks.length) {
      html += `<div class="sec-card"><div class="sec-title">🏦 Lender Impact Items (${lenderRisks.length})</div>`
      lenderRisks.forEach(r => {
        html += `
          <div class="det-row dr-${URGENCY_COLOR[r.urgency] || 'amber'}">
            <div class="det-row-badges">${sl(URGENCY_COLOR[r.urgency] || 'amber', URGENCY_LABEL[r.urgency] || 'Review Recommended')}</div>
            <div class="det-row-title">${r.risk}</div>
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
  let risks = []

  if (role === 'lender') {
    risks = (a.agent_summary?.transaction_risks || []).filter(r => r.lender_impact)
  } else if (role === 'agent') {
    risks = a.agent_summary?.transaction_risks || []
  } else {
    // buyer: prefer risk_findings, fall back to transaction_risks
    const rf = (a.risk_findings?.findings || []).map(f => ({
      risk: f.label || f.finding,
      urgency: f.urgency,
      lender_impact: false,
      negotiation_lever: null,
      source_document: f.source_document,
      source_section:  f.source_section,
      buyer_impact:    f.buyer_impact,
      _finding:        f.finding
    }))
    risks = rf.length ? rf : (a.agent_summary?.transaction_risks || [])
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
      html += `
        <div class="det-row dr-${color}">
          <div class="det-row-badges">
            ${sl(color, urgency)}
            ${r.lender_impact ? sl('red', '⚠ Lender Risk') : ''}
            ${r.negotiation_lever === 'Yes' ? sl('blue', '✓ Negotiable') : r.negotiation_lever === 'Maybe' ? sl('gray', '~ Maybe') : ''}
          </div>
          <div class="det-row-title">${r.risk || r.label || ''}</div>
          ${r._finding && r._finding !== r.risk ? `<div class="det-row-meta">${r._finding}</div>` : ''}
          ${r.buyer_impact ? `<div class="det-row-meta">${r.buyer_impact}</div>` : ''}
          ${r.source_document ? `<div class="det-row-src">📄 ${r.source_document}${r.source_section ? ' · ' + r.source_section : ''}</div>` : ''}
        </div>`
    })
    html += `</div>`
  })

  // Notable absences
  const absences = a.risk_findings?.notable_absences || []
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

// ── TAB: HIDDEN COSTS ────────────────────────────────────────────────────────
function renderHiddenCosts(a, role) {
  const fp          = a.financial_projections || {}
  const deferred    = fp.deferred_maintenance             || []
  const specAssess  = fp.special_assessment_discussions   || []
  const reserve     = fp.reserve_fund_shortfall
  const feeIncrease = fp.fee_increase_discussions         || []
  const litigation  = fp.litigation_cost_tracking         || []
  const wishlist    = fp.capital_improvements_wishlist    || []
  const projSum     = fp.projections_summary
  let html = ''

  // Summary headline (dark card)
  if (projSum) {
    const total = projSum.total_identified_exposure
    html += `<div class="sec-card-dark">
      <div class="sec-title">💰 Financial Exposure Summary</div>
      ${projSum.buyer_headline ? `<p class="ov-body" style="color:rgba(255,255,255,.75);margin-bottom:.75rem">${projSum.buyer_headline}</p>` : ''}
      ${total ? `<div class="exp-total">Total identified: <strong>${fmt$(total)}</strong></div>` : ''}
      ${projSum.highest_risk_item ? `<div style="font-size:.8rem;color:rgba(255,255,255,.5);margin-top:.5rem">Highest risk: ${projSum.highest_risk_item}</div>` : ''}
    </div>`
  }

  // Reserve Fund
  if (reserve) {
    const pct = reserve.current_percent_funded
    const rfColor     = pct == null ? '' : pct < 50 ? 'rf-low' : pct < 70 ? 'rf-mid' : 'rf-high'
    const rfTextColor = pct == null ? '#9CA3AF' : pct < 50 ? '#B91C1C' : pct < 70 ? '#92400E' : '#065F46'
    html += `<div class="sec-card ${pct != null && pct < 70 ? 'sec-card-warn' : ''}">
      <div class="sec-title">🏦 Reserve Fund</div>
      ${pct != null ? `
        <div class="reserve-row" style="margin-bottom:1rem">
          <div class="reserve-labels">
            <span>${pct}% funded</span>
            <span style="color:${rfTextColor};font-weight:700">${pct < 50 ? 'Underfunded' : pct < 70 ? 'Below threshold' : 'Adequate'}</span>
          </div>
          <div class="reserve-track"><div class="reserve-fill ${rfColor}" style="width:${Math.min(pct,100)}%"></div></div>
        </div>` : ''}
      ${reserve.shortfall_amount         ? `<div class="det-row-meta">Shortfall: <strong>${fmt$(reserve.shortfall_amount)}</strong></div>` : ''}
      ${reserve.projected_funding_year   ? `<div class="det-row-meta">Projected fully funded: ${reserve.projected_funding_year}</div>`     : ''}
      ${reserve.board_action_discussed   ? `<div class="det-row-meta">Board action: ${reserve.board_action_discussed}</div>`               : ''}
    </div>`
  }

  // Special Assessments
  if (specAssess.length) {
    const hasApproved = specAssess.some(s => ['APPROVED','VOTED'].includes(s.status))
    html += `<div class="sec-card ${hasApproved ? 'sec-card-err' : 'sec-card-warn'}">
      <div class="sec-title">⚡ Special Assessments (${specAssess.length})</div>`
    specAssess.forEach(s => {
      const color = ['APPROVED','VOTED'].includes(s.status) ? 'red' : 'amber'
      html += `
        <div class="det-row dr-${color}">
          <div class="det-row-badges">${sl(color, s.status || 'DISCUSSED')}</div>
          <div class="det-row-title">${s.description}</div>
          ${s.estimated_amount  ? `<div class="det-row-meta">Est. per unit: <strong>${fmt$(s.estimated_amount)}</strong></div>` : ''}
          ${s.likely_timeline   ? `<div class="det-row-meta">Timeline: ${s.likely_timeline}</div>`                               : ''}
          ${s.source_meeting    ? `<div class="det-row-src">📅 ${s.source_meeting}</div>`                                         : ''}
        </div>`
    })
    html += `</div>`
  }

  // Deferred Maintenance
  if (deferred.length) {
    html += `<div class="sec-card ${deferred.length > 2 ? 'sec-card-warn' : ''}">
      <div class="sec-title">🔧 Deferred Maintenance (${deferred.length})</div>`
    deferred.forEach(d => {
      const color = URGENCY_COLOR[d.urgency] || 'amber'
      html += `
        <div class="det-row dr-${color}">
          <div class="det-row-badges">${sl(color, URGENCY_LABEL[d.urgency] || 'Review Recommended')}</div>
          <div class="det-row-title">${d.item}</div>
          ${d.estimated_cost ? `<div class="det-row-meta">Est. cost: <strong>${fmt$(d.estimated_cost)}</strong></div>` : ''}
          ${d.timeline       ? `<div class="det-row-meta">Timeline: ${d.timeline}</div>` : ''}
          ${d.source_meeting ? `<div class="det-row-src">📅 ${d.source_meeting}</div>` : d.source_document ? `<div class="det-row-src">📄 ${d.source_document}</div>` : ''}
        </div>`
    })
    html += `</div>`
  }

  // Fee Increases
  if (feeIncrease.length) {
    html += `<div class="sec-card sec-card-warn">
      <div class="sec-title">📈 Fee Increase Discussions (${feeIncrease.length})</div>`
    feeIncrease.forEach(f => {
      const color = f.status === 'APPROVED' ? 'red' : 'amber'
      html += `
        <div class="det-row dr-${color}">
          <div class="det-row-badges">${sl(color, f.status || 'DISCUSSED')}</div>
          <div class="det-row-title">${f.fee_type || 'Fee Increase'}</div>
          ${f.current_amount && f.proposed_amount ? `<div class="det-row-meta">${fmt$(f.current_amount)} → <strong>${fmt$(f.proposed_amount)}</strong>${f.percent_change ? ` (+${f.percent_change}%)` : ''}</div>` : ''}
          ${f.effective_date ? `<div class="det-row-meta">Effective: ${f.effective_date}</div>` : ''}
          ${f.source_meeting ? `<div class="det-row-src">📅 ${f.source_meeting}</div>` : ''}
        </div>`
    })
    html += `</div>`
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
          ${l.costs_to_date           ? `<div class="det-row-meta">Costs to date: ${fmt$(l.costs_to_date)}</div>`                   : ''}
          ${l.estimated_total_exposure ? `<div class="det-row-meta">Total exposure: <strong>${fmt$(l.estimated_total_exposure)}</strong></div>` : ''}
          ${l.source_meeting          ? `<div class="det-row-src">📅 ${l.source_meeting}</div>` : l.source_document ? `<div class="det-row-src">📄 ${l.source_document}</div>` : ''}
        </div>`
    })
    html += `</div>`
  }

  // Capital Improvements Wishlist
  if (wishlist.length) {
    html += `<div class="sec-card"><div class="sec-title">🏗️ Capital Improvements Wishlist (${wishlist.length})</div>`
    wishlist.forEach(w => {
      const color = w.status === 'APPROVED' ? 'amber' : 'gray'
      html += `
        <div class="det-row dr-${color}">
          <div class="det-row-badges">${sl(color, w.status || 'WISH_LIST')}</div>
          <div class="det-row-title">${w.item}</div>
          ${w.estimated_cost ? `<div class="det-row-meta">Est. cost: ${fmt$(w.estimated_cost)}</div>` : ''}
          ${w.source_meeting ? `<div class="det-row-src">📅 ${w.source_meeting}</div>` : ''}
        </div>`
    })
    html += `</div>`
  }

  return html || '<p class="ov-body" style="text-align:center;padding:2rem;color:#9CA3AF">No financial projections data available.</p>'
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
    return new Date(a.date) - new Date(b.date)
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
    const overdue = ev.days_until_event != null && ev.days_until_event < 0

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
  const txRisks    = a.agent_summary?.transaction_risks || []
  const rfFindings = a.risk_findings?.findings          || []

  const riskCount = role === 'lender'
    ? txRisks.filter(r => r.lender_impact).length
    : (rfFindings.length || txRisks.length)
  const riskUrgent = (a.overall_verdict?.critical_count || 0) + (a.overall_verdict?.high_count || 0) > 0

  const restrictionsFound = a.restrictions?.restrictions_found || []
  const fp = a.financial_projections || {}

  const hasFinancial = !!(
    (fp.deferred_maintenance             || []).length ||
    (fp.special_assessment_discussions   || []).length ||
    (fp.litigation_cost_tracking         || []).length ||
    (fp.fee_increase_discussions         || []).length ||
    fp.reserve_fund_shortfall?.current_percent_funded != null ||
    fp.projections_summary
  )

  const hasTimeline = !!(a.timeline && (
    (a.timeline.critical_events   || []).length ||
    (a.timeline.financial_events  || []).length ||
    (a.timeline.document_events   || []).length ||
    (a.timeline.governance_events || []).length
  ))

  const tabs = [
    { id: 'overview',     label: 'Overview',          show: true },
    { id: 'risks',        label: 'Risks',             show: riskCount > 0,              count: riskCount, urgent: riskUrgent },
    { id: 'hidden-costs', label: 'Financial Outlook', show: hasFinancial },
    { id: 'timeline',     label: 'Timeline',          show: hasTimeline },
    { id: 'restrictions', label: 'Restrictions',      show: restrictionsFound.length > 0, count: restrictionsFound.length },
    { id: 'documents',    label: 'Documents',         show: true,                        count: (a.document_inventory || []).length },
    { id: 'compliance',   label: 'Compliance',        show: !!(a.compliance_check?.items?.length) }
  ].filter(t => t.show)

  // Tab bar
  let tabBarHtml = '<div class="tab-bar">'
  tabs.forEach((tab, i) => {
    const countChip = tab.count ? `<span class="tab-count">${tab.count > 99 ? '99+' : tab.count}</span>` : ''
    const urgentCls = tab.urgent ? ' has-urgent' : ''
    tabBarHtml += `<button class="tab-btn${i === 0 ? ' active' : ''}${urgentCls}" data-tab="${tab.id}">${tab.label}${countChip}</button>`
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

  document.getElementById('report-content').innerHTML = tabBarHtml + panelsHtml

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
