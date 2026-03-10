'use client'

import { useState } from 'react'

interface AreasTabProps {
  lang: 'en' | 'ko'
  areas: string[]
  onUpdate: (areas: string[]) => void
}

export default function AreasTab({ lang, areas, onUpdate }: AreasTabProps) {
  const [newArea, setNewArea] = useState('')

  const handleAdd = () => {
    const trimmed = newArea.trim()
    if (!trimmed) return
    if (areas.includes(trimmed)) return
    onUpdate([...areas, trimmed])
    setNewArea('')
  }

  const handleRemove = (area: string) => {
    onUpdate(areas.filter(a => a !== area))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div
      style={{
        background: '#181716',
        border: '1px solid var(--sand)',
        borderRadius: 12,
        padding: 28,
      }}
    >
      <h2
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: 'var(--charcoal)',
          fontFamily: 'var(--font-serif)',
          marginBottom: 4,
        }}
      >
        {lang === 'ko' ? '지역 관리' : 'Geographic Areas'}
      </h2>
      <p
        style={{
          color: 'var(--muted)',
          fontSize: 14,
          fontFamily: 'var(--font-sans)',
          marginBottom: 20,
        }}
      >
        {lang === 'ko'
          ? '모델 필터링에 사용할 지역을 관리합니다'
          : 'Manage the areas available for model filtering'}
      </p>

      {/* Area chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {areas.map(area => (
          <div
            key={area}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--warm)',
              border: '1px solid var(--sand)',
              borderRadius: 8,
              padding: '6px 10px',
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--charcoal)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {area}
            </span>
            <button
              onClick={() => handleRemove(area)}
              style={{
                width: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--sand)',
                borderRadius: 4,
                background: 'transparent',
                color: 'var(--muted)',
                cursor: 'pointer',
                fontSize: 14,
                lineHeight: 1,
                padding: 0,
              }}
              aria-label={`Remove ${area}`}
            >
              x
            </button>
          </div>
        ))}
      </div>

      {/* Add area row */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={newArea}
          onChange={e => setNewArea(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={lang === 'ko' ? '새 지역 이름...' : 'New area name...'}
          style={{
            flex: 1,
            background: 'var(--input-bg, #1e1d1b)',
            border: '1px solid var(--sand)',
            borderRadius: 8,
            padding: '8px 12px',
            color: 'var(--charcoal)',
            fontSize: 14,
            fontFamily: 'var(--font-sans)',
            outline: 'none',
          }}
        />
        <button
          onClick={handleAdd}
          disabled={!newArea.trim()}
          style={{
            background: newArea.trim() ? 'var(--charcoal)' : 'var(--sand)',
            color: newArea.trim() ? 'var(--cream)' : 'var(--muted)',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            cursor: newArea.trim() ? 'pointer' : 'default',
          }}
        >
          {lang === 'ko' ? '추가' : 'Add'}
        </button>
      </div>
    </div>
  )
}
