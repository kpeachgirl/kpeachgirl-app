'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n'
import AdminNav from './AdminNav'
import ModelsTab from './ModelsTab'
import ModelEditor from './ModelEditor'
import GroupsTab from './GroupsTab'
import AreasTab from './AreasTab'
import SubmissionsTab from './SubmissionsTab'
import { triggerRevalidation } from '@/lib/supabase/admin'
import type { Profile, CategorySection, PillGroup, FormConfig } from '@/lib/types'

type TabId = 'models' | 'groups' | 'submissions' | 'categories' | 'areas'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('models')
  const [lang, setLang] = useState<'en' | 'ko'>('en')
  const [userEmail, setUserEmail] = useState('')
  const [newSubmissionCount, setNewSubmissionCount] = useState(0)

  // Model editor state: undefined = closed, null = new model, Profile = editing
  const [editingModel, setEditingModel] = useState<Profile | null | undefined>(undefined)

  // Site config for editor
  const [categories, setCategories] = useState<CategorySection[]>([])
  const [pillGroups, setPillGroups] = useState<PillGroup[]>([])
  const [areas, setAreas] = useState<string[]>([])
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null)

  // Profiles list for GroupsTab member selection
  const [allProfiles, setAllProfiles] = useState<Profile[]>([])

  // Key to force ModelsTab refresh
  const [modelsKey, setModelsKey] = useState(0)

  const t = useTranslation(lang)

  const refreshSubmissionCount = useCallback(async () => {
    const supabase = createClient()
    const { count } = await supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new')
    setNewSubmissionCount(count ?? 0)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    // Fetch user email
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUserEmail(data.user.email)
      }
    })

    // Fetch new submission count
    refreshSubmissionCount()

    // Fetch all profiles for group member selection
    supabase
      .from('profiles')
      .select('*')
      .order('name', { ascending: true })
      .then(({ data }) => {
        if (data) setAllProfiles(data as Profile[])
      })

    // Fetch site_config for editor (include form_config)
    supabase
      .from('site_config')
      .select('id, value')
      .in('id', ['categories', 'pill_groups', 'areas', 'form_config'])
      .then(({ data }) => {
        if (data) {
          for (const row of data) {
            if (row.id === 'categories') setCategories(row.value as CategorySection[])
            if (row.id === 'pill_groups') setPillGroups(row.value as PillGroup[])
            if (row.id === 'areas') setAreas(row.value as string[])
            if (row.id === 'form_config') setFormConfig(row.value as FormConfig)
          }
        }
      })
  }, [refreshSubmissionCount])

  const handleEditModel = useCallback((model: Profile | null) => {
    setEditingModel(model)
  }, [])

  const handleSave = useCallback((savedProfile: Profile) => {
    // Refresh models list
    setModelsKey(k => k + 1)
    // Keep editor open showing saved state
  }, [])

  const handleDelete = useCallback((id: string) => {
    setEditingModel(undefined)
    setModelsKey(k => k + 1)
  }, [])

  const handleCloseEditor = useCallback(() => {
    setEditingModel(undefined)
  }, [])

  const handleAreasUpdate = useCallback(async (newAreas: string[]) => {
    const supabase = createClient()
    setAreas(newAreas)
    await supabase
      .from('site_config')
      .update({ value: newAreas })
      .eq('id', 'areas')
    triggerRevalidation(['/'])
  }, [])

  const handleSubmissionConverted = useCallback(() => {
    setModelsKey(k => k + 1)
    refreshSubmissionCount()
  }, [refreshSubmissionCount])

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
        {/* Models tab */}
        {activeTab === 'models' && (
          <ModelsTab
            key={modelsKey}
            lang={lang}
            onEditModel={handleEditModel}
            editingId={editingModel?.id}
          />
        )}

        {/* Groups tab */}
        {activeTab === 'groups' && (
          <GroupsTab
            lang={lang}
            profiles={allProfiles}
            pillGroups={pillGroups}
            categories={categories}
          />
        )}

        {/* Submissions tab */}
        {activeTab === 'submissions' && (
          <SubmissionsTab
            lang={lang}
            formConfig={formConfig}
            areas={areas}
            onConverted={handleSubmissionConverted}
          />
        )}

        {/* Areas tab */}
        {activeTab === 'areas' && (
          <AreasTab lang={lang} areas={areas} onUpdate={handleAreasUpdate} />
        )}

        {/* Other tabs - placeholders */}
        {activeTab === 'categories' && (
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
              {t.catDesc}
            </p>
          </div>
        )}
      </div>

      {/* Model Editor slide-out */}
      {editingModel !== undefined && (
        <ModelEditor
          model={editingModel}
          lang={lang}
          categories={categories}
          pillGroups={pillGroups}
          areas={areas}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  )
}
