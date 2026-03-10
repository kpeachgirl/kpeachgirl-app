'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n'
import type { Profile, CategorySection, PillGroup } from '@/lib/types'

interface ModelEditorProps {
  model: Profile | null
  lang: 'en' | 'ko'
  categories: CategorySection[]
  pillGroups: PillGroup[]
  areas: string[]
  onSave: (profile: Profile) => void
  onDelete: (id: string) => void
  onClose: () => void
}

type FormState = Record<string, any>

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.12em',
  color: 'var(--muted)',
  textTransform: 'uppercase',
  marginBottom: 6,
  fontFamily: 'var(--font-sans)',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid var(--sand)',
  background: '#1e1d1b',
  color: 'var(--charcoal)',
  fontSize: 13,
  fontFamily: 'var(--font-sans)',
}

const sectionHeading: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.16em',
  color: 'var(--rose)',
  textTransform: 'uppercase',
  marginBottom: 14,
  paddingBottom: 8,
  borderBottom: '1px solid var(--sand)',
  fontFamily: 'var(--font-serif)',
}

// Top-level profile fields (not stored in attributes)
const TOP_LEVEL_KEYS = new Set([
  'name', 'region', 'parent_region', 'bio', 'experience',
  'types', 'compensation', 'verified', 'vacation',
  'profile_image', 'profile_image_crop', 'cover_image', 'cover_image_crop',
  'sort_order',
])

function initForm(model: Profile | null): FormState {
  if (!model) {
    return {
      name: '',
      region: '',
      parent_region: 'LA',
      bio: '',
      experience: 'Beginner',
      types: [] as string[],
      compensation: [] as string[],
    }
  }
  const form: FormState = {
    name: model.name || '',
    region: model.region || '',
    parent_region: model.parent_region || 'LA',
    bio: model.bio || '',
    experience: model.experience || '',
    types: model.types || [],
    compensation: model.compensation || [],
  }
  // Flatten attributes into form
  if (model.attributes) {
    for (const [k, v] of Object.entries(model.attributes)) {
      if (!TOP_LEVEL_KEYS.has(k)) {
        form[k] = v || ''
      }
    }
  }
  return form
}

