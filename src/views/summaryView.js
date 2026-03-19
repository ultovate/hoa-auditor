import '../styles/summary.css'

const URGENCY_COLOR = { CRITICAL: 'red', HIGH: 'red', MEDIUM: 'amber', LOW: 'gray' }
const URGENCY_LABEL = {
  CRITICAL: 'Restrictions Apply',
  HIGH:     'Restrictions Apply',
  MEDIUM:   'Review Recommended',
  LOW:      'For Your Awareness'
}

function sl(colorClass, text) {
  return `<span class="sl sl-${colorClass}">${text}</span>`
}

export function renderExecutiveSummary(a, role) {
  const verdict      = a.overall_verdict?.verdict || 'CAUTION'
  const verdictLabel = { CRITICAL: 'Restrictions Apply', CAUTION: 'Review Recommended', SAFE: 'No Major Restrictions' }[verdict] || 'Review Recommended'
  const verdictIcon  = { CRITICAL: '!', CAUTION: '!', SAFE: '✓' }[verdict]

  const fp          = a.financial_projections || {}
  const docs        = a.document_inventory || []
  const cc          = a.compliance_check
  const topConcerns = a.buyer_summary?.top_concerns || []
  const txRisks     = a.agent_summary?.transaction_risks || []
  const monthlyCost = a.buyer_summary?.monthly_cost_summary
  const missingCrit = a.missing_documents?.critical_missing || []

  const cCount = a.overall_verdict?.critical_count || 0
  const hCount = a.overall_verdict?.high_count || 0
  const mCount = a.overall_verdict?.medium_count || 0
  const lCount = a.overall_verdict?.low_count || 0
  const restrictionsCount = cCount + hCount

  // Financial
  const specAssessments = fp.special_assessment_discussions || []
  const approvedAssess  = specAssessments.filter(s => ['APPROVED', 'VOTED'].includes(s.status))
  const proposedAssess  = specAssessments.filter(s => !['APPROVED', 'VOTED'].includes(s.status))
  const approvedTotal   = approvedAssess.reduce((n, s) => n + (Number(s.estimated_amount) || 0), 0)
  const deferredMaint   = fp.deferred_maintenance || []
  const deferredTotal   = deferredMaint.reduce((n, d) => n + (Number(d.estimated_cost) || 0), 0)
  const litigation      = fp.litigation_cost_tracking || []
  const litigationTotal = litigation.reduce((n, l) => n + (Number(l.estimated_total_exposure) || 0), 0)
  const reservePct      = fp.reserve_fund_shortfall?.current_percent_funded
  const totalExposure   = fp.projections_summary?.total_identified_exposure || a.overall_verdict?.total_financial_exposure
  const hasFinancialData = specAssessments.length || deferredMaint.length || litigation.length || reservePct != null || totalExposure

  const isLender       = role === 'lender'
  const staleCount     = docs.filter(d => d.is_stale).length
  const totalDocIssues = staleCount + missingCrit.length
  const feeRising      = (fp.fee_increase_discussions?.length || 0) > 0
  const monthlyFee     = monthlyCost?.current_monthly_fee

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
        ${restrictionsCount ? `<span class="vc vc-red">${restrictionsCount} Restrictions Apply</span>` : ''}
        ${mCount ? `<span class="vc vc-amber">${mCount} Review Recommended</span>` : ''}
        ${lCount ? `<span class="vc vc-gray">${lCount} For Your Awareness</span>` : ''}
      </div>
    </div>`

  // ── KPI ROW ─────────────────────────────────────────────────────────────
  html += `<div class="kpi-row">`
  if (!isLender) {
    const docsClass  = totalDocIssues > 0 ? 'kpi-warn' : 'kpi-ok'
    const riskClass  = restrictionsCount > 0 ? (verdict === 'CRITICAL' ? 'kpi-bad' : 'kpi-warn') : 'kpi-ok'
    const duesClass  = feeRising ? 'kpi-warn' : monthlyFee ? 'kpi-ok' : 'kpi-neutral'
    const riskValCls = verdict === 'CRITICAL' ? 'kv-bad' : verdict === 'CAUTION' ? 'kv-warn' : 'kv-ok'
    const riskStsCls = restrictionsCount > 0 ? (verdict === 'CRITICAL' ? 'ks-bad' : 'ks-warn') : 'ks-ok'

    html += `
      <div class="kpi-card ${docsClass}">
        <div class="kpi-label">Documents Analyzed</div>
        <div class="kpi-value">${docs.length}</div>
        <div class="kpi-status ${totalDocIssues > 0 ? 'ks-warn' : 'ks-ok'}">
          ${totalDocIssues > 0 ? `⚠ ${totalDocIssues} need review` : '✓ All current'}
        </div>
      </div>
      <div class="kpi-card ${riskClass}">
        <div class="kpi-label">Risk Areas</div>
        <div class="kpi-value ${riskValCls}">${restrictionsCount}</div>
        <div class="kpi-status ${riskStsCls}">
          ${restrictionsCount > 0 ? `${mCount} to review · ${lCount} awareness` : '✓ No restrictions found'}
        </div>
      </div>
      <div class="kpi-card ${duesClass}">
        <div class="kpi-label">Monthly Dues</div>
        <div class="kpi-value">${monthlyFee ? '$' + Number(monthlyFee).toLocaleString() : '—'}</div>
        <div class="kpi-status ${feeRising ? 'ks-warn' : monthlyFee ? 'ks-ok' : 'ks-muted'}">
          ${feeRising ? '⚠ Increase discussed' : monthlyFee ? '✓ Stable' : 'Not available'}
        </div>
      </div>`
  } else {
    const expClass = totalExposure ? 'kpi-bad' : 'kpi-ok'
    const resClass = reservePct == null ? 'kpi-neutral' : reservePct < 50 ? 'kpi-bad' : reservePct < 70 ? 'kpi-warn' : 'kpi-ok'
    const litClass = litigation.length ? 'kpi-bad' : 'kpi-ok'
    const resValCls = reservePct == null ? '' : reservePct < 50 ? 'kv-bad' : reservePct < 70 ? 'kv-warn' : 'kv-ok'
    const resStsCls = reservePct == null ? 'ks-muted' : reservePct < 50 ? 'ks-bad' : reservePct < 70 ? 'ks-warn' : 'ks-ok'
    const resSts    = reservePct == null ? 'No data' : reservePct < 50 ? 'Underfunded' : reservePct < 70 ? 'Below threshold' : '✓ Adequate'

    html += `
      <div class="kpi-card ${expClass}">
        <div class="kpi-label">Total Exposure</div>
        <div class="kpi-value ${totalExposure ? 'kv-bad' : ''}">${totalExposure ? '$' + Number(totalExposure).toLocaleString() : '—'}</div>
        <div class="kpi-status ${totalExposure ? 'ks-bad' : 'ks-ok'}">${totalExposure ? 'Identified financial risk' : '✓ No exposure identified'}</div>
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

  // ── FINANCIAL STRIP — always rendered ───────────────────────────────────
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
          ${totalExposure ? `<span class="fin-strip-total">Total identified: $${Number(totalExposure).toLocaleString()}</span>` : ''}
        </div>`

    if (hasFinancialData) {
      html += `
        <div class="fin-sub-grid">
          <div class="fin-sub ${assessClass}">
            <div class="fin-sub-label">Special Assessments</div>
            <div class="fin-sub-value ${assessValClass}">
              ${approvedAssess.length ? approvedAssess.length + ' approved' : proposedAssess.length ? proposedAssess.length + ' proposed' : 'None found'}
            </div>
            <div class="fin-sub-detail">${approvedTotal ? '$' + Number(approvedTotal).toLocaleString() + ' confirmed' : proposedAssess.length ? 'Under discussion' : 'No assessments identified'}</div>
          </div>
          <div class="fin-sub ${maintClass}">
            <div class="fin-sub-label">Deferred Maintenance</div>
            <div class="fin-sub-value ${maintValClass}">${deferredMaint.length ? deferredMaint.length + ' unresolved' : 'None found'}</div>
            <div class="fin-sub-detail">${deferredTotal ? '$' + Number(deferredTotal).toLocaleString() + ' est.' : deferredMaint.length ? 'Costs unspecified' : 'No deferred items'}</div>
          </div>
          <div class="fin-sub ${litigClass}">
            <div class="fin-sub-label">Litigation</div>
            <div class="fin-sub-value ${litigValClass}">${litigation.length ? litigation.length + ' active' : 'None found'}</div>
            <div class="fin-sub-detail">${litigationTotal ? '$' + Number(litigationTotal).toLocaleString() + ' exposure' : litigation.length ? 'Exposure unquantified' : 'No litigation identified'}</div>
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
    const concerns = topConcerns.slice(0, 5)
    const vColor   = verdict === 'CRITICAL' ? 'red' : verdict === 'CAUTION' ? 'amber' : 'green'
    if (!concerns.length) {
      alertsHtml = '<p style="color:#9CA3AF;font-size:.85rem;text-align:center;padding:1rem 0">No concerns identified.</p>'
    } else {
      alertsHtml = concerns.map((c, i) => {
        const color = i < 2 ? vColor : 'amber'
        const label = i < 2 ? verdictLabel : 'Review Recommended'
        const title = c.concern?.split(':')[0] || c.concern || 'Concern'
        return `
          <div class="ac ac-${color}">
            <div class="ac-badges">${sl(color, label)}</div>
            <div class="ac-title">${title}</div>
            ${c.why_it_matters ? `<div class="ac-desc">${c.why_it_matters}</div>` : ''}
            ${c.what_to_do ? `<span class="ac-action">→ ${c.what_to_do}</span>` : ''}
          </div>`
      }).join('')
      if (topConcerns.length > 5) {
        alertsHtml += `<span class="alert-more" onclick="goToFullReport()">+ ${topConcerns.length - 5} more in Full Report →</span>`
      }
    }

  } else if (role === 'agent') {
    const risks    = txRisks.slice(0, 3)
    const concerns = topConcerns.slice(0, 2)
    if (risks.length) {
      alertsHtml += `<div class="ac-section-label">Transaction Risks</div>`
      alertsHtml += risks.map(r => `
        <div class="ac ac-${URGENCY_COLOR[r.urgency] || 'amber'}">
          <div class="ac-badges">
            ${sl(URGENCY_COLOR[r.urgency] || 'amber', URGENCY_LABEL[r.urgency] || 'Review Recommended')}
            ${r.lender_impact ? `<span class="sl sl-red" style="font-size:.65rem">⚠ Lender risk</span>` : ''}
          </div>
          <div class="ac-title">${r.risk}</div>
          ${r.negotiation_lever && r.negotiation_lever !== 'No' ? `<div style="font-size:.76rem;color:#065F46;font-weight:600;margin-top:.2rem">✓ Negotiation opportunity</div>` : ''}
        </div>`).join('')
    }
    if (concerns.length) {
      alertsHtml += `<div class="ac-section-label">Buyer Concerns</div>`
      alertsHtml += concerns.map(c => `
        <div class="ac ac-amber">
          <div class="ac-badges">${sl('amber', 'Review Recommended')}</div>
          <div class="ac-title">${c.concern?.split(':')[0] || c.concern || 'Concern'}</div>
          ${c.why_it_matters ? `<div class="ac-desc">${c.why_it_matters}</div>` : ''}
        </div>`).join('')
    }
    const total = txRisks.length + topConcerns.length
    const shown = risks.length + concerns.length
    if (total > shown) {
      alertsHtml += `<span class="alert-more" onclick="goToFullReport()">+ ${total - shown} more in Full Report →</span>`
    }

  } else if (role === 'lender') {
    const lenderRisks = txRisks.filter(r => r.lender_impact).slice(0, 5)
    if (!lenderRisks.length) {
      alertsHtml = '<p style="color:#9CA3AF;font-size:.85rem;text-align:center;padding:1rem 0">No lender-impact items identified.</p>'
    } else {
      alertsHtml = lenderRisks.map(r => `
        <div class="ac ac-${URGENCY_COLOR[r.urgency] || 'amber'}">
          <div class="ac-badges">${sl(URGENCY_COLOR[r.urgency] || 'amber', URGENCY_LABEL[r.urgency] || 'Review Recommended')}</div>
          <div class="ac-title">${r.risk}</div>
          ${r.source_section ? `<div style="font-size:.74rem;color:#9CA3AF;margin-top:.2rem">📄 ${r.source_section}</div>` : ''}
        </div>`).join('')
      const totalLender = txRisks.filter(r => r.lender_impact).length
      if (totalLender > 5) {
        alertsHtml += `<span class="alert-more" onclick="goToFullReport()">+ ${totalLender - 5} more in Full Report →</span>`
      }
    }
  }

  // Document status — grouped by state
  const currentDocs = docs.filter(d => !d.is_stale)
  const staleDocs   = docs.filter(d => d.is_stale)

  const docIcon = (state) => state === 'stale' ? '⚠️' : state === 'missing' ? '❌' : '✅'

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
