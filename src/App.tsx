import { useState } from 'react'
import { LayoutDashboard, DollarSign, AlertCircle, Shield, Clock, CheckSquare, FileText } from 'lucide-react'
import SummaryTab from './components/SummaryTab.jsx'

const TABS = [
  { label: 'Summary',      Icon: LayoutDashboard },
  { label: 'Financial',    Icon: DollarSign       },
  { label: 'Risks',        Icon: AlertCircle      },
  { label: 'Restrictions', Icon: Shield           },
  { label: 'Timeline',     Icon: Clock            },
  { label: 'Compliance',   Icon: CheckSquare      },
  { label: 'Documents',    Icon: FileText         },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('Summary')

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Sticky shell ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50 }}>

        {/* Navbar */}
        <div style={{ background: '#1F1224', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 18 }}>Ultovate</span>
          <span style={{ color: '#94A3B8', fontSize: 13 }}>My Account</span>
        </div>

        {/* Hero — property header + white rounded tab bar */}
        <div style={{ background: '#2D1B33', padding: '32px 32px 0' }}>

          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94A3B8', margin: 0 }}>Chiavari Owners Association</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#FFFFFF', margin: '6px 0' }}>10398 NE 17th St. #302, Bellevue WA 98004</p>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>April 8, 2026 · 6 documents</p>

          {/* Tab bar — white, rounded top, sits flush at hero bottom */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px 16px 0 0', marginTop: 24, padding: '0 8px', display: 'flex' }}>
            {TABS.map(({ label, Icon }) => (
              <button
                key={label}
                onClick={() => setActiveTab(label)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === label ? '3px solid #9333EA' : '3px solid transparent',
                  color: activeTab === label ? '#9333EA' : '#64748B',
                  fontSize: 13,
                  fontWeight: activeTab === label ? 600 : 400,
                  padding: '12px 16px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ background: '#F8F9FB', minHeight: '100vh' }}>
        {activeTab === 'Summary' ? (
          <SummaryTab />
        ) : (
          <div style={{ padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#64748B', fontSize: 14 }}>{activeTab} — coming soon</span>
          </div>
        )}
      </div>

    </div>
  )
}
