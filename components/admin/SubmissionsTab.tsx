'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n'
import { generateSlug, triggerRevalidation } from '@/lib/supabase/admin'
import type { Submission, FormConfig } from '@/lib/types'

interface SubmissionsTabProps {
  lang: 'en' | 'ko'
  formConfig: FormConfig | null
  areas: string[]
  onConverted?: () => void
}

const STATUS_COLORS: Record<string, string> = {
  new: 'var(--rose)',
  reviewed: 'var(--peach)',
  approved: 'var(--sage)',
  dismissed: 'var(--sand)',
  converted: 'var(--muted)',
}

export default function SubmissionsTab({ lang, formConfig, areas, onConverted }: SubmissionsTabProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [linkCopied, setLinkCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const t = useTranslation(lang)

  const fetchSubmissions = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setSubmissions(data as Submission[])
    setLoading(false)
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const newCount = submissions.filter(s => s.status === 'new').length

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/membership`
    await navigator.clipboard.writeText(url)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from('submissions').update({ status }).eq('id', id)
    await fetchSubmissions()
  }

  const handleConvert = async (submission: Submission) => {
    const supabase = createClient()
    const fd = submission.form_data

    const region = fd.region || areas[0] || 'LA'
    const parentRegion = region.toLowerCase().includes('oc') ? 'OC' : 'LA'

    // Generate unique slug (append number if duplicate)
    let slug = generateSlug(fd.name)
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (existing) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`
    }

    const { error } = await supabase.from('profiles').insert({
      name: fd.name,
      slug,
      region,
      parent_region: parentRegion,
      bio: fd.bio || '',
      experience: fd.exp || 'Beginner',
      types: fd.types || [],
      compensation: [],
      verified: false,
      vacation: false,
      attributes: { age: fd.age, height: fd.height },
      profile_image: null,
      cover_image: null,
    })

    if (!error) {
      await supabase
        .from('submissions')
        .update({ status: 'converted' })
        .eq('id', submission.id)
      await triggerRevalidation(['/'])
      await fetchSubmissions()
      onConverted?.()
    }
  }

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      new: t.subNew,
      reviewed: t.subReviewed,
      approved: t.subApproved,
      dismissed: t.subDismissed,
      converted: t.subConverted,
    }
    return map[status] || status
  }

  // Identify file upload fields from form config
  const fileFields = formConfig?.fields.filter(f => f.type === 'file_upload').map(f => f.id) || []

  if (loading) {
    return (
      <div style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)', padding: 40, textAlign: 'center' }}>
        {t.loading}
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--charcoal)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0, fontFamily: 'var(--font-serif)' }}>
            {t.subTitle}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: '4px 0 0' }}>{t.subDesc}</p>
        </div>
        {newCount > 0 && (
          <span
            style={{
              background: 'var(--rose-soft)',
              color: 'var(--rose)',
              fontSize: 13,
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: 12,
            }}
          >
            {newCount} {t.subNew}
          </span>
        )}
      </div>

      {/* Share Link Box */}
      <div
        style={{
          background: 'var(--warm)',
          border: '1px solid var(--sand)',
          borderRadius: 10,
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{t.subShareTitle}</div>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>{t.subShareDesc}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 12,
              color: 'var(--ink)',
              background: 'var(--cream)',
              padding: '6px 10px',
              borderRadius: 6,
              maxWidth: 260,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {typeof window !== 'undefined' ? `${window.location.origin}/membership` : '/membership'}
          </div>
          <button
            onClick={handleCopyLink}
            style={{
              background: linkCopied ? 'var(--sage)' : 'var(--rose)',
              color: linkCopied ? '#000' : '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {linkCopied ? t.subCopied : t.subCopyLink}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {submissions.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--muted)',
            fontSize: 14,
          }}
        >
          <p style={{ marginBottom: 8 }}>{t.subNone}</p>
          <p style={{ fontSize: 13 }}>{t.subShareDesc}</p>
        </div>
      )}

      {/* Submission cards */}
      <div style={{ display: 'grid', gap: 12 }}>
        {submissions.map(sub => {
          const fd = sub.form_data
          const initial = (fd.name || '?')[0].toUpperCase()
          const statusColor = STATUS_COLORS[sub.status] || 'var(--muted)'

          return (
            <div
              key={sub.id}
              style={{
                background: 'var(--warm)',
                border: '1px solid var(--sand)',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              {/* Header row */}
              <div
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: statusColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: 15,
                    flexShrink: 0,
                  }}
                >
                  {initial}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{fd.name || 'Unknown'}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {fd.email && <span>{fd.email}</span>}
                    {fd.phone && <span>{fd.phone}</span>}
                    <span>
                      {t.subDate}: {new Date(sub.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Status badge */}
                <span
                  style={{
                    color: statusColor,
                    background: `color-mix(in srgb, ${statusColor} 15%, transparent)`,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 8,
                    textTransform: 'capitalize',
                  }}
                >
                  {statusLabel(sub.status)}
                </span>
              </div>

              {/* Details section */}
              <div style={{ padding: '0 18px 14px' }}>
                {/* 4-col details */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  {[
                    { label: t.regAge, value: fd.age },
                    { label: t.regHeight, value: fd.height },
                    { label: t.area, value: fd.region },
                    { label: t.experience, value: fd.exp },
                  ].map(
                    item =>
                      item.value && (
                        <div key={item.label}>
                          <div style={{ color: 'var(--muted)', fontSize: 11, marginBottom: 2 }}>{item.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{item.value}</div>
                        </div>
                      )
                  )}
                </div>

                {/* Shoot types pills */}
                {fd.types && Array.isArray(fd.types) && fd.types.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {fd.types.map((type: string) => (
                      <span
                        key={type}
                        style={{
                          border: '1px solid var(--sand)',
                          color: 'var(--muted)',
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bio */}
                {fd.bio && (
                  <p style={{ color: 'var(--ink)', fontSize: 13, margin: '6px 0', lineHeight: 1.5 }}>
                    {fd.bio}
                  </p>
                )}

                {/* Social link */}
                {fd.social && (
                  <a
                    href={fd.social.startsWith('http') ? fd.social : `https://instagram.com/${fd.social.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--rose)', fontSize: 13, textDecoration: 'none' }}
                  >
                    {fd.social}
                  </a>
                )}

                {/* ID photo / file uploads */}
                {fileFields.map(fieldId => {
                  const value = fd[fieldId] || sub.id_photo_url
                  if (!value) return null
                  return (
                    <div key={fieldId} style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img
                        src={value}
                        alt="ID"
                        style={{
                          width: 48,
                          height: 48,
                          objectFit: 'cover',
                          borderRadius: 6,
                          border: '1px solid var(--sand)',
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--sage)',
                          fontWeight: 600,
                        }}
                      >
                        {t.uploaded}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Action buttons */}
              {sub.status !== 'converted' && (
                <div
                  style={{
                    borderTop: '1px solid var(--sand)',
                    padding: '10px 18px',
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  {sub.status === 'new' && (
                    <>
                      <button
                        onClick={() => updateStatus(sub.id, 'reviewed')}
                        style={{
                          background: 'none',
                          border: '1px solid var(--peach)',
                          color: 'var(--peach)',
                          borderRadius: 6,
                          padding: '5px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {t.subMarkReviewed}
                      </button>
                      <button
                        onClick={() => updateStatus(sub.id, 'approved')}
                        style={{
                          background: 'none',
                          border: '1px solid var(--sage)',
                          color: 'var(--sage)',
                          borderRadius: 6,
                          padding: '5px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {t.subApprove}
                      </button>
                      <button
                        onClick={() => updateStatus(sub.id, 'dismissed')}
                        style={{
                          background: 'none',
                          border: '1px solid var(--sand)',
                          color: 'var(--sand)',
                          borderRadius: 6,
                          padding: '5px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {t.subDismiss}
                      </button>
                    </>
                  )}

                  {sub.status === 'reviewed' && (
                    <>
                      <button
                        onClick={() => updateStatus(sub.id, 'approved')}
                        style={{
                          background: 'none',
                          border: '1px solid var(--sage)',
                          color: 'var(--sage)',
                          borderRadius: 6,
                          padding: '5px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {t.subApprove}
                      </button>
                      <button
                        onClick={() => updateStatus(sub.id, 'dismissed')}
                        style={{
                          background: 'none',
                          border: '1px solid var(--sand)',
                          color: 'var(--sand)',
                          borderRadius: 6,
                          padding: '5px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {t.subDismiss}
                      </button>
                    </>
                  )}

                  {sub.status === 'approved' && (
                    <button
                      onClick={() => handleConvert(sub)}
                      style={{
                        background: 'var(--sage)',
                        color: '#000',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 16px',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {t.subConvert}
                    </button>
                  )}

                  {sub.status === 'dismissed' && (
                    <span style={{ color: 'var(--muted)', fontSize: 12, padding: '5px 0' }}>
                      {t.subDismissed}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
