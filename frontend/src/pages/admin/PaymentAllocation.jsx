import React, { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Search, 
  Plus, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Wallet,
  Receipt,
  Building2,
  Calendar,
  Hash
} from 'lucide-react'
import { SectionHeading } from '../../components/SectionHeading'
import { formatCurrency, authConfig } from '../../utils'

export function PaymentAllocation({ api, session, onNotice }) {
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [paymentForm, setPaymentForm] = useState({
    totalAmount: '',
    paymentMethod: 'CASH',
    chequeNumber: '',
    paymentDate: new Date().toISOString().split('T')[0],
  })

  const [allocations, setAllocations] = useState({}) // { invoiceId: amount }

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await api.get('/customers', authConfig(session.token))
        setCustomers(res.data)
      } catch (err) {
        onNotice({ type: 'error', text: 'Failed to load customers' })
      }
    }
    fetchCustomers()
  }, [api, session.token, onNotice])

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerInvoices(selectedCustomer)
    } else {
      setInvoices([])
      setAllocations({})
    }
  }, [selectedCustomer])

  async function fetchCustomerInvoices(customerId) {
    setLoading(true)
    try {
      const res = await api.get(`/customer-invoices/${customerId}`, authConfig(session.token))
      setInvoices(res.data)
    } catch (err) {
      onNotice({ type: 'error', text: 'Failed to load invoices' })
    } finally {
      setLoading(false)
    }
  }

  const handleAllocationChange = (invoiceId, value, balance) => {
    const amount = parseFloat(value) || 0
    if (amount > balance) {
      onNotice({ type: 'warning', text: 'Cannot allocate more than invoice balance' })
      return
    }
    setAllocations(prev => ({
      ...prev,
      [invoiceId]: value
    }))
  }

  const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
  const remainingUnallocated = (parseFloat(paymentForm.totalAmount) || 0) - totalAllocated

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (totalAllocated === 0) {
      onNotice({ type: 'error', text: 'Please allocate some amount to invoices' })
      return
    }

    if (totalAllocated > (parseFloat(paymentForm.totalAmount) || 0)) {
      onNotice({ type: 'error', text: 'Total allocated amount exceeds payment amount' })
      return
    }

    if (paymentForm.paymentMethod === 'CHEQUE' && !paymentForm.chequeNumber) {
      onNotice({ type: 'error', text: 'Cheque number is required' })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        customerId: selectedCustomer,
        paymentDate: paymentForm.paymentDate,
        totalAmount: parseFloat(paymentForm.totalAmount),
        paymentMethod: paymentForm.paymentMethod,
        chequeNumber: paymentForm.chequeNumber,
        allocations: Object.entries(allocations)
          .filter(([_, amount]) => parseFloat(amount) > 0)
          .map(([invoiceId, amount]) => ({
            invoiceId,
            allocatedAmount: parseFloat(amount)
          }))
      }

      await api.post('/payments', payload, authConfig(session.token))
      onNotice({ type: 'success', text: 'Payment allocated successfully' })
      
      // Reset form
      setSelectedCustomer('')
      setPaymentForm({
        totalAmount: '',
        paymentMethod: 'CASH',
        chequeNumber: '',
        paymentDate: new Date().toISOString().split('T')[0],
      })
      setAllocations({})
    } catch (err) {
      onNotice({ type: 'error', text: err.response?.data?.message || 'Failed to process payment' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="stack gap-6 animate-fade">
      <div className="between wrap-row panel p-6 glass-panel">
        <div className="cluster gap-4">
          <div className="icon-btn" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: 'none' }}>
            <Wallet size={24} />
          </div>
          <SectionHeading
            title="Payment Allocation"
            text="Settle customer balances and manage invoice credit."
          />
        </div>
      </div>

      <div className="grid-2 gap-6">
        {/* Payment Details */}
        <section className="panel p-6 glass-panel stack gap-6">
          <div className="cluster gap-2 mb-2">
            <CreditCard size={18} className="accent-text" />
            <span className="eyebrow">Transaction Details</span>
          </div>

          <form onSubmit={handleSubmit} className="stack gap-5">
            <label className="field">
              <span>Select Customer</span>
              <select 
                className="input" 
                value={selectedCustomer} 
                onChange={(e) => setSelectedCustomer(e.target.value)}
                required
              >
                <option value="">Choose a customer...</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </label>

            <div className="split-fields">
              <label className="field">
                <span>Payment Date</span>
                <input 
                  type="date" 
                  className="input" 
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>Total Amount</span>
                <input 
                  type="number" 
                  className="input" 
                  placeholder="0.00"
                  value={paymentForm.totalAmount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, totalAmount: e.target.value })}
                  required
                />
              </label>
            </div>

            <div className="split-fields">
              <label className="field">
                <span>Payment Method</span>
                <select 
                  className="input"
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  required
                >
                  <option value="CASH">CASH</option>
                  <option value="CARD">CARD</option>
                  <option value="CHEQUE">CHEQUE</option>
                  <option value="CREDIT_NOTE">CREDIT NOTE</option>
                </select>
              </label>
              {paymentForm.paymentMethod === 'CHEQUE' && (
                <label className="field">
                  <span>Cheque Number</span>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Enter cheque #"
                    value={paymentForm.chequeNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, chequeNumber: e.target.value })}
                    required
                  />
                </label>
              )}
            </div>

            <div className="p-5 mt-4" style={{ background: 'var(--bg-soft)', borderRadius: '20px', border: '1px solid var(--border)' }}>
              <div className="between mb-3">
                <span className="muted small font-strong">Summary</span>
              </div>
              <div className="between mb-2">
                <span className="small muted">Total Allocated</span>
                <span className="font-strong">{formatCurrency(totalAllocated)}</span>
              </div>
              <div className="between pt-3" style={{ borderTop: '1px dashed var(--border)' }}>
                <span className="small muted">Unallocated Balance</span>
                <span className={`font-strong ${remainingUnallocated < 0 ? 'danger-text' : 'success-text'}`} style={{ color: remainingUnallocated < 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {formatCurrency(remainingUnallocated)}
                </span>
              </div>
            </div>

            <button 
              className="btn btn-primary w-full glow-on-hover mt-4" 
              type="submit" 
              disabled={submitting || !selectedCustomer}
              style={{ padding: '18px', borderRadius: '18px' }}
            >
              {submitting ? 'Processing...' : 'Save & Allocate Payment'}
            </button>
          </form>
        </section>

        {/* Invoice List */}
        <section className="panel glass-panel overflow-hidden" style={{ padding: 0 }}>
          <div className="p-6 pb-0">
            <div className="cluster gap-2 mb-4">
              <Receipt size={18} className="accent-text" />
              <span className="eyebrow">Pending Invoices</span>
            </div>
          </div>

          <div className="overflow-auto" style={{ maxHeight: '600px' }}>
            <table className="w-full professional-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '24px' }}>Invoice</th>
                  <th>Date</th>
                  <th>Balance</th>
                  <th style={{ width: '150px', paddingRight: '24px' }}>Allocate</th>
                </tr>
              </thead>
              <tbody>
                {!selectedCustomer ? (
                  <tr>
                    <td colSpan="4" className="text-center p-8 muted">
                      Select a customer to view invoices
                    </td>
                  </tr>
                ) : loading ? (
                  <tr>
                    <td colSpan="4" className="text-center p-8 muted">
                      <div className="spinner m-0-auto"></div>
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center p-8 muted">
                      No unpaid invoices found for this customer
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv._id} className={parseFloat(allocations[inv._id]) >= inv.balanceAmount ? 'bg-success-soft' : ''}>
                      <td style={{ paddingLeft: '24px' }}>
                        <div className="stack">
                          <strong className="small">{inv.invoiceNo}</strong>
                          <span className="muted x-small">Total: {formatCurrency(inv.totalAmount)}</span>
                        </div>
                      </td>
                      <td>
                        <span className="small muted">{new Date(inv.date).toLocaleDateString()}</span>
                      </td>
                      <td>
                        <strong className="small">{formatCurrency(inv.balanceAmount)}</strong>
                      </td>
                      <td style={{ paddingRight: '24px' }}>
                        <input 
                          type="number" 
                          className="input compact"
                          placeholder="0.00"
                          style={{ textAlign: 'right' }}
                          value={allocations[inv._id] || ''}
                          onChange={(e) => handleAllocationChange(inv._id, e.target.value, inv.balanceAmount)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
