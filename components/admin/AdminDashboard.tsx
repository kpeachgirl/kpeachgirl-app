'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n'
import AdminNav from './AdminNav'

type TabId = 'models' | 'groups' | 'submissions' | 'categories' | 'areas'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('models')
  const [lang, setLang] = useState<'en' | 'ko'>('en')
  const [userEmail, setUserEmail] = useState('')
  const [newSubmissionCount, setNewSubmissionCount] = useState(0)

  const t = useTranslation(lang)

  useEffect(() => {
    const supabase = createClient()

    // Fetch user email
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUserEmail(data.user.email)
      }
    })

    // Fetch new submission count
    supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new')
      .then(({ count }) => {
        setNewSubmissionCount(count ?? 0)
      })
  }, [])

  const tabLabels: Record<TabId, string> = {
    models: t.tabModels,
    groups: t.tabGroups,
    submissions: t.tabSubmissions,
    categories: t.tabCategories,
    areas: t.tabAreas,
  }

  return (
    <div>
      <AdminNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        lang={lang}
        onLangChange={setLang}
        userEmail={userEmail}
        newSubmissionCount={newSubmissionCount}
      />

      {/* Content area */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '32px 24px',
        }}
      >
        {/* Placeholder panels -- replaced by actual tab components in plans 04-03 through 04-08 */}
        <div
          style={{
            color: 'var(--charcoal)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 8,
              fontFamily: 'var(--font-serif)',
            }}
          >
            {tabLabels[activeTab]}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>
            {activeTab === 'models' && t.total}
            {activeTab === 'groups' && t.grpDesc}
            {activeTab === 'submissions' && t.subDesc}
            {activeTab === 'categories' && t.catDesc}
            {activeTab === 'areas' && t.areasDesc}
          </p>
        </div>
      </div>
    </div>
  )
}
