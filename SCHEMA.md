# HOA Auditor — Canonical Schema Reference

**Schema version:** 2.0
**Source of truth for AI fill rules:** `hoa-pdf-converter/schemas/report_schema.json`
**This file:** UI-facing field reference — what the frontend reads and the contracts it relies on.

---

## 3-Layer Contract

```
Layer 1 — AI (Gemini)        reads raw PDF text, knows nothing about the UI
       ↓  canonical JSON (v2.0)
Layer 2 — Schema             single source of truth, validated, versioned
       ↓  validated, typed data
Layer 3 — UI (Vite + JS)     reads schema only, never parses AI text directly
```

The UI must never infer severity or data quality from free-text fields.
All urgency lives in `risks.findings[].urgency`. All data freshness lives in `document_inventory`.

---

## Top-Level Structure

```json
{
  "metadata":               { ... },
  "document_inventory":     [ ... ],
  "overall_verdict":        { ... },
  "risks":                  { "findings": [...], "notable_absences": [...] },
  "timeline":               { ... },
  "restrictions":           { ... },
  "buyer_profile_verdicts": { "verdicts": [...] },
  "financial_outlook":      { ... },
  "action_items":           [ ... ],
  "missing_documents":      { ... },
  "compliance_check":       { ... }
}
```

Sections are **conditional** — only present when the relevant documents were analysed.
The UI must always guard with `|| {}` or `|| []` before accessing any section.

---

## Section Reference

### `metadata`
Always present.

| Field | Type | Notes |
|---|---|---|
| `report_id` | string | Unique ID — `{slug}_{YYYYMMDD}_{HHMMSS}` |
| `schema_version` | string | Must be `"2.0"` |
| `generated_at` | ISO timestamp | When the report was generated |
| `property_address` | string | Full address |
| `hoa_name` | string | HOA or condominium association name |
| `state` | string | Two-letter state code e.g. `WA` |
| `documents_analysed_count` | integer | Count of docs in `document_inventory` |
| `pipeline_version` | string | Worker/prompt version |
| `isolation_confirmed` | boolean | True = no carryover from prior analysis |

---

### `document_inventory`
Always present. **Arrives as an array** — UI must convert to a map for staleness lookups.

```js
// UI conversion (done in buyerView.js renderBuyerView)
const docMap = inventory.reduce((m, d) => { m[d.document_type_id] = d; return m }, {})
```

| Field | Type | Notes |
|---|---|---|
| `document_type_id` | string | Key for lookups: `BUDGET`, `RESERVE_STUDY`, `RESALE_CERT`, `INSURANCE_CERT`, `MEETING_MINUTES`, `CCRS`, `FINANCIAL_STATEMENT` |
| `document_label` | string | Human-readable name |
| `filename` | string | Original filename |
| `date` | `YYYY-MM-DD` | Document date |
| `age_days` | integer | Days since document date at report generation |
| `confidence` | `0.0–1.0` | Classification confidence |
| `is_stale` | boolean | True if `age_days` exceeds the max for this doc type |
| `routed_to` | string[] | Which AI agents processed this doc |
| `notes` | string | Staleness flags or classification concerns |

#### Data Quality States (UI Contract)
The UI derives one of three states for any data point:

| State | Condition | UI Treatment |
|---|---|---|
| `FRESH` | Source doc exists in inventory AND `is_stale: false` | Show data as-is, no badge |
| `STALE` | Source doc exists AND `is_stale: true` | Show data + yellow "As of [date]" badge |
| `MISSING` | Source doc not in inventory OR `source_document` is null | Show "—" or "Not on file" badge |

**Rule:** The UI shows what the JSON says. It never estimates, fills in, or interpolates missing data.

---

### `overall_verdict`
Always present.

| Field | Type | Notes |
|---|---|---|
| `verdict` | `CRITICAL \| CAUTION \| SAFE` | Top-level verdict |
| `verdict_reason` | string | One sentence — why this verdict |
| `highest_urgency_risk_id` | string | Points to `risks.findings[].risk_id` |
| `total_financial_exposure` | number | Sum of CRITICAL + HIGH financial amounts |

