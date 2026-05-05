import React from 'react'
import { Edit, Plus, X, Warehouse, Package, Tag, FileText, DollarSign, Barcode, Layers, Image as ImageIcon, Ruler, Activity, CheckCircle2 } from 'lucide-react'
import { SectionHeading } from '../../components/SectionHeading'

export function ProductManager({
  productForm,
  handleProductFormChange,
  handleProductSave,
  resetProductEditor,
  editingProductId,
  busyAction,
}) {
  return (
    <div className="stack gap-5 animate-fade">
      {/* Premium Header */}
      <div className="between wrap-row panel p-5 glass-panel" style={{ borderLeft: '4px solid var(--accent)', borderRadius: '16px' }}>
        <div className="cluster gap-4">
          <div className="icon-btn" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: 'none', width: '42px', height: '42px' }}>
            <Package size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{editingProductId ? 'Modify Inventory Item' : 'Register Master Product'}</h2>
            <p className="muted small">Update technical specifications and warehouse mapping.</p>
          </div>
        </div>
        {editingProductId && (
          <button className="btn btn-secondary" onClick={resetProductEditor} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem' }}>
            <X size={16} />
            Discard Changes
          </button>
        )}
      </div>

      <form onSubmit={handleProductSave} className="grid-3 gap-5 align-start">
        {/* Main Attributes Panel */}
        <div className="panel p-6 glass-panel stack gap-6" style={{ gridColumn: 'span 2', borderRadius: '20px' }}>
          <div className="stack gap-4">
            <div className="cluster gap-2 mb-1">
              <FileText size={16} className="accent-text" />
              <span className="eyebrow" style={{ fontSize: '0.65rem' }}>Primary Attributes</span>
            </div>
            
            <label className="field">
              <span className="muted small font-strong uppercase" style={{ fontSize: '0.6rem' }}>Full Product Name</span>
              <input
                className="input large-input"
                name="name"
                placeholder="e.g. Arabica Dark Roast Coffee 1kg"
                value={productForm.name}
                onChange={handleProductFormChange}
                required
                style={{ fontSize: '1rem', fontWeight: 100 }}
              />
            </label>

            <label className="field">
              <span className="muted small font-strong uppercase" style={{ fontSize: '0.6rem' }}>Technical Description</span>
              <textarea
                className="input"
                name="description"
                placeholder="Add detailed specs, warranty details..."
                style={{ minHeight: '100px', resize: 'vertical', fontSize: '0.9rem' }}
                value={productForm.description}
                onChange={handleProductFormChange}
              />
            </label>

            <div className="grid-2 gap-5">
              <label className="field">
                <span className="muted small font-strong uppercase" style={{ fontSize: '0.6rem' }}>Business Category</span>
                <input
                  className="input"
                  name="category"
                  placeholder="e.g. Beverages"
                  value={productForm.category}
                  onChange={handleProductFormChange}
                  required
                />
              </label>
              <label className="field">
                <span className="muted small font-strong uppercase" style={{ fontSize: '0.6rem' }}>Unit of Measurement</span>
                <select
                  className="input"
                  name="unit"
                  value={productForm.unit}
                  onChange={handleProductFormChange}
                >
                  <option value="">Select a unit</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="ltr">Liter (ltr)</option>
                  <option value="ml">Milliliter (ml)</option>
                  <option value="box">Box</option>
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="dozen">Dozen</option>
                  <option value="pack">Pack</option>
                  <option value="case">Case</option>
                  <option value="bundle">Bundle</option>
                  <option value="set">Set</option>
                  <option value="roll">Roll</option>
                  <option value="tube">Tube</option>
                  <option value="meter">Meter (m)</option>
                  <option value="sq-meter">Square Meter (m²)</option>
                </select>
              </label>
            </div>
          </div>

          <div className="stack gap-4 pt-525" style={{ borderTop: '3px solid var(--border)', paddingTop: '1rem' }}>
            <div className="cluster gap-2 mb-1">
              <Warehouse size={16} className="accent-text" />
              <span className="eyebrow" style={{ fontSize: '0.65rem' }}>Warehouse Logic & Placement</span>
            </div>
            
            <div className="grid-3 gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <label className="field">
                <span className="muted small font-strong uppercase" style={{ fontSize: '0.6rem' }}>Row (R)</span>
                <input className="input text-center font-mono" style={{ width: '100%', minWidth: '0' }} type="number" name="rack.rowNumber" value={productForm.rack.rowNumber} onChange={handleProductFormChange} required />
              </label>
              <label className="field">
                <span className="muted small font-strong uppercase" style={{ fontSize: '0.6rem' }}>Column (C)</span>
                <input className="input text-center font-mono" style={{ width: '100%', minWidth: '0' }} type="number" name="rack.columnNumber" value={productForm.rack.columnNumber} onChange={handleProductFormChange} required />
              </label>
              <label className="field">
                <span className="muted small font-strong uppercase" style={{ fontSize: '0.6rem' }}>Shelf (S)</span>
                <input className="input text-center font-mono" style={{ width: '100%', minWidth: '0' }} type="number" name="rack.shelfNumber" value={productForm.rack.shelfNumber} onChange={handleProductFormChange} required />
              </label>
            </div>
            
            <div className="cluster gap-3 p-3 panel-strong" style={{ borderRadius: '12px', border: '1px dashed var(--border)', background: 'var(--bg-soft)' }}>
              <CheckCircle2 size={16} className="success-text" />
              <p className="muted small">
                Storage Label: <strong style={{ color: 'var(--text)' }}>R{productForm.rack.rowNumber}-C{productForm.rack.columnNumber}-S{productForm.rack.shelfNumber}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Identification & Pricing */}
        <div className="stack gap-5">
          <div className="panel p-5 glass-panel stack gap-4" style={{ borderRadius: '20px' }}>
            <div className="cluster gap-2">
              <Barcode size={16} className="accent-text" />
              <span className="eyebrow" style={{ fontSize: '0.65rem' }}>Identification</span>
            </div>
            
            <label className="field">
              <span className="muted small font-strong uppercase" style={{ fontSize: '0.6rem' }}>System SKU</span>
              <input
                className="input font-mono small"
                name="sku"
                placeholder="SKU-001"
                value={productForm.sku}
                onChange={handleProductFormChange}
                required
              />
            </label>

            <label className="field">
              <span className="muted small font-strong uppercase" style={{ fontSize: '0.6rem' }}>Barcode</span>
              <div className="input-shell compact" style={{ background: 'var(--bg-soft)', borderRadius: '10px' }}>
                <Barcode size={14} className="muted" />
                <input
                  className="ghost-input font-mono small"
                  name="barcode"
                  placeholder="Scan Code..."
                  value={productForm.barcode}
                  onChange={handleProductFormChange}
                  required
                />
              </div>
            </label>
          </div>

          <div className="panel p-5 glass-panel stack gap-5" style={{ borderRadius: '20px' }}>
            <div className="cluster gap-2">
              <DollarSign size={16} className="accent-text" />
              <span className="eyebrow" style={{ fontSize: '0.65rem' }}>Pricing & Stock</span>
            </div>
            
            <div className="grid-2 gap-4">
              <label className="field">
                <span className="muted small font-strong uppercase" style={{ fontSize: '0.6rem' }}>Cost</span>
                <div className="input-shell compact" style={{ borderRadius: '10px' }}>
                  <span className="muted x-small">$</span>
                  <input className="ghost-input font-strong small" type="number" name="costPrice" value={productForm.costPrice} onChange={handleProductFormChange} required />
                </div>
              </label>
              <label className="field">
                <span className="muted small font-strong uppercase" style={{ fontSize: '0.6rem' }}>Price</span>
                <div className="input-shell compact" style={{ border: '1px solid var(--accent-soft)', borderRadius: '10px' }}>
                  <span className="accent-text x-small">$</span>
                  <input className="ghost-input font-strong small accent-text" type="number" name="price" value={productForm.price} onChange={handleProductFormChange} required />
                </div>
              </label>
            </div>

            <div className="grid-2 gap-4">
              <label className="field">
                <span className="muted small font-strong uppercase" style={{ fontSize: '0.6rem' }}>Stock</span>
                <input className="input small font-strong" type="number" name="quantityInStock" value={productForm.quantityInStock} onChange={handleProductFormChange} required />
              </label>
              <label className="field">
                <span className="muted small font-strong uppercase" style={{ fontSize: '0.6rem' }}>Min</span>
                <input className="input small font-strong" type="number" name="reorderLevel" value={productForm.reorderLevel} onChange={handleProductFormChange} />
              </label>
            </div>
            
            <div className="text-center">
              <span className="pill success-soft" style={{ fontSize: '0.65rem', padding: '4px 12px' }}>
                Est. Margin: <strong style={{ color: 'var(--success)' }}>{(((productForm.price - productForm.costPrice) / (productForm.price || 1)) * 100).toFixed(0)}%</strong>
              </span>
            </div>
          </div>

          <button 
            className="btn btn-primary w-full glow-on-hover" 
            type="submit" 
            disabled={busyAction === 'product-save'} 
            style={{ padding: '16px', borderRadius: '16px', fontSize: '0.9rem', fontWeight: 700 }}
          >
            {busyAction === 'product-save' ? (
              <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
            ) : editingProductId ? (
              <Edit size={18} />
            ) : (
              <Plus size={18} />
            )}
            {busyAction === 'product-save' ? 'Processing...' : editingProductId ? 'Update Record' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
