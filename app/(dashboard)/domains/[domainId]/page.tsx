'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Globe, CheckCircle, XCircle, Settings, BarChart2 } from 'lucide-react'
import Link from 'next/link'
import { getDomain } from '@/lib/domains'
import type { Database } from '@/lib/supabase/types'

type Domain = Database['public']['Tables']['domains']['Row']

export default function DomainDashboard({ params }: { params: { domainId: string } }) {
  const [domain, setDomain] = useState<Domain | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadDomain() {
      try {
        const domainData = await getDomain(params.domainId)
        setDomain(domainData)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading domain",
          description: error.message,
        })
      } finally {
        setLoading(false)
      }
    }

    loadDomain()
  }, [params.domainId, toast])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!domain) {
    return <div>Domain not found</div>
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/domains">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
              <Globe className="h-6 w-6" />
              <span>{domain.domain}</span>
            </h2>
            <div className="flex items-center space-x-2">
              <Badge variant={domain.verification_status === 'verified' ? 'default' : 'destructive'}>
                {domain.verification_status === 'verified' ? (
                  <CheckCircle className="mr-1 h-3 w-3" />
                ) : (
                  <XCircle className="mr-1 h-3 w-3" />
                )}
                {domain.verification_status.charAt(0).toUpperCase() + domain.verification_status.slice(1)}
              </Badge>
              <Badge variant={domain.is_healthy ? 'default' : 'destructive'}>
                {domain.is_healthy ? 'Healthy' : 'Unhealthy'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/domains/${domain.id}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          {/* Add more stat cards here */}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="pages" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="sitemaps">Sitemaps</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>
          <TabsContent value="pages" className="space-y-4">
            {/* Pages content */}
          </TabsContent>
          <TabsContent value="sitemaps" className="space-y-4">
            {/* Sitemaps content */}
          </TabsContent>
          <TabsContent value="health" className="space-y-4">
            {/* Health monitoring content */}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}