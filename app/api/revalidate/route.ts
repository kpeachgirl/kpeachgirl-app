import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const MAX_PATHS = 10
const MAX_PATH_LENGTH = 100
const VALID_PATH_REGEX = /^\/[\w\-/.]*$/

export async function POST(request: NextRequest) {
  try {
    // Authenticate: require either a valid admin session or the revalidation secret
    const secret = request.headers.get('x-revalidation-secret')
    let authorized = false

    // Check secret-based auth (for webhooks / external triggers)
    if (secret && process.env.REVALIDATION_SECRET && secret === process.env.REVALIDATION_SECRET) {
      authorized = true
    }

    // Check session-based auth (for admin panel calls)
    if (!authorized) {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll() } }
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.app_metadata?.is_admin) {
        authorized = true
      }
    }

    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { paths } = body

    if (!Array.isArray(paths) || paths.length === 0 || paths.length > MAX_PATHS) {
      return NextResponse.json(
        { error: 'Invalid paths' },
        { status: 400 }
      )
    }

    for (const path of paths) {
      if (typeof path !== 'string' || path.length > MAX_PATH_LENGTH || !VALID_PATH_REGEX.test(path)) {
        return NextResponse.json(
          { error: 'Invalid path format' },
          { status: 400 }
        )
      }
    }

    for (const path of paths) {
      revalidatePath(path)
    }

    return NextResponse.json({ revalidated: true, paths })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    )
  }
}
