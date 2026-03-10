'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n'
import { uploadImage, deleteStorageFile, triggerRevalidation } from '@/lib/supabase/admin'
import PhotoEditor from './PhotoEditor'
import type { Profile, CategorySection, PillGroup, CropData, GalleryImage } from '@/lib/types'

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

type EditingPhoto = {
  key: 'profile_image' | 'cover_image' | 'gallery'
  idx?: number
} | null

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

const smallBtnStyle: React.CSSProperties = {
  padding: '3px 8px',
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  border: '1px solid var(--sand)',
  background: 'rgba(0,0,0,0.6)',
  color: 'var(--charcoal)',
  fontFamily: 'var(--font-sans)',
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
      profile_image: '',
      profile_image_crop: null,
      cover_image: '',
      cover_image_crop: null,
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
    profile_image: model.profile_image || '',
    profile_image_crop: model.profile_image_crop || null,
    cover_image: model.cover_image || '',
    cover_image_crop: model.cover_image_crop || null,
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

function cropStyle(crop: CropData | null): React.CSSProperties {
  if (!crop) return { objectFit: 'cover' as const }
  return {
    objectFit: 'cover' as const,
    objectPosition: `${crop.x}% ${crop.y}%`,
    transform: `scale(${crop.zoom / 100})`,
    transformOrigin: `${crop.x}% ${crop.y}%`,
  }
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
  const [saveError, setSaveError] = useState<string | null>(null)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [editingPhoto, setEditingPhoto] = useState<EditingPhoto>(null)
  const [uploading, setUploading] = useState<string | null>(null)

  const profileFileRef = useRef<HTMLInputElement>(null)
  const coverFileRef = useRef<HTMLInputElement>(null)
  const galleryFileRef = useRef<HTMLInputElement>(null)

  const t = useTranslation(lang)

  // Reset form when model changes
  useEffect(() => {
    setForm(initForm(model))
    setSaved(false)
    setGalleryImages([])
    // Load gallery images if editing existing model
    if (model?.id) {
      const supabase = createClient()
      supabase
        .from('gallery_images')
        .select('*')
        .eq('profile_id', model.id)
        .order('sort_order', { ascending: true })
        .then(({ data }) => {
          if (data) setGalleryImages(data as GalleryImage[])
        })
    }
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

  // --- Photo upload handlers ---
  const handlePhotoUpload = async (
    file: File,
    bucket: string,
    imageKey: 'profile_image' | 'cover_image'
  ) => {
    setUploading(imageKey)
    try {
      const folder = model?.id || 'new'
      const url = await uploadImage(file, bucket, folder)
      upd(imageKey, url)
    } catch (err) {
      console.error(`Upload ${imageKey} failed:`, err)
    } finally {
      setUploading(null)
    }
  }

  const handleGalleryUpload = async (file: File) => {
    if (!model?.id) return
    setUploading('gallery')
    try {
      const url = await uploadImage(file, 'gallery-images', model.id)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('gallery_images')
        .insert({
          profile_id: model.id,
          url,
          sort_order: galleryImages.length,
        })
        .select()
        .single()
      if (error) throw error
      if (data) setGalleryImages(prev => [...prev, data as GalleryImage])
    } catch (err) {
      console.error('Gallery upload failed:', err)
    } finally {
      setUploading(null)
    }
  }

  const handleGalleryDelete = async (img: GalleryImage) => {
    try {
      const supabase = createClient()
      await supabase.from('gallery_images').delete().eq('id', img.id)
      await deleteStorageFile('gallery-images', img.url).catch(() => {})
      setGalleryImages(prev => prev.filter(g => g.id !== img.id))
    } catch (err) {
      console.error('Gallery delete failed:', err)
    }
  }

  const handleRemovePhoto = (imageKey: 'profile_image' | 'cover_image') => {
    const bucket = imageKey === 'profile_image' ? 'profile-images' : 'cover-images'
    if (form[imageKey]) {
      deleteStorageFile(bucket, form[imageKey]).catch(() => {})
    }
    upd(imageKey, '')
    upd(`${imageKey}_crop`, null)
  }

  // --- PhotoEditor handlers ---
  const handleCropSave = (crop: CropData) => {
    if (!editingPhoto) return
    if (editingPhoto.key === 'gallery' && editingPhoto.idx !== undefined) {
      // Update gallery image crop in DB
      const img = galleryImages[editingPhoto.idx]
      if (img) {
        const supabase = createClient()
        supabase.from('gallery_images').update({ crop }).eq('id', img.id).then(() => {
          setGalleryImages(prev =>
            prev.map((g, i) => (i === editingPhoto.idx ? { ...g, crop } : g))
          )
        })
      }
    } else {
      upd(`${editingPhoto.key}_crop`, crop)
    }
    setEditingPhoto(null)
  }

  const getEditorProps = () => {
    if (!editingPhoto) return null
    if (editingPhoto.key === 'profile_image') {
      return { src: form.profile_image, crop: form.profile_image_crop, aspect: '2/3' }
    }
    if (editingPhoto.key === 'cover_image') {
      return { src: form.cover_image, crop: form.cover_image_crop, aspect: '7/3' }
    }
    if (editingPhoto.key === 'gallery' && editingPhoto.idx !== undefined) {
      const img = galleryImages[editingPhoto.idx]
      return img ? { src: img.url, crop: img.crop, aspect: '3/4' } : null
    }
    return null
  }

  // --- Save handler ---
  const handleSave = async () => {
    if (saving) return
    setSaveError(null)

    if (!form.name?.trim()) {
      setSaveError('Name is required')
      return
    }

    setSaving(true)

    const slug = form.name
      .toLowerCase()
      .trim()
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
      profile_image: topLevel.profile_image || null,
      profile_image_crop: topLevel.profile_image_crop || null,
      cover_image: topLevel.cover_image || null,
      cover_image_crop: topLevel.cover_image_crop || null,
      attributes,
    }

    const supabase = createClient()

    try {
      // Check slug uniqueness
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('slug', slug)
        .neq('id', model?.id || '')
        .maybeSingle()

      if (existing) {
        setSaveError(`A model with the URL "${slug}" already exists`)
        setSaving(false)
        return
      }

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
          // ISR revalidation
          await triggerRevalidation(['/', `/model/${slug}`])
          // Check groups containing this model
          const { data: groups } = await supabase
            .from('groups')
            .select('slug')
            .contains('member_ids', [model.id])
          if (groups?.length) {
            await triggerRevalidation(groups.map(g => `/group/${g.slug}`))
          }
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
          await triggerRevalidation(['/', `/model/${slug}`])
          onSave(data as Profile)
        }
      }
    } catch (err: any) {
      console.error('Save failed:', err)
      setSaveError(err?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  // --- Delete handler ---
  const handleDelete = async () => {
    if (!model?.id) return
    if (!confirm(t.deleteConfirm)) return

    const supabase = createClient()

    try {
      // Delete gallery images from storage
      for (const img of galleryImages) {
        await deleteStorageFile('gallery-images', img.url).catch(() => {})
      }
      // Delete gallery rows (CASCADE should handle, but explicit)
      await supabase.from('gallery_images').delete().eq('profile_id', model.id)

      // Delete profile/cover from storage
      if (model.profile_image) {
        await deleteStorageFile('profile-images', model.profile_image).catch(() => {})
      }
      if (model.cover_image) {
        await deleteStorageFile('cover-images', model.cover_image).catch(() => {})
      }

      const { error } = await supabase.from('profiles').delete().eq('id', model.id)
      if (!error) {
        await triggerRevalidation(['/', `/model/${model.slug}`])
        onDelete(model.id)
      }
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const editorProps = getEditorProps()

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
                form.profile_image ||
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

          {/* PHOTOS section */}
          <div style={{ marginBottom: 28 }}>
            <div style={sectionHeading}>{t.photos}</div>

            {/* Profile + Cover side by side */}
            <div className="admin-edit-grid" style={{ gap: 12 }}>
              {/* Profile Photo */}
              <div>
                <label style={labelStyle}>Profile Photo</label>
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '2/3',
                    border: form.profile_image ? 'none' : '1px dashed var(--sand)',
                    background: 'rgba(255,255,255,0.02)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onClick={() => !form.profile_image && profileFileRef.current?.click()}
                >
                  {form.profile_image ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.profile_image}
                        alt=""
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          ...cropStyle(form.profile_image_crop),
                        }}
                      />
                      <div style={{ position: 'absolute', bottom: 6, left: 6, display: 'flex', gap: 4 }}>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setEditingPhoto({ key: 'profile_image' }) }} style={smallBtnStyle}>Edit</button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); profileFileRef.current?.click() }} style={smallBtnStyle}>Upload</button>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemovePhoto('profile_image') }}
                        style={{ ...smallBtnStyle, position: 'absolute', top: 4, right: 4, color: 'var(--rose)' }}
                      >
                        X
                      </button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 11, color: 'var(--sand)', fontFamily: 'var(--font-sans)' }}>
                      {uploading === 'profile_image' ? 'Uploading...' : 'Click to upload'}
                    </div>
                  )}
                </div>
                <input
                  ref={profileFileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handlePhotoUpload(file, 'profile-images', 'profile_image')
                    e.target.value = ''
                  }}
                />
              </div>

              {/* Cover Photo */}
              <div>
                <label style={labelStyle}>Cover Photo</label>
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '7/3',
                    border: form.cover_image ? 'none' : '1px dashed var(--sand)',
                    background: 'rgba(255,255,255,0.02)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onClick={() => !form.cover_image && coverFileRef.current?.click()}
                >
                  {form.cover_image ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.cover_image}
                        alt=""
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          ...cropStyle(form.cover_image_crop),
                        }}
                      />
                      <div style={{ position: 'absolute', bottom: 6, left: 6, display: 'flex', gap: 4 }}>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setEditingPhoto({ key: 'cover_image' }) }} style={smallBtnStyle}>Edit</button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); coverFileRef.current?.click() }} style={smallBtnStyle}>Upload</button>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemovePhoto('cover_image') }}
                        style={{ ...smallBtnStyle, position: 'absolute', top: 4, right: 4, color: 'var(--rose)' }}
                      >
                        X
                      </button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 11, color: 'var(--sand)', fontFamily: 'var(--font-sans)' }}>
                      {uploading === 'cover_image' ? 'Uploading...' : 'Click to upload'}
                    </div>
                  )}
                </div>
                <input
                  ref={coverFileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handlePhotoUpload(file, 'cover-images', 'cover_image')
                    e.target.value = ''
                  }}
                />
              </div>
            </div>

            {/* Gallery section */}
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Gallery</label>
              {!model?.id ? (
                <div style={{ fontSize: 11, color: 'var(--muted)', padding: '12px 0', fontFamily: 'var(--font-sans)' }}>
                  Save the model first to add gallery images
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {galleryImages.map((img, idx) => (
                      <div
                        key={img.id}
                        style={{
                          position: 'relative',
                          aspectRatio: '3/4',
                          overflow: 'hidden',
                          background: '#111',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt=""
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            ...cropStyle(img.crop),
                          }}
                        />
                        {/* Index number */}
                        <span style={{ position: 'absolute', top: 4, left: 6, fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{idx + 1}</span>
                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleGalleryDelete(img)}
                          style={{ ...smallBtnStyle, position: 'absolute', top: 4, right: 4, color: 'var(--rose)', padding: '2px 5px' }}
                        >
                          X
                        </button>
                        {/* Edit crop */}
                        <button
                          type="button"
                          onClick={() => setEditingPhoto({ key: 'gallery', idx })}
                          style={{ ...smallBtnStyle, position: 'absolute', bottom: 4, left: 4, padding: '2px 6px' }}
                        >
                          Edit
                        </button>
                      </div>
                    ))}

                    {/* Add button */}
                    <div
                      onClick={() => galleryFileRef.current?.click()}
                      style={{
                        aspectRatio: '3/4',
                        border: '1px dashed var(--sand)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: 24,
                        color: 'var(--sand)',
                        background: 'rgba(255,255,255,0.02)',
                      }}
                    >
                      {uploading === 'gallery' ? '...' : '+'}
                    </div>
                  </div>
                  <input
                    ref={galleryFileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleGalleryUpload(file)
                      e.target.value = ''
                    }}
                  />
                </>
              )}
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

        {/* Error message */}
        {saveError && (
          <div
            style={{
              margin: '0 24px 12px',
              padding: '8px 12px',
              background: 'rgba(212, 117, 138, 0.12)',
              border: '1px solid rgba(212, 117, 138, 0.3)',
              color: 'var(--rose)',
              fontSize: 12,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {saveError}
          </div>
        )}

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

      {/* PhotoEditor modal */}
      {editingPhoto && editorProps && (
        <PhotoEditor
          src={editorProps.src}
          crop={editorProps.crop}
          aspect={editorProps.aspect}
          onSave={handleCropSave}
          onCancel={() => setEditingPhoto(null)}
          translations={t}
        />
      )}
    </>
  )
}
