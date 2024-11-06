import { NextResponse } from 'next/server'
import dns from 'dns'
import { promisify } from 'util'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const resolveTxt = promisify(dns.resolveTxt)

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    const token = searchParams.get('token')

    if (!domain || !token) {
      return NextResponse.json(
        { error: 'Missing domain or token', verified: false },
        { status: 400 }
      )
    }

    // Extract root domain for DNS lookup
    const domainParts = domain.split('.')
    const rootDomain = domainParts.slice(-2).join('.')

    try {
      const records = await resolveTxt(rootDomain)
      const expectedRecord = `bing-indexnow=${token}`
      
      const verified = records.some(record => 
        record.some(txt => txt.trim() === expectedRecord)
      )

      console.log({
        domain,
        rootDomain,
        expectedRecord,
        foundRecords: records,
        verified
      })

      return NextResponse.json({ verified, records })
    } catch (dnsError: any) {
      console.error('DNS lookup error:', {
        domain,
        rootDomain,
        error: dnsError.message,
        code: dnsError.code
      })

      return NextResponse.json({
        verified: false,
        error: 'Failed to lookup DNS records',
        details: dnsError.message,
        code: dnsError.code
      }, {
        status: dnsError.code === 'ENOTFOUND' ? 404 : 500
      })
    }
  } catch (error: any) {
    console.error('Verification endpoint error:', error)
    return NextResponse.json({
      verified: false,
      error: 'Verification failed',
      details: error.message
    }, { 
      status: 500 
    })
  }
}