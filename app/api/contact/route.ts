import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { name, email, message, modelName } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, message' },
        { status: 400 }
      )
    }

    // Validate lengths
    if (name.length > 200 || email.length > 320 || message.length > 5000) {
      return NextResponse.json(
        { error: 'Input too long' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Sanitize modelName for email subject
    const safeModelName = (modelName || 'General').replace(/[\r\n]/g, '').slice(0, 100)

    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: 'Kpeachgirl <onboarding@resend.dev>',
      to: [process.env.ADMIN_EMAIL!],
      subject: `Contact: ${safeModelName} - from ${name.slice(0, 100)}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
