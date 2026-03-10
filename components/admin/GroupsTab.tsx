'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n'
import GroupEditor from './GroupEditor'
import type { Group, GroupGalleryImage, Profile, PillGroup, CategorySection } from '@/lib/types'

interface GroupsTabProps {
  lang: 'en' | 'ko'
  profiles: Profile[]
  pillGroups: PillGroup[]
  categories: CategorySection[]
}

const placeholderSvg =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="#2a2622"/></svg>'
  )

function emptyGroup(): Group {
  return {
    id: '',
    name: '',
    slug: null,
    bio: null,
    badge_label: null,
    image: null,
    member_ids: [],
    types: [],
    compensation: [],
    attributes: {},
    sort_order: null,
    created_at: '',
    updated_at: '',
  }
}

export default function GroupsTab({ lang, profiles, pillGroups, categories }: GroupsTabProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGallery, setEditingGallery] = useState<GroupGalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const t = useTranslation(lang)

  const fetchGroups = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('groups')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true })
    if (data) setGroups(data as Group[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const startEdit = async (groupId: string) => {
    setEditingGroupId(groupId)
    // Fetch gallery images for this group
    const supabase = createClient()
    const { data } = await supabase
      .from('group_gallery_images')
      .select('*')
      .eq('group_id', groupId)
      .order('sort_order', { ascending: true })
    setEditingGallery((data as GroupGalleryImage[]) || [])
  }

  const startNew = () => {
    setEditingGroupId('__new__')
    setEditingGallery([])
  }

  const handleSave = (savedGroup: Group) => {
    setEditingGroupId(null)
    fetchGroups()
  }

  const handleDelete = (id: string) => {
    setEditingGroupId(null)
    setGroups(prev => prev.filter(g => g.id !== id))
  }

  const handleCancel = () => {
    setEditingGroupId(null)
  }

  const getBadge = (g: Group): string => {
    if (g.badge_label) return g.badge_label
    const count = (g.member_ids || []).length
    return count === 2 ? 'DUO' : count === 3 ? 'TRIO' : 'GROUP'
  }

  if (loading) {
    return (
      <div style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)', padding: 40, textAlign: 'center' }}>
        Loading groups...
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2
            className="serif"
            style={{
              fontWeight: 300,
              color: 'var(--charcoal)',
              fontSize: 22,
              fontFamily: 'var(--font-serif)',
            }}
          >
            {t.grpTitle}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, fontFamily: 'var(--font-sans)' }}>
            {t.grpDesc}
          </p>
        </div>
        <button
          onClick={startNew}
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
          {t.grpNew}
        </button>
      </div>

      {/* New group editor */}
      {editingGroupId === '__new__' && (
        <div
          style={{
            background: '#181716',
            border: '1px solid var(--rose)',
            overflow: 'hidden',
            marginBottom: 12,
          }}
        >
          <GroupEditor
            group={emptyGroup()}
            galleryImages={[]}
            profiles={profiles}
            pillGroups={pillGroups}
            categories={categories}
            lang={lang}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Group list */}
      {groups.length === 0 && editingGroupId !== '__new__' ? (
        <div
          style={{
            background: '#181716',
            border: '1px solid var(--sand)',
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          <div
            className="serif"
            style={{
              fontSize: 24,
              fontWeight: 300,
              color: 'var(--sand)',
              marginBottom: 8,
              fontFamily: 'var(--font-serif)',
            }}
          >
            {t.grpNone}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {groups.map(g => {
            const badge = getBadge(g)
            const isEditing = editingGroupId === g.id
            return (
              <div
                key={g.id}
                style={{
                  background: '#181716',
                  border: isEditing ? '1px solid var(--rose)' : '1px solid var(--sand)',
                  overflow: 'hidden',
                }}
              >
                {!isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                    <img
                      src={g.image || placeholderSvg}
                      alt=""
                      style={{ width: 48, height: 48, objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--charcoal)' }}>{g.name}</span>
                        <span
                          className="sans"
                          style={{
                            padding: '2px 8px',
                            fontSize: 8,
                            fontWeight: 800,
                            letterSpacing: '0.1em',
                            background: 'var(--rose)',
                            color: '#181716',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-sans)',
                          }}
                        >
                          {badge}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
                        {(g.member_ids || []).length} members
                      </div>
                    </div>
                    <button
                      onClick={() => startEdit(g.id)}
                      style={{
                        padding: '6px 16px',
                        background: 'var(--charcoal)',
                        color: 'var(--cream)',
                        border: 'none',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {t.edit}
                    </button>
                  </div>
                ) : (
                  <GroupEditor
                    group={g}
                    galleryImages={editingGallery}
                    profiles={profiles}
                    pillGroups={pillGroups}
                    categories={categories}
                    lang={lang}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onCancel={handleCancel}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
