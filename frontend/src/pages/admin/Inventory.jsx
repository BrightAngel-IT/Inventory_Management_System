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
            <div className="input-shell compact" style={{ flexBasis: '300px' }}>
              <Search size={18} className="muted" />
              <input
                className="ghost-input"
                placeholder="Name, SKU or Rack..."
                value={inventoryQuery}
                onChange={(e) => setInventoryQuery(e.target.value)}
              />
            </div>
            <button
              className={`pill ${onlyLowStock ? 'warning' : 'neutral'}`}
              style={{ cursor: 'pointer', border: 'none' }}
              onClick={() => setOnlyLowStock(!onlyLowStock)}
            >
              {onlyLowStock ? 'Showing Critical' : 'Filter Low Stock'}
            </button>
          </div>
        </div>

        <div className="stack gap-3">
          {inventoryProducts.map((product) => (
            <div key={product._id} className="inventory-row p-4 panel-strong glow-on-hover" style={{ borderRadius: '20px', border: '1px solid var(--border)' }}>
              <div className="cluster gap-4">
                <div style={{ position: 'relative' }}>
                  <img src={product.image} alt={product.name} className="thumb large" />
                  {product.quantityInStock <= product.reorderLevel && (
                    <div className="animate-pulse-soft" style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', color: 'white', padding: '4px', borderRadius: '50%', boxShadow: '0 0 10px var(--danger)' }}>
                      <AlertCircle size={12} />
                    </div>
                  )}
                </div>
                <div className="stack gap-1">
                  <div className="cluster gap-2">
                    <strong style={{ fontSize: '1.1rem' }}>{product.name}</strong>
                    <span className="code-line">{product.sku}</span>
                  </div>
                  <p className="muted small">{product.category} · Barcode: {product.barcode}</p>
                  <div className="cluster gap-3 mt-1">
                    <div className="cluster gap-1 muted small">
                      <Tag size={12} />
                      <span className="font-strong">{formatCurrency(product.price)}</span>
                    </div>
                    <div className="cluster gap-1 muted small">
                      <Truck size={12} />
                      <span>{product.supplier || 'General Vendor'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="inventory-meta">
                <div className="p-3 bg-soft" style={{ borderRadius: '12px', minWidth: '120px' }}>
                  <span className="muted small eyebrow" style={{ fontSize: '0.6rem' }}>Current Stock</span>
                  <div className={`font-strong ${product.quantityInStock <= product.reorderLevel ? 'accent-text' : ''}`}>
                    {product.quantityInStock} {product.unit}
                  </div>
                </div>
                <div className="p-3 bg-soft" style={{ borderRadius: '12px', minWidth: '120px' }}>
                  <span className="muted small eyebrow" style={{ fontSize: '0.6rem' }}>Rack Location</span>
                  <div className="cluster gap-2">
                    <Warehouse size={14} className="accent-text" />
                    <strong className="font-strong">{product.rackLabel}</strong>
                  </div>
                </div>
                <button className="icon-btn glow-on-hover" onClick={() => startEditingProduct(product)}>
                  <Edit size={18} />
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

            <div className="stack gap-3 p-4 bg-soft" style={{ borderRadius: '16px', border: '1px solid var(--border)' }}>
              <span className="eyebrow" style={{ fontSize: '0.65rem' }}>Shelf Allocation</span>
              <div className="split-fields triple">
                <input className="input" type="number" name="rack.rowNumber" placeholder="Row" value={productForm.rack.rowNumber} onChange={handleProductFormChange} required />
                <input className="input" type="number" name="rack.columnNumber" placeholder="Col" value={productForm.rack.columnNumber} onChange={handleProductFormChange} required />
                <input className="input" type="number" name="rack.shelfNumber" placeholder="Shelf" value={productForm.rack.shelfNumber} onChange={handleProductFormChange} required />
              </div>
            </div>

            <button className="btn btn-primary w-full glow-on-hover" type="submit" disabled={busyAction === 'product-save'}>
              {busyAction === 'product-save' ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : editingProductId ? <Edit size={18} /> : <Plus size={18} />}
              {busyAction === 'product-save' ? 'Syncing...' : editingProductId ? 'Update Record' : 'Create Record'}
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
          
          <div className="stack gap-3">
            {mockHistory.map((h, i) => (
              <div key={i} className="between p-3 panel-strong" style={{ borderRadius: '12px' }}>
                <div className="cluster gap-3">
                  <div className={`icon-btn small ${h.type === 'in' ? 'success' : 'danger'}-soft`} style={{ border: 'none' }}>
                    {h.type === 'in' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  </div>
                  <div className="stack">
                    <strong style={{ fontSize: '0.85rem' }}>{h.type === 'in' ? 'Restock' : 'Sale'} ({h.qty})</strong>
                    <span className="muted small">{h.date}</span>
                  </div>
                </div>
                <div className="pill neutral" style={{ fontSize: '0.6rem' }}>{h.user}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
