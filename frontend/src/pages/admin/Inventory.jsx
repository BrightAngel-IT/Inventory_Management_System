import React, { useState } from 'react'
import {
  Boxes,
  Edit,
  Plus,
  Search,
  Tag,
  Warehouse,
  X,
  History,
  TrendingDown,
  TrendingUp,
  Truck,
  AlertCircle,
} from 'lucide-react'
import { SectionHeading } from '../../components/SectionHeading'
import { formatCurrency } from '../../utils'

export function Inventory({
  inventoryProducts,
  inventoryQuery,
  setInventoryQuery,
  onlyLowStock,
  setOnlyLowStock,
  productForm,
  handleProductFormChange,
  handleProductSave,
  startEditingProduct,
  resetProductEditor,
  editingProductId,
  busyAction,
}) {
  const [showHistory, setShowHistory] = useState(false)

  // Mock movement history for visual appeal
  const mockHistory = [
    { type: 'in', qty: 50, date: 'Today, 10:30 AM', user: 'Admin' },
    { type: 'out', qty: 12, date: 'Today, 09:15 AM', user: 'Cashier 1' },
    { type: 'in', qty: 100, date: 'Yesterday', user: 'Admin' },
  ]

  return (
    <div className="inventory-grid animate-fade">
      <section className="panel p-6 stack gap-5 glass-panel">
        <div className="between wrap-row">
          <SectionHeading
            title="Stock Ledger"
            text="Global inventory view and rack placement management."
          />
          <div className="cluster gap-3">
            <div className="input-shell compact" style={{ flexBasis: '350px', background: 'var(--bg-soft)', border: '1px solid var(--accent-soft)', borderRadius: '999px', padding: '6px 20px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
              <Search size={18} className="accent-text" style={{ color: 'var(--accent)' }} />
              <input
                className="ghost-input"
                style={{ fontSize: '0.95rem' }}
                placeholder="Search by name, SKU, barcode..."
                value={inventoryQuery}
                onChange={(e) => setInventoryQuery(e.target.value)}
              />
            </div>
            <button
              className={`btn ${onlyLowStock ? 'btn-primary' : 'btn-secondary'} glow-on-hover`}
              style={{ padding: '8px 20px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600 }}
              onClick={() => setOnlyLowStock(!onlyLowStock)}
            >
              <AlertCircle size={16} />
              {onlyLowStock ? 'Showing Critical' : 'Low Stock Alerts'}
            </button>
          </div>
        </div>

        <div className="stack gap-3">
          {inventoryProducts.map((product) => (
            <div key={product._id} className="inventory-row p-4 panel-strong glow-on-hover animate-slide" style={{ borderRadius: '24px', border: '1px solid var(--border)', background: 'linear-gradient(145deg, var(--panel-strong), var(--bg-soft))', boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s ease' }}>
              <div className="cluster gap-5">
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '16px', padding: '4px', background: 'var(--panel-strong)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                  </div>
                  {product.quantityInStock <= product.reorderLevel && (
                    <div className="animate-pulse-soft cluster justify-center" style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--danger)', color: 'white', width: '24px', height: '24px', borderRadius: '50%', boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)' }}>
                      <AlertCircle size={14} />
                    </div>
                  )}
                </div>
                <div className="stack gap-1">
                  <div className="cluster gap-3">
                    <strong style={{ fontSize: '1.2rem', color: 'var(--text)' }}>{product.name}</strong>
                    <span className="pill neutral" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>{product.sku}</span>
                  </div>
                  <p className="muted small" style={{ fontWeight: 500 }}>{product.category} <span style={{ opacity: 0.5 }}>|</span> Code: {product.barcode}</p>
                  <div className="cluster gap-4 mt-2">
                    <div className="cluster gap-1">
                      <Tag size={14} style={{ color: 'var(--accent)' }} />
                      <span className="font-strong" style={{ color: 'var(--accent-strong)' }}>{formatCurrency(product.price)}</span>
                    </div>
                    <div className="cluster gap-1 muted small">
                      <Truck size={14} />
                      <span>{product.supplier || 'General Vendor'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="inventory-meta cluster gap-4">
                <div className="stack align-center p-3" style={{ background: 'var(--bg-soft)', borderRadius: '16px', minWidth: '110px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="muted small eyebrow mb-1">In Stock</span>
                  <div className={`font-strong ${product.quantityInStock <= product.reorderLevel ? 'danger-text' : 'success-text'}`} style={{ fontSize: '1.25rem', color: product.quantityInStock <= product.reorderLevel ? 'var(--danger)' : 'var(--success)' }}>
                    {product.quantityInStock} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{product.unit}</span>
                  </div>
                </div>
                <div className="stack align-center p-3" style={{ background: 'var(--bg-soft)', borderRadius: '16px', minWidth: '110px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="muted small eyebrow mb-1">Rack Loc</span>
                  <div className="cluster gap-2">
                    <Warehouse size={16} className="accent-text" />
                    <strong className="font-strong" style={{ fontSize: '1.1rem' }}>{product.rackLabel}</strong>
                  </div>
                </div>
                <button className="icon-btn glow-on-hover ml-2" onClick={() => startEditingProduct(product)} style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--accent-soft)', color: 'var(--accent-strong)', borderColor: 'transparent' }}>
                  <Edit size={20} />
                </button>
              </div>
            </div>
          ))}
          {inventoryProducts.length === 0 && (
            <div className="empty-state" style={{ padding: '80px' }}>
              <div className="metric-icon" style={{ width: '64px', height: '64px' }}>
                <Boxes size={32} />
              </div>
              <p className="lede mt-4">No inventory records found for your search.</p>
            </div>
          )}
        </div>
      </section>

      <aside className="stack gap-6 sticky-panel">
        <div className="panel p-6 stack gap-5 glass-panel">
          <div className="between">
            <SectionHeading
              title={editingProductId ? 'Modify Stock' : 'Add New SKU'}
              text="Input master data to sync with shelves."
            />
            {editingProductId && (
              <button type="button" className="icon-btn" onClick={resetProductEditor}>
                <X size={18} />
              </button>
            )}
          </div>

          <div className="stack gap-5">
            <label className="field">
              <span>Official Product Name</span>
              <input
                className="input"
                name="name"
                placeholder="Full descriptive name"
                value={productForm.name}
                onChange={handleProductFormChange}
                required
              />
            </label>

            <div className="split-fields">
              <label className="field">
                <span>SKU ID</span>
                <input
                  className="input"
                  name="sku"
                  placeholder="SKU-123"
                  value={productForm.sku}
                  onChange={handleProductFormChange}
                  required
                />
              </label>
              <label className="field">
                <span>Barcode</span>
                <input
                  className="input"
                  name="barcode"
                  placeholder="Scan or type..."
                  value={productForm.barcode}
                  onChange={handleProductFormChange}
                  required
                />
              </label>
            </div>

            <div className="split-fields">
              <label className="field">
                <span>Category</span>
                <input
                  className="input"
                  name="category"
                  placeholder="e.g. Electronics"
                  value={productForm.category}
                  onChange={handleProductFormChange}
                  required
                />
              </label>
              <label className="field">
                <span>Unit</span>
                <input
                  className="input"
                  name="unit"
                  placeholder="pcs, kg"
                  value={productForm.unit}
                  onChange={handleProductFormChange}
                />
              </label>
            </div>

            <div className="split-fields">
              <label className="field">
                <span>Price</span>
                <input
                  className="input"
                  type="number"
                  name="price"
                  value={productForm.price}
                  onChange={handleProductFormChange}
                  required
                />
              </label>
              <label className="field">
                <span>Min. Level</span>
                <input
                  className="input"
                  type="number"
                  name="reorderLevel"
                  value={productForm.reorderLevel}
                  onChange={handleProductFormChange}
                />
              </label>
            </div>

            <div className="stack gap-3 p-5" style={{ borderRadius: '20px', background: 'var(--bg-soft)', border: '1px solid var(--border)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
              <div className="cluster gap-2 mb-1">
                <Warehouse size={16} style={{ color: 'var(--accent)' }} />
                <span className="eyebrow" style={{ fontSize: '0.7rem' }}>Shelf Allocation</span>
              </div>
              <div className="split-fields triple">
                <input className="input" type="number" name="rack.rowNumber" placeholder="Row" value={productForm.rack.rowNumber} onChange={handleProductFormChange} required style={{ textAlign: 'center' }} />
                <input className="input" type="number" name="rack.columnNumber" placeholder="Col" value={productForm.rack.columnNumber} onChange={handleProductFormChange} required style={{ textAlign: 'center' }} />
                <input className="input" type="number" name="rack.shelfNumber" placeholder="Shelf" value={productForm.rack.shelfNumber} onChange={handleProductFormChange} required style={{ textAlign: 'center' }} />
              </div>
            </div>

            <button className="btn btn-primary w-full glow-on-hover mt-2" type="submit" disabled={busyAction === 'product-save'} style={{ padding: '16px', borderRadius: '16px', fontSize: '1.05rem' }}>
              {busyAction === 'product-save' ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : editingProductId ? <Edit size={20} /> : <Plus size={20} />}
              {busyAction === 'product-save' ? 'Syncing...' : editingProductId ? 'Update Inventory Record' : 'Add New Inventory Record'}
            </button>
          </div>
        </div>

        <div className="panel p-6 stack gap-5 glass-panel">
          <div className="between">
            <div className="cluster gap-2">
              <History size={18} className="muted" />
              <SectionHeading title="Movement History" text="Recent stock ins and outs." />
            </div>
            <button className="btn btn-ghost small" onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? 'Hide' : 'Show All'}
            </button>
          </div>
          
          <div className="stack gap-4 mt-2">
            {mockHistory.map((h, i) => (
              <div key={i} className="between p-4 panel-strong glow-on-hover" style={{ borderRadius: '16px', border: '1px solid transparent', transition: 'all 0.2s', cursor: 'default' }}>
                <div className="cluster gap-4">
                  <div className={`icon-btn ${h.type === 'in' ? 'success' : 'danger'}-soft`} style={{ border: 'none', background: h.type === 'in' ? 'var(--success-soft)' : 'var(--danger-soft)', color: h.type === 'in' ? 'var(--success)' : 'var(--danger)', width: '48px', height: '48px', borderRadius: '14px' }}>
                    {h.type === 'in' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div className="stack gap-1">
                    <strong style={{ fontSize: '0.95rem' }}>{h.type === 'in' ? 'Restock Received' : 'Retail Sale'} <span style={{ color: h.type === 'in' ? 'var(--success)' : 'var(--danger)' }}>({h.type === 'in' ? '+' : '-'}{h.qty})</span></strong>
                    <span className="muted small" style={{ fontWeight: 500 }}>{h.date}</span>
                  </div>
                </div>
                <div className="pill neutral" style={{ fontSize: '0.7rem', padding: '6px 12px', background: 'var(--bg)', border: '1px solid var(--border)' }}>{h.user}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
