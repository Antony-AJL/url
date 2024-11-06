'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Globe, CheckCircle, XCircle, MoreVertical } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { getDomains } from '@/lib/domains'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/lib/supabase/types'

type Domain = Database['public']['Tables']['domains']['Row']

export default function DashboardPage() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadDomains()
    }
  }, [user])

  async function loadDomains() {
    try {
      const domainsData = await getDomains(user!.id)
      setDomains(domainsData)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading domains",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredDomains = domains.filter(domain =>
    domain.domain.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h2 className="text-3xl font-bold tracking-tight">Domains</h2>
        <Button asChild>
          <Link href="/domains/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Domain
          </Link>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center space-x-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search domains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <div>Loading domains...</div>
        ) : domains.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <Globe className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No domains added yet</h3>
                <p className="text-sm text-muted-foreground">
                  Get started by adding your first domain to monitor
                </p>
                <Button asChild>
                  <Link href="/domains/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Domain
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Last Check</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDomains.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>{domain.domain}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={domain.verification_status === 'verified' ? 'default' : 'secondary'}>
                      {domain.verification_status === 'verified' ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <XCircle className="mr-1 h-3 w-3" />
                      )}
                      {domain.verification_status.charAt(0).toUpperCase() + domain.verification_status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={domain.is_healthy ? 'default' : 'destructive'}>
                      {domain.is_healthy ? 'Healthy' : 'Unhealthy'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {domain.last_health_check
                      ? new Date(domain.last_health_check).toLocaleDateString()
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/domains/${domain.id}`}>
                            View Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/domains/${domain.id}/health`}>
                            Health Check
                          </Link>
                        </DropdownMenuItem>
                        {domain.verification_status !== 'verified' && (
                          <DropdownMenuItem asChild>
                            <Link href={`/domains/${domain.id}/verify`}>
                              Verify Domain
                            </Link>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </div>
  )
}