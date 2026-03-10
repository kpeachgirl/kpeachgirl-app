'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadImage, deleteStorageFile, triggerRevalidation, generateSlug } from '@/lib/supabase/admin'
import { useTranslation } from '@/lib/i18n'
import type { Group, GroupGalleryImage, Profile, PillGroup, CategorySection } from '@/lib/types'

interface GroupEditorProps {
  group: Group
  galleryImages: GroupGalleryImage[]
  profiles: Profile[]
  pillGroups: PillGroup[]
  categories: CategorySection[]
  lang: 'en' | 'ko'
  onSave: (group: Group) => void
  onDelete: (id: string) => void
  onCancel: () => void
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

function initForm(group: Group): FormState {
  return {
    name: group.name || '',
    badge_label: group.badge_label || '',
    image: group.image || '',
    bio: group.bio || '',
    types: group.types || [],
    compensation: group.compensation || [],
    member_ids: group.member_ids || [],
    attributes: { ...(group.attributes || {}) },
  }
}

export default function GroupEditor({
  group,
  galleryImages: initialGallery,
  profiles,
  pillGroups,
  categories,
  lang,
  onSave,
  onDelete,
  onCancel,
}: GroupEditorProps) {
  const [form, setForm] = useState<FormState>(() => initForm(group))
  const [gallery, setGallery] = useState<GroupGalleryImage[]>(initialGallery)
  const [saving, setSaving] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const t = useTranslation(lang)

  const isNew = !group.id

  // --- Handlers ---

  const handleGroupPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadImage(file, 'gallery-images', group.id || 'new-group')
      setForm(p => ({ ...p, image: url }))
    } catch (err) {
      console.error('Group photo upload failed:', err)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const groupId = group.id
    if (!groupId) return
    try {
      const url = await uploadImage(file, 'gallery-images', groupId)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('group_gallery_images')
        .insert({ group_id: groupId, url, sort_order: gallery.length })
        .select()
        .single()
      if (error) throw error
      if (data) setGallery(prev => [...prev, data as GroupGalleryImage])
    } catch (err) {
      console.error('Gallery upload failed:', err)
    }
    if (galleryInputRef.current) galleryInputRef.current.value = ''
  }

  const handleGalleryDelete = async (img: GroupGalleryImage) => {
    try {
      const supabase = createClient()
      await supabase.from('group_gallery_images').delete().eq('id', img.id)
      await deleteStorageFile('gallery-images', img.url)
      setGallery(prev => prev.filter(g => g.id !== img.id))
    } catch (err) {
      console.error('Gallery delete failed:', err)
    }
  }

