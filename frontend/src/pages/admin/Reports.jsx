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
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
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
          <div style={{ width: '100%', height: '320px', position: 'relative' }}>
            {report?.trend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis 
                    dataKey="label" 
                    stroke="var(--muted)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10} 
                  />
                  <YAxis 
                    stroke="var(--muted)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value >= 1000 ? (value / 1000) + 'k' : value}`} 
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--panel-strong)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
                    itemStyle={{ color: 'var(--accent-strong)', fontWeight: 700 }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                    labelStyle={{ color: 'var(--muted)', marginBottom: '4px' }}
                    cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="var(--accent)" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state compact" style={{ height: '100%', display: 'grid', placeItems: 'center' }}>No pacing data for this range.</div>
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
