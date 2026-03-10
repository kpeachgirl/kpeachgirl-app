import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    // Allow internal calls (same origin) or validate secret for external calls
    const secret = request.headers.get('x-revalidation-secret')
    const referer = request.headers.get('referer') || ''
    const host = request.headers.get('host') || ''
    const isInternal = referer.includes(host)

    if (!isInternal && (!secret || secret !== process.env.REVALIDATION_SECRET)) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { paths } = body

    if (!Array.isArray(paths)) {
      return NextResponse.json(
        { error: 'paths must be an array' },
        { status: 400 }
      )
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
