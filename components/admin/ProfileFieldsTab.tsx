'use client'

import { useState, useRef } from 'react'
import { useTranslation } from '@/lib/i18n'
import { uploadImage } from '@/lib/supabase/admin'
import PhotoEditor from './PhotoEditor'
import type { HeroConfig, CardSettings, PillGroup, FormConfig, FormField, CategorySection, CropData } from '@/lib/types'

interface ProfileFieldsTabProps {
  lang: 'en' | 'ko'
  heroConfig: HeroConfig
  cardSettings: CardSettings
  pillGroups: PillGroup[]
  formConfig: FormConfig
  categories: CategorySection[]
  onConfigUpdate: (configId: string, value: any) => void
}

const panelStyle: React.CSSProperties = {
  background: '#181716',
  border: '1px solid var(--sand)',
  borderRadius: 12,
  padding: 28,
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  color: 'var(--muted)',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--input-bg)',
  border: '1px solid var(--sand)',
  borderRadius: 8,
  color: 'var(--charcoal)',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  outline: 'none',
}

export default function ProfileFieldsTab({
  lang,
  heroConfig,
  cardSettings,
  pillGroups,
  formConfig,
  categories,
  onConfigUpdate,
}: ProfileFieldsTabProps) {
  const t = useTranslation(lang)
  const [editingHeroPhoto, setEditingHeroPhoto] = useState(false)
  const heroFileRef = useRef<HTMLInputElement>(null)

  // ─── Hero Banner ──────────────────────────────────────────
  const updateHero = (patch: Partial<HeroConfig>) => {
    onConfigUpdate('hero', { ...heroConfig, ...patch })
  }

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadImage(file, 'profile-images', 'hero')
      updateHero({ img: url, imgCrop: { x: 50, y: 50, zoom: 100 } })
    } catch (err) {
      console.error('Hero upload failed:', err)
    }
  }

  // ─── Card Settings ────────────────────────────────────────
  const updateCards = (patch: Partial<CardSettings>) => {
    onConfigUpdate('card_settings', { ...cardSettings, ...patch })
  }

  const toggleSubtitleField = (field: string) => {
    const fields = cardSettings.subtitleFields.includes(field)
      ? cardSettings.subtitleFields.filter(f => f !== field)
      : [...cardSettings.subtitleFields, field]
    updateCards({ subtitleFields: fields })
  }

  // ─── Tag Groups ───────────────────────────────────────────
  const updatePillGroups = (updated: PillGroup[]) => {
    onConfigUpdate('pill_groups', updated)
  }

  const addPillGroup = () => {
    const id = `pg_${Date.now()}`
    updatePillGroups([...pillGroups, { id, title: 'New Group', color: 'var(--charcoal)', dataKey: `custom_tags_${Date.now()}`, options: ['Option 1'] }])
  }

  const removePillGroup = (idx: number) => {
    updatePillGroups(pillGroups.filter((_, i) => i !== idx))
  }

  const updatePillGroup = (idx: number, patch: Partial<PillGroup>) => {
    const updated = [...pillGroups]
    updated[idx] = { ...updated[idx], ...patch }
    updatePillGroups(updated)
  }

  const addOption = (groupIdx: number) => {
    const g = pillGroups[groupIdx]
    updatePillGroup(groupIdx, { options: [...g.options, 'New Option'] })
  }

  const removeOption = (groupIdx: number, optIdx: number) => {
    const g = pillGroups[groupIdx]
    updatePillGroup(groupIdx, { options: g.options.filter((_, i) => i !== optIdx) })
  }

  const updateOption = (groupIdx: number, optIdx: number, value: string) => {
    const g = pillGroups[groupIdx]
    const opts = [...g.options]
    opts[optIdx] = value
    updatePillGroup(groupIdx, { options: opts })
  }

  // ─── Form Config ──────────────────────────────────────────
  const updateForm = (patch: Partial<FormConfig>) => {
    onConfigUpdate('form_config', { ...formConfig, ...patch })
  }

  const updateFormField = (idx: number, patch: Partial<FormField>) => {
    const fields = [...formConfig.fields]
    fields[idx] = { ...fields[idx], ...patch }
    updateForm({ fields })
  }

  const addFormField = () => {
    updateForm({ fields: [...formConfig.fields, { id: `field_${Date.now()}`, label: 'New Field', type: 'text', required: false, width: 'full', placeholder: '' }] })
  }

  const removeFormField = (idx: number) => {
    updateForm({ fields: formConfig.fields.filter((_, i) => i !== idx) })
  }

  // ─── Categories ───────────────────────────────────────────
  const updateCategories = (updated: CategorySection[]) => {
    onConfigUpdate('categories', updated)
  }

  const addCategory = () => {
    const id = `section_${Date.now()}`
    updateCategories([...categories, { id, title: 'New Section', fields: [{ key: 'new_field', label: 'New Field' }] }])
  }

  const removeCategory = (idx: number) => {
    updateCategories(categories.filter((_, i) => i !== idx))
  }

  const updateCategoryTitle = (idx: number, title: string) => {
    const updated = [...categories]
    updated[idx] = { ...updated[idx], title }
    updateCategories(updated)
  }

  const addCategoryField = (catIdx: number) => {
    const cat = categories[catIdx]
    const key = `field_${Date.now()}`
    const updated = [...categories]
    updated[catIdx] = { ...cat, fields: [...cat.fields, { key, label: 'New Field' }] }
    updateCategories(updated)
  }

  const removeCategoryField = (catIdx: number, fieldIdx: number) => {
    const updated = [...categories]
    updated[catIdx] = { ...updated[catIdx], fields: updated[catIdx].fields.filter((_, i) => i !== fieldIdx) }
    updateCategories(updated)
  }

  const updateCategoryField = (catIdx: number, fieldIdx: number, label: string) => {
    const updated = [...categories]
    const fields = [...updated[catIdx].fields]
    fields[fieldIdx] = { ...fields[fieldIdx], label }
    updated[catIdx] = { ...updated[catIdx], fields }
    updateCategories(updated)
  }

  const cropStyle = (crop: CropData | null): React.CSSProperties => {
    if (!crop) return {}
    return {
      objectPosition: `${crop.x}% ${crop.y}%`,
      transform: `scale(${crop.zoom / 100})`,
      transformOrigin: `${crop.x}% ${crop.y}%`,
    }
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>

      {/* ─── HERO BANNER SETTINGS ──────────────────────────── */}
      <div style={panelStyle}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--charcoal)', marginBottom: 4 }}>Hero Banner Settings</h3>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>Configure the homepage hero banner image and text.</p>

        {/* Hero image area */}
        <div style={{ position: 'relative', aspectRatio: '21/9', borderRadius: 10, overflow: 'hidden', marginBottom: 20, border: heroConfig.img ? 'none' : '2px dashed var(--sand)', background: 'var(--warm)', cursor: heroConfig.img ? 'default' : 'pointer' }}
          onClick={() => !heroConfig.img && heroFileRef.current?.click()}
        >
          {heroConfig.img ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroConfig.img}
                alt="Hero"
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.4)', ...cropStyle(heroConfig.imgCrop) }}
              />
              {/* Preview text overlay */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--charcoal)', pointerEvents: 'none' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 300 }}>
                  {heroConfig.titleLine1} {heroConfig.titleLine2} <span style={{ color: 'var(--rose)', fontStyle: 'italic' }}>{heroConfig.titleAccent}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{heroConfig.subtitle}</div>
              </div>
              {/* Bottom controls */}
              <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 8 }}>
                <button onClick={(e) => { e.stopPropagation(); setEditingHeroPhoto(true) }} style={{ padding: '6px 14px', background: 'rgba(0,0,0,0.6)', border: '1px solid var(--sand)', borderRadius: 6, color: 'var(--charcoal)', fontSize: 12, cursor: 'pointer' }}>Edit</button>
                <button onClick={(e) => { e.stopPropagation(); heroFileRef.current?.click() }} style={{ padding: '6px 14px', background: 'rgba(0,0,0,0.6)', border: '1px solid var(--sand)', borderRadius: 6, color: 'var(--charcoal)', fontSize: 12, cursor: 'pointer' }}>Upload</button>
                <button onClick={(e) => { e.stopPropagation(); updateHero({ img: '', imgCrop: null }) }} style={{ width: 28, height: 28, background: 'rgba(0,0,0,0.6)', border: '1px solid var(--sand)', borderRadius: 6, color: 'var(--rose)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', fontSize: 14 }}>Click to upload hero image</div>
          )}
        </div>
        <input ref={heroFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleHeroUpload} />

        {/* Text fields - 2 column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <div style={labelStyle}>Subtitle</div>
            <input style={inputStyle} value={heroConfig.subtitle} onChange={e => updateHero({ subtitle: e.target.value })} />
          </div>
          <div>
            <div style={labelStyle}>Search Placeholder</div>
            <input style={inputStyle} value={heroConfig.searchPlaceholder} onChange={e => updateHero({ searchPlaceholder: e.target.value })} />
          </div>
        </div>

        {/* Title fields - 3 column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <div style={labelStyle}>Title Line 1</div>
            <input style={inputStyle} value={heroConfig.titleLine1} onChange={e => updateHero({ titleLine1: e.target.value })} />
          </div>
          <div>
            <div style={labelStyle}>Title Line 2</div>
            <input style={inputStyle} value={heroConfig.titleLine2} onChange={e => updateHero({ titleLine2: e.target.value })} />
          </div>
          <div>
            <div style={labelStyle}>Title Accent</div>
            <input style={inputStyle} value={heroConfig.titleAccent} onChange={e => updateHero({ titleAccent: e.target.value })} />
          </div>
        </div>
      </div>

      {/* PhotoEditor modal for hero */}
      {editingHeroPhoto && heroConfig.img && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PhotoEditor
            src={heroConfig.img}
            crop={heroConfig.imgCrop}
            aspect="21/9"
            onSave={(crop) => { updateHero({ imgCrop: crop }); setEditingHeroPhoto(false) }}
            onCancel={() => setEditingHeroPhoto(false)}
            translations={t}
          />
        </div>
      )}

      {/* ─── CARD DISPLAY SETTINGS ─────────────────────────── */}
      <div style={panelStyle}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--charcoal)', marginBottom: 4 }}>Card Display</h3>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>Configure how model cards appear on the homepage.</p>

        {/* Subtitle Fields */}
        <div style={{ marginBottom: 20 }}>
          <div style={labelStyle}>Subtitle Fields</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['region', 'types', 'exp', 'age'].map(field => (
              <button
                key={field}
                onClick={() => toggleSubtitleField(field)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--sand)',
                  background: cardSettings.subtitleFields.includes(field) ? 'var(--charcoal)' : 'transparent',
                  color: cardSettings.subtitleFields.includes(field) ? 'var(--cream)' : 'var(--charcoal)',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  textTransform: 'capitalize',
                }}
              >
                {field}
              </button>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div style={{ marginBottom: 20 }}>
          <div style={labelStyle}>Badges</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Verified badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => updateCards({ showVerifiedBadge: !cardSettings.showVerifiedBadge })}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: cardSettings.showVerifiedBadge ? 'var(--sage)' : 'var(--sand)',
                  position: 'relative', transition: 'background 0.2s',
                }}
              >
                <div style={{ width: 18, height: 18, borderRadius: 9, background: 'white', position: 'absolute', top: 3, left: cardSettings.showVerifiedBadge ? 23 : 3, transition: 'left 0.2s' }} />
              </button>
              <input style={{ ...inputStyle, width: 120 }} value={cardSettings.verifiedLabel} onChange={e => updateCards({ verifiedLabel: e.target.value })} />
            </div>
            {/* Away badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => updateCards({ showAwayBadge: !cardSettings.showAwayBadge })}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: cardSettings.showAwayBadge ? 'var(--peach)' : 'var(--sand)',
                  position: 'relative', transition: 'background 0.2s',
                }}
              >
                <div style={{ width: 18, height: 18, borderRadius: 9, background: 'white', position: 'absolute', top: 3, left: cardSettings.showAwayBadge ? 23 : 3, transition: 'left 0.2s' }} />
              </button>
              <input style={{ ...inputStyle, width: 120 }} value={cardSettings.awayLabel} onChange={e => updateCards({ awayLabel: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Overlay */}
        <div>
          <div style={labelStyle}>Card Overlay</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>Color</span>
              <input type="color" value={cardSettings.overlayColor} onChange={e => updateCards({ overlayColor: e.target.value })} style={{ width: 40, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: 'var(--muted)', fontSize: 12, whiteSpace: 'nowrap' }}>Opacity {cardSettings.overlayOpacity}%</span>
              <input type="range" min={0} max={100} value={cardSettings.overlayOpacity} onChange={e => updateCards({ overlayOpacity: Number(e.target.value) })} style={{ flex: 1, accentColor: 'var(--rose)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── TAG GROUPS EDITOR ─────────────────────────────── */}
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--charcoal)' }}>Tag Groups</h3>
          <button onClick={addPillGroup} style={{ padding: '6px 14px', background: 'var(--rose-soft)', color: 'var(--rose)', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>+ Add Group</button>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>Manage filter pill groups shown on profiles and homepage.</p>

        <div style={{ display: 'grid', gap: 16 }}>
          {pillGroups.map((group, gi) => (
            <div key={group.id} style={{ border: '1px solid var(--sand)', borderRadius: 10, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <input
                  value={group.title}
                  onChange={e => updatePillGroup(gi, { title: e.target.value })}
                  style={{ ...inputStyle, flex: 1, fontFamily: 'var(--font-serif)', fontSize: 16, borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, padding: '4px 0', background: 'transparent' }}
                />
                <input type="color" value={group.color.startsWith('#') ? group.color : '#f0ebe5'} onChange={e => updatePillGroup(gi, { color: e.target.value })} style={{ width: 32, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'transparent' }} />
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--muted)', background: 'var(--warm)', padding: '4px 8px', borderRadius: 4 }}>{group.dataKey}</span>
                <button onClick={() => removePillGroup(gi)} style={{ width: 28, height: 28, background: 'transparent', border: '1px solid var(--sand)', borderRadius: 6, color: 'var(--rose)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {group.options.map((opt, oi) => (
                  <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--warm)', borderRadius: 6, padding: '4px 8px' }}>
                    <input
                      value={opt}
                      onChange={e => updateOption(gi, oi, e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--charcoal)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none', width: Math.max(60, opt.length * 8) }}
                    />
                    <button onClick={() => removeOption(gi, oi)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 12, padding: 0 }}>&times;</button>
                  </div>
                ))}
                <button onClick={() => addOption(gi)} style={{ padding: '4px 12px', border: '1px dashed var(--sand)', borderRadius: 6, background: 'transparent', color: 'var(--muted)', fontSize: 12, cursor: 'pointer' }}>+ Add</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── MEMBERSHIP FORM EDITOR ────────────────────────── */}
      <div style={panelStyle}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--charcoal)', marginBottom: 4 }}>Membership Form</h3>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>Configure the membership application form fields and text.</p>

        {/* Form text settings */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={labelStyle}>Form Title</div>
            <input style={inputStyle} value={formConfig.title} onChange={e => updateForm({ title: e.target.value })} />
          </div>
          <div>
            <div style={labelStyle}>Submit Label</div>
            <input style={inputStyle} value={formConfig.submitLabel} onChange={e => updateForm({ submitLabel: e.target.value })} />
          </div>
          <div>
            <div style={labelStyle}>Subtitle</div>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={formConfig.subtitle} onChange={e => updateForm({ subtitle: e.target.value })} />
          </div>
          <div>
            <div style={labelStyle}>Success Title</div>
            <input style={inputStyle} value={formConfig.successTitle} onChange={e => updateForm({ successTitle: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={labelStyle}>Success Message</div>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={formConfig.successMsg} onChange={e => updateForm({ successMsg: e.target.value })} />
          </div>
        </div>

        {/* Fields list */}
        <div style={labelStyle}>Form Fields</div>
        <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
          {formConfig.fields.map((field, fi) => (
            <div key={field.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--warm)', borderRadius: 8, padding: '8px 12px' }}>
                <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em', width: 60, flexShrink: 0 }}>{field.id}</span>
                <input value={field.label} onChange={e => updateFormField(fi, { label: e.target.value })} style={{ ...inputStyle, flex: 1, padding: '6px 10px', fontSize: 13 }} />
                <select value={field.type} onChange={e => updateFormField(fi, { type: e.target.value as FormField['type'] })} style={{ ...inputStyle, width: 120, padding: '6px 8px', fontSize: 12 }}>
                  {['text', 'email', 'textarea', 'file_upload', 'area_select', 'exp_select', 'type_pills'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select value={field.width} onChange={e => updateFormField(fi, { width: e.target.value as FormField['width'] })} style={{ ...inputStyle, width: 80, padding: '6px 8px', fontSize: 12 }}>
                  {['full', 'half', 'third'].map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
                <button onClick={() => updateFormField(fi, { required: !field.required })} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: field.required ? 'var(--rose)' : 'var(--sand)', color: field.required ? 'white' : 'var(--muted)', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>*</button>
                <input value={field.placeholder || ''} onChange={e => updateFormField(fi, { placeholder: e.target.value })} placeholder="Placeholder..." style={{ ...inputStyle, width: 120, padding: '6px 10px', fontSize: 12 }} />
                <button onClick={() => removeFormField(fi)} style={{ width: 28, height: 28, background: 'transparent', border: '1px solid var(--sand)', borderRadius: 6, color: 'var(--rose)', cursor: 'pointer', fontSize: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
              </div>
              {field.type === 'file_upload' && (
                <div style={{ marginTop: 4, marginLeft: 68 }}>
                  <input value={field.helperText || ''} onChange={e => updateFormField(fi, { helperText: e.target.value })} placeholder="Helper text for file upload..." style={{ ...inputStyle, fontSize: 12, padding: '6px 10px' }} />
                </div>
              )}
            </div>
          ))}
        </div>
        <button onClick={addFormField} style={{ width: '100%', padding: '10px 0', border: '1px dashed var(--sand)', borderRadius: 8, background: 'transparent', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>+ Add Field</button>
      </div>

      {/* ─── CATEGORY SECTIONS ─────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--charcoal)' }}>Profile Sections</h3>
        <button onClick={addCategory} style={{ padding: '6px 14px', background: 'var(--rose-soft)', color: 'var(--rose)', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>+ Add Section</button>
      </div>

      {categories.map((cat, ci) => (
        <div key={cat.id} style={panelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <input
              value={cat.title}
              onChange={e => updateCategoryTitle(ci, e.target.value)}
              style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--charcoal)', background: 'transparent', border: 'none', borderBottom: '2px solid var(--sand)', padding: '4px 0', flex: 1, outline: 'none' }}
            />
            <button onClick={() => removeCategory(ci)} style={{ width: 28, height: 28, background: 'transparent', border: '1px solid var(--sand)', borderRadius: 6, color: 'var(--rose)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            {cat.fields.map((field, fi) => (
              <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--warm)', borderRadius: 6, padding: '6px 10px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--muted)', width: 60, flexShrink: 0 }}>{field.key}</span>
                <input value={field.label} onChange={e => updateCategoryField(ci, fi, e.target.value)} style={{ ...inputStyle, flex: 1, padding: '4px 8px', fontSize: 13 }} />
                <button onClick={() => removeCategoryField(ci, fi)} style={{ background: 'transparent', border: 'none', color: 'var(--rose)', cursor: 'pointer', fontSize: 14, padding: 0 }}>&times;</button>
              </div>
            ))}
          </div>
          <button onClick={() => addCategoryField(ci)} style={{ padding: '6px 14px', border: '1px dashed var(--sand)', borderRadius: 6, background: 'transparent', color: 'var(--muted)', fontSize: 12, cursor: 'pointer' }}>+ Add Field</button>
        </div>
      ))}
    </div>
  )
}
