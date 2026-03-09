'use client'

import AdminDashboard from '@/components/admin/AdminDashboard'

export default function AdminDashboardPage() {
  return (
    <div
      className="sans grain"
      style={{ minHeight: '100vh', background: 'var(--cream)' }}
    >
      <AdminDashboard />
    </div>
  )
}