---

### `risks`
Always present. **Single source of truth for urgency** — no other section assigns severity independently.

#### `risks.findings[]`

| Field | Type | Notes |
|---|---|---|
| `risk_id` | string | Format: `CATEGORY_01` e.g. `RESERVE_FUNDING_01` |
| `risk_category_id` | string | From `risk_categories.json` |
| `label` | string | Short human-readable label |
| `urgency` | `CRITICAL \| HIGH \| MEDIUM \| LOW` | **The only place this finding's severity is stated** |
| `verdict_label` | string | Display label e.g. `"CRITICALLY UNDERFUNDED"` |
| `finding` | string | Factual finding from the document |
| `source_document` | string | `document_type_id` |
| `source_section` | string | Section/article reference |
| `lender_flag` | boolean | True = commonly triggers lender denial |
| `negotiation_lever` | `Yes \| No \| Maybe` | Can this be negotiated |
| `buyer_note` | string | Plain English for buyer |
| `agent_note` | string | Professional note for agent (omitted if same as buyer_note) |
| `is_restriction_risk` | boolean | Originated from CC&R/Bylaw |
| `is_financial_risk` | boolean | Originated from financial doc |

#### `risks.notable_absences[]`
Explicit confirmation a risk category was searched and not found. UI can display "No known litigation" etc.

---

### `buyer_profile_verdicts`
Present when `restrictions` section is populated.

#### `buyer_profile_verdicts.verdicts[]`

| Field | Type | Notes |
|---|---|---|
| `buyer_type_id` | string | e.g. `AIRBNB_INVESTOR`, `PET_OWNER_LARGE_DOG`, `RENOVATOR` |
| `buyer_type_label` | string | Human-readable label |
| `verdict` | `DO NOT BUY \| CAUTION \| OK` | |
| `dealbreakers` | string[] | Rules that are dealbreakers for this buyer type |
| `concerns` | string[] | Rules worth noting but not dealbreakers |
| `verdict_reason` | string | One sentence plain English summary |

---

### `financial_outlook`
Conditional — present when financial documents were analysed. Each sub-section is independently conditional.

#### `financial_outlook.monthly_fees`
Present when `RESALE_CERT` or `BUDGET` found.

| Field | Type | Notes |
|---|---|---|
| `current_monthly_fee` | number | Current monthly dues |
| `upcoming_fee` | number \| null | Scheduled increase amount |
| `upcoming_fee_date` | `YYYY-MM-DD` \| null | When increase takes effect |
| `upcoming_fee_percent_change` | number \| null | e.g. `15` for 15% |
| `transfer_fees_due_at_closing` | number \| null | Total one-time fees at closing |
| `source_document` | string | `document_type_id` — used for data quality check |
| `source_section` | string | Section reference |
| `risk_id` | string \| null | Points to `risks.findings[]` if fee is HIGH/CRITICAL |

#### `financial_outlook.reserve_fund`
Present when `RESERVE_STUDY` or `RESALE_CERT` found.

| Field | Type | Notes |
|---|---|---|
| `has_reserve_study` | boolean | |
| `reserve_study_date` | `YYYY-MM-DD` \| null | |
| `reserve_study_age_days` | integer \| null | UI uses `> 365` as stale threshold |
| `current_percent_funded` | integer \| null | e.g. `45` for 45% funded |
| `shortfall_amount` | number \| null | Dollar gap to fully funded |
| `projected_funding_year` | integer \| null | Year reserve reaches 100% |
| `board_action_discussed` | string \| null | What the board discussed about the shortfall |
| `source_document` | string | `document_type_id` |
| `risk_id` | string \| null | **Must be present** if `has_reserve_study: false` OR `current_percent_funded < 70` |

**Reserve fund % UI thresholds:**

