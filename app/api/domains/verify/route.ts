import { NextResponse } from 'next/server'
import dns from 'dns'
import { promisify } from 'util'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const resolveTxt = promisify(dns.resolveTxt)

async function verifyDNS(domain: string, token: string) {
  try {
    // Extract root domain for DNS lookup
    const domainParts = domain.split('.')
    const rootDomain = domainParts.slice(-2).join('.')

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

    return verified
  } catch (error) {
    console.error('DNS verification error:', error)
    return false
  }
}

async function verifyFile(domain: string, token: string) {
  try {
    const response = await fetch(`https://${domain}/bing-indexnow-${token}.html`)
    if (!response.ok) return false
    const content = await response.text()
    return content.trim() === token
  } catch (error) {
    console.error('File verification error:', error)
    return false
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { domainId } = await request.json()

    // Get domain details and verify ownership
    const { data: domain, error: fetchError } = await supabase
      .from('domains')
      .select('*')
      .eq('id', domainId)
      .eq('user_id', session.user.id) // Make sure the domain belongs to the user
      .single()

    if (fetchError || !domain) {
      return NextResponse.json(
        { error: 'Domain not found or unauthorized' },
        { status: 404 }
      )
    }

    // Verify ownership
    let isVerified = false
    if (domain.verification_method === 'dns') {
      isVerified = await verifyDNS(domain.domain, domain.verification_token)
    } else {
      isVerified = await verifyFile(domain.domain, domain.verification_token)
    }

    // Update verification status
    const { error: updateError } = await supabase
      .from('domains')
      .update({
        verification_status: isVerified ? 'verified' : 'failed',
        last_verified_at: isVerified ? new Date().toISOString() : null
      })
      .eq('id', domainId)
      .eq('user_id', session.user.id) // Additional security check

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ 
      success: true, 
      verified: isVerified,
      message: isVerified ? 'Domain verified successfully' : 'Verification failed'
    })
  } catch (error: any) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    )
  }
}