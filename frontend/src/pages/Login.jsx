import React from 'react'
import {
  Barcode,
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
      <div className="auth-splash animate-fade">
        <img
          src="/stock_management_hero_1777367508290.png"
          alt="BrightAngel Hero"
          onLoad={(e) => (e.target.style.opacity = 0.6)}
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

          <div className="metric-grid compact mt-6" style={{ width: '100%' }}>
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

      <div className="auth-card panel animate-slide">
        <div className="between mb-6">
          <div className="stack gap-1">
            <p className="eyebrow">Enterprise Access</p>
            <h2 style={{ fontSize: '2rem' }}>Sign in to start</h2>
          </div>
          <button
            type="button"
            className="icon-btn"
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

          <button className="btn btn-primary" type="submit" disabled={busyAction === 'login'}>
            <UserRound size={18} />
            {busyAction === 'login' ? 'Authenticating...' : 'Enter Workspace'}
          </button>
        </form>

        <div className="stack gap-4 mt-8">
          <div className="between">
            <p className="eyebrow">Quick-start Profiles</p>
            <div className="pill neutral">Development Mode</div>
          </div>
          <div className="stack gap-2">
            {demoCredentials.map((credential) => (
              <button
                key={credential.label}
                type="button"
                className="demo-card"
                onClick={() =>
                  setAuthForm({ email: credential.email, password: credential.password })
                }
              >
                <div className="between">
                  <span className="font-strong">{credential.label}</span>
                  <span className="code-line small">{credential.email}</span>
                </div>
                <p className="muted small text-left mt-1">{credential.role}</p>
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
    <article className="feature-card">
      <div className="feature-icon">
        <Icon size={20} />
      </div>
      <strong>{title}</strong>
      <p className="muted">{text}</p>
    </article>
  )
}
