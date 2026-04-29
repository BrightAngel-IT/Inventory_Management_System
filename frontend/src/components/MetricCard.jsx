import React from 'react'

export function MetricCard({ icon: Icon, title, value, helper }) {
  return (
    <article className="metric-card panel animate-fade">
      <div className="between">
        <div className="metric-icon">
          <Icon size={24} />
        </div>
        <div className="pill success" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)', fontSize: '0.65rem' }}>Active</div>
      </div>
      <div className="stack gap-1 mt-4">
        <span className="eyebrow" style={{ fontSize: '0.65rem', opacity: 0.7 }}>{title}</span>
        <strong className="metric-value" style={{ color: 'var(--text)' }}>{value}</strong>
        <p className="muted small mt-1" style={{ borderTop: '1px solid var(--border)', paddingTop: '8px' }}>{helper}</p>
      </div>
    </article>
  )
}
