import React from 'react'
import {
  BarChart3,
  Boxes,
  Receipt,
  ShoppingCart,
  Download,
  Filter,
  Calendar,
  FileText,
} from 'lucide-react'
import { MetricCard } from '../../components/MetricCard'
import { SectionHeading } from '../../components/SectionHeading'
import { formatCurrency, formatDate } from '../../utils'

export function Reports({ report, reportRange, setReportRange }) {
  const ranges = ['daily', 'weekly', 'monthly', 'annual']

  return (
    <div className="stack gap-6 animate-fade">
      <div className="between wrap-row panel p-6 glass-panel">
        <div className="cluster gap-4">
          <div className="icon-btn" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: 'none' }}>
            <BarChart3 size={24} />
          </div>
          <SectionHeading
            title="Revenue Intelligence"
            text="Deep dive into financial performance and order velocity."
          />
        </div>
        <div className="cluster gap-3 wrap-row">
          <div className="range-switcher">
            {ranges.map((range) => (
              <button
                key={range}
                className={`range-btn ${reportRange === range ? 'active' : ''}`}
                onClick={() => setReportRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="btn btn-secondary glow-on-hover">
            <Download size={18} />
            Export Ledger
          </button>
        </div>
      </div>

      <div className="metric-grid">
        <MetricCard
          icon={ShoppingCart}
          title="Gross Revenue"
          value={formatCurrency(report?.summary.totalRevenue ?? 0)}
          helper="Consolidated sales value"
        />
        <MetricCard
          icon={Receipt}
          title="Order Volume"
          value={String(report?.summary.totalOrders ?? 0)}
          helper="Total finalized invoices"
        />
        <MetricCard
          icon={Boxes}
          title="Inventory Flow"
          value={String(report?.summary.unitsSold ?? 0)}
          helper="Individual items processed"
        />
        <MetricCard
          icon={BarChart3}
          title="Ticket Average"
          value={formatCurrency(report?.summary.averageTicket ?? 0)}
          helper="Mean value per transaction"
        />
      </div>

      <div className="reports-grid">
        <div className="panel p-6 stack gap-6 glass-panel">
          <SectionHeading
            title="Revenue Pacing"
            text="Tracking growth across the timeline."
          />
          <div className="stack gap-5">
            {(report?.trend || []).map((point) => (
              <div key={point.label} className="stack gap-2">
                <div className="between">
                  <div className="cluster gap-2">
                    <Calendar size={12} className="muted" />
                    <strong className="font-strong" style={{ fontSize: '0.9rem' }}>{point.label}</strong>
                  </div>
                  <span className="muted small">
                    <strong style={{ color: 'var(--text)' }}>{formatCurrency(point.revenue)}</strong> · {point.orders} orders
                  </span>
                </div>
                <div className="progress-track tall" style={{ height: '8px' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${report?.summary.totalRevenue ? (point.revenue / report.summary.totalRevenue) * 100 : 0}%`,
                      background: 'linear-gradient(90deg, var(--accent), var(--accent-strong))'
                    }}
                  />
                </div>
              </div>
            ))}
            {(report?.trend || []).length === 0 && (
              <div className="empty-state compact">No pacing data for this range.</div>
            )}
          </div>
        </div>

        <div className="panel p-6 stack gap-6">
          <SectionHeading
            title="Revenue Distribution"
            text="Insights by payment and category."
          />
          <div className="stack gap-5">
            <div className="stack gap-3">
              <span className="eyebrow" style={{ fontSize: '0.6rem' }}>By Channel</span>
              {(report?.paymentBreakdown || []).map((entry) => (
                <div key={entry.label} className="list-row p-3 panel-strong glow-on-hover" style={{ borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <strong className="font-strong">{entry.label}</strong>
                  <span style={{ color: 'var(--accent-strong)' }}>{formatCurrency(entry.value)}</span>
                </div>
              ))}
            </div>
            <div className="stack gap-3">
              <span className="eyebrow" style={{ fontSize: '0.6rem' }}>By Category</span>
              {(report?.categoryBreakdown || []).map((entry) => (
                <div key={entry.label} className="list-row p-3 panel-strong glow-on-hover" style={{ borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <strong className="font-strong">{entry.label}</strong>
                  <span style={{ color: 'var(--success)' }}>{formatCurrency(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel p-6 stack gap-6 glass-panel" style={{ gridColumn: 'span 2' }}>
          <SectionHeading
            title="Chronological Ledger"
            text="Complete transaction stream for this period."
          />
          <div className="stack gap-2" style={{ maxHeight: '480px', overflowY: 'auto' }}>
            {(report?.recentSales || []).map((sale) => (
              <div key={sale._id} className="list-row p-4 panel-strong glow-on-hover" style={{ borderRadius: '16px', border: '1px solid var(--border)' }}>
                <div className="cluster gap-4">
                  <div className="icon-btn small success-soft" style={{ border: 'none' }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <strong className="font-strong" style={{ fontSize: '1rem' }}>{sale.invoiceNumber}</strong>
                    <p className="muted small">{sale.customerName || 'Walk-in'} · {sale.cashierName}</p>
                  </div>
                </div>
                <div className="text-right stack gap-1">
                  <strong style={{ color: 'var(--accent-strong)', fontSize: '1.1rem' }}>{formatCurrency(sale.total)}</strong>
                  <div className="cluster gap-2 justify-end">
                    <span className="pill neutral" style={{ fontSize: '0.6rem' }}>{sale.paymentMethod}</span>
                    <p className="muted small">{formatDate(sale.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
            {(report?.recentSales || []).length === 0 && (
              <div className="empty-state compact">No invoices in this range.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