export default function ModelEditor({
  model,
  lang,
  categories,
  pillGroups,
  areas,
  onSave,
  onDelete,
  onClose,
}: ModelEditorProps) {
  const [form, setForm] = useState<FormState>(() => initForm(model))
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const t = useTranslation(lang)

  // Reset form when model changes
  useEffect(() => {
    setForm(initForm(model))
    setSaved(false)
  }, [model])

  const upd = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const expOptions = [
    { value: 'Beginner', label: t.expBeginner },
    { value: 'Intermediate', label: t.expIntermediate },
    { value: 'Experienced', label: t.expExperienced },
    { value: 'Professional', label: t.expProfessional },
  ]

  const handleSave = async () => {
    if (saving) return
    setSaving(true)

    const slug = form.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    // Separate top-level fields from attributes
    const attributes: Record<string, string> = {}
    const topLevel: Record<string, any> = {}

    for (const [k, v] of Object.entries(form)) {
      if (TOP_LEVEL_KEYS.has(k)) {
        topLevel[k] = v
      } else {
        attributes[k] = v as string
      }
    }

    const profileData = {
      name: topLevel.name,
      slug,
      region: topLevel.region || null,
      parent_region: topLevel.parent_region || null,
      bio: topLevel.bio || null,
      experience: topLevel.experience || null,
      types: topLevel.types || [],
      compensation: topLevel.compensation || [],
      verified: topLevel.verified ?? false,
      vacation: topLevel.vacation ?? false,
      attributes,
    }

    const supabase = createClient()

    try {
      if (model?.id) {
        // Update existing
        const { data, error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', model.id)
          .select()
          .single()
        if (error) throw error
        if (data) {
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
          onSave(data as Profile)
        }
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single()
        if (error) throw error
        if (data) {
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
          onSave(data as Profile)
        }
      }
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!model?.id) return
    if (!confirm(t.deleteConfirm)) return

    const supabase = createClient()
    const { error } = await supabase.from('profiles').delete().eq('id', model.id)
    if (!error) {
      onDelete(model.id)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 999,
        }}
      />

      {/* Slide-out panel */}
      <div
        className="slide-in admin-slide"
        style={{
          background: 'var(--cream)',
          borderLeft: '1px solid var(--sand)',
          zIndex: 1000,
          overflowY: 'auto',
          boxShadow: '-16px 0 48px rgba(0,0,0,0.08)',
        }}
      >
        {/* Sticky header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            background: '#181716',
            borderBottom: '1px solid var(--sand)',
            padding: '14px 24px',
            zIndex: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={
                model?.profile_image ||
                'data:image/svg+xml,' +
                  encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="#d9cfc4"/></svg>'
                  )
              }
              alt=""
              style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 2 }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--charcoal)' }}>
                {form.name || 'New Model'}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--muted)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {t.editing}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid var(--sand)',
              width: 28,
              height: 28,
              cursor: 'pointer',
              fontSize: 14,
              color: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-sans)',
            }}
          >
            x
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ padding: '20px 24px 100px' }}>
          {/* IDENTITY section */}
          <div style={{ marginBottom: 28 }}>
            <div style={sectionHeading}>{t.identity}</div>
            <div className="admin-edit-grid">
              {/* Name */}
              <div>
                <label style={labelStyle}>{t.fullName}</label>
                <input
                  value={form.name || ''}
                  onChange={e => upd('name', e.target.value)}
                  style={inputStyle}
                />
              </div>
              {/* Region */}
              <div>
                <label style={labelStyle}>{t.area}</label>
                <select
                  value={form.region || ''}
                  onChange={e => upd('region', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">--</option>
                  {areas.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              {/* Parent Region */}
              <div>
                <label style={labelStyle}>{t.parentRegion}</label>
                <select
                  value={form.parent_region || 'LA'}
                  onChange={e => upd('parent_region', e.target.value)}
                  style={inputStyle}
                >
                  <option value="LA">LA</option>
                  <option value="OC">OC</option>
                </select>
              </div>
              {/* Experience */}
              <div>
                <label style={labelStyle}>{t.experience}</label>
                <select
                  value={form.experience || ''}
                  onChange={e => upd('experience', e.target.value)}
                  style={inputStyle}
                >
                  {expOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PHOTOS placeholder */}
          <div style={{ marginBottom: 28 }}>
            <div style={sectionHeading}>{t.photos}</div>
            <div
              className="admin-edit-grid"
              style={{ gap: 12 }}
            >
              <div
                style={{
                  aspectRatio: '2/3',
                  border: '1px dashed var(--sand)',
                  background: 'rgba(255,255,255,0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  color: 'var(--sand)',
                  textAlign: 'center',
                  padding: 12,
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Photo upload available in next plan
              </div>
              <div
                style={{
                  aspectRatio: '7/3',
                  border: '1px dashed var(--sand)',
                  background: 'rgba(255,255,255,0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  color: 'var(--sand)',
                  textAlign: 'center',
                  padding: 12,
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Photo upload available in next plan
              </div>
            </div>
          </div>

          {/* Category sections */}
          {categories.map(cat => (
            <div key={cat.id} style={{ marginBottom: 28 }}>
              <div style={sectionHeading}>{cat.title}</div>
              <div className="admin-edit-grid">
                {cat.fields.map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input
                      value={form[f.key] || ''}
                      onChange={e => upd(f.key, e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* BIOGRAPHY section */}
          <div style={{ marginBottom: 28 }}>
            <div style={sectionHeading}>{t.biography}</div>
            <textarea
              value={form.bio || ''}
              onChange={e => upd('bio', e.target.value)}
              rows={5}
              style={{
                ...inputStyle,
                resize: 'vertical',
              }}
            />
          </div>

          {/* Tag pill groups */}
          {pillGroups.map(pg => (
            <div key={pg.id} style={{ marginBottom: 28 }}>
              <div style={sectionHeading}>{pg.title}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {pg.options.map(opt => {
                  const vals: string[] = form[pg.dataKey] || []
                  const on = vals.includes(opt)
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        upd(
                          pg.dataKey,
                          on ? vals.filter(x => x !== opt) : [...vals, opt]
                        )
                      }
                      style={{
                        padding: '5px 14px',
                        fontSize: 11,
                        fontWeight: on ? 700 : 500,
                        cursor: 'pointer',
                        border: on
                          ? `1px solid ${pg.color}`
                          : '1px solid var(--sand)',
                        background: on ? pg.color : '#181716',
                        color: on ? 'var(--cream)' : 'var(--muted)',
                        letterSpacing: '0.04em',
                        fontFamily: 'var(--font-sans)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Delete button */}
          {model?.id && (
            <div style={{ paddingTop: 20, borderTop: '1px solid var(--sand)' }}>
              <button
                onClick={handleDelete}
                style={{
                  width: '100%',
                  padding: '10px 0',
                  background: 'transparent',
                  border: '1px solid rgba(184,92,107,0.3)',
                  color: 'var(--rose)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  ;(e.target as HTMLElement).style.background = 'var(--rose)'
                  ;(e.target as HTMLElement).style.color = '#fff'
                }}
                onMouseLeave={e => {
                  ;(e.target as HTMLElement).style.background = 'transparent'
                  ;(e.target as HTMLElement).style.color = 'var(--rose)'
                }}
              >
                {t.deleteModel}
              </button>
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div
          className="admin-save-bar"
          style={{
            background: '#181716',
            borderTop: '1px solid var(--sand)',
            padding: '12px 24px',
            display: 'flex',
            gap: 10,
            zIndex: 3,
          }}
        >
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1,
              padding: '12px 0',
              background: saved ? 'var(--sage)' : 'var(--charcoal)',
              color: 'var(--cream)',
              border: 'none',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: saving ? 'wait' : 'pointer',
              fontFamily: 'var(--font-sans)',
              transition: 'background 0.3s',
            }}
          >
            {saved ? t.saved : t.savePublish}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 20px',
              border: '1px solid var(--sand)',
              background: 'transparent',
              color: 'var(--muted)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </>
  )
}
