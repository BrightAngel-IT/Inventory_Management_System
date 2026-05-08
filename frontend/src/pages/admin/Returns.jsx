import React, { useState, useEffect } from 'react'
import { 
  RotateCcw, 
  Search, 
  Filter, 
  Plus, 
  ArrowLeft, 
  Calendar, 
  User, 
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MoreVertical,
  History,
  Boxes
} from 'lucide-react'
import { authConfig, formatCurrency, formatDate } from '../../utils'
import { SectionHeading } from '../../components/SectionHeading'
import _BarcodeReader from 'react-barcode-reader'
const BarcodeReader = _BarcodeReader.default || _BarcodeReader

export default function Returns({ api, session, onNotice }) {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  
  // New Return Form State
  const [newReturn, setNewReturn] = useState({
    type: 'customer',
    entityId: '',
    entityName: '',
    referenceNo: '',
    reason: '',
    refundMethod: 'credit-note',
    items: []
  })
  
  const [foundInvoice, setFoundInvoice] = useState(null)
  const [isSearchingInvoice, setIsSearchingInvoice] = useState(false)

  useEffect(() => {
    fetchReturns()
  }, [])

  async function fetchReturns() {
    setLoading(true)
    try {
      const response = await api.get('/returns', authConfig(session.token))
      setReturns(response.data)
    } catch (error) {
      onNotice({ type: 'error', text: 'Failed to load returns.' })
    } finally {
      setLoading(false)
    }
  }

  async function searchInvoice() {
    if (!newReturn.referenceNo) return
    setIsSearchingInvoice(true)
    setFoundInvoice(null)
    try {
      // Searching for original sale/invoice
      const response = await api.get(`/sales?query=${newReturn.referenceNo}`, authConfig(session.token))
      const sale = response.data.sales.find(s => s.invoiceNumber === newReturn.referenceNo)
      
      if (sale) {
        setFoundInvoice(sale)
        setNewReturn(prev => ({
          ...prev,
          entityId: sale.customerId || '',
          entityName: sale.customerName || '',
          items: sale.items.map(item => ({
            ...item,
            quantity: 1, // Default to 1 for return
            maxQuantity: item.quantity,
            unitPrice: item.price
          }))
        }))
      } else {
        onNotice({ type: 'warning', text: 'Invoice not found.' })
      }
    } catch (error) {
      onNotice({ type: 'error', text: 'Error searching invoice.' })
    } finally {
      setIsSearchingInvoice(false)
    }
  }

  async function handleSubmitReturn(e) {
    e.preventDefault()
    if (newReturn.items.length === 0) return
    
    try {
      await api.post('/returns', newReturn, authConfig(session.token))
      onNotice({ type: 'success', text: 'Return processed successfully.' })
      setShowForm(false)
      fetchReturns()
      resetForm()
    } catch (error) {
      onNotice({ type: 'error', text: 'Failed to process return.' })
    }
  }

  function resetForm() {
    setNewReturn({
      type: 'customer',
      entityId: '',
      entityName: '',
      referenceNo: '',
      reason: '',
      refundMethod: 'credit-note',
      items: []
    })
    setFoundInvoice(null)
  }

  async function handleBarcodeScan(code) {
    const cleanedCode = String(code || '').trim();
    if (!cleanedCode) return;

    // If an invoice is already found, try to select/increment the item in the return list
    if (foundInvoice) {
      const itemIndex = newReturn.items.findIndex(i => i.barcode === cleanedCode || i.sku === cleanedCode);
      if (itemIndex !== -1) {
        const nextItems = [...newReturn.items];
        const item = nextItems[itemIndex];
        if (item.quantity < item.maxQuantity) {
          item.quantity += 1;
          setNewReturn({ ...newReturn, items: nextItems });
          onNotice({ type: 'success', text: `Increased return qty for ${item.name}` });
        } else {
          onNotice({ type: 'warning', text: `Maximum return quantity reached for ${item.name}` });
        }
        return;
      }
    }

    // Otherwise, try to find an invoice that contains this product
    onNotice({ type: 'info', text: `Searching for invoices containing: ${cleanedCode}` });
    try {
      // We search for sales that contain this barcode
      const response = await api.get(`/sales?query=${cleanedCode}`, authConfig(session.token));
      const relevantSales = response.data.sales;
      
      if (relevantSales.length > 0) {
        // For simplicity, take the most recent one
        const latestSale = relevantSales[0];
        setFoundInvoice(latestSale);
        setNewReturn(prev => ({
          ...prev,
          referenceNo: latestSale.invoiceNumber,
          entityId: latestSale.customerId || '',
          entityName: latestSale.customerName || '',
          items: latestSale.items.map(item => ({
            ...item,
            quantity: (item.barcode === cleanedCode || item.sku === cleanedCode) ? 1 : 0, 
            maxQuantity: item.quantity,
            unitPrice: item.price
          }))
        }));
        onNotice({ type: 'success', text: `Found invoice ${latestSale.invoiceNumber}` });
        if (!showForm) setShowForm(true);
      } else {
        onNotice({ type: 'warning', text: 'No recent invoices found for this item.' });
      }
    } catch (error) {
      onNotice({ type: 'error', text: 'Error searching by barcode.' });
    }
  }

  const filteredReturns = returns.filter(r => 
    r.returnNo.toLowerCase().includes(search.toLowerCase()) ||
    r.entityName?.toLowerCase().includes(search.toLowerCase()) ||
    r.referenceNo?.toLowerCase().includes(search.toLowerCase())
  )

  if (showForm) {
    return (
      <div className="stack gap-6">
        <BarcodeReader onError={() => {}} onScan={handleBarcodeScan} />
        <div className="between align-center">
          <button onClick={() => setShowForm(false)} className="btn-ghost cluster gap-2">
            <ArrowLeft size={18} /> Back to Returns
          </button>
          <SectionHeading title="Process New Return" subtitle="Institutional credit note & stock reversal" />
        </div>

        <div className="grid-2 gap-6 align-start">
          <div className="panel glass-panel stack gap-6 p-6">
            <h3 className="font-bold cluster gap-2"><History size={20} className="accent-text" /> 1. Locate Original Transaction</h3>
            <div className="stack gap-4">
              <div className="field">
                <label>Original Invoice Number</label>
                <div className="cluster gap-2">
                  <input 
                    type="text" 
                    value={newReturn.referenceNo} 
                    onChange={e => setNewReturn({...newReturn, referenceNo: e.target.value})}
                    placeholder="e.g. C-INV-2026..."
                    className="flex-1"
                  />
                  <button onClick={searchInvoice} className="btn-primary" disabled={isSearchingInvoice}>
                    {isSearchingInvoice ? 'Searching...' : 'Find'}
                  </button>
                </div>
              </div>
              
              {foundInvoice && (
                <div className="panel-strong p-4 rounded-xl border border-dashed border-accent-soft">
                  <div className="between mb-2">
                    <span className="muted x-small uppercase">Transaction Found</span>
                    <span className="success-text x-small font-bold">VERIFIED</span>
                  </div>
                  <p className="font-bold">{foundInvoice.customerName}</p>
                  <div className="cluster gap-4 mt-2">
                    <span className="muted small cluster gap-1"><Calendar size={14} /> {formatDate(foundInvoice.createdAt)}</span>
                    <span className="muted small cluster gap-1"><FileText size={14} /> {formatCurrency(foundInvoice.total)}</span>
                  </div>
                </div>
              )}
            </div>

            <h3 className="font-bold cluster gap-2 mt-4"><RotateCcw size={20} className="accent-text" /> 2. Return Details</h3>
            <div className="stack gap-4">
              <div className="field">
                <label>Reason for Return</label>
                <textarea 
                  value={newReturn.reason} 
                  onChange={e => setNewReturn({...newReturn, reason: e.target.value})}
                  placeholder="e.g. Damaged during transit, Wrong item..."
                />
              </div>
              <div className="field">
                <label>Refund Method</label>
                <select 
                  value={newReturn.refundMethod} 
                  onChange={e => setNewReturn({...newReturn, refundMethod: e.target.value})}
                >
                  <option value="credit-note">Credit Note (Update Balance)</option>
                  <option value="cash">Direct Cash Refund</option>
                  <option value="bank-transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
          </div>

          <div className="panel glass-panel stack gap-6 p-6">
            <h3 className="font-bold cluster gap-2"><Boxes size={20} className="accent-text" /> 3. Select Items to Return</h3>
            
            {!foundInvoice ? (
              <div className="stack align-center p-12 muted">
                <AlertCircle size={40} opacity={0.2} />
                <p className="mt-2">Search for an invoice first</p>
              </div>
            ) : (
              <div className="stack gap-4">
                <table className="statement-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newReturn.items.map((item, idx) => (
                      <tr key={idx} className="statement-row">
                        <td>
                          <div className="stack">
                            <span className="font-bold">{item.name}</span>
                            <span className="muted x-small">Sold: {item.maxQuantity}</span>
                          </div>
                        </td>
                        <td>
                          <input 
                            type="number" 
                            value={item.quantity} 
                            min="1" 
                            max={item.maxQuantity}
                            onChange={e => {
                              const nextItems = [...newReturn.items]
                              nextItems[idx].quantity = parseInt(e.target.value)
                              setNewReturn({...newReturn, items: nextItems})
                            }}
                            className="w-16 p-1 rounded border"
                          />
                        </td>
                        <td className="text-right font-strong">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="panel-strong p-4 rounded-xl between mt-4">
                  <span className="muted">Total Return Value</span>
                  <strong className="accent-text" style={{ fontSize: '1.5rem' }}>
                    {formatCurrency(newReturn.items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0))}
                  </strong>
                </div>

                <button onClick={handleSubmitReturn} className="btn-primary w-full p-4 mt-2">
                  Complete Institutional Return
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="stack gap-6">
      <BarcodeReader onError={() => {}} onScan={handleBarcodeScan} />
      <div className="between align-center">
        <SectionHeading title="Returns & Refunds" subtitle="Track product reversals and credit adjustments" />
        <button onClick={() => setShowForm(true)} className="btn-primary cluster gap-2">
          <Plus size={18} /> New Return
        </button>
      </div>

      <div className="panel glass-panel p-4 cluster gap-4">
        <div className="search-field flex-1 cluster gap-2 p-2 rounded-xl" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
          <Search size={18} className="muted" />
          <input 
            type="text" 
            placeholder="Search returns by No, Entity or Ref..." 
            className="flex-1 bg-transparent border-none outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-ghost cluster gap-2"><Filter size={18} /> Filter</button>
      </div>

      <div className="panel glass-panel overflow-hidden">
        <table className="statement-table">
          <thead>
            <tr>
              <th>Return No</th>
              <th>Date</th>
              <th>Entity</th>
              <th>Reference</th>
              <th className="text-right">Amount</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center p-12 muted">Loading institutional ledger...</td></tr>
            ) : filteredReturns.length === 0 ? (
              <tr><td colSpan="7" className="text-center p-12 muted">No returns found matching your query.</td></tr>
            ) : filteredReturns.map((ret) => (
              <tr key={ret._id} className="statement-row">
                <td><strong className="accent-text">{ret.returnNo}</strong></td>
                <td className="muted">{formatDate(ret.createdAt)}</td>
                <td>
                  <div className="cluster gap-2">
                    <div className="avatar x-small">{ret.entityName?.[0]}</div>
                    <span className="font-bold">{ret.entityName}</span>
                  </div>
                </td>
                <td><span className="muted x-small uppercase font-bold">{ret.referenceNo}</span></td>
                <td className="text-right font-strong danger-text">-{formatCurrency(ret.totalAmount)}</td>
                <td>
                  <div className="cluster gap-1 success-text small font-bold uppercase">
                    <CheckCircle2 size={14} /> Completed
                  </div>
                </td>
                <td className="text-center">
                  <button className="icon-btn"><Eye size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
