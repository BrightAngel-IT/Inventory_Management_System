import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  ShieldCheck,
  TrendingUp,
  FileText,
  ScanLine,
} from 'lucide-react'
import { MetricCard } from '../../components/MetricCard'
import { SectionHeading } from '../../components/SectionHeading'
import { formatCurrency, formatDate } from '../../utils'

export function CashierDashboard({ overview, session, startTransition }) {
  const navigate = useNavigate()
  const quickActions = [
    { label: 'New Bill', icon: ShoppingCart, path: '/pos', color: 'var(--accent)' },
    { label: 'Scan Item', icon: ScanLine, path: '/pos', color: 'var(--info)' },
  ]

  return (
    <div className="stack gap-6 animate-fade">
      <section className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <MetricCard
          icon={TrendingUp}
          title="My Daily Sales"
          value={formatCurrency(overview?.metrics.revenueDaily ?? 0)}
          helper="Total value processed today"
        />
        <MetricCard
          icon={ShoppingCart}
          title="Orders Processed"
          value={String(overview?.metrics.totalOrdersDaily ?? 0)}
          helper="Number of finalized bills"
        />
        <MetricCard
          icon={ShieldCheck}
          title="Terminal Status"
          value="Cashier Active"
          helper={`User: ${session.user.name}`}
        />
      </section>

      <section className="panel p-6 stack gap-5 glass-panel">
        <SectionHeading title="Quick Actions" text="Essential tools for your shift." />
        <div className="cluster gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="quick-action-card glow-on-hover"
              style={{ flex: 1, maxWidth: '240px' }}
              onClick={() => navigate(action.path)}
            >
              <div className="quick-action-icon" style={{ color: action.color }}>
                <action.icon size={24} />
              </div>
              <span className="font-strong" style={{ fontSize: '0.9rem' }}>{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel p-6 stack gap-5">
        <SectionHeading
          title="My Recent Bills"
          text="Latest transactions handled by you."
        />
        <div className="stack gap-3">
          {(overview?.recentSales || []).slice(0, 8).map((sale) => (
            <div key={sale._id} className="list-row p-3 panel-strong glow-on-hover" style={{ borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div className="stack gap-1">
                <div className="cluster gap-2">
                  <FileText size={14} className="muted" />
                  <strong style={{ fontSize: '0.95rem' }}>{sale.invoiceNumber}</strong>
                </div>
                <p className="muted small">
                  {sale.customerName || 'Walk-in Customer'} · {formatDate(sale.createdAt)}
                </p>
              </div>
              <div className="text-right">
                 <strong style={{ color: 'var(--accent-strong)' }}>{formatCurrency(sale.total)}</strong>
                 <p className="muted small" style={{ fontSize: '0.65rem' }}>{sale.paymentMethod}</p>
              </div>
            </div>
          ))}
          {(overview?.recentSales || []).length === 0 && (
            <div className="empty-state compact">
              <p className="muted">Start your first transaction to see activity here.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