| % Funded | State | Color | Plain-English Label |
|---|---|---|---|
| ≥ 70% | Healthy | Green | "Well-funded — the HOA has set aside most of what it needs." |
| 40–69% | Watch | Amber | "Partially funded — a special assessment is possible." |
| < 40% | Risk | Red | "Under-funded — higher risk of a special assessment." |

#### `financial_outlook.special_assessments`
Present when `RESALE_CERT`, `MEETING_MINUTES`, or `SPECIAL_ASSESSMENT` found. Arrives as `.items[]`.

| Field | Type | Notes |
|---|---|---|
| `description` | string | What the assessment is for |
| `estimated_amount_per_unit` | number \| null | Per-unit dollar amount |
| `status` | string | `LEVIED \| APPROVED \| VOTED \| PROPOSED \| PRELIMINARY \| DISCUSSED \| RUMORED` |
| `likely_timeline` | string \| null | When due or expected |
| `source_document` | string | `document_type_id` |
| `risk_id` | string \| null | Must be present for `LEVIED/APPROVED/VOTED`; required for `PROPOSED` if > $500 |

**UI grouping rule:**
- `LEVIED / APPROVED / VOTED` → confirmed, show in Col 2 cash flow boxes
- All others → potential, show in Col 3 risk cards

#### `financial_outlook.deferred_maintenance`
Present when `MEETING_MINUTES` or `RESERVE_STUDY` found. Arrives as `.items[]`.

| Field | Type | Notes |
|---|---|---|
| `item` | string | Plain English description |
| `estimated_cost` | number \| null | Dollar amount |
| `timeline` | string \| null | When it needs to be addressed |
| `source_document` | string | `document_type_id` |
| `risk_id` | string \| null | Present if HIGH or CRITICAL severity |

#### `financial_outlook.insurance`

| Field | Type | Notes |
|---|---|---|
| `coverage_status` | string | `CURRENT \| LAPSED \| EXPIRING_SOON \| GAPS_IDENTIFIED \| UNKNOWN` |
| `policy_expiration_date` | `YYYY-MM-DD` \| null | |
| `coverage_gaps` | string[] | Plain English gap descriptions |
| `deductible_owner_responsibility` | string \| null | Owner's deductible obligation |
| `source_document` | string | `document_type_id` |
| `risk_id` | string \| null | Must be present if `LAPSED` or `GAPS_IDENTIFIED` |

#### `financial_outlook.litigation_costs`
Arrives as `.items[]`.

| Field | Type | Notes |
|---|---|---|
| `description` | string | Nature of the legal matter |
| `costs_to_date` | number \| null | Legal costs incurred |
| `estimated_total_exposure` | number \| null | Total estimated exposure |
| `resolution_status` | string | `ONGOING \| SETTLED \| PENDING \| THREATENED` |
| `source_document` | string | `document_type_id` |
| `risk_id` | string \| null | Must be present for `ONGOING` or `PENDING` |

---

### `action_items`
Always present. Tagged by role so UI can filter by audience.

| Field | Type | Notes |
|---|---|---|
| `action_id` | integer | Sequential |
| `priority` | string | `IMMEDIATE \| BEFORE_CLOSING \| AFTER_CLOSING \| ONGOING` |
| `roles` | string[] | `buyer \| agent \| lender \| all` |
| `action` | string | Actionable instruction starting with a verb |
| `why` | string | Consequence of not acting |
| `risk_id` | string \| null | Points to `risks.findings[]` if addressing a specific risk |

**UI filter rule:** For buyer page, show items where `roles` includes `"buyer"` or `"all"`.

---

### `missing_documents`
Always present.

| Field | Type | Notes |
|---|---|---|
| `critical_missing[]` | array | Docs that block reliable analysis |
| `recommended_missing[]` | array | Docs that would add insight |
| `analysis_completeness` | string | `FULL \| PARTIAL \| MINIMAL` |

Each item in `critical_missing` / `recommended_missing`:

