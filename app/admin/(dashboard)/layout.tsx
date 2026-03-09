import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/admin/login')
  }

  // Check admin claim in app_metadata
  const isAdmin = user.app_metadata?.is_admin === true
  if (!isAdmin) {
    redirect('/admin/login')
  }

  return <>{children}</>
}
