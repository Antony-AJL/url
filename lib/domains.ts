import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './supabase/types'
import { z } from 'zod'

const supabase = createClientComponentClient<Database>()

type Domain = Database['public']['Tables']['domains']['Row']

const domainSchema = z.string()
  .toLowerCase()
  .min(1, 'Domain is required')
  .refine(domain => {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/
    return domainRegex.test(domain)
  }, 'Please enter a valid domain name')
  .transform(domain => domain.trim())

export async function validateDomain(domain: string) {
  try {
    return { domain: domainSchema.parse(domain), isValid: true, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { domain, isValid: false, error: error.errors[0].message }
    }
    return { domain, isValid: false, error: 'Invalid domain format' }
  }
}

export async function checkDomainAvailability(domain: string, userId: string) {
  const { data: existingDomain } = await supabase
    .from('domains')
    .select('id')
    .eq('domain', domain.toLowerCase())
    .single()

  return !existingDomain
}

export async function addDomain(
  userId: string, 
  domain: string, 
  verificationMethod: 'dns' | 'file'
) {
  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Ensure userId matches the authenticated user
  if (user.id !== userId) throw new Error('Unauthorized')

  const validation = await validateDomain(domain)
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid domain')
  }

  const isAvailable = await checkDomainAvailability(validation.domain, userId)
  if (!isAvailable) {
    throw new Error('This domain is already registered')
  }

  const verificationToken = generateVerificationToken()

  const { data, error } = await supabase
    .from('domains')
    .insert({
      user_id: user.id, // Make sure we're using the authenticated user's ID
      domain: validation.domain,
      verification_method: verificationMethod,
      verification_token: verificationToken,
      verification_status: 'pending',
      is_healthy: true,
      settings: {
        auto_sitemap_sync: false,
        sitemap_urls: [],
        auto_indexing: false,
        indexing_frequency: 'daily'
      }
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding domain:', error)
    throw new Error(error.message)
  }
  
  return data
}

function generateVerificationToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function getDomains(userId: string) {
  const { data, error } = await supabase
    .from('domains')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getDomain(domainId: string) {
  const { data, error } = await supabase
    .from('domains')
    .select('*')
    .eq('id', domainId)
    .single()

  if (error) throw error
  return data
}

export async function verifyDomain(domainId: string) {
  try {
    const { data: domain } = await supabase
      .from('domains')
      .select('*')
      .eq('id', domainId)
      .single()

    if (!domain) {
      throw new Error('Domain not found')
    }

    // Call the main verification endpoint
    const response = await fetch('/api/domains/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ domainId })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Verification failed')
    }

    const { success, verified } = await response.json()

    // Update local state with verification result
    const { error: updateError } = await supabase
      .from('domains')
      .update({
        verification_status: verified ? 'verified' : 'failed',
        last_verified_at: verified ? new Date().toISOString() : null
      })
      .eq('id', domainId)

    if (updateError) throw updateError

    return {
      status: verified ? 'verified' : 'failed',
      error: null
    }
  } catch (error: any) {
    console.error('Domain verification error:', error)
    return {
      status: 'failed',
      error: error.message
    }
  }
}