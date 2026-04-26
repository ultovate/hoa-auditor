import { useState } from 'react'
import SummaryTab from './components/SummaryTab'

const tabs = ['Summary', 'Financial', 'Risks', 'Restrictions', 'Timeline', 'Compliance', 'Documents']

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
        <div style={{ padding: '32px 32px 24px' }}>
          <p style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: '#94A3B8', margin: '0 0 8px'
          }}>Chiavari Owners Association</p>
          <h1 style={{
            fontSize: 32, fontWeight: 700, color: 'white',
            margin: '0 0 8px', lineHeight: 1.2
          }}>10398 NE 17th St. #302, Bellevue WA 98004</h1>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
            April 8, 2026 · 6 documents analyzed
          </p>
        </div>

        {/* TAB BAR */}
       <div style={{
        background: 'white',
        borderRadius: '12px 12px 0 0',
        display: 'flex',
        marginLeft: '24px',
        marginRight: '24px',
        paddingLeft: '8px',
        overflow: 'hidden',
      }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 20px',
                fontSize: 15,
                fontWeight: 500,
                fontFamily: 'inherit',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid #9333EA' : '3px solid transparent',
                color: activeTab === tab ? '#9333EA' : '#64748B',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab}
            </button>
          ))}
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