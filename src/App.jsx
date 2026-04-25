import { useState } from 'react'
import SummaryTab from './components/SummaryTab.jsx'

const TABS = ['Summary', 'Financial', 'Risks', 'Restrictions', 'Timeline', 'Compliance', 'Documents']

export default function App() {
  const [activeTab, setActiveTab] = useState('Summary')

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FB', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Navbar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#1F1224', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 18 }}>Ultovate</span>
        <span style={{ color: '#94A3B8', fontSize: 13 }}>My Account</span>
      </div>

      {/* Tab bar */}
      <div style={{ position: 'sticky', top: 49, zIndex: 40, background: '#FFFFFF', borderBottom: '1px solid rgba(31,18,36,0.08)', padding: '0 32px', display: 'flex', gap: 0 }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid #9333EA' : '3px solid transparent',
              color: activeTab === tab ? '#9333EA' : '#64748B',
              fontSize: 13,
              fontWeight: activeTab === tab ? 600 : 400,
              padding: '12px 16px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'Summary' ? (
        <SummaryTab />
      ) : (
        <div style={{ background: '#F8F9FB', padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#64748B', fontSize: 14 }}>{activeTab} coming soon</span>
        </div>
      )}

    </div>
  )
}
