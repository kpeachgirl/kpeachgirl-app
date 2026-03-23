'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n'

type TabId = 'models' | 'groups' | 'submissions' | 'categories' | 'areas'

interface AdminNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  lang: 'en' | 'ko'
  onLangChange: (lang: 'en' | 'ko') => void
  userEmail: string
  newSubmissionCount: number
}

const TAB_IDS: { id: TabId; labelKey: string }[] = [
  { id: 'models', labelKey: 'tabModels' },
  { id: 'groups', labelKey: 'tabGroups' },
  { id: 'submissions', labelKey: 'tabSubmissions' },
  { id: 'categories', labelKey: 'tabCategories' },
  { id: 'areas', labelKey: 'tabAreas' },
]

export default function AdminNav({
  activeTab,
  onTabChange,
  lang,
  onLangChange,
  userEmail,
  newSubmissionCount,
}: AdminNavProps) {
  const t = useTranslation(lang)
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <nav
      className="admin-nav-pad"
      style={{
        background: '#181716',
        borderBottom: '1px solid var(--sand)',
      }}
    >
      {/* Top row: logo + user controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 56,
          flexWrap: 'wrap',
          gap: 8,
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        {/* Left: back link + logo + badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link
            href="/"
            style={{
              color: 'var(--muted)',
              fontSize: 13,
              textDecoration: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {t.back}
          </Link>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--charcoal)',
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            Kpeachgirl
          </span>
          <span
            style={{
              background: 'var(--rose-soft)',
              color: 'var(--rose)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: 4,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {t.admin}
          </span>
        </div>

        {/* Right: lang toggle + user + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Language toggle */}
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
                onClick={() => onLangChange(l)}
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

          {/* User avatar + email */}
          <div
            className="mob-hide"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--rose-soft)',
                color: 'var(--rose)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                textTransform: 'uppercase',
              }}
            >
              {userEmail ? userEmail[0] : '?'}
            </div>
            <span
              style={{
                color: 'var(--muted)',
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
              }}
            >
              {userEmail}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              border: '1px solid var(--sand)',
              background: 'transparent',
              color: 'var(--muted)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '6px 14px',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--rose)'
              e.currentTarget.style.color = 'var(--rose)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--sand)'
              e.currentTarget.style.color = 'var(--muted)'
            }}
          >
            {t.logout}
          </button>
        </div>
      </div>

      {/* Tab row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          paddingBottom: 12,
        }}
      >
        {TAB_IDS.map(({ id, labelKey }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              style={{
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-sans)',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                background: isActive ? 'var(--charcoal)' : 'transparent',
                color: isActive ? 'var(--cream)' : 'var(--muted)',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {t[labelKey]}
              {id === 'submissions' && newSubmissionCount > 0 && (
                <span
                  style={{
                    background: '#e05555',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 5px',
                  }}
                >
                  {newSubmissionCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
