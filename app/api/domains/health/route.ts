import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

async function checkDomainHealth(domain: string) {
  try {
    const startTime = Date.now()
    const response = await fetch(`https://${domain}`, {
      method: 'HEAD',
      headers: { 'User-Agent': 'BingIndex Health Check' }
    })
    const responseTime = Date.now() - startTime

    return {
      statusCode: response.status,
      responseTime,
      isHealthy: response.ok,
      error: null
    }
  } catch (error: any) {
    return {
      statusCode: 0,
      responseTime: 0,
      isHealthy: false,
      error: error.message
    }
  }
}

export async function POST(request: Request) {
  try {
    const { domainId } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    const { data: domain, error: fetchError } = await supabase
      .from('domains')
      .select('*')
      .eq('id', domainId)
      .single()

    if (fetchError || !domain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      )
    }

    const health = await checkDomainHealth(domain.domain)

    // Update domain health status
    const { error: updateError } = await supabase
      .from('domains')
      .update({
        is_healthy: health.isHealthy,
        last_health_check: new Date().toISOString()
      })
      .eq('id', domainId)

    // Log health check result
    const { error: logError } = await supabase
      .from('domain_health_logs')
      .insert({
        domain_id: domainId,
        status_code: health.statusCode,
        response_time: health.responseTime,
        is_healthy: health.isHealthy,
        error_message: health.error
      })

    if (updateError || logError) {
      throw updateError || logError
    }

    return NextResponse.json({ success: true, health })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}