'use client'

export default function AdminDashboardPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--cream)' }}
    >
      <p
        className="text-lg"
        style={{
          color: 'var(--charcoal)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        Admin Dashboard
      </p>
    </div>
  )
}
