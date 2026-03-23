'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [lang, setLang] = useState<'en' | 'ko'>('en')
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslation(lang)

  useEffect(() => {
    setMounted(true)
    // Restore language preference
    const saved = localStorage.getItem('kpeach-lang')
    if (saved === 'ko') setLang('ko')
  }, [])

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t.loginError)
      return
    }

    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--cream)' }}
    >
      <div
        className="w-full max-w-md"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {/* Language toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div
            style={{
              display: 'flex',
              borderRadius: 6,
              overflow: 'hidden',
              border: '1px solid var(--sand)',
            }}
          >
            {(['en', 'ko'] as const).map((l) => (
              <button
                key={l}
                onClick={() => { setLang(l); localStorage.setItem('kpeach-lang', l) }}
                style={{
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  background: lang === l ? 'var(--charcoal)' : 'transparent',
                  color: lang === l ? 'var(--cream)' : 'var(--muted)',
                  transition: 'all 0.15s',
                }}
              >
                {l === 'en' ? 'EN' : 'KO'}
              </button>
            ))}
          </div>
        </div>

        {/* Logo */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl tracking-widest uppercase mb-2"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--charcoal)',
              letterSpacing: '0.2em',
            }}
          >
            K<span style={{ color: 'var(--rose)' }}>peach</span>girl
          </h1>
          <p
            className="text-sm tracking-wider uppercase"
            style={{
              fontFamily: 'var(--font-sans)',
              color: 'var(--muted)',
              letterSpacing: '0.15em',
            }}
          >
            {t.loginPortal}
          </p>
        </div>

        {/* Login Form */}
        <div
          className="rounded-xl p-8"
          style={{
            background: '#181716',
            border: '1px solid var(--sand)',
          }}
        >
          {error && (
            <div
              className="mb-6 p-3 rounded-lg text-sm"
              style={{
                background: 'rgba(212, 117, 138, 0.12)',
                color: 'var(--rose)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {error}
            </div>
          )}

          <div className="mb-5">
            <label
              className="block text-xs uppercase tracking-wider mb-2"
              style={{
                color: 'var(--muted)',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.1em',
              }}
            >
              {t.loginEmail}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="admin@kpeachgirl.com"
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: '#1e1d1b',
                border: '1px solid var(--sand)',
                color: 'var(--charcoal)',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-xs uppercase tracking-wider mb-2"
              style={{
                color: 'var(--muted)',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.1em',
              }}
            >
              {t.loginPassword}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.loginPasswordPh}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: '#1e1d1b',
                border: '1px solid var(--sand)',
                color: 'var(--charcoal)',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm uppercase tracking-wider transition-all"
            style={{
              background: loading ? 'var(--sand)' : 'var(--rose)',
              color: loading ? 'var(--muted)' : '#fff',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.1em',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? t.loginLoading : t.loginSubmit}
          </button>
        </div>

        {/* Back to site */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm transition-colors hover:opacity-80"
            style={{
              color: 'var(--muted)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {t.loginBack}
          </Link>
        </div>

        {/* Footer text */}
        <p
          className="text-center mt-8 text-xs"
          style={{
            color: 'var(--muted)',
            fontFamily: 'var(--font-sans)',
            opacity: 0.6,
          }}
        >
          {t.loginDisclaimer}
        </p>
      </div>
    </div>
  )
}
