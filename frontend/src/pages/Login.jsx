import React from 'react'
import {
  Barcode,
  Boxes,
  Moon,
  ShieldCheck,
  Sparkles,
  SunMedium,
  UserRound,
  Warehouse,
} from 'lucide-react'
import { NoticeBanner } from '../components/NoticeBanner'

export function Login({
  theme,
  setTheme,
  authForm,
  setAuthForm,
  handleLogin,
  busyAction,
  demoCredentials,
  notice,
}) {
  return (
    <div className="auth-shell">
      <div className="auth-splash animate-fade" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <img
          src="/hero.png"
          alt="BrightAngel Hero"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0, transition: 'opacity 1s ease-in-out', zIndex: 0 }}
          onLoad={(e) => (e.target.style.opacity = 0.55)}
        />
        <div className="auth-splash-content stack gap-4">
          <div className="cluster gap-3">
            <Sparkles size={20} className="accent-text" />
            <span className="eyebrow" style={{ color: 'white', opacity: 0.8 }}>
              Retail-ready MERN stock workspace
            </span>
          </div>
          <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1 }}>
            Intelligent Stock <br /> Flow Management
          </h1>
          <p className="lede" style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '500px' }}>
            Empower your warehouse with rack-aware inventory, high-speed billing, and real-time
            sales intelligence. Designed for precision and scaled for growth.
          </p>

          <div className="metric-grid compact mt-6" style={{ width: '100%', gap: '16px' }}>
            <FeatureCard
              icon={Barcode}
              title="Barcode Integration"
              text="Instant lookups for USB/Keyboard scanners."
            />
            <FeatureCard
              icon={Warehouse}
              title="Rack Mapping"
              text="Precise row & column location tracking."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Role Security"
              text="Admin reports & cashier desk controls."
            />
          </div>
        </div>
      </div>

      <div className="auth-card panel animate-slide" style={{ padding: '48px', borderRadius: '32px', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)', background: 'linear-gradient(145deg, var(--panel), var(--bg-soft))' }}>
        <div className="between mb-6">
          <div className="stack gap-1">
            <div className="cluster gap-2 mb-2">
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--accent)', color: 'white', display: 'grid', placeItems: 'center', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}>
                <Boxes size={18} />
              </div>
              <p className="eyebrow">Enterprise Access</p>
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.04em' }}>Sign in to start</h2>
          </div>
          <button
            type="button"
            className="icon-btn glow-on-hover"
            style={{ borderRadius: '12px' }}
            onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <SunMedium size={18} />}
          </button>
        </div>

        <form className="stack gap-5" onSubmit={handleLogin}>
          <label className="field">
            <span>Corporate Email Address</span>
            <input
              className="input"
              type="email"
              placeholder="e.g. admin@brightangel.local"
              value={authForm.email}
              onChange={(event) =>
                setAuthForm((current) => ({ ...current, email: event.target.value }))
              }
              required
            />
          </label>

          <label className="field">
            <span>Access Password</span>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={authForm.password}
              onChange={(event) =>
                setAuthForm((current) => ({ ...current, password: event.target.value }))
              }
              required
            />
          </label>

          <button className="btn btn-primary glow-on-hover mt-2" type="submit" disabled={busyAction === 'login'} style={{ padding: '16px', borderRadius: '16px', fontSize: '1.1rem', letterSpacing: '0.01em' }}>
            {busyAction === 'login' ? <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: 'white' }}></div> : <UserRound size={20} />}
            {busyAction === 'login' ? 'Authenticating...' : 'Enter Workspace'}
          </button>
        </form>

        <div className="stack gap-4 mt-8">
          <div className="between">
            <p className="eyebrow">Quick-start Profiles</p>
            <div className="pill neutral">Development Mode</div>
          </div>
          <div className="stack gap-3">
            {demoCredentials.map((credential) => (
              <button
                key={credential.label}
                type="button"
                className="panel-strong glow-on-hover stack gap-1 p-4"
                style={{ textAlign: 'left', cursor: 'pointer', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg-soft)', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                onClick={() =>
                  setAuthForm({ email: credential.email, password: credential.password })
                }
              >
                <div className="between">
                  <span className="font-strong" style={{ fontSize: '1rem', color: 'var(--text)' }}>{credential.label}</span>
                  <span className="pill neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>{credential.email}</span>
                </div>
                <p className="muted small text-left">{credential.role}</p>
              </button>
            ))}
          </div>
        </div>

        {notice ? (
          <div className="mt-6">
            <NoticeBanner notice={notice} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <article className="feature-card p-4" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', transition: 'transform 0.3s' }}>
      <div className="feature-icon mb-3" style={{ color: 'var(--accent)', background: 'rgba(245, 158, 11, 0.15)', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
        <Icon size={22} />
      </div>
      <strong style={{ display: 'block', marginBottom: '6px', fontSize: '1.05rem', color: 'white', fontWeight: 700 }}>{title}</strong>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.5 }}>{text}</p>
    </article>
  )
}
