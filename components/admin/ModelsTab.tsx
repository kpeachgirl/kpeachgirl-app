'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { triggerRevalidation } from '@/lib/supabase/admin'
import { useTranslation } from '@/lib/i18n'
import type { Profile } from '@/lib/types'

interface ModelsTabProps {
  lang: 'en' | 'ko'
  onEditModel: (model: Profile | null) => void
  editingId?: string
}

const placeholderSvg = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#d9cfc4"/></svg>'
)

export default function ModelsTab({ lang, onEditModel, editingId }: ModelsTabProps) {
  const [models, setModels] = useState<Profile[]>([])
  const [groupCount, setGroupCount] = useState(0)
  const [filter, setFilter] = useState<'all' | 'la' | 'oc' | 'verified' | 'vacation'>('all')
  const [loading, setLoading] = useState(true)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [orderChanged, setOrderChanged] = useState(false)

  const t = useTranslation(lang)

  const fetchModels = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true })
    if (data) setModels(data as Profile[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchModels()
    // Fetch group count for stats
    const supabase = createClient()
    supabase
      .from('groups')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => setGroupCount(count ?? 0))
  }, [fetchModels])

  const toggleField = async (id: string, field: 'verified' | 'vacation') => {
    const model = models.find(m => m.id === id)
    if (!model) return
    const newVal = !model[field]
    setModels(prev => prev.map(m => m.id === id ? { ...m, [field]: newVal } : m))
    const supabase = createClient()
    await supabase.from('profiles').update({ [field]: newVal }).eq('id', id)
    // Trigger ISR revalidation for affected pages
    if (model.slug) {
      triggerRevalidation(['/', `/model/${model.slug}`])
    }
  }

  const handleDragStart = (idx: number) => {
    setDragIndex(idx)
  }

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    setOverIndex(idx)
  }

  const handleDrop = (idx: number) => {
    if (dragIndex === null || dragIndex === idx) {
      setDragIndex(null)
      setOverIndex(null)
      return
    }
    const updated = [...models]
    const [moved] = updated.splice(dragIndex, 1)
    updated.splice(idx, 0, moved)
    setModels(updated)
    setDragIndex(null)
    setOverIndex(null)
    setOrderChanged(true)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setOverIndex(null)
  }

  const saveOrder = async () => {
    setSaving(true)
    try {
      const order = models.map((m, i) => ({ id: m.id, sort_order: i }))
      const res = await fetch('/api/reorder-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      })
      if (res.ok) {
        setOrderChanged(false)
        triggerRevalidation(['/'])
      }
    } catch (err) {
      console.error('Save order failed:', err)
    } finally {
      setSaving(false)
    }
  }

  const filtered = models.filter(m => {
    if (filter === 'la') return m.parent_region === 'LA'
    if (filter === 'oc') return m.parent_region === 'OC'
    if (filter === 'verified') return m.verified
    if (filter === 'vacation') return m.vacation
    return true
  })

  const stats = [
    { l: t.total, v: models.length },
    { l: t.verified, v: models.filter(m => m.verified).length },
    { l: t.tabGroups, v: groupCount },
    { l: t.onVacation, v: models.filter(m => m.vacation).length },
  ]

  const filters: [string, string][] = [
    ['all', t.filterAll],
    ['la', 'LA'],
    ['oc', 'OC'],
    ['verified', t.filterVerified],
    ['vacation', t.filterVacation],
  ]

  if (loading) {
    return (
      <div style={{ color: 'var(--muted)', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
        {t.loadingModels}
      </div>
    )
  }

  return (
    <>
      {/* Header with New Model button + Save Order */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {orderChanged && (
            <button
              onClick={saveOrder}
              disabled={saving}
              style={{
                padding: '10px 24px',
                background: 'var(--sage)',
                color: '#0e0d0c',
                border: 'none',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: saving ? 'wait' : 'pointer',
                fontFamily: 'var(--font-sans)',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Order'}
            </button>
          )}
          {orderChanged && (
            <span style={{ fontSize: 11, color: 'var(--peach)', fontFamily: 'var(--font-sans)' }}>
              Drag to reorder, then save
            </span>
          )}
        </div>
        <button
          onClick={() => onEditModel(null)}
          style={{
            padding: '10px 24px',
            background: 'var(--rose)',
            color: '#0e0d0c',
            border: 'none',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {t.newModel}
        </button>
      </div>

      {/* Stats bar */}
      <div
        className="admin-stats"
        style={{ marginBottom: 32, background: 'var(--sand)' }}
      >
        {stats.map(s => (
          <div key={s.l} style={{ background: '#181716', padding: '24px 20px' }}>
            <div
              style={{
                fontSize: 36,
                fontWeight: 300,
                color: 'var(--charcoal)',
                fontFamily: 'var(--font-serif)',
              }}
            >
              {s.v}
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                marginTop: 2,
              }}
            >
              {s.l}
            </div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="filter-scroll" style={{ marginBottom: 20 }}>
        {filters.map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k as typeof filter)}
            style={{
              padding: '6px 16px',
              border: filter === k ? '1px solid var(--charcoal)' : '1px solid var(--sand)',
              background: filter === k ? 'var(--charcoal)' : '#181716',
              color: filter === k ? 'var(--cream)' : 'var(--muted)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Model table */}
      <div style={{ background: '#181716', border: '1px solid var(--sand)', overflow: 'hidden' }}>
        {/* Header row */}
        <div
          className="admin-table-row-drag"
          style={{
            padding: '12px 16px',
            borderBottom: '2px solid var(--sand)',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.14em',
            color: 'var(--muted)',
            textTransform: 'uppercase',
          }}
        >
          <span>#</span>
          <span />
          <span>{t.thName}</span>
          <span className="mob-hide">{t.thArea}</span>
          <span className="mob-hide">{t.thLevel}</span>
          <span className="mob-hide" style={{ textAlign: 'center' }}>{t.thVerified}</span>
          <span className="mob-hide" style={{ textAlign: 'center' }}>{t.thVacation}</span>
          <span />
        </div>

        {/* Model rows */}
        {filtered.map((m, idx) => {
          const isEditing = editingId === m.id
          const globalIdx = models.findIndex(x => x.id === m.id)
          const isDragging = dragIndex === globalIdx
          const isOver = overIndex === globalIdx
          return (
            <div
              key={m.id}
              draggable={filter === 'all'}
              onDragStart={() => handleDragStart(globalIdx)}
              onDragOver={(e) => handleDragOver(e, globalIdx)}
              onDrop={() => handleDrop(globalIdx)}
              onDragEnd={handleDragEnd}
              className="admin-table-row-drag"
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                alignItems: 'center',
                background: isDragging ? 'rgba(212,117,138,0.08)' : isEditing ? 'var(--rose-soft)' : '#181716',
                borderTop: isOver ? '2px solid var(--rose)' : '2px solid transparent',
                transition: 'background 0.15s',
                opacity: isDragging ? 0.5 : 1,
                cursor: filter === 'all' ? 'grab' : 'default',
              }}
              onMouseEnter={e => {
                if (!isEditing && !isDragging) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = isDragging ? 'rgba(212,117,138,0.08)' : isEditing ? 'var(--rose-soft)' : '#181716'
              }}
            >
              {/* Drag handle + order number */}
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-sans)', minWidth: 30 }}>
                {filter === 'all' && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5, flexShrink: 0 }}>
                    <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
                  </svg>
                )}
                {globalIdx + 1}
              </span>
              {/* Thumbnail */}
              <img
                src={m.profile_image || placeholderSvg}
                alt=""
                style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 2 }}
              />
              {/* Name */}
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--charcoal)' }}>{m.name}</span>
              {/* Area */}
              <span className="mob-hide" style={{ fontSize: 12, color: 'var(--muted)' }}>{m.region}</span>
              {/* Level */}
              <span className="mob-hide" style={{ fontSize: 11, color: 'var(--muted)' }}>{m.experience}</span>
              {/* Verified toggle */}
              <div className="mob-hide" style={{ textAlign: 'center' }}>
                <button
                  onClick={e => { e.stopPropagation(); toggleField(m.id, 'verified') }}
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                    background: m.verified ? 'var(--sage)' : 'var(--sand)',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: m.verified ? 18 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      background: '#181716',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    }}
                  />
                </button>
              </div>
              {/* Vacation toggle */}
              <div className="mob-hide" style={{ textAlign: 'center' }}>
                <button
                  onClick={e => { e.stopPropagation(); toggleField(m.id, 'vacation') }}
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                    background: m.vacation ? 'var(--peach)' : 'var(--sand)',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: m.vacation ? 18 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      background: '#181716',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    }}
                  />
                </button>
              </div>
              {/* Edit button */}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => onEditModel(m)}
                  style={{
                    background: isEditing ? 'var(--rose)' : 'var(--charcoal)',
                    border: 'none',
                    color: 'var(--cream)',
                    padding: '4px 12px',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {t.edit}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

// Export refresh helper for parent to call after save/delete
export { type ModelsTabProps }
