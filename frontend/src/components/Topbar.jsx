import React, { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { formatCurrency } from '../utils'

export function Topbar({ activeView, session, overview }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="topbar panel p-6 between wrap-row gap-5">
      <div className="stack gap-1">
        <p className="eyebrow" style={{ color: 'var(--accent-strong)' }}>Active Workspace</p>
        <h1 style={{ fontSize: '2.5rem' }}>
          {activeView === 'overview' && (session.user.role === 'admin' ? 'Operations Command' : 'Cashier Terminal')}
          {activeView === 'pos' && 'Billing Desk'}
          {activeView === 'inventory' && 'Warehouse Control'}
          {activeView === 'reports' && 'Revenue Analytics'}
          {activeView === 'suppliers' && 'Supplier Management'}
          {activeView === 'customers' && 'Customer Management'}
          {activeView === 'purchases' && 'Purchases Log'}
          {activeView === 'invoices' && 'Invoices Log'}
          {activeView === 'payments' && 'Payments Log'}
          {activeView === 'staff' && 'Staff Management'}
          {activeView === 'notifications' && 'Notification Management'}
          {activeView === 'product-manager' && 'Product Management'}
        </h1>
        <div className="cluster gap-3 muted small mt-1">
          <span>Branch: <strong className="font-strong" style={{ color: 'var(--text)' }}>{session.user.branch}</strong></span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <div className="cluster gap-2 pill success-soft" style={{ padding: '4px 10px', background: 'var(--success-soft)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <Clock size={12} />
            <strong style={{ fontFamily: 'var(--font-mono)' }}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
          </div>
        </div>
      </div>

      <div className="topbar-actions cluster gap-4">
        {session.user.role === 'admin' && (
          <>
            <div className="mini-stat panel-strong" style={{ padding: '12px 20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <span className="muted eyebrow" style={{ fontSize: '0.6rem' }}>Total SKUs</span>
              <div className="font-strong" style={{ fontSize: '1.25rem' }}>{overview?.metrics.totalProducts ?? 0}</div>
            </div>
            <div className="mini-stat panel-strong" style={{ padding: '12px 20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <span className="muted eyebrow" style={{ fontSize: '0.6rem', color: 'var(--danger)' }}>Alerts</span>
              <div className="font-strong" style={{ fontSize: '1.25rem', color: 'var(--danger)' }}>{overview?.metrics.lowStockCount ?? 0}</div>
            </div>
          </>
        )}
        <div className="mini-stat panel-strong" style={{ padding: '12px 20px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--accent-soft)' }}>
          <span className="muted eyebrow" style={{ fontSize: '0.6rem' }}>{session.user.role === 'admin' ? "Today's Rev" : "My Sales"}</span>
          <div className="font-strong" style={{ fontSize: '1.25rem', color: 'var(--accent-strong)' }}>{formatCurrency(overview?.metrics.revenueToday ?? 0)}</div>
        </div>
      </div>
    </header>
  )
}
