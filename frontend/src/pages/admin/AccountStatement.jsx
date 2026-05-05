import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  FileText, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search,
  Download,
  Calendar,
  Eye,
  Building2,
  User,
  Info,
  Plus,
  AlertCircle,
  Printer,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  Receipt,
  Filter,
  RefreshCw,
  MoreVertical
} from 'lucide-react'
import { authConfig, formatCurrency, formatDate } from '../../utils'
import { SectionHeading } from '../../components/SectionHeading'

export default function AccountStatement({ api, session, onNotice }) {
  const { type, id } = useParams()
  const navigate = useNavigate()
  
  const [entity, setEntity] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAllocations, setShowAllocations] = useState(null) // ID of payment to show allocations for
  
  // Date range filters for user friendliness
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })

  useEffect(() => {
    if (type && id) {
      fetchData()
    }
  }, [type, id])

  async function fetchData() {
    setLoading(true)
    try {
      const config = authConfig(session.token)
      const [entityRes, invoicesRes, paymentsRes] = await Promise.all([
        api.get(`/${type}s/${id}`, config),
        api.get(`/${type === 'customer' ? 'customer-invoices/customer' : 'supplier-invoices/supplier'}/${id}`, config),
        api.get(`/${type === 'customer' ? 'payments' : 'supplier-payments'}?${type}Id=${id}`, config)
      ])

      setEntity(entityRes.data)
      setInvoices(invoicesRes.data || [])
      setPayments(paymentsRes.data || [])
    } catch (err) {
      onNotice?.({ type: 'error', text: 'Failed to load account data.' })
    } finally {
      setLoading(false)
    }
  }

  const statementData = useMemo(() => {
    const transactions = [
      ...invoices.map(inv => ({
        _id: inv._id,
        date: inv.date,
        type: 'Invoice',
        reference: inv.invoiceNo,
        billing: inv.totalAmount,
        payment: 0,
        status: inv.status,
        raw: inv
      })),
      ...payments.map(pay => ({
        _id: pay._id,
        date: pay.paymentDate,
        type: 'Payment',
        reference: pay.paymentNo,
        billing: 0,
        payment: pay.totalAmount,
        status: 'PAID',
        raw: pay
      }))
    ]

    // Sort by date
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date))

    // Calculate running balance
    let balance = 0
    return transactions.map(t => {
      balance += t.billing - t.payment
      return { ...t, balance }
    })
  }, [invoices, payments])

  const filteredData = useMemo(() => {
    return statementData.filter(t => {
      const matchesSearch = String(t.reference || t._id || '').toLowerCase().includes(search.toLowerCase())
      
      const tDate = new Date(t.date)
      const matchesStart = !dateRange.start || tDate >= new Date(dateRange.start)
      const matchesEnd = !dateRange.end || tDate <= new Date(dateRange.end)
      
      return matchesSearch && matchesStart && matchesEnd
    })
  }, [statementData, search, dateRange])

  const stats = useMemo(() => {
    const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalAmount, 0)
    const totalPaid = payments.reduce((sum, p) => sum + p.totalAmount, 0)
    const outstanding = totalInvoiced - totalPaid
    return { totalInvoiced, totalPaid, outstanding }
  }, [invoices, payments])

  const handlePrint = () => {
    window.print()
  }

  if (loading) return (
    <div className="p-12 text-center stack align-center gap-6 animate-pulse">
      <RefreshCw size={48} className="spinner accent-text" />
      <p className="muted font-strong">Preparing high-fidelity statement...</p>
    </div>
  )

  if (!entity) return (
    <div className="p-20 text-center muted stack align-center gap-4">
      <AlertCircle size={64} className="danger-text" />
      <h3 className="font-strong">Entity Records Not Found</h3>
      <p>The requested {type} account could not be retrieved from the database.</p>
      <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  )

  return (
    <div className="stack gap-8 animate-fade account-statement-page">
      {/* Interactive Toolbelt (Non-Printable) */}
      <div className="between wrap-row no-print panel glass-panel p-4 shadow-sm" style={{ borderRadius: '16px' }}>
        <div className="cluster gap-4">
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            Accounts
          </button>
          <div className="v-divider"></div>
          <div className="cluster gap-3">
            <div className="input-shell compact" style={{ width: '200px' }}>
              <Calendar size={14} className="muted" />
              <input type="date" className="ghost-input x-small" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
            </div>
            <span className="muted small">to</span>
            <div className="input-shell compact" style={{ width: '200px' }}>
              <Calendar size={14} className="muted" />
              <input type="date" className="ghost-input x-small" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
            </div>
            {(dateRange.start || dateRange.end) && (
              <button className="btn btn-sm btn-ghost danger-text" onClick={() => setDateRange({start: '', end: ''})}>Clear Filters</button>
            )}
          </div>
        </div>
        
        <div className="cluster gap-3">
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={16} />
            Download PDF
          </button>
          <button className="btn btn-primary shadow-lg" onClick={() => navigate('/payments')}>
            <Plus size={16} />
            Record Payment
          </button>
        </div>
      </div>

      {/* Official Statement Document */}
      <div className="document-container shadow-2xl">
        {/* Document Header (PDF Optimized) */}
        <div className="document-header">
          <div className="document-branding">
            <div className="document-logo">
              <Receipt size={32} />
              <div className="stack">
                <span className="logo-text">NILMA Alliance <span className="accent-text">(Pvt) Ltd</span></span>
                <span className="logo-subtext">Inventory Management Solutions</span>
              </div>
            </div>
            <div className="document-info text-right">
              <h2 className="doc-type">Account Statement</h2>
              <span className="doc-id">REF: {entity._id.slice(-8).toUpperCase()}</span>
              <span className="doc-date">Generated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="document-meta-grid">
            <div className="meta-box">
              <span className="meta-label">Billed To:</span>
              <h3 className="meta-value">{entity.name}</h3>
              <div className="meta-details">
                {entity.email && <span><Mail size={12}/> {entity.email}</span>}
                {entity.phone && <span><Phone size={12}/> {entity.phone}</span>}
                {entity.address && <span><MapPin size={12}/> {entity.address}</span>}
              </div>
            </div>
            <div className="meta-box summary-box">
              <span className="meta-label">Financial Summary</span>
              <div className="summary-row">
                <span>Total Billing</span>
                <strong>{formatCurrency(stats.totalInvoiced)}</strong>
              </div>
              <div className="summary-row">
                <span>Total Payments</span>
                <strong className="success-text">{formatCurrency(stats.totalPaid)}</strong>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Balance Due</span>
                <strong className={stats.outstanding > 0 ? 'danger-text' : 'success-text'}>
                  {formatCurrency(stats.outstanding)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar (Web only) */}
        <div className="document-toolbar no-print">
          <div className="input-shell ghost" style={{ flex: 1 }}>
            <Search size={18} className="muted" />
            <input className="ghost-input" placeholder="Search by reference number..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Transaction Ledger */}
        <div className="document-body">
          <table className="statement-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Status</th>
                <th className="text-right">Debit (Dr)</th>
                <th className="text-right">Credit (Cr)</th>
                <th className="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <React.Fragment key={row._id}>
                  <tr className="statement-row">
                    <td>{new Date(row.date).toLocaleDateString()}</td>
                    <td>
                      <div className="stack">
                        <strong>{row.reference}</strong>
                        <span className="muted x-small uppercase">{row.type}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`pill x-small ${row.status === 'PAID' ? 'success' : 'warning'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="text-right">{row.billing > 0 ? formatCurrency(row.billing) : '-'}</td>
                    <td className="text-right success-text">{row.payment > 0 ? formatCurrency(row.payment) : '-'}</td>
                    <td className="text-right font-strong">
                      {formatCurrency(row.balance)}
                    </td>
                  </tr>
                  
                  {/* Allocation breakdown (Optional in Web, Mandatory in Print if active) */}
                  {(showAllocations === row._id || window.matchMedia('print').matches) && row.type === 'Payment' && row.raw.allocations.length > 0 && (
                    <tr className="allocation-row no-hover">
                      <td colSpan="6">
                        <div className="allocation-details">
                          <span className="allocation-label">Settlement Breakdown:</span>
                          <div className="allocation-grid">
                            {row.raw.allocations.map((alloc, idx) => (
                              <div key={idx} className="allocation-item">
                                <span>Inv: {alloc.invoiceId?.invoiceNo || 'N/A'}</span>
                                <strong>{formatCurrency(alloc.allocatedAmount)}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="empty-state">
              <Receipt size={48} opacity={0.1} />
              <p>No transactions found for the selected filters.</p>
            </div>
          )}
        </div>

        {/* Official Footer */}
        <div className="document-footer">
          <div className="footer-sign">
            <div className="sign-line"></div>
            <span>Authorized Signature</span>
          </div>
          <div className="footer-disclaimer">
            <p>This is a system-generated document. For any discrepancies, please contact our support team at info@nilmaalliance.com within 7 business days.</p>
            <span>NILMA Alliance (Pvt) Ltd | 295, 1/1 Galle Road, Colombo – 6, Sri Lanka</span>
          </div>
        </div>
      </div>

      <style>{`
        .document-container {
          background: #fff;
          color: #1a1a1a;
          border-radius: 8px;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }
        
        .document-header {
          padding: 40px;
          border-bottom: 2px solid #f0f0f0;
          background: #fafafa;
        }

        .document-branding {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }

        .document-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .logo-text { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .logo-subtext { font-size: 11px; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }

        .doc-type { font-size: 28px; font-weight: 900; color: #000; text-transform: uppercase; margin-bottom: 4px; }
        .doc-id, .doc-date { display: block; font-size: 12px; font-weight: 700; color: #666; }

        .document-meta-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 40px;
        }

        .meta-label { display: block; font-size: 10px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .meta-value { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
        .meta-details span { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #444; margin-bottom: 4px; }

        .summary-box { background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 12px; }
        .summary-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
        .summary-divider { height: 1px; border-top: 1px dashed #eee; margin: 12px 0; }
        .summary-row.total { font-size: 16px; border-top: 1px solid #000; padding-top: 12px; margin-top: 4px; }

        .document-toolbar { padding: 20px 40px; background: #fff; border-bottom: 1px solid #f0f0f0; }

        .document-body { padding: 0 40px; }
        .statement-table { width: 100%; border-collapse: collapse; }
        .statement-table th { padding: 16px 8px; text-align: left; font-size: 11px; font-weight: 800; color: #999; text-transform: uppercase; border-bottom: 2px solid #000; }
        .statement-table td { padding: 16px 8px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
        .statement-row:hover { background: #fcfcfc; }

        .allocation-details { padding: 16px; background: #f9f9f9; border-radius: 8px; margin: 8px 0; border: 1px solid #eee; }
        .allocation-label { display: block; font-size: 10px; font-weight: 800; color: #999; text-transform: uppercase; margin-bottom: 12px; }
        .allocation-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .allocation-item { display: flex; justify-content: space-between; font-size: 12px; padding: 8px; background: #fff; border: 1px solid #eee; border-radius: 6px; }

        .document-footer { padding: 40px; display: flex; justify-content: space-between; align-items: flex-end; background: #fafafa; border-top: 1px solid #f0f0f0; }
        .footer-sign span { font-size: 11px; font-weight: 800; color: #999; text-transform: uppercase; }
        .sign-line { width: 180px; height: 1px; background: #000; margin-bottom: 8px; }
        .footer-disclaimer { text-align: right; max-width: 400px; }
        .footer-disclaimer p { font-size: 10px; color: #999; line-height: 1.4; margin-bottom: 8px; }
        .footer-disclaimer span { font-size: 11px; font-weight: 800; color: #000; }

        .empty-state { padding: 60px; text-align: center; color: #ccc; }

        @media print {
          body { margin: 0; background: #fff !important; }
          .no-print { display: none !important; }
          .document-container { border-radius: 0; box-shadow: none !important; }
          .document-header { background: #fff !important; border-bottom: 2px solid #000; }
          .summary-box { border: 1px solid #000 !important; }
          .statement-table th { border-bottom: 2px solid #000 !important; color: #000; }
          .allocation-details { background: #fff !important; border: 1px solid #ccc !important; }
          .document-footer { background: #fff !important; border-top: 1px solid #000; }
        }
      `}</style>
    </div>
  )
}
