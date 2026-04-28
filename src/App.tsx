import { useState } from 'react'
import SummaryTab from './components/SummaryTab'

const tabs = ['Summary', 'Financial', 'Risks', 'Restrictions', 'Timeline', 'Compliance', 'Documents']

function DisclaimerBanner() {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,251,235,0.15)' : 'rgba(255,251,235,0.10)',
        border: '1px solid rgba(245,158,11,0.20)',
        padding: '16px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        marginBottom: '24px',
        transition: 'background 0.2s',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20" height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0, marginTop: 2 }}
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 22h16a2 2 0 0 0 1.73-4Z"/>
        <path d="M12 9v4"/>
        <path d="M12 17h.01"/>
      </svg>
      <div>
        <p style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: '#E2C8F0', margin: '0 0 4px',
        }}>Forensic Audit Disclaimer</p>
        <p style={{
          fontSize: 11, color: '#CBD5E1', lineHeight: 1.6,
          margin: 0, opacity: 0.90,
        }}>
          This report is AI-generated based on the documents provided and is for informational purposes only.
          It does not constitute legal, financial, or professional advice. Findings may be incomplete if key
          documents were not uploaded. Verify all material facts with a licensed real estate attorney or HOA
          specialist before closing.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Summary')

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FB', fontFamily: 'Inter, sans-serif' }}>

      {/* NAVBAR */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#1F1224',
        padding: '12px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 28, height: 28, background: '#9333EA',
            borderRadius: 6, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14
          }}>U</div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>Ultovate</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <input
            type="text"
            placeholder="Search findings, clauses, or financials..."
            style={{
              width: 320, background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8, padding: '8px 14px',
              color: 'white', fontSize: 13, outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <span style={{ color: '#94A3B8', fontSize: 13 }}>My Account</span>
        </div>
      </div>

      {/* HERO */}
      <div style={{ background: '#2D1B33' }}>
        <div style={{ padding: '32px 32px 0' }}>
          <p style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: '#C084FC', margin: '0 0 8px'
          }}>Chiavari Owners Association</p>
          <h1 style={{
            fontSize: 32, fontWeight: 700, color: 'white',
            margin: '0 0 8px', lineHeight: 1.2, letterSpacing: '-0.025em'
          }}>10398 NE 17th St. #302, Bellevue WA 98004</h1>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
            April 8, 2026 · 6 documents analyzed
          </p>

          {/* DISCLAIMER */}
          <DisclaimerBanner />
        </div>

        {/* TAB BAR */}
        <div style={{
          background: 'white',
          borderRadius: '12px 12px 0 0',
          border: '1px solid #E2E8F0',
          borderBottom: 'none',
          boxShadow: '0 -1px 4px rgba(0,0,0,0.06)',
          display: 'flex',
          marginLeft: '24px',
          marginRight: '24px',
          overflow: 'hidden',
        }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  position: 'relative',
                  padding: '16px 32px',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  background: isActive ? '#F8FAFC' : 'transparent',
                  border: 'none',
                  color: isActive ? '#9333EA' : '#94A3B8',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  minWidth: 120,
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.color = '#7C3AED'
                    ;(e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'
                    ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                  }
                }}
              >
                {tab}
                {isActive && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: 3, background: '#9333EA'
                  }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: '32px' }}>
        {activeTab === 'Summary' && <SummaryTab />}
        {activeTab !== 'Summary' && (
          <div style={{
            background: 'white', borderRadius: 8,
            border: '1px solid #E2E8F0',
            padding: '48px', textAlign: 'center',
            color: '#64748B', fontSize: 14
          }}>
            {activeTab} tab — coming soon
          </div>
        )}
      </div>

    </div>
  )
}