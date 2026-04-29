import React, { useEffect, useState } from 'react'
import { 
  Receipt, 
  FileText, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle
} from 'lucide-react'
import { SectionHeading } from '../../components/SectionHeading'
import { authConfig, formatCurrency, formatDate } from '../../utils'

export default function Invoices({ api, session, onNotice }) {
  const [activeTab, setActiveTab] = useState('customer') // 'customer' or 'supplier'
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchInvoices()
  }, [activeTab])

  async function fetchInvoices() {
    setLoading(true)
    try {
      const endpoint = activeTab === 'customer' ? '/customer-invoices' : '/supplier-invoices'
      const response = await api.get(endpoint, authConfig(session.token))
      setInvoices(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      onNotice({ type: 'error', text: `Failed to fetch ${activeTab} invoices.` })
    } finally {
      setLoading(false)
    }
  }

  const filtered = invoices.filter(inv => 
    inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
    (inv.customerId?.name || inv.supplierId?.name || '').toLowerCase().includes(search.toLowerCase())
  )

  const getStatusPill = (status) => {
    switch (status) {
      case 'PAID': return <span className="pill success">Paid</span>
      case 'PARTIAL': return <span className="pill warning">Partial</span>
      case 'UNPAID': return <span className="pill danger">Unpaid</span>
      default: return <span className="pill neutral">{status}</span>
    }
  }

  return (
    <div className="stack gap-6 animate-fade">
      <div className="between wrap-row panel p-6 glass-panel">
        <div className="cluster gap-4">
          <div className="icon-btn" style={{ background: 'var(--info-soft)', color: 'var(--info)', border: 'none' }}>
            <Receipt size={24} />
          </div>
          <SectionHeading 
            title="Invoice Central" 
            text="Manage accounts receivable and payable across the organization." 
          />
        </div>
        <div className="range-switcher p-1" style={{ background: 'var(--bg-soft)', borderRadius: '12px' }}>
          <button 
            className={`btn ${activeTab === 'customer' ? 'btn-primary' : ''}`} 
            style={{ borderRadius: '10px', fontSize: '0.8rem', background: activeTab === 'customer' ? '' : 'transparent', color: activeTab === 'customer' ? '' : 'var(--text-soft)', border: 'none' }}
            onClick={() => setActiveTab('customer')}
          >
            Sales Invoices
          </button>
          <button 
            className={`btn ${activeTab === 'supplier' ? 'btn-primary' : ''}`} 
            style={{ borderRadius: '10px', fontSize: '0.8rem', background: activeTab === 'supplier' ? '' : 'transparent', color: activeTab === 'supplier' ? '' : 'var(--text-soft)', border: 'none' }}
            onClick={() => setActiveTab('supplier')}
          >
            Purchase Invoices
          </button>
        </div>
      </div>

      <div className="panel glass-panel stack gap-4">
        <div className="p-6 pb-0 between wrap-row gap-4">
          <div className="input-shell compact" style={{ maxWidth: '400px' }}>
            <Search size={18} className="muted" />
            <input className="ghost-input" placeholder="Search by invoice # or entity name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="cluster gap-2 muted small">
            <Filter size={16} />
            <span>Showing all {activeTab} settlements</span>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full professional-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '24px' }}>Invoice Details</th>
                <th>{activeTab === 'customer' ? 'Customer' : 'Supplier'}</th>
                <th>Total Value</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th style={{ textAlign: 'right', paddingRight: '24px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv._id} className="table-row-hover">
                  <td style={{ paddingLeft: '24px' }}>
                    <div className="cluster gap-2">
                      <FileText size={14} className="muted" />
                      <strong className="small font-mono">{inv.invoiceNo}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="stack">
                      <strong className="small">{inv.customerId?.name || inv.supplierId?.name || 'Walk-in'}</strong>
                      <span className="muted x-small">{inv.customerId?.phone || inv.supplierId?.phone || 'No contact'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-strong">{formatCurrency(inv.totalAmount)}</span>
                  </td>
                  <td>
                    <span className={inv.balanceAmount > 0 ? 'danger-text font-strong' : 'success-text'}>
                      {formatCurrency(inv.balanceAmount)}
                    </span>
                  </td>
                  <td>{getStatusPill(inv.status)}</td>
                  <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                    <span className="muted small">{formatDate(inv.date)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <div className="p-12 text-center muted stack align-center gap-4">
              <AlertCircle size={48} opacity={0.2} />
              <p>No invoices found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
