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
  theme,
  setTheme,
  handleLogout,
  startTransition,
}) {
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
    <aside className="sidebar panel glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Fixed Header */}
      <div className="brand-lockup between" style={{ 
        paddingBottom: '24px', 
        marginBottom: '24px', 
        borderBottom: '1px solid var(--border)',
        flexShrink: 0
      }}>
        <div className="cluster gap-3">
          <div className="brand-badge glow-on-hover" style={{ boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)', width: '42px', height: '42px', borderRadius: '12px' }}>
            <Boxes size={22} />
          </div>
          <div>
            <p className="eyebrow" style={{ fontSize: '0.65rem', color: 'var(--accent-strong)', letterSpacing: '0.05em' }}>System Node</p>
            <h2 style={{ fontSize: '1.25rem', letterSpacing: '-0.04em', fontWeight: 800, color: 'var(--text)' }}>BrightAngel</h2>
          </div>
        </div>
        <button
          type="button"
          className="icon-btn glow-on-hover"
          style={{ borderRadius: '12px', width: '38px', height: '38px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)', transition: 'all 0.2s' }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
        >
          {theme === 'light' ? <Moon size={18} /> : <SunMedium size={18} />}
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="stack gap-4" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>

        <div className="user-profile panel-strong p-3 glow-on-hover" style={{ borderRadius: '16px', border: '1px solid var(--border)', background: 'linear-gradient(145deg, var(--panel-strong), var(--bg-soft))' }}>
          <div className="cluster gap-3">
            <div className="avatar" style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', color: 'var(--accent-strong)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              {session.user.role === 'admin' ? <Crown size={22} /> : <User size={22} />}
            </div>
            <div className="stack">
              <strong style={{ fontSize: '0.95rem' }}>{session.user.name}</strong>
              <div className="cluster gap-1">
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></div>
                <span className="muted small" style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>{session.user.role} Status</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="stack gap-1">
          {navigation.map((item, index) => {
            const Icon = item.icon
            const isActive = activeView === item.key
            
            // Add a visual separator before admin items if first admin item
            const showDivider = session?.user?.role === 'admin' && index === 3

            return (
              <React.Fragment key={item.key}>
                {showDivider && (
                  <div className="my-2 stack gap-1">
                    <span className="eyebrow muted ml-4 mb-1" style={{ fontSize: '0.65rem' }}>Management</span>
                    <div style={{ height: '1px', background: 'var(--border)', margin: '0 16px' }}></div>
                  </div>
                )}
                <button
                  type="button"
                  className={`nav-link ${isActive ? 'active glow-on-hover' : ''}`}
                  style={isActive ? { borderLeft: '3px solid var(--accent-strong)', paddingLeft: '13px', background: 'linear-gradient(90deg, var(--accent-soft), transparent)', fontWeight: 600 } : { borderLeft: '3px solid transparent' }}
                  onClick={() => startTransition(() => setActiveView(item.key))}
                >
                  <Icon size={18} style={{ color: isActive ? 'var(--accent-strong)' : 'inherit' }} />
                  <span>{item.label}</span>
                </button>
              </React.Fragment>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <button 
          type="button" 
          className="btn w-full cluster justify-start gap-3" 
          style={{ 
            padding: '12px 16px', 
            borderRadius: '12px', 
            color: 'var(--muted)', 
            background: 'transparent',
            border: '1px solid transparent',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }} 
          onMouseEnter={(e) => {
             e.currentTarget.style.color = 'var(--danger)';
             e.currentTarget.style.background = 'var(--danger-soft)';
             e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
          }}
          onMouseLeave={(e) => {
             e.currentTarget.style.color = 'var(--muted)';
             e.currentTarget.style.background = 'transparent';
             e.currentTarget.style.borderColor = 'transparent';
          }}
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Sign out session</span>
        </button>
      </div>
    </aside>
  )
}
