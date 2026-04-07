import '../styles/summary.css'

const URGENCY_COLOR = { CRITICAL: 'red', HIGH: 'red', MEDIUM: 'amber', LOW: 'gray' }
const URGENCY_LABEL = {
  CRITICAL: 'Action Required',
  HIGH:     'Needs Attention',
  MEDIUM:   'Review Recommended',
  LOW:      'For Your Awareness'
}

function sl(colorClass, text) {
  return `<span class="sl sl-${colorClass}">${text}</span>`
}

function fmt$(n) {
  if (n == null || n === '') return null
  return '$' + Number(n).toLocaleString()
}

const toArr = v => Array.isArray(v) ? v : (v?.items || [])

export function renderExecutiveSummary(a, role) {
  const verdict      = a.overall_verdict?.verdict || 'CAUTION'
  const verdictLabel = { CRITICAL: 'Action Required', CAUTION: 'Review Recommended', SAFE: 'No Major Restrictions' }[verdict] || 'Review Recommended'
  const verdictIcon  = { CRITICAL: '!', CAUTION: '!', SAFE: '✓' }[verdict]

  const risks      = a.risks?.findings        || []
  const absences   = a.risks?.notable_absences || []
  const fo         = a.financial_outlook       || {}
  const docs       = a.document_inventory      || []
  const cc         = a.compliance_check
  const missingCrit = a.missing_documents?.critical_missing || []
  const actionItems = Array.isArray(a.action_items) ? a.action_items : (a.action_items?.items || [])

  // Risk counts — computed from actual data
  const cCount = risks.filter(r => r.urgency === 'CRITICAL').length
  const hCount = risks.filter(r => r.urgency === 'HIGH').length
  const mCount = risks.filter(r => r.urgency === 'MEDIUM').length
  const lCount = risks.filter(r => r.urgency === 'LOW').length
  const actionCount = cCount + hCount

  // Financial data — from financial_outlook
  const specAssessments = toArr(fo.special_assessments)
  const approvedAssess  = specAssessments.filter(s => ['APPROVED','VOTED','LEVIED'].includes(s.status))
  const proposedAssess  = specAssessments.filter(s => !['APPROVED','VOTED','LEVIED'].includes(s.status))
  const approvedTotal   = approvedAssess.reduce((n, s) => n + (Number(s.estimated_amount_per_unit) || 0), 0)
  const deferredMaint   = toArr(fo.deferred_maintenance)
  const deferredTotal   = deferredMaint.reduce((n, d) => n + (Number(d.estimated_cost) || 0), 0)
  const litigation      = toArr(fo.litigation_costs)
  const litigationTotal = litigation.reduce((n, l) => n + (Number(l.estimated_total_exposure) || 0), 0)
  const reservePct      = fo.reserve_fund?.current_percent_funded
  const monthlyFee      = fo.monthly_fees?.current_monthly_fee
  const upcomingFee     = fo.monthly_fees?.upcoming_fee
  const hasFinancialData = specAssessments.length || deferredMaint.length || litigation.length || reservePct != null

  const isLender       = role === 'lender'
  const staleCount     = docs.filter(d => d.is_stale).length
  const totalDocIssues = staleCount + missingCrit.length

  let html = ''

  // ── DISCLAIMER ──────────────────────────────────────────────────────────
  html += `
    <div class="summary-disclaimer">
      <span style="font-size:.9rem;flex-shrink:0;margin-top:.1rem">⚠</span>
      <p><strong style="color:#475569">For awareness only — not legal or financial advice.</strong>
      This AI-generated report highlights areas that may need attention. Always verify findings
      with a licensed attorney or real estate professional before making decisions.</p>
    </div>`

  // ── VERDICT HERO ────────────────────────────────────────────────────────
  html += `
    <div class="vh ${verdict}">
      <div class="vh-top">
        <div class="vh-icon">${verdictIcon}</div>
        <div>
          <div class="vh-label">${verdictLabel}</div>
          <div class="vh-reason">${a.overall_verdict?.verdict_reason || ''}</div>
        </div>
      </div>
      <div class="vh-chips">
        ${actionCount ? `<span class="vc vc-red">${actionCount} Action Required</span>` : ''}
        ${mCount      ? `<span class="vc vc-amber">${mCount} Review Recommended</span>` : ''}
        ${lCount      ? `<span class="vc vc-gray">${lCount} For Your Awareness</span>` : ''}
      </div>
    </div>`

  // ── KPI ROW ─────────────────────────────────────────────────────────────
  html += `<div class="kpi-row">`
  if (!isLender) {
    const docsClass  = totalDocIssues > 0 ? 'kpi-warn' : 'kpi-ok'
    const riskClass  = actionCount > 0 ? (verdict === 'CRITICAL' ? 'kpi-bad' : 'kpi-warn') : 'kpi-ok'
    const duesClass  = upcomingFee ? 'kpi-warn' : monthlyFee ? 'kpi-ok' : 'kpi-neutral'
    const riskValCls = verdict === 'CRITICAL' ? 'kv-bad' : verdict === 'CAUTION' ? 'kv-warn' : 'kv-ok'
    const riskStsCls = actionCount > 0 ? (verdict === 'CRITICAL' ? 'ks-bad' : 'ks-warn') : 'ks-ok'

    html += `
      <div class="kpi-card ${docsClass}">
        <div class="kpi-label">Documents Analyzed</div>
        <div class="kpi-value">${docs.length}</div>
        <div class="kpi-status ${totalDocIssues > 0 ? 'ks-warn' : 'ks-ok'}">
          ${totalDocIssues > 0 ? `⚠ ${totalDocIssues} need review` : '✓ All current'}
        </div>
      </div>
      <div class="kpi-card ${riskClass}">
        <div class="kpi-label">Risk Findings</div>
        <div class="kpi-value ${riskValCls}">${actionCount}</div>
        <div class="kpi-status ${riskStsCls}">
          ${actionCount > 0 ? `${mCount} to review · ${lCount} awareness` : '✓ No critical risks'}
        </div>
      </div>
      <div class="kpi-card ${duesClass}">
        <div class="kpi-label">Monthly Dues</div>
        <div class="kpi-value">${monthlyFee ? '$' + Number(monthlyFee).toLocaleString() : '—'}</div>
        <div class="kpi-status ${upcomingFee ? 'ks-warn' : monthlyFee ? 'ks-ok' : 'ks-muted'}">
          ${upcomingFee ? `⚠ Increase → $${Number(upcomingFee).toLocaleString()}` : monthlyFee ? '✓ Stable' : 'Not available'}
        </div>
      </div>`
  } else {
    const lenderRisks = risks.filter(r => r.lender_flag)
    const resClass    = reservePct == null ? 'kpi-neutral' : reservePct < 50 ? 'kpi-bad' : reservePct < 70 ? 'kpi-warn' : 'kpi-ok'
    const litClass    = litigation.length ? 'kpi-bad' : 'kpi-ok'
    const resValCls   = reservePct == null ? '' : reservePct < 50 ? 'kv-bad' : reservePct < 70 ? 'kv-warn' : 'kv-ok'
    const resStsCls   = reservePct == null ? 'ks-muted' : reservePct < 50 ? 'ks-bad' : reservePct < 70 ? 'ks-warn' : 'ks-ok'
    const resSts      = reservePct == null ? 'No data' : reservePct < 50 ? 'Underfunded' : reservePct < 70 ? 'Below threshold' : '✓ Adequate'

    html += `
      <div class="kpi-card ${lenderRisks.length ? 'kpi-bad' : 'kpi-ok'}">
        <div class="kpi-label">Lender Flags</div>
        <div class="kpi-value ${lenderRisks.length ? 'kv-bad' : 'kv-ok'}">${lenderRisks.length}</div>
        <div class="kpi-status ${lenderRisks.length ? 'ks-bad' : 'ks-ok'}">${lenderRisks.length ? 'Items affecting loan approval' : '✓ No flags identified'}</div>
      </div>
      <div class="kpi-card ${resClass}">
        <div class="kpi-label">Reserve Fund</div>
        <div class="kpi-value ${resValCls}">${reservePct != null ? reservePct + '%' : '—'}</div>
        <div class="kpi-status ${resStsCls}">${resSts}</div>
      </div>
      <div class="kpi-card ${litClass}">
        <div class="kpi-label">Active Litigation</div>
        <div class="kpi-value ${litigation.length ? 'kv-bad' : 'kv-ok'}">${litigation.length}</div>
        <div class="kpi-status ${litigation.length ? 'ks-bad' : 'ks-ok'}">${litigation.length ? 'Open cases identified' : '✓ None identified'}</div>
      </div>`
  }
  html += `</div>`

  // ── FINANCIAL STRIP ──────────────────────────────────────────────────────
  {
    const reserveColor     = reservePct == null ? '' : reservePct < 50 ? 'rf-low' : reservePct < 70 ? 'rf-mid' : 'rf-high'
    const reserveTextColor = reservePct == null ? '#9CA3AF' : reservePct < 50 ? '#B91C1C' : reservePct < 70 ? '#92400E' : '#065F46'
    const assessClass      = approvedAssess.length ? 'fsc-red' : proposedAssess.length ? 'fsc-amber' : ''
    const assessValClass   = approvedAssess.length ? 'fsv-red' : proposedAssess.length ? 'fsv-amber' : 'fsv-ok'
    const maintClass       = deferredMaint.length > 2 ? 'fsc-red' : deferredMaint.length ? 'fsc-amber' : ''
    const maintValClass    = deferredMaint.length > 2 ? 'fsv-red' : deferredMaint.length ? 'fsv-amber' : 'fsv-ok'
    const litigClass       = litigation.length ? 'fsc-red' : ''
    const litigValClass    = litigation.length ? 'fsv-red' : 'fsv-ok'

    html += `
      <div class="fin-strip">
        <div class="fin-strip-head">
          <h3>💰 Financial Exposure</h3>
        </div>`

    if (hasFinancialData) {
      html += `
        <div class="fin-sub-grid">
          <div class="fin-sub ${assessClass}">
            <div class="fin-sub-label">Special Assessments</div>
            <div class="fin-sub-value ${assessValClass}">
              ${approvedAssess.length ? approvedAssess.length + ' approved' : proposedAssess.length ? proposedAssess.length + ' proposed' : 'None found'}
            </div>
            <div class="fin-sub-detail">${approvedTotal ? fmt$(approvedTotal) + '/unit confirmed' : proposedAssess.length ? 'Under discussion' : 'No assessments identified'}</div>
          </div>
          <div class="fin-sub ${maintClass}">
            <div class="fin-sub-label">Deferred Maintenance</div>
            <div class="fin-sub-value ${maintValClass}">${deferredMaint.length ? deferredMaint.length + ' items' : 'None found'}</div>
            <div class="fin-sub-detail">${deferredTotal ? fmt$(deferredTotal) + ' est.' : deferredMaint.length ? 'Costs unspecified' : 'No deferred items'}</div>
          </div>
          <div class="fin-sub ${litigClass}">
            <div class="fin-sub-label">Litigation</div>
            <div class="fin-sub-value ${litigValClass}">${litigation.length ? litigation.length + ' active' : 'None found'}</div>
            <div class="fin-sub-detail">${litigationTotal ? fmt$(litigationTotal) + ' exposure' : litigation.length ? 'Exposure unquantified' : 'No litigation identified'}</div>
          </div>
        </div>
        ${reservePct != null ? `
          <div class="reserve-row">
            <div class="reserve-labels">
              <span>Reserve Fund</span>
              <span style="color:${reserveTextColor};font-weight:700">${reservePct}% funded${reservePct < 50 ? ' · Underfunded' : reservePct < 70 ? ' · Below threshold' : ' · Adequate'}</span>
            </div>
            <div class="reserve-track">
              <div class="reserve-fill ${reserveColor}" style="width:${Math.min(reservePct, 100)}%"></div>
            </div>
          </div>` : ''}`
    } else {
      html += `<div class="fin-empty">No financial concerns identified in the provided documents</div>`
    }

    html += `</div>`
  }

  // ── TWO-COLUMN BODY ──────────────────────────────────────────────────────
  let alertsHtml = ''
  const alertsTitle = role === 'lender' ? '🏦 Lender Impact Items' : '⚡ Areas Needing Attention'

  if (role === 'buyer') {
    const topRisks = risks.filter(r => r.urgency === 'CRITICAL' || r.urgency === 'HIGH').slice(0, 5)
    if (!topRisks.length && absences.length) {
      alertsHtml = `<p style="color:#065F46;font-size:.85rem;padding:.5rem 0">✅ No critical concerns identified.</p>`
    } else if (!topRisks.length) {
      alertsHtml = '<p style="color:#9CA3AF;font-size:.85rem;text-align:center;padding:1rem 0">No concerns identified.</p>'
    } else {
      alertsHtml = topRisks.map(r => {
        const color = URGENCY_COLOR[r.urgency] || 'amber'
        return `
          <div class="ac ac-${color}">
            <div class="ac-badges">${sl(color, URGENCY_LABEL[r.urgency])}</div>
            <div class="ac-title">${r.label}</div>
            ${r.buyer_note ? `<div class="ac-desc">${r.buyer_note}</div>` : r.finding ? `<div class="ac-desc">${r.finding}</div>` : ''}
          </div>`
      }).join('')
      const total = risks.filter(r => r.urgency === 'CRITICAL' || r.urgency === 'HIGH').length
      if (total > 5) {
        alertsHtml += `<span class="alert-more" onclick="goToFullReport()">+ ${total - 5} more in Full Report →</span>`
      }
    }

  } else if (role === 'agent') {
    const topRisks = risks.slice(0, 3)
    const actionItems3 = actionItems.filter(i => i.roles?.includes('agent') || i.roles?.includes('all')).slice(0, 2)
    if (topRisks.length) {
      alertsHtml += `<div class="ac-section-label">Risk Findings</div>`
      alertsHtml += topRisks.map(r => `
        <div class="ac ac-${URGENCY_COLOR[r.urgency] || 'amber'}">
          <div class="ac-badges">
            ${sl(URGENCY_COLOR[r.urgency] || 'amber', URGENCY_LABEL[r.urgency] || 'Review Recommended')}
            ${r.lender_flag ? `<span class="sl sl-red" style="font-size:.65rem">⚠ Lender risk</span>` : ''}
            ${r.negotiation_lever === 'Yes' ? `<span class="sl sl-blue" style="font-size:.65rem">✓ Negotiable</span>` : ''}
          </div>
          <div class="ac-title">${r.label}</div>
          ${r.agent_note ? `<div class="ac-desc">${r.agent_note}</div>` : ''}
        </div>`).join('')
    }
    if (actionItems3.length) {
      alertsHtml += `<div class="ac-section-label">Next Steps</div>`
      alertsHtml += actionItems3.map(i => `
        <div class="ac ac-amber">
          <div class="ac-badges">${sl('amber', i.priority === 'IMMEDIATE' ? 'Immediate' : 'Before Closing')}</div>
          <div class="ac-title">${i.action}</div>
        </div>`).join('')
    }
    if (risks.length > 3) {
      alertsHtml += `<span class="alert-more" onclick="goToFullReport()">+ ${risks.length - 3} more in Full Report →</span>`
    }

  } else if (role === 'lender') {
    const lenderRisks = risks.filter(r => r.lender_flag).slice(0, 5)
    if (!lenderRisks.length) {
      alertsHtml = '<p style="color:#9CA3AF;font-size:.85rem;text-align:center;padding:1rem 0">No lender-impact items identified.</p>'
    } else {
      alertsHtml = lenderRisks.map(r => `
        <div class="ac ac-${URGENCY_COLOR[r.urgency] || 'amber'}">
          <div class="ac-badges">${sl(URGENCY_COLOR[r.urgency] || 'amber', URGENCY_LABEL[r.urgency] || 'Review Recommended')}</div>
          <div class="ac-title">${r.label}</div>
          ${r.agent_note || r.buyer_note ? `<div class="ac-desc">${r.agent_note || r.buyer_note}</div>` : ''}
          ${r.source_document ? `<div style="font-size:.74rem;color:#9CA3AF;margin-top:.2rem">📄 ${r.source_document}${r.source_section ? ' · ' + r.source_section : ''}</div>` : ''}
        </div>`).join('')
      const totalLender = risks.filter(r => r.lender_flag).length
      if (totalLender > 5) {
        alertsHtml += `<span class="alert-more" onclick="goToFullReport()">+ ${totalLender - 5} more in Full Report →</span>`
      }
    }
  }

  // Document status
  const currentDocs = docs.filter(d => !d.is_stale)
  const staleDocs   = docs.filter(d =>  d.is_stale)

  let docsHtml = ''
  if (currentDocs.length) {
    docsHtml += `
      <div class="doc-group">
        <div class="doc-group-label">✅ Current (${currentDocs.length})</div>
        ${currentDocs.map(d => `
          <div class="doc-item">
            <span style="font-size:.85rem">📄</span>
            <span class="doc-item-name">${d.document_label}</span>
            <span class="doc-item-meta">${d.page_count ? d.page_count + ' pg' : ''}</span>
          </div>`).join('')}
      </div>`
  }
  if (staleDocs.length) {
    docsHtml += `
      <div class="doc-group">
        <div class="doc-group-label" style="color:#92400E">⚠ Needs Verification (${staleDocs.length})</div>
        ${staleDocs.map(d => `
          <div class="doc-item">
            <span style="font-size:.85rem">📄</span>
            <span class="doc-item-name">${d.document_label}</span>
            <span class="doc-item-meta">${sl('amber', 'Needs Verification')}</span>
          </div>`).join('')}
      </div>`
  }
  if (missingCrit.length) {
    docsHtml += `
      <div class="doc-group">
        <div class="doc-group-label" style="color:#B91C1C">❌ Missing (${missingCrit.length})</div>
        ${missingCrit.map(d => `
          <div class="doc-item">
            <span style="font-size:.85rem">📄</span>
            <span class="doc-item-name">${d.label}</span>
            <span class="doc-item-meta">${sl('red', 'Missing')}</span>
          </div>`).join('')}
      </div>`
  }
  if (!docsHtml) {
    docsHtml = '<p style="color:#9CA3AF;font-size:.85rem">No documents on record.</p>'
  }

  html += `
    <div class="sum-cols">
      <div class="sum-col-card">
        <div class="sum-col-title">${alertsTitle}</div>
        ${alertsHtml}
      </div>
      <div class="sum-col-card">
        <div class="sum-col-title">📋 Document Status</div>
        ${docsHtml}
      </div>
    </div>`

  // ── COMPLIANCE STRIP (WA only) ───────────────────────────────────────────
  if (cc?.items?.length) {
    const found    = cc.items.filter(i => i.status === 'FOUND' || i.status === 'N/A').length
    const notFound = cc.items.filter(i => i.status === 'NOT_FOUND').length
    const unclear  = cc.items.filter(i => i.status === 'UNCLEAR').length

    html += `
      <div class="comp-strip">
        <span class="comp-label">WA Compliance</span>
        <div class="comp-stats">
          <span class="comp-stat cs-found"><strong>${found}</strong> of ${cc.items.length} found</span>
          ${notFound ? `<span class="comp-stat cs-missing"><strong>${notFound}</strong> missing</span>` : ''}
          ${unclear  ? `<span class="comp-stat cs-unclear"><strong>${unclear}</strong> unclear</span>` : ''}
        </div>
        <button class="comp-btn" onclick="goToFullReport()">View Details →</button>
      </div>`
  }

  document.getElementById('summary-content').innerHTML = html
}
