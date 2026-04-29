import React, { useState, useEffect } from 'react'
import {
  Boxes,
  Crown,
  LayoutDashboard,
  LogOut,
  Moon,
  Receipt,
  ScanLine,
  ShoppingCart,
  SunMedium,
  Warehouse,
  BarChart3,
  Clock,
  User,
} from 'lucide-react'

export function Sidebar({
  session,
  activeView,
  setActiveView,
  barcodeValue,
  theme,
  setTheme,
  handleLogout,
  startTransition,
}) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const navigation = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'pos', label: 'Billing Desk', icon: ShoppingCart },
    { key: 'inventory', label: 'Inventory', icon: Warehouse },
    ...(session?.user?.role === 'admin'
      ? [
          { key: 'categories', label: 'Categories', icon: Boxes },
          { key: 'suppliers', label: 'Suppliers', icon: User },
          { key: 'customers', label: 'Customers', icon: User },
          { key: 'locations', label: 'Locations', icon: Warehouse },
          { key: 'purchases', label: 'Purchases', icon: Receipt },
          { key: 'invoices', label: 'Invoices', icon: Receipt },
          { key: 'payments', label: 'Payments', icon: Receipt },
          { key: 'reports', label: 'Sales Reports', icon: BarChart3 },
        ]
      : []),
  ]

  return (
    <aside className="sidebar panel glass-panel">
      <div className="stack gap-6">
        <div className="brand-lockup">
          <div className="brand-badge glow-on-hover">
            <Boxes size={24} />
          </div>
          <div>
            <p className="eyebrow" style={{ fontSize: '0.65rem', color: 'var(--accent)' }}>System Command</p>
            <h2 style={{ fontSize: '1.1rem', letterSpacing: '-0.03em' }}>BrightAngel Flow</h2>
          </div>
        </div>

        <div className="user-profile panel-strong p-4" style={{ borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div className="cluster gap-3">
            <div className="avatar" style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', color: 'var(--accent-strong)' }}>
              {session.user.role === 'admin' ? <Crown size={20} /> : <User size={20} />}
            </div>
            <div className="stack">
              <strong style={{ fontSize: '0.9rem' }}>{session.user.name}</strong>
              <span className="muted small" style={{ textTransform: 'capitalize' }}>{session.user.role} Account</span>
            </div>
          </div>
        </div>

        <nav className="stack gap-1">
          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.key}
                type="button"
                className={`nav-link ${activeView === item.key ? 'active' : ''}`}
                onClick={() => startTransition(() => setActiveView(item.key))}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="stack gap-5">
        <div className="panel-strong p-4 stack gap-3" style={{ borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg-soft)' }}>
          <div className="between">
            <div className="cluster gap-2">
              <Clock size={14} className="accent-text" />
              <span className="eyebrow" style={{ fontSize: '0.6rem' }}>System Time</span>
            </div>
            <div className="pill success" style={{ padding: '2px 8px', fontSize: '0.6rem' }}>Online</div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>

        <div className={`scanner-panel p-4 ${barcodeValue ? 'animate-pulse-soft' : ''}`} style={{ borderRadius: '16px', background: barcodeValue ? 'var(--accent-soft)' : 'var(--bg-soft)', border: `1px solid ${barcodeValue ? 'var(--accent)' : 'var(--border)'}` }}>
          <div className="cluster gap-2 mb-2">
            <ScanLine size={16} className={barcodeValue ? 'accent-text' : 'muted'} />
            <strong style={{ fontSize: '0.85rem' }}>Scanner Active</strong>
          </div>
          <p className="muted small" style={{ fontSize: '0.75rem' }}>
            Ready for input...
          </p>
          {barcodeValue && (
            <div className="mt-2 p-2 bg-strong" style={{ borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-strong)' }}>
              {barcodeValue}
            </div>
          )}
        </div>

        <div className="stack gap-2">
          <button
            type="button"
            className="btn btn-secondary w-full"
            style={{ justifyContent: 'flex-start', padding: '10px 16px' }}
            onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
          >
            {theme === 'light' ? <Moon size={18} /> : <SunMedium size={18} />}
            <span>Theme: {theme === 'light' ? 'Dark' : 'Light'}</span>
          </button>

          <button type="button" className="btn btn-ghost w-full" style={{ justifyContent: 'flex-start', padding: '10px 16px', color: 'var(--danger)' }} onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
