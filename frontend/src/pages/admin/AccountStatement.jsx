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
        method: pay.paymentMethod || 'N/A',
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
              <input type="date" className="ghost-input x-small" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
            </div>
            <span className="muted small">to</span>
            <div className="input-shell compact" style={{ width: '200px' }}>
              <Calendar size={14} className="muted" />
              <input type="date" className="ghost-input x-small" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
            </div>
            {(dateRange.start || dateRange.end) && (
              <button className="btn btn-sm btn-ghost danger-text" onClick={() => setDateRange({ start: '', end: '' })}>Clear Filters</button>
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
        {/* Official Letterhead Watermark */}
        <div className="document-watermark">NILMA</div>

        {/* Document Header (Custom Layout) */}
        <div className="custom-document-header">
          {/* Left Column: Company Identity & Supplier Details */}
          <div className="parties-col">
            <div className="company-branding-custom left-align">
              <div className="logo-vertical-stack">
                <img src="/logo1.png" alt="NILMA Logo" className="header-logo-img large-logo" />
                <div className="brand-text-group">
                  <h1 className="brand-name">NILMA Alliance <span className="pvt-ltd">(Pvt) Ltd</span></h1>
                  <p className="brand-slogan">INVENTORY MANAGEMENT SOLUTIONS</p>
                </div>
              </div>
              <div className="company-address-minimal">
                <p>295, 1/1 Galle Road, Colombo – 06, Sri Lanka</p>
                <p>+94 11 234 5678 | info@nilmaalliance.com</p>
              </div>
            </div>

            <div className="branding-divider"></div>

            <div className="billed-to-col">
              <span className="col-label">{type === 'customer' ? 'BILLED TO (CUSTOMER):' : 'REMIT TO (SUPPLIER):'}</span>
              <h2 className="billed-party-name">{entity.name}</h2>
              <div className="billed-contact-list">
                {entity.email && (
                  <div className="contact-row">
                    <Mail size={12} className="muted" />
                    <span>{entity.email}</span>
                  </div>
                )}
                {entity.phone && (
                  <div className="contact-row">
                    <Phone size={12} className="muted" />
                    <span>{entity.phone}</span>
                  </div>
                )}
                {entity.address && (
                  <div className="contact-row">
                    <MapPin size={12} className="muted" />
                    <span>{entity.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Title & Summary */}
          <div className="branding-meta-col">
            <div className="statement-title-section">
              <h1 className="doc-title-large">
                {type === 'customer' ? 'CUSTOMER STATEMENT' : 'SUPPLIER STATEMENT'}
              </h1>
              <div className="doc-meta-minimal">
                <p>REF: {entity._id.slice(-8).toUpperCase()}</p>
                <p>Generated: {new Date().toLocaleDateString('en-GB')}</p>
              </div>
            </div>

            <div className="financial-summary-box">
              <h3 className="summary-box-label">FINANCIAL SUMMARY</h3>
              <div className="summary-row">
                <span>{type === 'customer' ? 'Total Invoiced' : 'Total Purchases'}</span>
                <strong>{formatCurrency(stats.totalInvoiced)}</strong>
              </div>
              <div className="summary-row">
                <span>{type === 'customer' ? 'Total Payments' : 'Total Credits'}</span>
                <strong>{formatCurrency(stats.totalPaid)}</strong>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row balance-row">
                <span>Balance Due</span>
                <strong className="balance-value">
                  {stats.outstanding < 0 ? `(${formatCurrency(Math.abs(stats.outstanding))})` : formatCurrency(stats.outstanding)}
                </strong>
              </div>
              <div className="balance-underline"></div>
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
                <th>Type</th>
                <th>Ref No</th>
                <th>Method</th>
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
                      <span className="muted x-small uppercase font-bold">{row.type}</span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '12px' }}>{row.reference}</strong>
                    </td>
                    <td>
                      <span className="muted x-small uppercase">{row.method || '-'}</span>
                    </td>
                    <td>
                      <span className={`pill x-small ${row.status === 'PAID' ? 'success' : (row.status === 'PARTIAL' ? 'warning' : 'danger')}`}>
                        {row.status === 'PAID' ? 'Settled' : (row.status === 'PARTIAL' ? 'Partial' : 'Outstanding')}
                      </span>
                    </td>
                    <td className="text-right">{row.billing > 0 ? formatCurrency(row.billing) : '-'}</td>
                    <td className="text-right success-text">{row.payment > 0 ? formatCurrency(row.payment) : '-'}</td>
                    <td className="text-right font-strong">
                      {row.balance < 0 ? `(${formatCurrency(Math.abs(row.balance))})` : formatCurrency(row.balance)}
                    </td>
                  </tr>

                  {/* Allocation breakdown (Optional in Web, Mandatory in Print if active) */}
                  {(showAllocations === row._id || window.matchMedia('print').matches) && row.type === 'Payment' && row.raw.allocations.length > 0 && (
                    <tr className="allocation-row no-hover">
                      <td colSpan="8">
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
          <div className="footer-content-wrapper">
            <div className="footer-signature-block">
              <div className="signature-line"></div>
              <div className="signature-meta">
                <span className="signature-label">AUTHORIZED SIGNATURE & STAMP</span>
              </div>
            </div>

            <div className="footer-info-block">
              <p className="system-disclaimer">
                This is a computer-generated statement and does not require a physical signature.
                For any discrepancies, please notify us within 7 business days.
              </p>
              <div className="footer-pagination">
                <span>Page 01 of 01</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .document-container {
          background: var(--panel-strong);
          color: var(--text);
          border-radius: 12px;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08);
          position: relative;
        }

        .document-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 180px;
          font-weight: 900;
          color: rgba(15, 23, 42, 0.015);
          pointer-events: none;
          z-index: 0;
          user-select: none;
        }

        .custom-document-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          padding: 20px 50px 30px 50px;
          background: transparent;
          position: relative;
          z-index: 1;
        }

        .col-label { font-size: 9px; font-weight: 800; color: #94a3b8; letter-spacing: 1.5px; display: block; margin-bottom: 12px; text-transform: uppercase; }
        .billed-party-name { font-size: 28px; font-weight: 900; color: #0f172a; margin-bottom: 15px; letter-spacing: -0.5px; }
        .billed-contact-list { display: flex; flex-direction: column; gap: 6px; }
        .contact-row { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #475569; font-weight: 500; }

        .company-branding-custom { margin-bottom: 25px; }
        .company-branding-custom.left-align { text-align: left; }
        .logo-vertical-stack { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
        .brand-text-group { display: flex; flex-direction: column; gap: 2px; }
        .header-logo-img.large-logo { height: 95px; width: auto; object-fit: contain; }
        .brand-name { font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; line-height: 1.1; letter-spacing: -0.5px; }
        .brand-name .pvt-ltd { color: var(--accent); opacity: 0.8; }
        .brand-slogan { font-size: 10px; font-weight: 800; color: #64748b; letter-spacing: 1.5px; margin-top: 2px; }
        
        .company-address-minimal { font-size: 11px; color: #64748b; margin-top: 8px; line-height: 1.4; font-weight: 500; }

        .branding-divider { height: 1.5px; background: #e2e8f0; width: 100%; margin: 15px 0; }

        .branding-meta-col { padding-top: 15px; }
        .statement-title-section { text-align: right; margin-bottom: 25px; overflow: hidden; }
        .doc-title-large { 
          font-size: 32px; 
          font-weight: 900; 
          color: var(--text); 
          margin-bottom: 6px; 
          letter-spacing: -1px; 
          line-height: 1; 
          white-space: nowrap;
        }
        .doc-meta-minimal { font-size: 11px; font-weight: 700; color: #94a3b8; line-height: 1.5; text-transform: uppercase; }

        .financial-summary-box {
          background: var(--panel);
          border: 1px solid var(--accent-soft);
          border-radius: 10px;
          padding: 12px 15px;
          margin-left: auto;
          width: 260px;
          position: relative;
        }

        .summary-box-label { font-size: 8px; font-weight: 800; color: #94a3b8; letter-spacing: 1px; margin-bottom: 8px; }
        .summary-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; color: var(--text-soft); font-weight: 600; }
        .summary-row strong { color: var(--text); font-weight: 800; font-family: 'Inter', monospace; }
        .summary-divider { height: 1px; background: var(--border); margin: 8px 0; }
        .balance-row { font-size: 13px; margin-bottom: 2px; }
        .balance-value { font-size: 15px; font-weight: 900; color: var(--text); }
        .balance-underline { height: 2px; border-bottom: 1px solid var(--text); border-top: 1px solid var(--text); width: 100%; margin-top: 3px; opacity: 0.3; }

        .document-toolbar { padding: 15px 50px; background: transparent; border-bottom: 1px solid var(--border); }

        .document-body { padding: 0 50px 40px 50px; position: relative; z-index: 1; }
        .statement-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .statement-table thead { position: sticky; top: 0; z-index: 10; }
        .statement-table th { 
          padding: 12px; 
          text-align: left; 
          font-size: 9px; 
          font-weight: 900; 
          color: #ffffff; 
          background: var(--accent); 
          text-transform: uppercase; 
          letter-spacing: 1.2px;
          border: none;
        }
        .statement-table th:first-child { border-top-left-radius: 4px; }
        .statement-table th:last-child { border-top-right-radius: 4px; }

        .statement-row td { 
          padding: 10px 12px; 
          border-bottom: 1px solid var(--border); 
          font-size: 12px;
          color: var(--text);
          font-weight: 500;
        }
        .statement-row:hover { background: var(--panel-hover); }

        .formal-status { font-size: 9px; font-weight: 900; letter-spacing: 1px; padding: 2px 0; border-bottom: 2px solid transparent; }
        .formal-status.settled { color: #059669; border-color: #059669; }
        .formal-status.pending { color: #d97706; border-color: #d97706; }

        .allocation-details { 
          padding: 15px; 
          background: #f8fafc; 
          border-radius: 12px; 
          margin: 10px 0; 
          border: 1px solid #f1f5f9; 
        }
        .allocation-label { display: block; font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 12px; }
        .allocation-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; }
        .allocation-item { 
          display: flex; 
          justify-content: space-between; 
          font-size: 12px; 
          padding: 10px; 
          background: #fff; 
          border: 1px solid #e2e8f0; 
          border-radius: 8px;
        }

        .document-footer { 
          padding: 40px 50px; 
          background: transparent; 
          border-top: 2px solid var(--accent-soft); 
          page-break-inside: avoid;
          position: relative;
          z-index: 1;
        }

        .footer-content-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .footer-signature-block { text-align: left; flex-shrink: 0; }
        .signature-line { width: 220px; height: 1.5px; background: #0f172a; margin-bottom: 8px; }
        .signature-meta { display: flex; flex-direction: column; gap: 4px; }
        .signature-label { font-size: 8px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; }
        .signature-date { font-size: 8px; font-weight: 700; color: #cbd5e1; letter-spacing: 1px; margin-top: 2px; }
        
        .footer-info-block { text-align: right; max-width: 420px; flex-shrink: 0; }
        .system-disclaimer { font-size: 8.5px; color: #94a3b8; line-height: 1.4; margin-bottom: 12px; font-weight: 500; font-style: italic; }
        .footer-company-details { display: flex; align-items: center; justify-content: flex-end; gap: 10px; font-size: 9.5px; color: #475569; font-weight: 700; margin-bottom: 8px; }
        .footer-brand-name { color: #0f172a; text-transform: uppercase; letter-spacing: 0.8px; }
        .footer-separator { color: #e2e8f0; font-weight: 400; }
        .footer-pagination { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px; }

        .empty-state { padding: 80px; text-align: center; color: #94a3b8; }

        @media print {
          @page { size: A4; margin: 0; }
          
          /* Force parent containers to be visible and non-flex */
          html, body, #root, .app-shell, .workspace, .account-statement-page {
            height: auto !important;
            overflow: visible !important;
            background: #fff !important;
            width: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
          }

          /* Hide UI elements */
          .sidebar, .topbar, .notice-banner, .no-print, .btn, button, .v-divider, .icon-btn, .brand-lockup, nav { 
            display: none !important; 
          }

          .document-container { 
            border: none !important;
            box-shadow: none !important;
            width: 210mm !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            visibility: visible !important;
            background: #ffffff !important;
            color: #000000 !important;
          }

          .document-watermark {
            display: none !important;
          }

          .custom-document-header { 
            padding: 8mm 15mm 10mm 15mm !important; 
            gap: 15mm !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            background: #fff !important;
          }
          
          .document-body {
            padding: 0 15mm 10mm 15mm !important;
          }

          .financial-summary-box {
            border: 1.5px solid #000 !important;
            background: #ffffff !important;
            width: 100% !important;
            margin-top: 5mm !important;
            color: #000000 !important;
          }
          .summary-row { color: #444 !important; }
          .summary-row strong, .balance-value { color: #000 !important; }

          .statement-table {
            width: 100% !important;
            page-break-inside: auto;
          }
          
          .statement-table thead {
            display: table-header-group !important;
          }

          .statement-row {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          .statement-table th {
            background: #f1f5f9 !important;
            color: #000000 !important;
            padding: 3mm 2mm !important;
            border-bottom: 1px solid #000 !important;
            -webkit-print-color-adjust: exact;
          }

          .statement-table td {
            padding: 2.5mm 2mm !important;
            color: #000000 !important;
            background: #ffffff !important;
          }

          .formal-status {
            border-bottom: 1.5px solid #000 !important;
            color: #000 !important;
          }

          .document-footer {
            padding: 10mm 15mm 15mm 15mm !important;
            border-top: 1.5px solid #000 !important;
            margin-top: auto !important;
            background: #fff !important;
            color: #000 !important;
          }
        }
      `}</style>
    </div>
  )
}
