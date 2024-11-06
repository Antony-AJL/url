import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    const token = searchParams.get('token')

    if (!domain || !token) {
      return NextResponse.json(
        { error: 'Missing domain or token' },
        { status: 400 }
      )
    }

    const verificationUrl = `https://${domain}/bing-indexnow-${token}.html`
    
    const response = await fetch(verificationUrl, {
      headers: {
        'User-Agent': 'BingIndex Verification/1.0'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ verified: false })
    }

    const content = await response.text()
    const verified = content.trim() === token

    return NextResponse.json({ verified })
  } catch (error: any) {
    console.error('File verification error:', error)
    return NextResponse.json(
      { error: error.message, verified: false },
      { status: 500 }
    )
  }
}