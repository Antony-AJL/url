'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Globe, Shield } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { addDomain, validateDomain, checkDomainAvailability } from '@/lib/domains'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AddDomainPage() {
  const [domain, setDomain] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleDomainChange = async (value: string) => {
    setDomain(value)
    setValidationError(null)

    if (value) {
      const validation = await validateDomain(value)
      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid domain')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const isAvailable = await checkDomainAvailability(validation.domain, user.id)
        if (!isAvailable) {
          setValidationError('This domain is already registered')
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setValidationError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please sign in to add a domain",
        })
        return
      }

      const result = await addDomain(user.id, domain, 'dns')
      toast({
        title: "Success",
        description: "Domain added successfully. Proceeding to verification...",
      })
      router.push(`/domains/${result.id}/verify`)
    } catch (error: any) {
      setValidationError(error.message)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add domain",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <Button variant="ghost" size="icon" asChild>
          <Link href="/domains">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Add Domain</h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Domain Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain Name</Label>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="domain"
                    placeholder="example.com"
                    value={domain}
                    onChange={(e) => handleDomainChange(e.target.value)}
                    required
                  />
                </div>
                {validationError && (
                  <p className="text-sm text-destructive">{validationError}</p>
                )}
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  You'll need to verify ownership of this domain by adding a DNS TXT record.
                  We'll guide you through the process in the next step.
                </AlertDescription>
              </Alert>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !!validationError || !domain}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Globe className="h-4 w-4" />
                    </motion.div>
                    <span>Adding Domain...</span>
                  </div>
                ) : (
                  'Continue to Verification'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}