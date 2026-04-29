import React, { useState } from 'react'
import {
  CreditCard,
  Plus,
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
  X,
  PauseCircle,
  History,
  Tag,
  UserPlus,
  ScanLine,
} from 'lucide-react'
import { SectionHeading } from '../../components/SectionHeading'
import { formatCurrency } from '../../utils'

export function POS({
  catalogProducts,
  catalogQuery,
  setCatalogQuery,
  cart,
  setCart,
  addProductToCart,
  changeCartQuantity,
  checkoutForm,
  setCheckoutForm,
  handleCheckout,
  busyAction,
  cartSubtotal,
  cartTax,
  cartTotal,
  barcodeValue,
  customers,
}) {
  const [heldBills, setHeldBills] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', ...new Set(catalogProducts.map(p => p.category))]
  const filteredProducts = catalogProducts.filter(p => 
    (activeCategory === 'All' || p.category === activeCategory)
  )

  const handleHoldBill = () => {
    if (cart.length === 0) return
    const newHold = {
      id: Date.now(),
      cart: [...cart],
      customer: checkoutForm.customerName || 'Walk-in Customer',
      total: cartTotal,
      time: new Date().toLocaleTimeString()
    }
    setHeldBills([newHold, ...heldBills])
    setCart([])
    setCheckoutForm({ ...checkoutForm, customerName: '' })
  }

  const handleResumeBill = (hold) => {
    setCart(hold.cart)
    setHeldBills(heldBills.filter(h => h.id !== hold.id))
  }

  return (
    <div className="pos-grid animate-fade">
      <section className="stack gap-6">
        <div className="panel p-6 stack gap-5 glass-panel">
          <div className="between wrap-row gap-4 mb-4">
            <SectionHeading
              title="Billing Console"
              text="Search and select items to add to the active bill."
            />
            <div className="input-shell compact" style={{ flexBasis: '320px' }}>
              <Search size={18} className="muted" />
              <input
                className="ghost-input"
                placeholder="SKU, Barcode or Name..."
                value={catalogQuery}
                onChange={(e) => setCatalogQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="cluster gap-2 wrap-row" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`pill ${activeCategory === cat ? 'active' : 'neutral'}`}
                style={{ cursor: 'pointer', border: 'none', padding: '6px 16px' }}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <button
                key={product._id}
                type="button"
                className="product-card stack glow-on-hover"
                onClick={() => addProductToCart(product)}
                disabled={product.quantityInStock <= 0}
              >
                <div style={{ position: 'relative' }}>
                  <img src={product.image} alt={product.name} className="product-image" />
                  <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                    <div className="pill glass" style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--text)', fontSize: '0.6rem', fontWeight: 700 }}>
                      {product.rackLabel}
                    </div>
                  </div>
                </div>
                <div className="stack gap-1 p-1">
                  <div className="between">
                    <span className="eyebrow" style={{ fontSize: '0.6rem', color: 'var(--accent)' }}>{product.category}</span>
                    <span className={`pill ${product.quantityInStock <= 5 ? 'danger' : 'success'}-soft`} style={{ fontSize: '0.6rem' }}>
                      {product.quantityInStock} stock
                    </span>
                  </div>
                  <strong style={{ fontSize: '1rem', lineHeight: 1.2 }}>{product.name}</strong>
                  <div className="between mt-2">
                    <span className="font-strong" style={{ fontSize: '1.1rem', color: 'var(--accent-strong)' }}>
                      {formatCurrency(product.price)}
                    </span>
                    <div className="icon-btn glow-on-hover" style={{ width: '32px', height: '32px', background: 'var(--accent)', color: 'white', border: 'none' }}>
                      <Plus size={18} />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <aside className="stack gap-6 sticky-panel">
        <div className="panel p-6 stack gap-5 glass-panel" style={{ minHeight: '400px' }}>
          <div className="between wrap-row gap-2 mb-2">
            <SectionHeading title="Active Cart" text={`${cart.length} items`} />
            <div className="cluster gap-2">
               <button className="icon-btn glow-on-hover" title="Hold Bill" onClick={handleHoldBill} disabled={cart.length === 0} style={{ width: '40px', height: '40px', background: 'var(--panel-strong)', borderRadius: '12px' }}>
                <PauseCircle size={18} />
              </button>
              <button className="icon-btn glow-on-hover" title="Clear All" onClick={() => setCart([])} disabled={cart.length === 0} style={{ color: 'var(--danger)', width: '40px', height: '40px', background: 'var(--danger-soft)', borderColor: 'transparent', borderRadius: '12px' }}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className={`scanner-panel p-3 ${barcodeValue ? 'animate-pulse-soft' : ''}`} style={{ borderRadius: '12px', background: barcodeValue ? 'linear-gradient(145deg, var(--accent-soft), transparent)' : 'var(--bg-soft)', border: `1px solid ${barcodeValue ? 'var(--accent)' : 'var(--border)'}`, transition: 'all 0.3s ease', marginBottom: '8px' }}>
            <div className="between mb-1">
              <div className="cluster gap-2">
                <ScanLine size={14} className={barcodeValue ? 'accent-text' : 'muted'} />
                <strong style={{ fontSize: '0.8rem' }}>Barcode Scanner</strong>
              </div>
              {barcodeValue && <div className="pill" style={{ fontSize: '0.55rem', background: 'var(--accent)', color: 'white' }}>Captured</div>}
            </div>
            <p className="muted small" style={{ fontSize: '0.7rem' }}>
              {barcodeValue ? 'Item added to cart' : 'Awaiting barcode input...'}
            </p>
            {barcodeValue && (
              <div className="mt-2 p-2" style={{ borderRadius: '8px', background: 'var(--panel-strong)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-strong)', border: '1px solid var(--accent-soft)', textAlign: 'center', fontWeight: 600 }}>
                {barcodeValue}
              </div>
            )}
          </div>

          <div className="stack gap-3" style={{ flex: 1, overflowY: 'auto', maxHeight: '360px' }}>
            {cart.map((item) => (
              <div key={item.productId} className="cart-row p-3 panel-strong glow-on-hover" style={{ borderRadius: '16px', border: '1px solid var(--border)' }}>
                <img src={item.image} alt={item.name} className="thumb" style={{ width: '40px', height: '40px' }} />
                <div className="grow stack">
                  <strong style={{ fontSize: '0.9rem' }}>{item.name}</strong>
                  <span className="muted small">{formatCurrency(item.price)}</span>
                </div>
                <div className="qty-box">
                  <button className="qty-btn" onClick={() => changeCartQuantity(item.productId, 'decrease')}>-</button>
                  <strong style={{ minWidth: '24px', textAlign: 'center' }}>{item.quantity}</strong>
                  <button className="qty-btn" onClick={() => changeCartQuantity(item.productId, 'increase')}>+</button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="empty-state compact" style={{ padding: '60px 20px' }}>
                <ShoppingCart size={40} className="muted mb-3" style={{ opacity: 0.3 }} />
                <p className="muted small">Cart is empty. Scan items or select from the catalog above.</p>
              </div>
            )}
          </div>

          {heldBills.length > 0 && (
            <div className="stack gap-3 mt-4 pt-4" style={{ borderTop: '1px dashed var(--border)' }}>
              <div className="cluster gap-2 muted">
                <History size={14} />
                <span className="eyebrow" style={{ fontSize: '0.65rem' }}>Held Orders ({heldBills.length})</span>
              </div>
              <div className="cluster gap-2 wrap-row">
                {heldBills.map(hold => (
                  <button key={hold.id} className="pill neutral-soft glow-on-hover" style={{ cursor: 'pointer', border: '1px solid var(--border)', display: 'flex', gap: '8px', alignItems: 'center', padding: '6px 12px' }} onClick={() => handleResumeBill(hold)}>
                    <span style={{ fontWeight: 700 }}>{hold.customer}</span>
                    <span className="accent-text" style={{ fontSize: '0.75rem' }}>{formatCurrency(hold.total)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bill-summary stack gap-3 mt-auto">
            <div className="between">
              <span className="muted small">Subtotal</span>
              <span className="font-strong small">{formatCurrency(cartSubtotal)}</span>
            </div>
            <div className="between total-line">
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>Payable Amount</span>
              <strong>{formatCurrency(cartTotal)}</strong>
            </div>
          </div>
        </div>

        <form className="panel p-6 stack gap-5 glass-panel" onSubmit={handleCheckout}>
          <div className="stack gap-4">
            <label className="field">
              <span>Customer Identification</span>
              <div className="input-shell">
                <UserPlus size={16} className="muted" />
                <input
                  className="ghost-input"
                  placeholder="Walk-in Customer"
                  value={checkoutForm.customerName}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, customerName: e.target.value })}
                  list="customer-list"
                />
                <datalist id="customer-list">
                  {customers.map(c => <option key={c._id} value={c.name} />)}
                </datalist>
              </div>
            </label>

            {checkoutForm.paymentMethod === 'credit' && (
              <label className="field animate-fade">
                <span>Link to Customer Profile</span>
                <select 
                  className="input"
                  value={checkoutForm.customerId || ''}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, customerId: e.target.value })}
                  required
                >
                  <option value="">Select Account...</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </label>
            )}

            <div className="split-fields">
              <label className="field">
                <span>Payment</span>
                <select
                  className="input"
                  value={checkoutForm.paymentMethod}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, paymentMethod: e.target.value })}
                >
                  <option value="cash">Cash Payment</option>
                  <option value="card">Card Payment</option>
                  <option value="upi">UPI / Digital</option>
                  <option value="credit">Store Credit / Account</option>
                </select>
              </label>
              <label className="field">
                <span>Discount</span>
                <input
                  className="input"
                  type="number"
                  placeholder="0.00"
                  value={checkoutForm.discount}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, discount: e.target.value })}
                />
              </label>
            </div>

            <button className="btn btn-primary w-full mt-2 glow-on-hover" type="submit" disabled={busyAction === 'checkout' || cart.length === 0}>
              {busyAction === 'checkout' ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <Receipt size={18} />}
              {busyAction === 'checkout' ? 'Processing...' : `Finalize & Pay ${formatCurrency(cartTotal)}`}
            </button>
          </div>
        </form>
      </aside>
    </div>
  )
}