| Field | Notes |
|---|---|
| `document_type_id` | Key matching `document_types.json` |
| `label` | Human-readable name |
| `why_critical` / `why_recommended` | What analysis is blocked or missing |
| `how_to_obtain` | Who to request it from |

---

### `compliance_check`
Present only when a state checklist applies (currently WA).

| Field | Type | Notes |
|---|---|---|
| `state` | string | e.g. `WA` |
| `law` | string | e.g. `RCW 64.90.640` |
| `overall_status` | string | `COMPLIANT \| PARTIAL \| NON_COMPLIANT` |
| `items[]` | array | Per-checklist-item results |

Each item:

| Field | Notes |
|---|---|
| `id` | e.g. `wa_b` |
| `title` | Human-readable |
| `severity` | `HIGH \| MEDIUM` |
| `new_2026` | Boolean — new 2026 requirement |
| `status` | `FOUND \| NOT_FOUND \| UNCLEAR \| N/A` |
| `notes` | What was found or why it's missing |
| `action_required` | Specific action if `NOT_FOUND \| UNCLEAR`, otherwise null |
| `risk_id` | Points to `risks.findings[]` if this generated a risk entry |

---

## Cross-Reference Rules (Summary)

The AI enforces these; the UI relies on them being valid:

| Rule | Contract |
|---|---|
| XR-1 | `restrictions[].risk_id` must match a `risks.findings[]` entry |
| XR-2 | `financial_outlook` risk_ids must match `risks.findings[]` |
| XR-3 | `compliance_check` risk_ids must match `risks.findings[]` |
| XR-4 | `action_items[].risk_id` must match `risks.findings[]` |
| XR-5 | `overall_verdict.highest_urgency_risk_id` must match `risks.findings[]` |
| XR-6 | `risk_id` format: `{RISK_CATEGORY_ID}_{zero-padded-seq}` e.g. `RESERVE_FUNDING_01` |

---

## Enum Quick Reference

**`overall_verdict.verdict`:** `CRITICAL | CAUTION | SAFE`
**`risks.findings[].urgency`:** `CRITICAL | HIGH | MEDIUM | LOW`
**`buyer_profile_verdicts.verdict`:** `DO NOT BUY | CAUTION | OK`
**`special_assessments.status`:** `LEVIED | APPROVED | VOTED | PROPOSED | PRELIMINARY | DISCUSSED | RUMORED`
**`insurance.coverage_status`:** `CURRENT | LAPSED | EXPIRING_SOON | GAPS_IDENTIFIED | UNKNOWN`
**`litigation_costs.resolution_status`:** `ONGOING | SETTLED | PENDING | THREATENED`
**`action_items.priority`:** `IMMEDIATE | BEFORE_CLOSING | AFTER_CLOSING | ONGOING`
**`action_items.roles[]`:** `buyer | agent | lender | all`
**`missing_documents.analysis_completeness`:** `FULL | PARTIAL | MINIMAL`
**`compliance_check.overall_status`:** `COMPLIANT | PARTIAL | NON_COMPLIANT`
**`compliance_check.items[].status`:** `FOUND | NOT_FOUND | UNCLEAR | N/A`

---

## Related Files

| File | Purpose |
|---|---|
| `hoa-pdf-converter/schemas/report_schema.json` | Full AI fill instructions, cross-reference rules, adaptive conditions |
| `hoa-pdf-converter/schemas/risk_categories.json` | Risk category IDs and verdict logic |
| `hoa-pdf-converter/schemas/document_types.json` | Document type IDs and max acceptable age thresholds |
| `hoa-pdf-converter/schemas/urgency_levels.json` | Urgency decision tree |
| `hoa-pdf-converter/schemas/restriction_categories.json` | Restriction categories and buyer profile types |
| `hoa-pdf-converter/compliance/wa_checklist.json` | WA state compliance checklist items |
| `ARCHITECTURE.md` | System architecture, data flow, DB schema, decisions log |
