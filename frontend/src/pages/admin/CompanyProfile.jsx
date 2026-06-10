import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  Save, 
  Upload, 
  MapPin, 
  Phone, 
  Mail, 
  Type, 
  Sparkles,
  Camera,
  Globe
} from 'lucide-react'
import { SectionHeading } from '../../components/SectionHeading'
import { getBaseUrl } from '../../utils'

export default function CompanyProfile({ company, onUpdate, isBusy }) {
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    address: '',
    phone: '',
    email: '',
  })
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoFile, setLogoFile] = useState(null)

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        tagline: company.tagline || '',
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
      })
      if (company.logo) {
        setLogoPreview(company.logo)
      }
    }
  }, [company])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = new FormData()
    data.append('name', formData.name)
    data.append('tagline', formData.tagline)
    data.append('address', formData.address)
    data.append('phone', formData.phone)
    data.append('email', formData.email)
    if (logoFile) {
      data.append('logo', logoFile)
    }
    onUpdate(data)
  }

  return (
    <div className="stack gap-6 animate-fade">
      <div className="between align-end wrap-row gap-4">
        <SectionHeading 
          title="Company Identity" 
          text="Manage the branding details used across sidebars, login pages, and customer invoices." 
        />
        <div className="cluster gap-3 no-print">
          <div className="badge accent-soft" style={{ borderRadius: '12px', padding: '6px 14px' }}>
            <Sparkles size={14} />
            <span className="font-strong x-small">WHITELABEL SETTINGS</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Column: Branded Identity Card */}
        <div className="col-span-12 lg:col-span-4 stack gap-5">
          <div className="panel glass-panel p-6 text-center stack align-center justify-center gap-4 glow-on-hover shadow-xl" style={{ borderRadius: '24px', minHeight: '320px', background: 'linear-gradient(145deg, var(--panel), var(--bg-soft))' }}>
            <div className="company-logo-wrapper relative" style={{ 
              width: '160px', 
              height: '160px', 
              borderRadius: '20px', 
              background: 'white', 
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              padding: '16px',
              display: 'grid',
              placeItems: 'center',
              overflow: 'hidden',
              border: '2px dashed var(--accent-faded)'
            }}>
              {logoPreview ? (
                <img 
                  src={logoPreview.startsWith('blob:') ? logoPreview : `${getBaseUrl()}${logoPreview}`} 
                  alt="Company Logo" 
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                />
              ) : (
                <div className="stack align-center gap-2 muted">
                  <Building2 size={56} style={{ opacity: 0.1 }} />
                  <span className="small">NO LOGO</span>
                </div>
              )}
            </div>
            
            <div className="stack gap-1">
              <h3 style={{ fontSize: '1.3rem', letterSpacing: '-0.02em' }}>{formData.name || 'Your Company'}</h3>
              <p className="accent-text small tracking-widest font-bold uppercase" style={{ fontSize: '0.75rem' }}>{formData.tagline || 'Excellence in Service'}</p>
            </div>

            <div className="divider" style={{ width: '40px', opacity: 0.2 }}></div>

            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
              id="logo-upload"
            />
            <label htmlFor="logo-upload" className="btn btn-outline cluster gap-2 cursor-pointer shadow-sm hover-up" style={{ borderRadius: '12px', padding: '8px 16px' }}>
              <Camera size={14} />
              Change Logo
            </label>
            <p className="tiny muted text-center" style={{ opacity: 0.7 }}>Recommended: Square format (PNG/JPG). Transparent background works best.</p>
          </div>
        </div>

        {/* Right Column: Information Form */}
        <div className="col-span-12 lg:col-span-8">
          <form onSubmit={handleSubmit} className="panel glass-panel p-6 stack gap-5 shadow-2xl" style={{ borderRadius: '24px', border: '1px solid var(--border)' }}>
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2 md:col-span-1 stack gap-2">
                <label className="label-text cluster gap-2 muted small font-bold uppercase tracking-wider">
                  <Building2 size={12} className="accent-text" />
                  Legal Entity Name
                </label>
                <div className="input-shell hover-glow" style={{ borderRadius: '12px' }}>
                  <Type size={18} className="muted" />
                  <input
                    type="text"
                    name="name"
                    className="ghost-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. NILMA Alliance (Pvt) Ltd"
                    required
                  />
                </div>
              </div>

              <div className="col-span-2 md:col-span-1 stack gap-2">
                <label className="label-text cluster gap-2 muted small font-bold uppercase tracking-wider">
                  <Globe size={12} className="accent-text" />
                  Business Slogan
                </label>
                <div className="input-shell hover-glow" style={{ borderRadius: '12px' }}>
                  <Globe size={18} className="muted" />
                  <input
                    type="text"
                    name="tagline"
                    className="ghost-input"
                    value={formData.tagline}
                    onChange={handleChange}
                    placeholder="e.g. Excellence Across Diverse Industries"
                  />
                </div>
              </div>
            </div>

            <div className="stack gap-2">
              <label className="label-text cluster gap-2 muted small font-bold uppercase tracking-wider">
                <MapPin size={12} className="accent-text" />
                Headquarters Address
              </label>
              <div className="input-shell align-start py-3 hover-glow" style={{ borderRadius: '12px' }}>
                <MapPin size={18} className="muted mt-1" />
                <textarea
                  name="address"
                  className="ghost-input w-full"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="295, 1/1 Galle Road, Colombo – 06, Sri Lanka"
                  rows="3"
                  style={{ resize: 'none' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2 md:col-span-1 stack gap-2">
                <label className="label-text cluster gap-2 muted small font-bold uppercase tracking-wider">
                  <Phone size={12} className="accent-text" />
                  Business Contact
                </label>
                <div className="input-shell hover-glow" style={{ borderRadius: '12px' }}>
                  <Phone size={18} className="muted" />
                  <input
                    type="text"
                    name="phone"
                    className="ghost-input"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+94 11 234 5678"
                  />
                </div>
              </div>

              <div className="col-span-2 md:col-span-1 stack gap-2">
                <label className="label-text cluster gap-2 muted small font-bold uppercase tracking-wider">
                  <Mail size={12} className="accent-text" />
                  Support Email
                </label>
                <div className="input-shell hover-glow" style={{ borderRadius: '12px' }}>
                  <Mail size={18} className="muted" />
                  <input
                    type="email"
                    name="email"
                    className="ghost-input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="info@nilmaalliance.com"
                  />
                </div>
              </div>
            </div>

            <div className="divider" style={{ opacity: 0.1 }}></div>

            <div className="between wrap-row gap-4 pt-1">
              <div className="cluster gap-3 muted font-medium">
                <div className="pulse-dot"></div>
                <span className="small">Deploying updates will refresh all templates</span>
              </div>
              <button
                type="submit"
                className="btn btn-primary px-10 shadow-xl glow-on-hover py-3"
                disabled={isBusy}
                style={{ minWidth: '240px', borderRadius: '12px' }}
              >
                {isBusy ? (
                  <div className="cluster gap-2">
                    <div className="spinner-sm"></div>
                    UPDATING SYSTEM...
                  </div>
                ) : (
                  <div className="cluster gap-2">
                    <Save size={16} />
                    SAVE CHANGES
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