  const handleSave = async () => {
    if (!form.name?.trim()) return
    setSaving(true)
    try {
      const supabase = createClient()
      const slug = generateSlug(form.name)
      const payload = {
        name: form.name,
        slug,
        bio: form.bio || null,
        badge_label: form.badge_label || null,
        image: form.image || null,
        member_ids: form.member_ids || [],
        types: form.types || [],
        compensation: form.compensation || [],
        attributes: form.attributes || {},
      }

      let savedGroup: Group
      if (isNew) {
        const { data, error } = await supabase
          .from('groups')
          .insert(payload)
          .select()
          .single()
        if (error) throw error
        savedGroup = data as Group
      } else {
        const { data, error } = await supabase
          .from('groups')
          .update(payload)
          .eq('id', group.id)
          .select()
          .single()
        if (error) throw error
        savedGroup = data as Group
      }

      // Revalidate homepage + group page + member profile pages
      const revalPaths = ['/', `/group/${slug}`]
      for (const mid of form.member_ids || []) {
        const member = profiles.find(p => p.id === mid)
        if (member?.slug) revalPaths.push(`/model/${member.slug}`)
      }
      triggerRevalidation(revalPaths)

      onSave(savedGroup)
    } catch (err) {
      console.error('Save group failed:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!group.id) return
    if (!confirm(t.deleteConfirm)) return
    try {
      const supabase = createClient()
      const { error } = await supabase.from('groups').delete().eq('id', group.id)
      if (error) throw error
      triggerRevalidation(['/', `/group/${group.slug}`])
      onDelete(group.id)
    } catch (err) {
      console.error('Delete group failed:', err)
    }
  }

  const togglePill = (dataKey: string, option: string) => {
    setForm(p => {
      const vals: string[] = p[dataKey] || []
      const on = vals.includes(option)
      return { ...p, [dataKey]: on ? vals.filter((x: string) => x !== option) : [...vals, option] }
    })
  }

  const setAttr = (key: string, value: string) => {
    setForm(p => ({ ...p, attributes: { ...p.attributes, [key]: value } }))
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Name + Badge Label */}
      <div className="admin-edit-grid" style={{ marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>{t.grpName}</label>
          <input
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>
            {t.grpBadgeLabel}{' '}
            <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 9, color: 'var(--sand)' }}>
              ({t.grpBadgeAuto})
            </span>
          </label>
          <input
            value={form.badge_label}
            onChange={e => setForm(p => ({ ...p, badge_label: e.target.value }))}
            placeholder="DUO / TRIO / custom..."
            style={inputStyle}
          />
        </div>
      </div>

      {/* Group Photo */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Group Photo</label>
        <div
          style={{
            position: 'relative',
            width: 200,
            aspectRatio: '1/1',
            border: '1px dashed var(--sand)',
            background: 'rgba(255,255,255,0.02)',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
          onClick={() => photoInputRef.current?.click()}
        >
          {form.image ? (
            <img src={form.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                fontSize: 11,
                color: 'var(--sand)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Click to upload
            </div>
          )}
          {form.image && (
            <button
              onClick={e => {
                e.stopPropagation()
                setForm(p => ({ ...p, image: '' }))
              }}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 20,
                height: 20,
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: 'none',
                fontSize: 11,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              x
            </button>
          )}
        </div>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={handleGroupPhoto}
          style={{ display: 'none' }}
        />
      </div>

      {/* Bio */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>{t.grpBio}</label>
        <textarea
          value={form.bio}
          onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Tag groups (shoot types, compensation) */}
      {pillGroups.map(pg => (
        <div key={pg.id} style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{pg.title}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            {pg.options.map(opt => {
              const vals: string[] = form[pg.dataKey] || []
              const on = vals.includes(opt)
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => togglePill(pg.dataKey, opt)}
                  style={{
                    padding: '5px 14px',
                    fontSize: 11,
                    fontWeight: on ? 700 : 500,
                    cursor: 'pointer',
                    border: on ? `1px solid ${pg.color}` : '1px solid var(--sand)',
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

      {/* Category fields */}
      {categories.map(cat => (
        <div key={cat.id} style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{cat.title}</label>
          <div className="admin-edit-grid" style={{ marginTop: 4 }}>
            {cat.fields.map(ff => (
              <div key={ff.key}>
                <label style={{ ...labelStyle, fontSize: 9 }}>{ff.label}</label>
                <input
                  value={form.attributes[ff.key] || ''}
                  onChange={e => setAttr(ff.key, e.target.value)}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Members */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>{t.grpMembers}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {(form.member_ids || []).map((mid: string) => {
            const m = profiles.find(x => x.id === mid)
            return m ? (
              <div
                key={mid}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 6px 6px 12px',
                  border: '1px solid var(--sand)',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--charcoal)' }}>{m.name}</span>
                <button
                  onClick={() =>
                    setForm(p => ({
                      ...p,
                      member_ids: (p.member_ids || []).filter((x: string) => x !== mid),
                    }))
                  }
                  style={{
                    width: 20,
                    height: 20,
                    border: '1px solid var(--sand)',
                    background: 'none',
                    color: 'var(--muted)',
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  x
                </button>
              </div>
            ) : null
          })}
        </div>
        <div style={{ marginTop: 8 }}>
          <select
            onChange={e => {
              const v = e.target.value
              if (v && !(form.member_ids || []).includes(v)) {
                setForm(p => ({ ...p, member_ids: [...(p.member_ids || []), v] }))
              }
              e.target.value = ''
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid var(--sand)',
              background: '#1e1d1b',
              color: 'var(--charcoal)',
              fontSize: 12,
              fontFamily: 'var(--font-sans)',
            }}
          >
            <option value="">{t.grpAddMember}...</option>
            {profiles
              .filter(m => !(form.member_ids || []).includes(m.id))
              .map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Gallery */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>
          {t.grpGallery} ({gallery.length})
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 6,
            marginTop: 8,
          }}
        >
          {gallery.map(img => (
            <div
              key={img.id}
              style={{
                position: 'relative',
                aspectRatio: '3/4',
                overflow: 'hidden',
                border: '1px solid var(--sand)',
              }}
            >
              <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => handleGalleryDelete(img)}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 18,
                  height: 18,
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                x
              </button>
            </div>
          ))}
          <div
            style={{
              aspectRatio: '3/4',
              border: '1px dashed var(--sand)',
              cursor: group.id ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: group.id ? 1 : 0.4,
            }}
            onClick={() => group.id && galleryInputRef.current?.click()}
          >
            <span style={{ fontSize: 20, color: 'var(--sand)' }}>+</span>
          </div>
        </div>
        {!group.id && (
          <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
            Save the group first to upload gallery images.
          </p>
        )}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleGalleryUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 1,
            padding: '10px 0',
            background: 'var(--charcoal)',
            color: 'var(--cream)',
            border: 'none',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: saving ? 'wait' : 'pointer',
            fontFamily: 'var(--font-sans)',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving...' : t.savePublish}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '10px 20px',
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
        {!isNew && (
          <button
            onClick={handleDelete}
            style={{
              padding: '10px 16px',
              border: '1px solid rgba(212,117,138,0.3)',
              background: 'transparent',
              color: 'var(--rose)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {t.grpDelete}
          </button>
        )}
      </div>
    </div>
  )
}
