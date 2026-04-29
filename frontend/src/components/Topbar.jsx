import React from 'react'
import { formatCurrency } from '../utils'

export function Topbar({ activeView, session, overview }) {
  return (
    <header className="topbar panel p-6">
      <div className="stack gap-1">
        <p className="eyebrow" style={{ color: 'var(--accent-strong)' }}>Active Workspace</p>
        <h1 style={{ fontSize: '2.5rem' }}>
          {activeView === 'overview' && 'Operations Command'}
          {activeView === 'pos' && 'Billing Desk'}
          {activeView === 'inventory' && 'Warehouse Control'}
          {activeView === 'reports' && 'Revenue Analytics'}
        </h1>
        <div className="cluster gap-3 muted small">
          <span>Branch: <strong className="font-strong" style={{ color: 'var(--text)' }}>{session.user.branch}</strong></span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="topbar-actions cluster gap-4">
        <div className="mini-stat panel-strong" style={{ padding: '12px 20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <span className="muted eyebrow" style={{ fontSize: '0.6rem' }}>Total SKUs</span>
          <div className="font-strong" style={{ fontSize: '1.25rem' }}>{overview?.metrics.totalProducts ?? 0}</div>
        </div>
        <div className="mini-stat panel-strong" style={{ padding: '12px 20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <span className="muted eyebrow" style={{ fontSize: '0.6rem', color: 'var(--danger)' }}>Alerts</span>
          <div className="font-strong" style={{ fontSize: '1.25rem', color: 'var(--danger)' }}>{overview?.metrics.lowStockCount ?? 0}</div>
        </div>
        <div className="mini-stat panel-strong" style={{ padding: '12px 20px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--accent-soft)' }}>
          <span className="muted eyebrow" style={{ fontSize: '0.6rem' }}>Today's Rev</span>
          <div className="font-strong" style={{ fontSize: '1.25rem', color: 'var(--accent-strong)' }}>{formatCurrency(overview?.metrics.revenueToday ?? 0)}</div>
        </div>
      </div>
    </header>
  )
}
