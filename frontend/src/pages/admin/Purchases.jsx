import React, { useEffect, useState } from 'react'
import { 
  Truck, 
  Plus, 
  Search, 
  Calendar, 
  DollarSign, 
  X, 
  Trash2, 
  ShoppingBag,
  FileText,
  Boxes,
  CheckCircle2
} from 'lucide-react'
import { SectionHeading } from '../../components/SectionHeading'
import { authConfig, readErrorMessage, formatCurrency, formatDate } from '../../utils'
import { Pagination } from '../../components/Pagination'

export default function Purchases({ api, session, onNotice }) {
  const [purchases, setPurchases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const [formData, setFormData] = useState({
    supplier: '',
    items: [], // { productId, quantity, costPrice }
    total: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [pRes, sRes, prRes] = await Promise.all([
        api.get('/purchases', authConfig(session.token)),
        api.get('/suppliers', authConfig(session.token)),
        api.get('/products', authConfig(session.token))
      ])
      setPurchases(pRes.data)
      setSuppliers(sRes.data)
      setProducts(prRes.data.products || [])
    } catch (err) {
      onNotice({ type: 'error', text: 'Failed to sync purchase records.' })
    } finally {
      setLoading(false)
    }
  }

  function addItem() {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1, costPrice: 0 }]
    })
  }

  function removeItem(index) {
    const newItems = formData.items.filter((_, i) => i !== index)
    const newTotal = newItems.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0)
    setFormData({ ...formData, items: newItems, total: newTotal })
  }

  function updateItem(index, field, value) {
    const newItems = [...formData.items]
    newItems[index][field] = value
    const newTotal = newItems.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0)
    setFormData({ ...formData, items: newItems, total: newTotal })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (formData.items.length === 0) return onNotice({ type: 'error', text: 'Add at least one item.' })
    try {
      await api.post('/purchases', {
        supplier: formData.supplier,
        products: formData.items.map(i => ({ product: i.productId, quantity: i.quantity, costPrice: i.costPrice })),
        total: formData.total,
        date: new Date()
      }, authConfig(session.token))
      
      onNotice({ type: 'success', text: 'Purchase order processed. Supplier invoice generated.' })
      setShowForm(false)
      setFormData({ supplier: '', items: [], total: 0 })
      fetchData()
    } catch (err) {
      onNotice({ type: 'error', text: readErrorMessage(err) })
    }
  }

  const totalPages = Math.ceil(purchases.length / itemsPerPage)
  const paginatedPurchases = purchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="stack gap-6 animate-fade">
      <div className="between wrap-row panel p-6 glass-panel" style={{ borderLeft: '4px solid var(--accent)' }}>
        <div className="cluster gap-4">
          <div className="icon-btn" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: 'none' }}>
            <Truck size={24} />
          </div>
          <SectionHeading 
            title="Procurement Log" 
            text="Track incoming stock and supplier liabilities." 
          />
        </div>
        <button className="btn btn-primary glow-on-hover" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          Record Purchase
        </button>
      </div>

      {showForm && (
        <div className="panel p-8 glass-panel animate-fade relative">
          <button className="icon-btn ghost absolute top-4 right-4" onClick={() => setShowForm(false)}>
            <X size={20} />
          </button>
          <form onSubmit={handleSubmit} className="stack gap-6">
            <h3 className="accent-text">New Procurement Order</h3>
            
            <label className="field">
              <span>Select Supplier</span>
              <select className="input" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} required>
                <option value="">-- Select Partner --</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </label>

            <div className="stack gap-4">
              <div className="between">
                <span className="eyebrow">Order Items</span>
                <button type="button" className="btn btn-secondary small" onClick={addItem}>
                  <Plus size={14} /> Add Line
                </button>
              </div>
              
              <div className="stack gap-2">
                {formData.items.map((item, idx) => (
                  <div key={idx} className="cluster gap-3 panel-strong p-3" style={{ borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <select 
                      className="input flex-1" 
                      value={item.productId} 
                      onChange={e => updateItem(idx, 'productId', e.target.value)}
                      required
                    >
                      <option value="">-- Product --</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                    </select>
                    <input 
                      className="input" 
                      type="number" 
                      style={{ width: '80px' }} 
                      placeholder="Qty" 
                      value={item.quantity} 
                      onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                      required 
                    />
                    <input 
                      className="input" 
                      type="number" 
                      style={{ width: '120px' }} 
                      placeholder="Cost" 
                      value={item.costPrice} 
                      onChange={e => updateItem(idx, 'costPrice', Number(e.target.value))}
                      required 
                    />
                    <button type="button" className="icon-btn ghost hover-danger" onClick={() => removeItem(idx)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="between panel-strong p-4" style={{ borderRadius: '14px' }}>
              <span className="font-strong">Total Commitment:</span>
              <h2 className="accent-text">{formatCurrency(formData.total)}</h2>
            </div>

            <button className="btn btn-primary w-full" type="submit">
              Finalize Order
            </button>
          </form>
        </div>
      )}

      <div className="panel glass-panel overflow-auto">
        <table className="w-full professional-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '24px' }}>Purchase ID</th>
              <th>Supplier Partner</th>
              <th>Order Volume</th>
              <th>Financial Valuation</th>
              <th style={{ textAlign: 'right', paddingRight: '24px' }}>Date Processed</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPurchases.map(pur => (
              <tr key={pur._id} className="table-row-hover">
                <td style={{ paddingLeft: '24px' }}>
                  <div className="cluster gap-2">
                    <FileText size={14} className="muted" />
                    <strong className="small font-mono">#{pur._id.slice(-6).toUpperCase()}</strong>
                  </div>
                </td>
                <td>
                  <div className="stack">
                    <strong className="small">{pur.supplier?.name || 'Manual Entry'}</strong>
                    <span className="muted x-small">{pur.supplier?.category || 'General Supply'}</span>
                  </div>
                </td>
                <td>
                  <div className="cluster gap-2">
                    <Boxes size={14} className="muted" />
                    <span className="small">{pur.products?.length || 0} Line Items</span>
                  </div>
                </td>
                <td>
                  <strong className="accent-text">{formatCurrency(pur.total)}</strong>
                </td>
                <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                  <span className="muted small">{formatDate(pur.date || pur.createdAt)}</span>
                </td>
              </tr>
            ))}
            {purchases.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="p-12 text-center muted">No procurement history recorded.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={purchases.length}
        itemsPerPage={itemsPerPage}
      />
    </div>
  )
}
